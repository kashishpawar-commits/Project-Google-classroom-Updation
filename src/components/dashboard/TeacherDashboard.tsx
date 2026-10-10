import React, { useState } from 'react';
import { 
  Users, BookOpen, FileText, CheckSquare, Plus, ArrowRight, 
  Clock, Megaphone, Send, Eye, CheckCheck, BookMarked, Video, 
  Link2, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatRelativeTime } from '../../lib/utils';
import { DueSoonBadge } from '../ui/DueSoonBadge';
import { ClassCard } from '../classroom/ClassCard';
import { MaterialSeenModal } from '../classroom/MaterialSeenModal';

interface TeacherDashboardProps {
  onNavigate: (view: string, id?: string) => void;
  openCreateClassModal: () => void;
  openCreateAssignmentModal: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onNavigate,
  openCreateClassModal,
  openCreateAssignmentModal,
}) => {
  const { user } = useAuth();
  const { 
    classes, members, assignments, materials, 
    submissions, announcements, materialViews, views 
  } = useData();

  const [selectedMaterialForSeen, setSelectedMaterialForSeen] = useState<{
    id: string;
    title: string;
    type: 'assignment' | 'announcement' | 'pdf' | 'notes' | 'document' | 'link';
    classId: string;
    className?: string;
    postedAt?: string;
  } | null>(null);

  const myClasses = classes.filter((c) => c.teacherId === user?.id);
  const myClassIds = new Set(myClasses.map((c) => c.id));

  // Teacher's materials & assignments
  const myMaterials = materials.filter((m) => myClassIds.has(m.classId));
  const myAssignments = assignments.filter((a) => myClassIds.has(a.classId));
  const myAssignmentIds = new Set(myAssignments.map((a) => a.id));
  const mySubmissions = submissions.filter((s) => myAssignmentIds.has(s.assignmentId));

  const pendingSubmissions = mySubmissions.filter((s) => s.status === 'submitted');

  // Enrolled students across teacher's classes
  const myStudents = members.filter((m) => myClassIds.has(m.classId) && m.role === 'student');
  const uniqueStudentIds = new Set(myStudents.map((s) => s.userId));
  const totalEnrolledStudents = uniqueStudentIds.size;

  // Engagement stats
  let totalStudentMaterialPairs = 0;
  let seenStudentMaterialPairs = 0;

  // Track across materials
  myMaterials.forEach((mat) => {
    const classStudents = members.filter((m) => m.classId === mat.classId && m.role === 'student');
    totalStudentMaterialPairs += classStudents.length;
    const mViews = materialViews.filter((v) => v.materialId === mat.id && v.seen);
    const seenCount = classStudents.filter((st) => mViews.some((v) => v.studentId === st.userId)).length;
    seenStudentMaterialPairs += seenCount;
  });

  // Track across assignments
  myAssignments.forEach((asg) => {
    const classStudents = members.filter((m) => m.classId === asg.classId && m.role === 'student');
    totalStudentMaterialPairs += classStudents.length;
    const aViews = views.filter((v) => v.assignmentId === asg.id);
    const seenCount = classStudents.filter((st) => aViews.some((v) => v.studentId === st.userId)).length;
    seenStudentMaterialPairs += seenCount;
  });

  const unseenStudentMaterialPairs = Math.max(0, totalStudentMaterialPairs - seenStudentMaterialPairs);
  const totalItems = myMaterials.length + myAssignments.length;

  // Recent materials for the highlight section
  const recentDisplayMaterials = [
    ...myMaterials.map((m) => ({
      id: m.id,
      title: m.title,
      type: m.type,
      classId: m.classId,
      className: m.className || myClasses.find((c) => c.id === m.classId)?.name,
      createdAt: m.createdAt,
      isAssignment: false,
    })),
    ...myAssignments.map((a) => ({
      id: a.id,
      title: a.title,
      type: 'assignment' as const,
      classId: a.classId,
      className: a.className || myClasses.find((c) => c.id === a.classId)?.name,
      createdAt: a.createdAt,
      dueDate: a.dueDate,
      isAssignment: true,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
   .slice(0, 4);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-[#D93025]" />;
      case 'notes':
        return <BookMarked className="w-4 h-4 text-[#188038]" />;
      case 'video':
        return <Video className="w-4 h-4 text-[#7627BB]" />;
      case 'link':
        return <Link2 className="w-4 h-4 text-[#1A73E8]" />;
      default:
        return <FileText className="w-4 h-4 text-[#1A73E8]" />;
    }
  };

  return (
    <div className="space-y-8 text-left">
      {/* Header Greeting & Quick Actions */}
      <div className="pb-3 border-b border-[#DADCE0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#202124]">
            Good day, {user?.name}
          </h1>
          <p className="text-xs text-[#5F6368]">
            Here's what's happening in your classes and student material engagement.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('materials')}
            className="px-3.5 py-1.5 text-xs font-semibold bg-white border border-[#DADCE0] text-[#1A73E8] hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4" /> Create Material
          </button>
          <button
            onClick={openCreateAssignmentModal}
            className="px-3.5 py-1.5 text-xs font-semibold bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" /> Assignment
          </button>
          <button
            onClick={openCreateClassModal}
            className="px-3.5 py-1.5 text-xs font-semibold bg-white border border-[#DADCE0] text-[#202124] hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-[#5F6368]" /> Create Class
          </button>
        </div>
      </div>

      {/* MATERIAL ENGAGEMENT SUMMARY CARD */}
      <div className="bg-white border border-[#DADCE0] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#DADCE0] pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[#202124] uppercase tracking-wider">
              MATERIAL ENGAGEMENT
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-[#188038] border border-emerald-200">
              Seen Tracking Active
            </span>
          </div>
          <button
            onClick={() => onNavigate('seen-tracking')}
            className="text-xs font-semibold text-[#1A73E8] hover:underline flex items-center gap-1"
          >
            View Full Tracking <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 bg-[#F8F9FA] border border-[#DADCE0] rounded-lg">
            <p className="text-[11px] font-semibold text-[#5F6368] uppercase tracking-wider">Total Materials</p>
            <p className="text-2xl font-bold text-[#202124] mt-0.5">{totalItems}</p>
            <p className="text-[10px] text-[#5F6368] mt-1">{myMaterials.length} notes/PDFs • {myAssignments.length} tasks</p>
          </div>

          <div className="p-3.5 bg-[#F8F9FA] border border-[#DADCE0] rounded-lg">
            <p className="text-[11px] font-semibold text-[#5F6368] uppercase tracking-wider">Total Students</p>
            <p className="text-2xl font-bold text-[#202124] mt-0.5">{totalEnrolledStudents}</p>
            <p className="text-[10px] text-[#5F6368] mt-1">across {myClasses.length} courses</p>
          </div>

          <div className="p-3.5 bg-emerald-50/50 border border-emerald-200/80 rounded-lg">
            <p className="text-[11px] font-semibold text-[#188038] uppercase tracking-wider flex items-center gap-1">
              <CheckCheck className="w-3.5 h-3.5 text-[#188038]" /> Seen Engagements
            </p>
            <p className="text-2xl font-bold text-[#188038] mt-0.5">{seenStudentMaterialPairs}</p>
            <p className="text-[10px] text-[#188038] mt-1">
              {totalStudentMaterialPairs > 0 
                ? `${Math.round((seenStudentMaterialPairs / totalStudentMaterialPairs) * 100)}% overall viewed` 
                : 'No engagements yet'}
            </p>
          </div>

          <div className="p-3.5 bg-amber-50/50 border border-amber-200/80 rounded-lg">
            <p className="text-[11px] font-semibold text-[#B06000] uppercase tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 rounded-full border border-[#B06000] inline-block" /> Unseen
            </p>
            <p className="text-2xl font-bold text-[#B06000] mt-0.5">{unseenStudentMaterialPairs}</p>
            <p className="text-[10px] text-[#B06000] mt-1">pending student opens</p>
          </div>
        </div>
      </div>

      {/* RECENT MATERIAL SECTION WITH SEEN PROGRESS BARS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#202124]">RECENT MATERIALS</h2>
            <p className="text-xs text-[#5F6368]">
              Instant view percentage and WhatsApp-style student seen breakdown
            </p>
          </div>
          <button
            onClick={() => onNavigate('materials')}
            className="text-xs font-semibold text-[#1A73E8] hover:underline flex items-center gap-1"
          >
            Manage All Materials ({myMaterials.length}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentDisplayMaterials.length === 0 ? (
          <div className="p-8 text-center bg-white border border-[#DADCE0] rounded-xl space-y-3">
            <FileText className="w-10 h-10 text-[#5F6368] mx-auto opacity-40" />
            <h3 className="text-sm font-semibold text-[#202124]">No materials posted yet</h3>
            <p className="text-xs text-[#5F6368] max-w-sm mx-auto">
              Provide study notes, PDFs, or assignments to start tracking which students have seen your content.
            </p>
            <button
              onClick={() => onNavigate('materials')}
              className="px-4 py-2 bg-[#1A73E8] text-white rounded-lg text-xs font-semibold hover:bg-[#1557B0]"
            >
              + Create Study Material
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentDisplayMaterials.map((item) => {
              const enrolledStudents = members.filter(
                (m) => m.classId === item.classId && m.role === 'student'
              );
              const totalStudents = Math.max(enrolledStudents.length, 1);

              let seenCount = 0;
              if (item.isAssignment) {
                const aViews = views.filter((v) => v.assignmentId === item.id);
                seenCount = enrolledStudents.filter((st) => aViews.some((v) => v.studentId === st.userId)).length;
              } else {
                const mViews = materialViews.filter((v) => v.materialId === item.id && v.seen);
                seenCount = enrolledStudents.filter((st) => mViews.some((v) => v.studentId === st.userId)).length;
              }

              const pct = Math.round((seenCount / totalStudents) * 100);

              return (
                <div
                  key={item.id}
                  className="bg-white border border-[#DADCE0] hover:border-slate-400 hover:shadow-md rounded-xl p-5 flex flex-col justify-between transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-lg bg-slate-50 border border-[#DADCE0] shrink-0">
                          {getTypeIcon(item.type)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-[#202124] truncate">
                              {item.title}
                            </h3>
                            {item.dueDate && (
                              <DueSoonBadge dueDate={item.dueDate} size="sm" showCountdown={true} />
                            )}
                          </div>
                          <p className="text-xs text-[#5F6368] mt-0.5">
                            {item.className || 'Course'} • Posted {formatRelativeTime(item.createdAt)}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#1A73E8] shrink-0">
                        {item.type}
                      </span>
                    </div>

                    {/* Seen metrics */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-[#202124] flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-[#1A73E8]" />
                          <strong>{seenCount}</strong> / {enrolledStudents.length} students have seen
                        </span>
                        <span className="font-bold text-[#1A73E8]">{pct}%</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-[#DADCE0]/50">
                        <div
                          className="bg-[#1A73E8] h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* View Seen Status Button */}
                  <div className="pt-4 mt-4 border-t border-[#DADCE0]">
                    <button
                      onClick={() => setSelectedMaterialForSeen({
                        id: item.id,
                        title: item.title,
                        type: item.type as any,
                        classId: item.classId,
                        className: item.className,
                        postedAt: item.createdAt,
                      })}
                      className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-[#1A73E8] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Eye className="w-4 h-4" /> View Seen Status
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* YOUR CLASSES SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#202124]">Your Classes</h2>
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
            <h3 className="text-sm font-semibold text-[#202124]">No classes created yet</h3>
            <p className="text-xs text-[#5F6368] max-w-sm mx-auto">
              Get started by creating your first course. You will receive a unique class code for your students.
            </p>
            <button
              onClick={openCreateClassModal}
              className="px-4 py-2 bg-[#1A73E8] text-white rounded-lg text-xs font-semibold hover:bg-[#1557B0]"
            >
              Create Class
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

      {/* PENDING GRADING */}
      <div className="bg-white border border-[#DADCE0] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#DADCE0] pb-3">
          <h2 className="text-sm font-semibold text-[#202124] flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[#B06000]" /> Pending Submissions to Review
          </h2>
          <span className="text-xs font-semibold text-[#B06000] bg-amber-50 px-2 py-0.5 rounded">
            {pendingSubmissions.length} waiting
          </span>
        </div>

        {pendingSubmissions.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#5F6368]">
            All caught up! No submissions currently waiting for review.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pendingSubmissions.slice(0, 4).map((sub) => {
              const asg = myAssignments.find((a) => a.id === sub.assignmentId);
              return (
                <div
                  key={sub.id}
                  onClick={() => onNavigate('assignment', sub.assignmentId)}
                  className="p-3 rounded-lg border border-[#DADCE0] hover:border-[#1A73E8] hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-semibold text-[#202124]">{sub.studentName}</p>
                    <p className="text-[11px] text-[#5F6368]">{asg?.title || 'Assignment'} • {asg?.className}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#5F6368] block">
                      {formatRelativeTime(sub.submittedAt)}
                    </span>
                    <span className="text-[11px] font-semibold text-[#1A73E8]">
                      Grade →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SEEN MODAL */}
      {selectedMaterialForSeen && (
        <MaterialSeenModal
          isOpen={!!selectedMaterialForSeen}
          onClose={() => setSelectedMaterialForSeen(null)}
          materialId={selectedMaterialForSeen.id}
          materialTitle={selectedMaterialForSeen.title}
          materialType={selectedMaterialForSeen.type}
          classId={selectedMaterialForSeen.classId}
          className={selectedMaterialForSeen.className}
          postedAt={selectedMaterialForSeen.postedAt}
        />
      )}
    </div>
  );
};
