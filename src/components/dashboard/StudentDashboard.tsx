import React from 'react';
import { BookOpen, Calendar, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatDate, formatRelativeTime } from '../../lib/utils';
import { DueSoonBadge } from '../ui/DueSoonBadge';
import { ClassCard } from '../classroom/ClassCard';

interface StudentDashboardProps {
  onNavigate: (view: string, id?: string) => void;
  openJoinClassModal: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigate,
  openJoinClassModal,
}) => {
  const { user } = useAuth();
  const { classes, members, assignments, views, submissions } = useData();

  // Filter student's enrolled classes
  const myClassIds = members
    .filter((m) => m.userId === user?.id)
    .map((m) => m.classId);
  const myClasses = classes.filter((c) => myClassIds.includes(c.id));

  // My assignments
  const myAssignments = assignments.filter((a) => myClassIds.includes(a.classId));

  // Calculate submission status
  const pendingAssignments = myAssignments
    .filter((a) => {
      const sub = submissions.find((s) => s.assignmentId === a.id && s.studentId === user?.id);
      return !sub || (sub.status !== 'submitted' && sub.status !== 'graded');
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  // Recent Activity timeline
  const recentTimeline = [
    ...myAssignments.map((a) => ({
      type: 'posted',
      title: `Assignment posted: "${a.title}"`,
      time: a.createdAt,
      className: a.className,
      id: a.id,
    })),
    ...views
      .filter((v) => v.studentId === user?.id)
      .map((v) => {
        const asg = assignments.find((a) => a.id === v.assignmentId);
        return {
          type: 'seen',
          title: `Viewed assignment: "${asg?.title || 'Assignment'}"`,
          time: v.lastSeenAt,
          className: asg?.className || '',
          id: v.assignmentId,
        };
      }),
    ...submissions
      .filter((s) => s.studentId === user?.id)
      .map((s) => {
        const asg = assignments.find((a) => a.id === s.assignmentId);
        return {
          type: s.status === 'graded' ? 'graded' : 'submitted',
          title: s.status === 'graded'
            ? `Graded: ${s.grade}/${asg?.points || 100} on "${asg?.title}"`
            : `Submitted: "${asg?.title}"`,
          time: s.submittedAt,
          className: asg?.className || '',
          id: s.assignmentId,
        };
      }),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 text-left">
      {/* Header Greeting */}
      <div className="pb-2 border-b border-[#DADCE0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold text-[#202124]">
            {getGreeting()}, {user?.name}
          </h1>
          <p className="text-xs text-[#5F6368]">
            Here is your coursework and upcoming deadlines for today.
          </p>
        </div>
        <button
          onClick={openJoinClassModal}
          className="px-3.5 py-1.5 text-xs font-semibold bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-lg transition-colors shadow-xs"
        >
          Join a class
        </button>
      </div>

      {/* Your Classes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#202124]">Your Classes</h2>
          <button
            onClick={() => onNavigate('classes')}
            className="text-xs font-semibold text-[#1A73E8] hover:underline flex items-center gap-1"
          >
            View all ({myClasses.length}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {myClasses.length === 0 ? (
          <div className="p-8 text-center bg-white border border-[#DADCE0] rounded-xl space-y-3">
            <BookOpen className="w-10 h-10 text-[#5F6368] mx-auto opacity-40" />
            <h3 className="text-sm font-semibold text-[#202124]">No classes yet</h3>
            <p className="text-xs text-[#5F6368] max-w-sm mx-auto">
              You are not enrolled in any classes. Enter a class code from your teacher to join.
            </p>
            <button
              onClick={openJoinClassModal}
              className="px-4 py-2 bg-[#1A73E8] text-white rounded-lg text-xs font-semibold hover:bg-[#1557B0]"
            >
              Join Class
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myClasses.map((cls) => (
              <ClassCard
                key={cls.id}
                cls={cls}
                onClick={() => onNavigate('class', cls.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 2 Columns: Upcoming & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Upcoming Assignments */}
        <div className="bg-white border border-[#DADCE0] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#DADCE0] pb-3">
            <h2 className="text-sm font-semibold text-[#202124] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#1A73E8]" /> Upcoming Deadlines
            </h2>
            <button
              onClick={() => onNavigate('assignments')}
              className="text-xs text-[#1A73E8] hover:underline font-medium"
            >
              View tasks
            </button>
          </div>

          {pendingAssignments.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#5F6368]">
              <CheckCircle2 className="w-8 h-8 text-[#188038] mx-auto mb-2 opacity-80" />
              Woohoo! No assignments due right now.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingAssignments.slice(0, 4).map((a) => (
                <div
                  key={a.id}
                  onClick={() => onNavigate('assignment', a.id)}
                  className="p-3 rounded-lg border border-[#DADCE0] hover:border-[#1A73E8] hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-[#202124] truncate">{a.title}</p>
                      <DueSoonBadge dueDate={a.dueDate} size="sm" showCountdown={false} />
                    </div>
                    <p className="text-[11px] text-[#5F6368]">{a.className}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-medium text-[#D93025] flex items-center gap-1 justify-end">
                      <Clock className="w-3.5 h-3.5" /> Due {formatDate(a.dueDate)}
                    </span>
                    <span className="text-[10px] text-[#5F6368]">{a.points} points</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-[#DADCE0] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#DADCE0] pb-3">
            <h2 className="text-sm font-semibold text-[#202124] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#188038]" /> Recent Activity
            </h2>
            <span className="text-[11px] text-[#5F6368]">Past few days</span>
          </div>

          {recentTimeline.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#5F6368]">
              No recent activity recorded.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentTimeline.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onNavigate('assignment', item.id)}
                  className="p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors flex items-start justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-[#202124] truncate">{item.title}</p>
                    <p className="text-[11px] text-[#5F6368]">{item.className}</p>
                  </div>
                  <span className="text-[10px] text-[#5F6368] shrink-0 font-mono">
                    {formatRelativeTime(item.time)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
