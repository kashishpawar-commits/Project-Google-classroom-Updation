import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { ViewTrackingResponse, StudentViewTrackingRecord } from '../../types/database';
import { SeenBadge, AssignmentStatusBadge } from '../../components/ui/StatusBadge';
import { Avatar } from '../../components/ui/Avatar';
import { SearchBar, Skeleton, ErrorState, EmptyState } from '../../components/ui/FeedbackStates';
import { X, Users, Eye, EyeOff, BarChart3, RefreshCw, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface ViewTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'material' | 'assignment';
  entityId: string;
  title: string;
}

export const ViewTrackingModal: React.FC<ViewTrackingModalProps> = ({
  isOpen,
  onClose,
  entityType,
  entityId,
  title,
}) => {
  const [data, setData] = useState<ViewTrackingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'seen' | 'unseen'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'views' | 'date'>('name');

  const fetchTracking = async () => {
    try {
      setLoading(true);
      setError(null);

      const rpcName = entityType === 'material' ? 'get_material_view_tracking' : 'get_assignment_view_tracking';
      const paramName = entityType === 'material' ? 'p_material_id' : 'p_assignment_id';

      const { data: resData, error: rpcError } = await supabase.rpc(rpcName, {
        [paramName]: entityId,
      });

      if (!rpcError && resData) {
        setData(resData as ViewTrackingResponse);
        return;
      }

      // Fallback: Compute tracking stats directly from database tables
      if (entityType === 'material') {
        const { data: matData, error: matErr } = await supabase
          .from('materials')
          .select('id, title, classroom_id')
          .eq('id', entityId)
          .single();

        if (matErr || !matData) throw matErr || new Error('Material not found');

        // Fetch enrolled members with profiles
        const { data: members, error: memErr } = await supabase
          .from('classroom_members')
          .select('student_id, student:profiles(id, full_name, email, avatar_url)')
          .eq('classroom_id', matData.classroom_id);

        if (memErr) throw memErr;

        // Fetch material views
        const { data: views, error: viewErr } = await supabase
          .from('material_views')
          .select('*')
          .eq('material_id', entityId);

        if (viewErr) throw viewErr;

        const viewMap = new Map((views || []).map((v) => [v.student_id, v]));
        const studentsList: StudentViewTrackingRecord[] = (members || []).map((m: any) => {
          const profile = m.student;
          const v = viewMap.get(m.student_id);
          const hasViewed = Boolean(v);
          return {
            student_id: m.student_id,
            full_name: profile?.full_name || 'Student',
            email: profile?.email || '',
            avatar_url: profile?.avatar_url || null,
            status: hasViewed ? 'seen' : 'unseen',
            first_viewed_at: v?.first_viewed_at || null,
            last_viewed_at: v?.last_viewed_at || null,
            view_count: v?.view_count || 0,
          };
        });

        const enrolledCount = studentsList.length;
        const seenCount = studentsList.filter((s) => s.status === 'seen').length;
        const unseenCount = enrolledCount - seenCount;
        const engagementPct = enrolledCount > 0 ? Math.round((seenCount / enrolledCount) * 1000) / 10 : 0;

        setData({
          material_id: entityId,
          title: matData.title,
          published_at: (matData as any).published ? (matData as any).created_at : null,
          summary: {
            enrolled_count: enrolledCount,
            seen_count: seenCount,
            unseen_count: unseenCount,
            engagement_pct: engagementPct,
          },
          students: studentsList,
        });
      } else {
        throw rpcError || new Error('View tracking unavailable');
      }
    } catch (err: unknown) {
      console.error('Failed to load view tracking:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tracking data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !entityId) return;
    fetchTracking();

    // Setup Realtime subscription on views table
    const channelName = `view_tracking_${entityType}_${entityId}`;
    const targetTable = entityType === 'material' ? 'material_views' : 'assignment_views';
    const filterColumn = entityType === 'material' ? 'material_id' : 'assignment_id';

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: targetTable,
          filter: `${filterColumn}=eq.${entityId}`,
        },
        () => {
          // Re-fetch via SQL RPC to ensure calculated stats are strictly synchronized
          fetchTracking();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, entityId, entityType]);

  const filteredStudents = useMemo(() => {
    if (!data?.students) return [];

    let list = [...data.students];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) => s.full_name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      list = list.filter((s) => s.status === statusFilter);
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'name') {
        return a.full_name.localeCompare(b.full_name);
      }
      if (sortBy === 'status') {
        if (a.status === b.status) return a.full_name.localeCompare(b.full_name);
        return a.status === 'seen' ? -1 : 1;
      }
      if (sortBy === 'views') {
        return b.view_count - a.view_count;
      }
      if (sortBy === 'date') {
        const timeA = a.last_viewed_at ? new Date(a.last_viewed_at).getTime() : 0;
        const timeB = b.last_viewed_at ? new Date(b.last_viewed_at).getTime() : 0;
        return timeB - timeA;
      }
      return 0;
    });

    return list;
  }, [data, searchQuery, statusFilter, sortBy]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {entityType} Tracking
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <h2 className="text-base font-semibold text-gray-900 truncate max-w-md mt-0.5">{title}</h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchTracking}
              disabled={loading}
              className="p-1.5 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-200/60 transition-colors"
              title="Refresh tracking data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && !data ? (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
              </div>
              <Skeleton className="h-64 rounded-xl" />
            </div>
          ) : error ? (
            <ErrorState title="Failed to load engagement tracking" message={error} onRetry={fetchTracking} />
          ) : data ? (
            <>
              {/* Summary Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-xs">
                  <div className="flex items-center justify-between text-gray-500 mb-1">
                    <span className="text-xs font-medium">Enrolled Students</span>
                    <Users className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{data.summary.enrolled_count}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Active in classroom</p>
                </div>

                <div className="p-4 bg-white border border-blue-200/80 rounded-xl shadow-xs bg-blue-50/20">
                  <div className="flex items-center justify-between text-blue-700 mb-1">
                    <span className="text-xs font-medium">Seen</span>
                    <Eye className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-700">{data.summary.seen_count}</p>
                  <p className="text-xs text-blue-500 mt-0.5">Opened at least once</p>
                </div>

                <div className="p-4 bg-white border border-amber-200/80 rounded-xl shadow-xs bg-amber-50/20">
                  <div className="flex items-center justify-between text-amber-700 mb-1">
                    <span className="text-xs font-medium">Unseen</span>
                    <EyeOff className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-2xl font-bold text-amber-700">{data.summary.unseen_count}</p>
                  <p className="text-xs text-amber-500 mt-0.5">Not opened yet</p>
                </div>

                <div className="p-4 bg-white border border-emerald-200/80 rounded-xl shadow-xs bg-emerald-50/20">
                  <div className="flex items-center justify-between text-emerald-700 mb-1">
                    <span className="text-xs font-medium">Engagement</span>
                    <BarChart3 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-bold text-emerald-700">{data.summary.engagement_pct}%</p>
                  <p className="text-xs text-emerald-500 mt-0.5">Seen ÷ Enrolled</p>
                </div>
              </div>

              {/* Controls bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-2">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search students by name or email..."
                  className="w-full sm:w-72"
                />

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="text-xs bg-white border border-gray-300 rounded-lg px-2.5 py-2 text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Students ({data.students.length})</option>
                    <option value="seen">Seen Only ({data.summary.seen_count})</option>
                    <option value="unseen">Unseen Only ({data.summary.unseen_count})</option>
                  </select>

                  {/* Sort Filter */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-xs bg-white border border-gray-300 rounded-lg px-2.5 py-2 text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="status">Sort by Seen Status</option>
                    <option value="views">Sort by View Count</option>
                    <option value="date">Sort by Last Seen</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs">
                {filteredStudents.length === 0 ? (
                  <EmptyState
                    title="No students found"
                    description={
                      data.students.length === 0
                        ? 'No students are currently enrolled in this classroom.'
                        : 'No students matched your search criteria.'
                    }
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <tr>
                          <th className="px-5 py-3">Student</th>
                          <th className="px-5 py-3">Status</th>
                          <th className="px-5 py-3">First Opened</th>
                          <th className="px-5 py-3">Last Viewed</th>
                          <th className="px-5 py-3 text-center">Total Views</th>
                          {entityType === 'assignment' && (
                            <th className="px-5 py-3">Submission</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredStudents.map((st) => (
                          <tr key={st.student_id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <Avatar name={st.full_name} url={st.avatar_url} size="sm" />
                                <div>
                                  <div className="font-medium text-gray-900 text-sm">{st.full_name}</div>
                                  <div className="text-xs text-gray-400">{st.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <SeenBadge
                                status={st.status}
                                firstViewedAt={st.first_viewed_at}
                                viewCount={st.view_count}
                              />
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-600">
                              {st.first_viewed_at ? new Date(st.first_viewed_at).toLocaleString() : '—'}
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-600">
                              {st.last_viewed_at ? new Date(st.last_viewed_at).toLocaleString() : '—'}
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap text-center text-xs font-medium text-gray-700">
                              {st.view_count > 0 ? (
                                <span className="inline-block px-2 py-0.5 bg-gray-100 rounded text-gray-800">
                                  {st.view_count}
                                </span>
                              ) : (
                                <span className="text-gray-400">0</span>
                              )}
                            </td>
                            {entityType === 'assignment' && (
                              <td className="px-5 py-3.5 whitespace-nowrap text-xs">
                                {st.has_submitted ? (
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                      Turned In {st.is_late ? '(Late)' : ''}
                                    </span>
                                    {st.marks_obtained !== null && st.marks_obtained !== undefined && (
                                      <span className="text-gray-600 font-medium">
                                        {st.marks_obtained} pts
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic">Not submitted</span>
                                )}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
