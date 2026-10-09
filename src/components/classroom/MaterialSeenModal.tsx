import React, { useState } from 'react';
import { 
  X, Check, CheckCheck, Eye, Search, Bell, Users, FileText, 
  Megaphone, Clock, AlertCircle, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatDate, formatRelativeTime } from '../../lib/utils';

interface MaterialSeenModalProps {
  isOpen: boolean;
  onClose: () => void;
  materialId: string;
  materialTitle: string;
  materialType: 'assignment' | 'announcement' | 'pdf' | 'notes' | 'document' | 'link';
  classId: string;
  className?: string;
  postedAt?: string;
}

export const MaterialSeenModal: React.FC<MaterialSeenModalProps> = ({
  isOpen,
  onClose,
  materialId,
  materialTitle,
  materialType,
  classId,
  className,
  postedAt,
}) => {
  const { user } = useAuth();
  const { members, views, materialViews, sendReminderToUnseenStudents } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'seen' | 'unseen'>('all');
  const [reminderSentCount, setReminderSentCount] = useState<number | null>(null);

  // CRITICAL PRIVACY RULE: Only teacher and admin can see who has seen / unseen the material!
  if (!isOpen || (user?.role !== 'teacher' && user?.role !== 'admin')) {
    return null;
  }

  // Enrolled students for this class
  const classStudents = members.filter(
    (m) => m.classId === classId && m.role === 'student'
  );
  const totalStudents = Math.max(classStudents.length, 1);

  // Views for this material (either in assignment views or general material views)
  const currentViews = [
    ...materialViews.filter((v) => v.materialId === materialId),
    ...views.filter((v) => v.assignmentId === materialId).map((v) => ({
      id: v.id,
      materialId: v.assignmentId,
      studentId: v.studentId,
      classId,
      studentName: v.studentName,
      studentEmail: v.studentEmail,
      studentAvatar: v.studentAvatar,
      seen: true,
      firstSeenAt: v.firstSeenAt,
      lastSeenAt: v.lastSeenAt,
      viewCount: v.viewCount,
    })),
  ];

  // De-duplicate views by studentId
  const uniqueViewsMap = new Map<string, typeof currentViews[0]>();
  currentViews.forEach((v) => {
    if (!uniqueViewsMap.has(v.studentId)) {
      uniqueViewsMap.set(v.studentId, v);
    }
  });

  // Calculate seen and unseen
  const studentRows = classStudents.map((st) => {
    const view = uniqueViewsMap.get(st.userId);
    return {
      userId: st.userId,
      name: st.userName,
      email: st.userEmail,
      avatar: st.userAvatar,
      seen: !!view,
      firstSeenAt: view?.firstSeenAt,
      lastSeenAt: view?.lastSeenAt,
      viewCount: view?.viewCount || 0,
    };
  });

  const seenStudents = studentRows.filter((s) => s.seen);
  const unseenStudents = studentRows.filter((s) => !s.seen);
  const seenPercentage = Math.round((seenStudents.length / classStudents.length) * 100) || 0;

  // Filter and search
  const filteredRows = studentRows
    .filter((s) => {
      if (filterTab === 'seen') return s.seen;
      if (filterTab === 'unseen') return !s.seen;
      return true;
    })
    .filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    });

  const handleSendReminder = () => {
    const count = sendReminderToUnseenStudents(materialId, materialTitle, classId);
    setReminderSentCount(count);
    setTimeout(() => {
      setReminderSentCount(null);
    }, 4000);
  };

  const getIcon = () => {
    switch (materialType) {
      case 'assignment':
        return <FileText className="w-5 h-5 text-[#1A73E8]" />;
      case 'announcement':
        return <Megaphone className="w-5 h-5 text-[#188038]" />;
      case 'pdf':
      case 'document':
      case 'notes':
        return <FileText className="w-5 h-5 text-[#B06000]" />;
      default:
        return <FileText className="w-5 h-5 text-[#1A73E8]" />;
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 cursor-default animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-[#DADCE0] rounded-xl shadow-2xl max-w-xl w-full flex flex-col max-h-[90vh] overflow-hidden text-left"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#DADCE0] flex items-start justify-between gap-3 bg-[#F8F9FA]">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2.5 rounded-lg bg-white border border-[#DADCE0] shrink-0 shadow-2xs">
              {getIcon()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-[#1A73E8]">
                  {materialType}
                </span>
                {className && (
                  <span className="text-xs text-[#5F6368] font-medium">
                    {className}
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-[#202124] truncate mt-1">
                {materialTitle}
              </h2>
              {postedAt && (
                <p className="text-[11px] text-[#5F6368] mt-0.5">
                  Posted {formatDate(postedAt)}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#5F6368] hover:text-[#202124] hover:bg-slate-200 rounded-full transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Privacy notice banner */}
        <div className="px-5 py-2 bg-slate-50 border-b border-[#DADCE0] text-[11px] text-[#5F6368] flex items-center gap-1.5">
          <span className="font-semibold text-[#188038] flex items-center gap-1">🔒 Instructor Confidentiality:</span>
          <span>Only the teacher can see who has seen or unseen this material. Students cannot see classmate tracking.</span>
        </div>

        {/* Engagement Progress Card (Requirement 7 & 8) */}
        <div className="p-5 border-b border-[#DADCE0] bg-white space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#202124] flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#1A73E8]" />
              <strong>{seenStudents.length}</strong> of <strong>{classStudents.length}</strong> students have seen this material
            </span>
            <span className="font-bold text-sm text-[#1A73E8]">
              {seenPercentage}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-[#DADCE0]/50">
            <div
              className="bg-[#1A73E8] h-full rounded-full transition-all duration-300"
              style={{ width: `${seenPercentage}%` }}
            />
          </div>

          {/* Quick Stats: Seen vs Unseen */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div 
              onClick={() => setFilterTab('seen')}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between text-xs ${
                filterTab === 'seen' ? 'border-[#188038] bg-emerald-50/50' : 'border-[#DADCE0] hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCheck className="w-4 h-4 text-[#188038]" />
                <span className="font-medium text-[#202124]">Seen</span>
              </div>
              <span className="font-bold text-[#188038]">{seenStudents.length}</span>
            </div>

            <div 
              onClick={() => setFilterTab('unseen')}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between text-xs ${
                filterTab === 'unseen' ? 'border-[#5F6368] bg-slate-100' : 'border-[#DADCE0] hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-[#5F6368] inline-block" />
                <span className="font-medium text-[#202124]">Unseen</span>
              </div>
              <span className="font-bold text-[#5F6368]">{unseenStudents.length}</span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 border-b border-[#DADCE0] bg-[#F8F9FA] flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5F6368]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#DADCE0] rounded-lg text-xs text-[#202124] focus:outline-hidden focus:border-[#1A73E8]"
            />
          </div>

          <div className="flex gap-1.5 shrink-0">
            {(['all', 'seen', 'unseen'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  filterTab === tab
                    ? 'bg-[#1A73E8] text-white shadow-xs'
                    : 'bg-white text-[#5F6368] hover:text-[#202124] border border-[#DADCE0]'
                }`}
              >
                {tab === 'all' ? `All (${studentRows.length})` : tab === 'seen' ? `Seen (${seenStudents.length})` : `Unseen (${unseenStudents.length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Student List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#DADCE0] max-h-96">
          {filteredRows.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#5F6368] space-y-1">
              <Users className="w-8 h-8 text-[#5F6368] mx-auto opacity-40 mb-2" />
              <p className="font-medium">No students match your criteria.</p>
              {searchQuery && (
                <p className="text-[11px] text-[#5F6368]">Try searching with a different name or email.</p>
              )}
            </div>
          ) : (
            filteredRows.map((st) => (
              <div
                key={st.userId}
                className="p-3.5 px-5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors text-xs"
              >
                {/* Student Info */}
                <div className="flex items-center gap-3 min-w-0">
                  {st.avatar ? (
                    <img
                      src={st.avatar}
                      alt={st.name}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1A73E8] font-bold flex items-center justify-center text-xs shrink-0">
                      {st.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-[#202124] truncate">{st.name}</p>
                    <p className="text-[11px] text-[#5F6368] truncate">{st.email}</p>
                  </div>
                </div>

                {/* WhatsApp-Style Status (Requirement 1 & 2) */}
                <div className="text-right shrink-0">
                  {st.seen ? (
                    <div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#188038] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCheck className="w-3.5 h-3.5 text-[#188038]" /> Seen
                      </span>
                      <p className="text-[10px] text-[#5F6368] mt-0.5">
                        {st.lastSeenAt ? formatRelativeTime(st.lastSeenAt) : 'Recently'}
                        {st.viewCount > 1 ? ` • ${st.viewCount} views` : ''}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#5F6368] bg-slate-100 px-2 py-0.5 rounded border border-[#DADCE0]">
                        <span className="w-2 h-2 rounded-full border border-[#5F6368] inline-block" /> Unseen
                      </span>
                      <p className="text-[10px] text-[#5F6368] mt-0.5">
                        Not opened yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#DADCE0] bg-[#F8F9FA] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {reminderSentCount !== null ? (
            <div className="text-[#188038] font-semibold flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Reminder notification sent to {reminderSentCount} unseen students!
            </div>
          ) : unseenStudents.length > 0 ? (
            <button
              onClick={handleSendReminder}
              className="w-full sm:w-auto px-3.5 py-2 bg-white hover:bg-slate-100 border border-[#DADCE0] text-[#1A73E8] hover:text-[#1557B0] font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
            >
              <Bell className="w-4 h-4" /> Send Reminder to Unseen Students ({unseenStudents.length})
            </button>
          ) : (
            <div className="text-[#188038] font-medium flex items-center gap-1">
              <CheckCheck className="w-4 h-4" /> All enrolled students have viewed this material!
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white font-semibold rounded-lg shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
