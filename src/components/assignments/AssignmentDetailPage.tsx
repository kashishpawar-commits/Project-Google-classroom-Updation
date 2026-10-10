import React, { useEffect, useState } from 'react';
import { 
  FileText, Calendar, Clock, Paperclip, Upload, Send, MessageSquare, 
  CheckCircle2, AlertCircle, ArrowLeft, Eye, Download, Trash2, 
  Check, RotateCcw, User, CheckSquare, Edit, X, Search, Bell, CheckCheck 
} from 'lucide-react';
import { Assignment, Attachment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { StatusBadge } from '../ui/StatusBadge';
import { DueSoonBadge } from '../ui/DueSoonBadge';
import { formatDate, formatFileSize, formatRelativeTime } from '../../lib/utils';

interface AssignmentDetailPageProps {
  assignmentId?: string;
  assignment?: Assignment;
  onBack?: () => void;
  onNavigate?: (view: string, id?: string) => void;
  openSubmissionsManager?: (asgId: string) => void;
  openGradingModal?: (submissionId: string) => void;
}

export const AssignmentDetailPage: React.FC<AssignmentDetailPageProps> = ({
  assignmentId,
  assignment: propsAssignment,
  onBack,
  onNavigate,
}) => {
  const { user } = useAuth();
  const { 
    assignments, recordAssignmentView, submitAssignment, unsubmitAssignment, 
    gradeSubmission, submissions, views, comments, addComment, members,
    updateAssignment, deleteAssignment, sendReminderToUnseenStudents 
  } = useData();

  const assignment = propsAssignment || assignments.find((a) => a.id === assignmentId);

  const [activeTab, setActiveTab] = useState<'instructions' | 'student_work'>('instructions');
  const [textResponse, setTextResponse] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<Attachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPrivateComment, setNewPrivateComment] = useState('');
  const [newClassComment, setNewClassComment] = useState('');
  const [gradingScores, setGradingScores] = useState<{ [subId: string]: string }>({});
  const [gradingFeedbacks, setGradingFeedbacks] = useState<{ [subId: string]: string }>({});
  const [gradedSuccessMsg, setGradedSuccessMsg] = useState<string | null>(null);

  // Student list search & filter for teacher
  const [studentSearch, setStudentSearch] = useState('');
  const [studentFilter, setStudentFilter] = useState<'all' | 'seen' | 'unseen' | 'submitted' | 'graded'>('all');
  const [reminderMsg, setReminderMsg] = useState<string | null>(null);

  // Edit Assignment Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editInstructions, setEditInstructions] = useState('');
  const [editPoints, setEditPoints] = useState(100);
  const [editDueDate, setEditDueDate] = useState('');
  const [editTopic, setEditTopic] = useState('');

  // AUTOMATIC ASSIGNMENT SEEN TRACKING
  useEffect(() => {
    if (user && user.role === 'student' && assignment?.id) {
      recordAssignmentView(assignment.id);
    }
  }, [assignment?.id, user?.id]);

  if (!assignment) {
    return (
      <div className="p-12 text-center bg-white border border-[#DADCE0] rounded-xl space-y-4">
        <FileText className="w-12 h-12 text-[#5F6368] mx-auto opacity-50" />
        <h3 className="text-lg font-bold text-[#202124]">Assignment Not Found</h3>
        <p className="text-xs text-[#5F6368]">The requested assignment could not be loaded or no longer exists.</p>
        <button
          onClick={() => (onNavigate ? onNavigate('assignments') : onBack?.())}
          className="px-4 py-2 bg-[#1A73E8] text-white rounded-lg text-xs font-semibold"
        >
          Return to Tasks
        </button>
      </div>
    );
  }

  const handleGoBack = () => {
    if (onBack) onBack();
    else if (onNavigate) onNavigate('assignments');
  };

  // Student specific view & submission state
  const studentView = views.find((v) => v.assignmentId === assignment.id && v.studentId === user?.id);
  const mySubmission = submissions.find((s) => s.assignmentId === assignment.id && s.studentId === user?.id);

  // Enrolled students for this assignment's class
  const classStudents = members.filter(
    (m) => m.classId === assignment.classId && m.role === 'student'
  );

  // Submissions for this assignment
  const asgSubmissions = submissions.filter((s) => s.assignmentId === assignment.id);
  const asgViews = views.filter((v) => v.assignmentId === assignment.id);

  const turnedInCount = asgSubmissions.filter((s) => s.status === 'submitted' || s.status === 'graded').length;
  const gradedCount = asgSubmissions.filter((s) => s.status === 'graded').length;
  const assignedCount = classStudents.length;
  const seenCount = asgViews.length;

  // Comments for this assignment
  const classComments = comments.filter(
    (c) => c.targetId === assignment.id && c.targetType === 'assignment_class'
  );

  const privateComments = comments.filter((c) => {
    if (c.targetId !== assignment.id || c.targetType !== 'assignment_private') return false;
    if (user?.role === 'student') {
      return c.studentIdForPrivate === user.id;
    }
    return true;
  });

  const handleFileUploadSim = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: Attachment[] = Array.from(files).map((f: File) => ({
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: f.name,
      url: '#',
      type: f.type || 'application/octet-stream',
      size: f.size,
    }));

    setUploadedFiles((prev) => [...prev, ...newAttachments]);
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmitWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    submitAssignment(assignment.id, uploadedFiles, textResponse);
    setIsSubmitting(false);
  };

  const handleUnsubmit = () => {
    if (!mySubmission) return;
    if (confirm('Unsubmit assignment? You will be able to edit and resubmit your work.')) {
      unsubmitAssignment(mySubmission.id);
    }
  };

  const handleAddPrivateComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrivateComment.trim() || !user) return;
    addComment(
      assignment.id,
      'assignment_private',
      newPrivateComment,
      user.role === 'student' ? user.id : undefined
    );
    setNewPrivateComment('');
  };

  const handleAddClassComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassComment.trim() || !user) return;
    addComment(
      assignment.id,
      'assignment_class',
      newClassComment
    );
    setNewClassComment('');
  };

  const handleGradeReturn = (subId: string) => {
    const scoreVal = gradingScores[subId];
    const feedbackVal = gradingFeedbacks[subId] || '';
    const scoreNum = scoreVal !== undefined && scoreVal !== '' ? Number(scoreVal) : 100;
    gradeSubmission(subId, scoreNum, feedbackVal);
    setGradedSuccessMsg(`Submission returned with grade ${scoreNum}/${assignment.points}`);
    setTimeout(() => setGradedSuccessMsg(null), 3000);
  };

  const handleOpenEdit = () => {
    setEditTitle(assignment.title);
    setEditInstructions(assignment.instructions);
    setEditPoints(assignment.points);
    setEditDueDate(assignment.dueDate ? assignment.dueDate.split('T')[0] : '');
    setEditTopic(assignment.topic || '');
    setShowEditModal(true);
  };

  const handleSaveAssignmentEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    updateAssignment(assignment.id, {
      title: editTitle.trim(),
      instructions: editInstructions.trim(),
      points: Number(editPoints),
      dueDate: editDueDate,
      topic: editTopic.trim() || undefined,
    });
    setShowEditModal(false);
  };

  const handleDeleteAssignment = () => {
    if (confirm(`Delete assignment "${assignment.title}"? This cannot be undone.`)) {
      deleteAssignment(assignment.id);
      handleGoBack();
    }
  };

  const isTeacher = user?.role === 'teacher';

  return (
    <div className="space-y-6 text-left">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleGoBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5F6368] hover:text-[#202124] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Assignments
        </button>

        {isTeacher && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('instructions')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'instructions'
                  ? 'bg-blue-50 text-[#1A73E8]'
                  : 'text-[#5F6368] hover:bg-slate-100'
              }`}
            >
              Instructions
            </button>
            <button
              onClick={() => setActiveTab('student_work')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'student_work'
                  ? 'bg-blue-50 text-[#1A73E8]'
                  : 'text-[#5F6368] hover:bg-slate-100'
              }`}
            >
              Student Work ({turnedInCount}/{assignedCount})
            </button>
            <div className="h-4 w-px bg-[#DADCE0] mx-1" />
            <button
              onClick={handleOpenEdit}
              className="p-1.5 text-[#5F6368] hover:text-[#1A73E8] hover:bg-slate-100 rounded-lg transition-colors"
              title="Edit Assignment"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={handleDeleteAssignment}
              className="p-1.5 text-[#5F6368] hover:text-[#D93025] hover:bg-rose-50 rounded-lg transition-colors"
              title="Delete Assignment"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {gradedSuccessMsg && (
        <div className="p-3 bg-emerald-50 text-[#188038] border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          {gradedSuccessMsg}
        </div>
      )}

      {/* TEACHER STUDENT WORK TAB */}
      {isTeacher && activeTab === 'student_work' ? (
        <div className="space-y-6">
          {/* Summary Metric Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-[#DADCE0] p-4 rounded-xl text-center">
              <span className="text-2xl font-bold text-[#1A73E8]">{turnedInCount}</span>
              <p className="text-xs text-[#5F6368] font-medium mt-1">Turned in</p>
            </div>
            <div className="bg-white border border-[#DADCE0] p-4 rounded-xl text-center">
              <span className="text-2xl font-bold text-[#202124]">{assignedCount}</span>
              <p className="text-xs text-[#5F6368] font-medium mt-1">Assigned</p>
            </div>
            <div className="bg-white border border-[#DADCE0] p-4 rounded-xl text-center">
              <span className="text-2xl font-bold text-[#188038]">{gradedCount}</span>
              <p className="text-xs text-[#5F6368] font-medium mt-1">Graded</p>
            </div>
            <div className="bg-white border border-[#DADCE0] p-4 rounded-xl text-center">
              <span className="text-2xl font-bold text-[#1A73E8]">{seenCount}</span>
              <p className="text-xs text-[#5F6368] font-medium mt-1">
                Seen by students ({Math.round((seenCount / Math.max(assignedCount, 1)) * 100)}%)
              </p>
            </div>
          </div>

          {/* Filter, Search & Reminder Bar */}
          <div className="bg-white border border-[#DADCE0] rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shadow-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5F6368]" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search students..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#F8F9FA] border border-[#DADCE0] rounded-lg text-xs text-[#202124] focus:outline-hidden focus:border-[#1A73E8] focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {(['all', 'seen', 'unseen', 'submitted', 'graded'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStudentFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    studentFilter === tab
                      ? 'bg-[#1A73E8] text-white shadow-xs'
                      : 'bg-[#F8F9FA] text-[#5F6368] hover:bg-slate-100 border border-[#DADCE0]'
                  }`}
                >
                  {tab === 'all' ? 'All' : tab === 'seen' ? 'Seen' : tab === 'unseen' ? 'Unseen' : tab === 'submitted' ? 'Turned in' : 'Graded'}
                </button>
              ))}

              {seenCount < classStudents.length && (
                <button
                  onClick={() => {
                    const count = sendReminderToUnseenStudents(assignment.id, assignment.title, assignment.classId);
                    setReminderMsg(`Reminder sent to ${count} students!`);
                    setTimeout(() => setReminderMsg(null), 4000);
                  }}
                  className="px-3 py-1.5 bg-white border border-[#DADCE0] text-[#1A73E8] hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Bell className="w-3.5 h-3.5" /> Remind Unseen
                </button>
              )}
            </div>
          </div>

          {reminderMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" /> {reminderMsg}
            </div>
          )}

          {/* Student Submissions Table */}
          <div className="bg-white border border-[#DADCE0] rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#DADCE0] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#202124]">Student Submissions & Status</h3>
              <span className="text-xs text-[#5F6368]">{classStudents.length} enrolled students</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F9FA] border-b border-[#DADCE0] text-[#5F6368] uppercase text-[10px] font-semibold">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Seen Status</th>
                    <th className="py-3 px-4">Work / Files</th>
                    <th className="py-3 px-4">Submission Status</th>
                    <th className="py-3 px-4">Grade & Return</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DADCE0]">
                  {classStudents
                    .filter((st) => {
                      const view = asgViews.find((v) => v.studentId === st.userId);
                      const sub = asgSubmissions.find((s) => s.studentId === st.userId);
                      if (studentFilter === 'seen') return !!view;
                      if (studentFilter === 'unseen') return !view;
                      if (studentFilter === 'submitted') return sub?.status === 'submitted';
                      if (studentFilter === 'graded') return sub?.status === 'graded';
                      return true;
                    })
                    .filter((st) => {
                      const q = studentSearch.toLowerCase().trim();
                      if (!q) return true;
                      return st.userName.toLowerCase().includes(q) || st.userEmail.toLowerCase().includes(q);
                    })
                    .map((st) => {
                    const view = asgViews.find((v) => v.studentId === st.userId);
                    const sub = asgSubmissions.find((s) => s.studentId === st.userId);
                    const isGraded = sub?.status === 'graded';

                    return (
                      <tr key={st.id} className="hover:bg-slate-50">
                        {/* Student Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            {st.userAvatar ? (
                              <img src={st.userAvatar} alt={st.userName} className="w-7 h-7 rounded-full object-cover" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-slate-200 text-[#5F6368] font-bold flex items-center justify-center text-[10px]">
                                {st.userName.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-[#202124]">{st.userName}</p>
                              <p className="text-[10px] text-[#5F6368]">{st.userEmail}</p>
                            </div>
                          </div>
                        </td>

                        {/* WhatsApp-Style Seen Status */}
                        <td className="py-3.5 px-4">
                          {view ? (
                            <div>
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#188038] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <CheckCheck className="w-3.5 h-3.5 text-[#188038]" /> Seen ({view.viewCount}x)
                              </span>
                              <span className="text-[10px] text-[#5F6368] block mt-0.5">
                                Last: {formatRelativeTime(view.lastSeenAt)}
                              </span>
                            </div>
                          ) : (
                            <div>
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#5F6368] bg-slate-100 px-2 py-0.5 rounded border border-[#DADCE0]">
                                <span className="w-2 h-2 rounded-full border border-[#5F6368] inline-block" /> Unseen
                              </span>
                              <span className="text-[10px] text-[#5F6368] block mt-0.5">
                                Not opened yet
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Work / Response */}
                        <td className="py-3.5 px-4 max-w-xs">
                          {sub ? (
                            <div className="space-y-1">
                              {sub.textResponse && (
                                <p className="text-[11px] text-[#202124] italic line-clamp-2">
                                  "{sub.textResponse}"
                                </p>
                              )}
                              {sub.attachments && sub.attachments.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {sub.attachments.map((att) => (
                                    <span key={att.id} className="inline-flex items-center gap-1 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-[#202124]">
                                      <Paperclip className="w-3 h-3 text-[#1A73E8]" /> {att.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <span className="text-[10px] text-[#5F6368] block">
                                Turned in {formatRelativeTime(sub.submittedAt)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[#5F6368] text-xs italic">No work submitted</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {sub ? (
                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              sub.status === 'graded' ? 'bg-emerald-50 text-[#188038]' : 'bg-blue-50 text-[#1A73E8]'
                            }`}>
                              {sub.status.toUpperCase()}
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#5F6368]">Assigned</span>
                          )}
                        </td>

                        {/* Grade and Return Action */}
                        <td className="py-3.5 px-4">
                          {sub ? (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min={0}
                                  max={assignment.points}
                                  value={gradingScores[sub.id] !== undefined ? gradingScores[sub.id] : (sub.grade ?? '')}
                                  onChange={(e) => setGradingScores({ ...gradingScores, [sub.id]: e.target.value })}
                                  placeholder="Score"
                                  className="w-16 px-2 py-1 text-xs border border-[#DADCE0] rounded text-center focus:border-[#1A73E8] outline-hidden"
                                />
                                <span className="text-[11px] text-[#5F6368]">/ {assignment.points}</span>
                              </div>
                              <input
                                type="text"
                                value={gradingFeedbacks[sub.id] !== undefined ? gradingFeedbacks[sub.id] : (sub.feedback ?? '')}
                                onChange={(e) => setGradingFeedbacks({ ...gradingFeedbacks, [sub.id]: e.target.value })}
                                placeholder="Add feedback..."
                                className="w-36 px-2 py-1 text-[11px] border border-[#DADCE0] rounded focus:border-[#1A73E8] outline-hidden block"
                              />
                              <button
                                onClick={() => handleGradeReturn(sub.id)}
                                className="px-2.5 py-1 text-[11px] font-semibold bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded transition-colors shadow-xs"
                              >
                                {isGraded ? 'Update Grade' : 'Return Work'}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#5F6368] italic">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* INSTRUCTIONS & STUDENT SUBMISSION VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Assignment Details & Instructions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-[#DADCE0] rounded-xl p-6 space-y-4 shadow-xs">
              <div className="flex items-start justify-between gap-4 border-b border-[#DADCE0] pb-4">
                <div>
                  <span className="text-xs font-semibold text-[#1A73E8] bg-blue-50 px-2 py-0.5 rounded">
                    {assignment.className} {assignment.topic ? `• ${assignment.topic}` : ''}
                  </span>
                  <h1 className="text-2xl font-bold text-[#202124] mt-2 tracking-tight">
                    {assignment.title}
                  </h1>
                  <p className="text-xs text-[#5F6368] mt-1">
                    {assignment.teacherName} • Posted {formatDate(assignment.createdAt)}
                  </p>
                </div>

                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[#202124]">{assignment.points} points</p>
                    <DueSoonBadge dueDate={assignment.dueDate} size="sm" showCountdown={true} />
                  </div>
                  <p className="text-xs font-medium text-[#D93025] flex items-center gap-1 justify-end mt-0.5">
                    <Clock className="w-3.5 h-3.5" /> Due {formatDate(assignment.dueDate)}
                  </p>
                </div>
              </div>

              {/* Instructions text */}
              <div>
                <h3 className="text-xs font-bold text-[#5F6368] uppercase tracking-wider mb-2">Instructions</h3>
                <p className="text-xs text-[#202124] whitespace-pre-wrap leading-relaxed">
                  {assignment.instructions}
                </p>
              </div>

              {/* Attachments from teacher */}
              {assignment.attachments && assignment.attachments.length > 0 && (
                <div className="pt-2 border-t border-[#DADCE0]">
                  <h3 className="text-xs font-bold text-[#5F6368] uppercase tracking-wider mb-2">Reference Materials</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {assignment.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="p-3 rounded-lg border border-[#DADCE0] bg-slate-50 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-[#1A73E8] shrink-0" />
                          <span className="font-medium text-[#202124] truncate">{att.name}</span>
                        </div>
                        <span className="text-[11px] text-[#5F6368] shrink-0 ml-2">
                          {formatFileSize(att.size)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Class Comments Section */}
            <div className="bg-white border border-[#DADCE0] rounded-xl p-5 space-y-3 shadow-xs">
              <h3 className="text-xs font-bold text-[#202124] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#1A73E8]" /> Class Comments ({classComments.length})
              </h3>

              <div className="space-y-2">
                {classComments.map((cmt) => (
                  <div key={cmt.id} className="text-xs py-1.5 border-b border-[#DADCE0]/50 last:border-0">
                    <span className="font-semibold text-[#202124]">{cmt.authorName}: </span>
                    <span className="text-[#5F6368]">{cmt.content}</span>
                    <span className="text-[10px] text-[#5F6368] block mt-0.5">{formatRelativeTime(cmt.createdAt)}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddClassComment} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newClassComment}
                  onChange={(e) => setNewClassComment(e.target.value)}
                  placeholder="Add class comment..."
                  className="flex-1 px-3 py-2 text-xs border border-[#DADCE0] rounded-lg text-[#202124] focus:border-[#1A73E8] outline-hidden"
                />
                <button
                  type="submit"
                  disabled={!newClassComment.trim()}
                  className="px-3 py-2 bg-[#1A73E8] hover:bg-[#1557B0] disabled:opacity-40 text-white rounded-lg text-xs font-semibold"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: "Your Work" for students or quick stats for teachers */}
          <div className="lg:col-span-1 space-y-6">
            {user?.role === 'student' ? (
              <div className="space-y-6">
                {/* "Your work" card (Google Classroom standard) */}
                <div className="bg-white border border-[#DADCE0] rounded-xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#DADCE0] pb-3">
                    <h2 className="text-base font-bold text-[#202124]">Your work</h2>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      mySubmission?.status === 'graded' 
                        ? 'bg-emerald-50 text-[#188038]' 
                        : mySubmission?.status === 'submitted' 
                        ? 'bg-blue-50 text-[#1A73E8]' 
                        : 'bg-slate-100 text-[#5F6368]'
                    }`}>
                      {mySubmission?.status === 'graded' 
                        ? 'Graded' 
                        : mySubmission?.status === 'submitted' 
                        ? 'Turned In' 
                        : 'Assigned'}
                    </span>
                  </div>

                  {/* If Graded: show score & teacher feedback */}
                  {mySubmission?.status === 'graded' && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1">
                      <p className="text-xs font-bold text-[#188038]">
                        Score: {mySubmission.grade} / {assignment.points}
                      </p>
                      {mySubmission.feedback && (
                        <p className="text-xs text-[#202124]">
                          <strong>Teacher feedback:</strong> {mySubmission.feedback}
                        </p>
                      )}
                    </div>
                  )}

                  {/* If already submitted: show files & unsubmit button */}
                  {mySubmission ? (
                    <div className="space-y-3">
                      {mySubmission.textResponse && (
                        <div className="p-2.5 bg-slate-50 border border-[#DADCE0] rounded-lg text-xs">
                          <p className="text-[11px] font-bold text-[#5F6368] mb-0.5">Your Response:</p>
                          <p className="text-[#202124]">{mySubmission.textResponse}</p>
                        </div>
                      )}

                      {mySubmission.attachments && mySubmission.attachments.length > 0 && (
                        <div className="space-y-1.5">
                          {mySubmission.attachments.map((att) => (
                            <div key={att.id} className="p-2 bg-slate-50 border border-[#DADCE0] rounded-lg flex items-center justify-between text-xs">
                              <span className="truncate">{att.name}</span>
                              <Check className="w-3.5 h-3.5 text-[#188038]" />
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="text-[11px] text-[#5F6368] text-center">
                        Turned in on {formatDate(mySubmission.submittedAt)}
                      </p>

                      <button
                        onClick={handleUnsubmit}
                        className="w-full py-2 border border-[#DADCE0] hover:bg-slate-50 text-[#202124] rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-[#5F6368]" /> Unsubmit to Edit
                      </button>
                    </div>
                  ) : (
                    /* Submission Form */
                    <form onSubmit={handleSubmitWork} className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-[#5F6368] mb-1">
                          Response or Notes
                        </label>
                        <textarea
                          rows={3}
                          value={textResponse}
                          onChange={(e) => setTextResponse(e.target.value)}
                          placeholder="Type your answer or comments here..."
                          className="w-full p-2.5 bg-[#F8F9FA] border border-[#DADCE0] rounded-lg text-xs text-[#202124] focus:border-[#1A73E8] focus:bg-white outline-hidden"
                        />
                      </div>

                      {/* Attached files */}
                      {uploadedFiles.length > 0 && (
                        <div className="space-y-1.5">
                          {uploadedFiles.map((f) => (
                            <div key={f.id} className="p-2 bg-slate-50 border border-[#DADCE0] rounded-lg flex items-center justify-between text-xs">
                              <span className="truncate max-w-[180px]">{f.name}</span>
                              <button type="button" onClick={() => removeFile(f.id)} className="text-[#D93025]">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* File upload trigger */}
                      <label className="w-full py-2 border border-dashed border-[#DADCE0] hover:bg-slate-50 rounded-lg text-xs font-medium text-[#1A73E8] flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                        <Paperclip className="w-3.5 h-3.5" /> + Add or attach files
                        <input type="file" multiple onChange={handleFileUploadSim} className="hidden" />
                      </label>

                      <button
                        type="submit"
                        disabled={isSubmitting || (!textResponse.trim() && uploadedFiles.length === 0)}
                        className="w-full py-2.5 bg-[#1A73E8] hover:bg-[#1557B0] disabled:opacity-40 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                      >
                        {isSubmitting ? 'Submitting...' : 'Turn In'}
                      </button>
                    </form>
                  )}
                </div>

                {/* Private comments card */}
                <div className="bg-white border border-[#DADCE0] rounded-xl p-5 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold text-[#202124] flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[#1A73E8]" /> Private comments
                  </h3>
                  <p className="text-[11px] text-[#5F6368]">Private conversation between you and your teacher.</p>

                  <div className="space-y-2">
                    {privateComments.map((cmt) => (
                      <div key={cmt.id} className="text-xs py-1 border-b border-[#DADCE0]/40 last:border-0">
                        <p className="font-semibold text-[#202124]">{cmt.authorName}</p>
                        <p className="text-[#5F6368]">{cmt.content}</p>
                        <span className="text-[10px] text-[#5F6368] block">{formatRelativeTime(cmt.createdAt)}</span>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddPrivateComment} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={newPrivateComment}
                      onChange={(e) => setNewPrivateComment(e.target.value)}
                      placeholder="Add private comment..."
                      className="flex-1 px-3 py-1.5 text-xs border border-[#DADCE0] rounded-lg text-[#202124] focus:border-[#1A73E8] outline-hidden"
                    />
                    <button
                      type="submit"
                      disabled={!newPrivateComment.trim()}
                      className="p-1.5 bg-[#1A73E8] hover:bg-[#1557B0] disabled:opacity-40 text-white rounded-lg"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              /* Teacher Quick Panel on Right */
              <div className="bg-white border border-[#DADCE0] rounded-xl p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider border-b border-[#DADCE0] pb-2">
                  Assignment Overview
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#DADCE0]/50">
                    <span className="text-[#5F6368]">Total Enrolled:</span>
                    <span className="font-semibold text-[#202124]">{assignedCount} students</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#DADCE0]/50">
                    <span className="text-[#5F6368]">Turned In:</span>
                    <span className="font-semibold text-[#1A73E8]">{turnedInCount}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#DADCE0]/50">
                    <span className="text-[#5F6368]">Graded:</span>
                    <span className="font-semibold text-[#188038]">{gradedCount}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#5F6368]">Students Viewed:</span>
                    <span className="font-semibold text-[#7627BB]">{seenCount}</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('student_work')}
                  className="w-full py-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  Grade Student Submissions →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Assignment Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DADCE0] rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#DADCE0]">
              <h3 className="text-base font-bold text-[#202124]">Edit Assignment</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 text-[#5F6368] hover:text-[#202124] rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignmentEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F9FA] text-[#202124] rounded-lg border border-[#DADCE0] text-xs focus:border-[#1A73E8] focus:bg-white outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">Instructions</label>
                <textarea
                  rows={4}
                  value={editInstructions}
                  onChange={(e) => setEditInstructions(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F9FA] text-[#202124] rounded-lg border border-[#DADCE0] text-xs focus:border-[#1A73E8] focus:bg-white outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1">Points</label>
                  <input
                    type="number"
                    min={1}
                    value={editPoints}
                    onChange={(e) => setEditPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#F8F9FA] text-[#202124] rounded-lg border border-[#DADCE0] text-xs focus:border-[#1A73E8] focus:bg-white outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F9FA] text-[#202124] rounded-lg border border-[#DADCE0] text-xs focus:border-[#1A73E8] focus:bg-white outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">Topic</label>
                <input
                  type="text"
                  value={editTopic}
                  onChange={(e) => setEditTopic(e.target.value)}
                  placeholder="e.g. Memory Management"
                  className="w-full px-3 py-2 bg-[#F8F9FA] text-[#202124] rounded-lg border border-[#DADCE0] text-xs focus:border-[#1A73E8] focus:bg-white outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#DADCE0]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#5F6368] hover:text-[#202124] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
