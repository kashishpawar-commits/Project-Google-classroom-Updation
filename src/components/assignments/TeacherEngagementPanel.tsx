import React, { useState } from 'react';
import { 
  Eye, CheckCircle2, Clock, Search, Filter, 
  ArrowLeft, User, Check, CheckCheck, FileText, Bell, 
  BookMarked, Video, Link2, FolderOpen
} from 'lucide-react';
import { Assignment, Material } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatDate, formatRelativeTime } from '../../lib/utils';
import { DueSoonBadge } from '../ui/DueSoonBadge';

interface TeacherEngagementPanelProps {
  assignmentId?: string;
  assignment?: Assignment;
  onNavigate?: (view: string, id?: string) => void;
  onBack?: () => void;
  openSubmissionsManager?: (asgId: string) => void;
}

export const TeacherEngagementPanel: React.FC<TeacherEngagementPanelProps> = ({
  assignmentId,
  assignment: propsAssignment,
  onNavigate,
  onBack,
  openSubmissionsManager,
}) => {
  const { user } = useAuth();
  const { 
    classes, members, views, materialViews, submissions, 
    assignments, materials, sendReminderToUnseenStudents 
  } = useData();

  // Unified list of trackable items (Assignments + Study Materials)
  const trackableItems = [
    ...materials.map((m) => ({
      id: m.id,
      title: m.title,
      type: m.type,
      classId: m.classId,
      className: m.className || classes.find((c) => c.id === m.classId)?.name || 'Course',
      isAssignment: false,
      points: undefined,
    })),
    ...assignments.map((a) => ({
      id: a.id,
      title: a.title,
      type: 'assignment' as const,
      classId: a.classId,
      className: a.className || classes.find((c) => c.id === a.classId)?.name || 'Course',
      isAssignment: true,
      points: a.points,
    })),
  ];

  const [selectedItemId, setSelectedItemId] = useState<string>(
    propsAssignment?.id || assignmentId || (trackableItems[0]?.id ?? '')
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'seen' | 'unseen' | 'submitted' | 'graded'>('all');
  const [reminderNote, setReminderNote] = useState<string | null>(null);

  // CRITICAL PRIVACY: Only teacher or admin can access
  if (user?.role !== 'teacher' && user?.role !== 'admin') {
    return (
      <div className="p-12 text-center bg-white border border-[#DADCE0] rounded-xl space-y-3">
        <FileText className="w-12 h-12 text-[#5F6368] mx-auto opacity-50" />
        <h3 className="text-base font-bold text-[#202124]">Teacher Access Only</h3>
        <p className="text-xs text-[#5F6368]">
          Material seen/unseen tracking analytics are strictly confidential and reserved for course instructors.
        </p>
      </div>
    );
  }

  const activeItem =
    trackableItems.find((item) => item.id === selectedItemId) ||
    trackableItems.find((item) => item.id === propsAssignment?.id) ||
    trackableItems[0];

  if (!activeItem) {
    return (
      <div className="p-12 text-center bg-white border border-[#DADCE0] rounded-xl space-y-4">
        <FileText className="w-12 h-12 text-[#5F6368] mx-auto opacity-50" />
        <h3 className="text-lg font-bold text-[#202124]">No Materials or Assignments Available</h3>
        <p className="text-xs text-[#5F6368]">
          Upload study materials or create an assignment to view student seen tracking.
        </p>
      </div>
    );
  }

  // Get enrolled students for this class
  const classStudents = members.filter(
    (m) => m.classId === activeItem.classId && m.role === 'student'
  );
  const totalStudents = Math.max(classStudents.length, 1);

  // Get views & submissions for active item
  const itemViews = activeItem.isAssignment
    ? views.filter((v) => v.assignmentId === activeItem.id)
    : materialViews.filter((v) => v.materialId === activeItem.id && v.seen);

  const itemSubmissions = activeItem.isAssignment
    ? submissions.filter((s) => s.assignmentId === activeItem.id)
    : [];

  // Engagement Counts
  const seenStudents = classStudents.filter((s) =>
    activeItem.isAssignment
      ? itemViews.some((v) => (v as any).studentId === s.userId)
      : itemViews.some((v) => v.studentId === s.userId)
  );

  const unseenStudents = classStudents.filter((s) =>
    activeItem.isAssignment
      ? !itemViews.some((v) => (v as any).studentId === s.userId)
      : !itemViews.some((v) => v.studentId === s.userId)
  );

  const submittedStudents = classStudents.filter((s) =>
    itemSubmissions.some((sub) => sub.studentId === s.userId && (sub.status === 'submitted' || sub.status === 'graded'))
  );

  const gradedStudents = classStudents.filter((s) =>
    itemSubmissions.some((sub) => sub.studentId === s.userId && sub.status === 'graded')
  );

  const seenPct = Math.round((seenStudents.length / totalStudents) * 100);
  const subPct = Math.round((submittedStudents.length / totalStudents) * 100);

  // Filter student rows
  const studentRows = classStudents.map((m) => {
    const view = itemViews.find((v) => (v as any).studentId === m.userId);
    const sub = itemSubmissions.find((s) => s.studentId === m.userId);
    return {
      userId: m.userId,
      name: m.userName,
      email: m.userEmail,
      avatar: m.userAvatar,
      seen: !!view,
      firstSeenAt: view?.firstSeenAt,
      lastSeenAt: view?.lastSeenAt,
      viewCount: view?.viewCount || 0,
      submission: sub,
      submissionStatus: sub?.status,
      grade: sub?.grade,
      feedback: sub?.feedback,
      submittedAt: sub?.submittedAt,
    };
  }).filter((row) => {
    const matchesSearch =
      row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterStatus === 'seen') return row.seen;
    if (filterStatus === 'unseen') return !row.seen;
    if (filterStatus === 'submitted') return row.submissionStatus === 'submitted';
    if (filterStatus === 'graded') return row.submissionStatus === 'graded';
    return true;
  });

  return (
    <div className="space-y-6 text-left">
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5F6368] hover:text-[#202124] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      )}

      {/* Header and Material Picker */}
      <div className="p-6 bg-white border border-[#DADCE0] rounded-xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#1A73E8] bg-blue-50 px-2.5 py-0.5 rounded">
                {activeItem.className}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-[#188038] border border-emerald-200">
                {activeItem.type}
              </span>
            </div>
            <h1 className="text-xl font-bold text-[#202124] mt-1">
              {activeItem.title}
            </h1>
            <p className="text-xs text-[#5F6368]">
              Track WhatsApp-style blue ticks (seen/unseen) and interaction timestamps for this learning content.
            </p>
          </div>

          <div className="w-full sm:w-auto">
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2 bg-[#F8F9FA] text-[#202124] border border-[#DADCE0] rounded-lg text-xs font-semibold focus:border-[#1A73E8] outline-hidden"
            >
              <optgroup label="Study Materials (Notes / PDFs / Links)">
                {trackableItems.filter((i) => !i.isAssignment).map((item) => (
                  <option key={item.id} value={item.id}>
                    📄 {item.title} ({item.className})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Assignments & Coursework">
                {trackableItems.filter((i) => i.isAssignment).map((item) => (
                  <option key={item.id} value={item.id}>
                    📝 {item.title} ({item.className})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 bg-[#F8F9FA] border border-[#DADCE0] rounded-lg">
            <p className="text-[11px] font-semibold text-[#5F6368]">Enrolled Students</p>
            <p className="text-xl font-bold text-[#202124]">{totalStudents}</p>
          </div>

          <div className="p-3 bg-[#F8F9FA] border border-[#DADCE0] rounded-lg">
            <p className="text-[11px] font-semibold text-[#5F6368] flex items-center gap-1">
              <CheckCheck className="w-3.5 h-3.5 text-[#188038]" /> Students Seen
            </p>
            <p className="text-xl font-bold text-[#1A73E8]">
              {seenStudents.length} <span className="text-xs font-normal text-[#5F6368]">({seenPct}%)</span>
            </p>
          </div>

          <div className="p-3 bg-[#F8F9FA] border border-[#DADCE0] rounded-lg">
            <p className="text-[11px] font-semibold text-[#5F6368] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full border border-[#B06000] inline-block" /> Unseen
            </p>
            <p className="text-xl font-bold text-[#B06000]">
              {unseenStudents.length} <span className="text-xs font-normal text-[#5F6368]">({100 - seenPct}%)</span>
            </p>
          </div>

          <div className="p-3 bg-[#F8F9FA] border border-[#DADCE0] rounded-lg">
            <p className="text-[11px] font-semibold text-[#5F6368]">
              {activeItem.isAssignment ? 'Turned In' : 'Engagement Rate'}
            </p>
            <p className="text-xl font-bold text-[#188038]">
              {activeItem.isAssignment ? `${submittedStudents.length} (${subPct}%)` : `${seenPct}%`}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white border border-[#DADCE0] rounded-xl flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5F6368]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#F8F9FA] border border-[#DADCE0] rounded-lg text-xs text-[#202124] focus:border-[#1A73E8] focus:bg-white outline-hidden"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center">
          {(['all', 'seen', 'unseen'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors flex items-center gap-1.5 ${
                filterStatus === status
                  ? 'bg-[#1A73E8] text-white shadow-xs'
                  : 'bg-[#F8F9FA] text-[#5F6368] hover:bg-slate-100 border border-[#DADCE0]'
              }`}
            >
              {status === 'seen' && <CheckCheck className="w-3.5 h-3.5" />}
              {status === 'unseen' && <span className="w-2 h-2 rounded-full border border-current" />}
              {status === 'seen' ? `Seen (${seenStudents.length})` : status === 'unseen' ? `Unseen (${unseenStudents.length})` : `All (${totalStudents})`}
            </button>
          ))}

          {activeItem.isAssignment && (
            <>
              <button
                onClick={() => setFilterStatus('submitted')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  filterStatus === 'submitted'
                    ? 'bg-[#1A73E8] text-white shadow-xs'
                    : 'bg-[#F8F9FA] text-[#5F6368] hover:bg-slate-100 border border-[#DADCE0]'
                }`}
              >
                Submitted ({submittedStudents.length})
              </button>
            </>
          )}

          {unseenStudents.length > 0 && (
            <button
              onClick={() => {
                const count = sendReminderToUnseenStudents(activeItem.id, activeItem.title, activeItem.classId);
                setReminderNote(`Reminder notification sent to ${count} students!`);
                setTimeout(() => setReminderNote(null), 4000);
              }}
              className="px-3 py-1.5 bg-white border border-[#DADCE0] text-[#1A73E8] hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Bell className="w-3.5 h-3.5" /> Remind Unseen ({unseenStudents.length})
            </button>
          )}
        </div>
      </div>

      {reminderNote && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" /> {reminderNote}
        </div>
      )}

      {/* Student Seen Tracking Table */}
      <div className="bg-white border border-[#DADCE0] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F9FA] border-b border-[#DADCE0] text-[#5F6368] uppercase text-[10px] font-semibold">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Seen Tracking (WhatsApp Status)</th>
                <th className="py-3 px-4">View Frequency</th>
                {activeItem.isAssignment && (
                  <>
                    <th className="py-3 px-4">Submission Status</th>
                    <th className="py-3 px-4">Grade</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DADCE0]">
              {studentRows.length === 0 ? (
                <tr>
                  <td colSpan={activeItem.isAssignment ? 6 : 3} className="py-8 text-center text-[#5F6368]">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                studentRows.map((r) => (
                  <tr key={r.userId} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        {r.avatar ? (
                          <img src={r.avatar} alt={r.name} className="w-7 h-7 rounded-full object-cover" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-[#5F6368] font-bold flex items-center justify-center text-[10px]">
                            {r.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-[#202124]">{r.name}</p>
                          <p className="text-[10px] text-[#5F6368]">{r.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* WhatsApp-Style Seen Status */}
                    <td className="py-3.5 px-4">
                      {r.seen ? (
                        <div>
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#188038] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCheck className="w-3.5 h-3.5 text-[#188038]" /> ✓✓ Seen
                          </span>
                          <span className="text-[10px] text-[#5F6368] block mt-0.5">
                            Seen: {formatRelativeTime(r.lastSeenAt || r.firstSeenAt)}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#5F6368] bg-slate-100 px-2 py-0.5 rounded border border-[#DADCE0]">
                            <span className="w-2 h-2 rounded-full border border-[#5F6368] inline-block" /> ○ Unseen
                          </span>
                          <span className="text-[10px] text-[#5F6368] block mt-0.5">
                            Not opened yet
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-[#202124]">
                      {r.viewCount > 0 ? `${r.viewCount}x opened` : '—'}
                    </td>

                    {activeItem.isAssignment && (
                      <>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            r.submissionStatus === 'graded' 
                              ? 'bg-emerald-50 text-[#188038]' 
                              : r.submissionStatus === 'submitted' 
                              ? 'bg-blue-50 text-[#1A73E8]' 
                              : 'bg-slate-100 text-[#5F6368]'
                          }`}>
                            {r.submissionStatus ? r.submissionStatus.toUpperCase() : 'ASSIGNED'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-[#202124]">
                          {r.grade !== undefined ? `${r.grade} / ${activeItem.points}` : '—'}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {r.submission ? (
                            <button
                              onClick={() => {
                                if (openSubmissionsManager) {
                                  openSubmissionsManager(activeItem.id);
                                } else if (onNavigate) {
                                  onNavigate('assignment', activeItem.id);
                                }
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold text-[#1A73E8] bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                            >
                              Review Work
                            </button>
                          ) : (
                            <span className="text-[11px] text-[#5F6368] italic">No submission</span>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
