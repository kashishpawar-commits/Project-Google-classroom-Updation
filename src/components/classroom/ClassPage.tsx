import React, { useState } from 'react';
import { 
  BookOpen, FileText, Users, Copy, Check, CheckCheck, MessageSquare, 
  Plus, Paperclip, Send, Trash2, ArrowLeft, MoreVertical, 
  FolderPlus, Edit, Clock, AlertCircle, ChevronDown, ChevronRight, LogOut, RotateCcw, Eye,
  BookMarked, Video, Link2, Download, ExternalLink, X, FolderOpen
} from 'lucide-react';
import { Class, Topic, Assignment, Material } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { StatusBadge } from '../ui/StatusBadge';
import { DueSoonBadge } from '../ui/DueSoonBadge';
import { formatDate, formatRelativeTime } from '../../lib/utils';
import { EmptyState } from '../ui/EmptyState';
import { MaterialSeenModal } from './MaterialSeenModal';

interface ClassPageProps {
  classId?: string;
  classData?: Class;
  onBack?: () => void;
  onNavigate?: (view: string, id?: string) => void;
  onNavigateToAssignment?: (assignmentId: string) => void;
  openCreateAssignmentModal?: (classId: string) => void;
}

export const ClassPage: React.FC<ClassPageProps> = ({
  classId,
  classData: propsClassData,
  onBack,
  onNavigate,
  onNavigateToAssignment,
  openCreateAssignmentModal,
}) => {
  const { user } = useAuth();
  const { 
    classes, members, assignments, materials, topics, announcements, comments, 
    createAnnouncement, updateAnnouncement, deleteAnnouncement, addComment, deleteComment, 
    removeMember, leaveClass, views, materialViews, submissions,
    createTopic, updateTopic, deleteTopic, createMaterial, deleteMaterial,
    deleteAssignment, updateClass, generateClassCode, recordMaterialView
  } = useData();

  const classData = propsClassData || classes.find((c) => c.id === classId);

  const [activeTab, setActiveTab] = useState<'stream' | 'classwork' | 'materials' | 'people'>('stream');
  const [copied, setCopied] = useState(false);
  const [codeRegenerated, setCodeRegenerated] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [isAnnouncing, setIsAnnouncing] = useState(false);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);
  const [editingAnnouncementText, setEditingAnnouncementText] = useState('');
  const [commentInput, setCommentInput] = useState<{ [key: string]: string }>({});

  // Add Material Modal State
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [matTitle, setMatTitle] = useState('');
  const [matType, setMatType] = useState<Material['type']>('pdf');
  const [matTopic, setMatTopic] = useState('');
  const [matDesc, setMatDesc] = useState('');
  const [matContent, setMatContent] = useState('');
  const [matUrl, setMatUrl] = useState('');
  const [matFileName, setMatFileName] = useState('');

  // Material Seen Tracking Modal State (Strictly for Teachers & Admin)
  const [showSeenModal, setShowSeenModal] = useState(false);
  const [selectedMaterialForModal, setSelectedMaterialForModal] = useState<{
    id: string;
    title: string;
    type: 'assignment' | 'announcement' | 'pdf' | 'notes' | 'document' | 'link';
    postedAt?: string;
  } | null>(null);

  // Topic Modals / Input states
  const [newTopicName, setNewTopicName] = useState('');
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editTopicName, setEditTopicName] = useState('');

  // Class Edit Modal
  const [showEditClassModal, setShowEditClassModal] = useState(false);
  const [editClassName, setEditClassName] = useState('');
  const [editClassSection, setEditClassSection] = useState('');
  const [editClassSubject, setEditClassSubject] = useState('');
  const [editClassRoom, setEditClassRoom] = useState('');
  const [editClassDesc, setEditClassDesc] = useState('');

  // Search in People tab
  const [peopleSearch, setPeopleSearch] = useState('');

  if (!classData) {
    return (
      <div className="p-12 text-center bg-white border border-[#DADCE0] rounded-xl space-y-4">
        <BookOpen className="w-12 h-12 text-[#5F6368] mx-auto opacity-50" />
        <h3 className="text-lg font-bold text-[#202124]">Class Not Found</h3>
        <p className="text-xs text-[#5F6368]">The requested class could not be loaded or no longer exists.</p>
        <button
          onClick={() => (onNavigate ? onNavigate('classes') : onBack?.())}
          className="px-4 py-2 bg-[#1A73E8] text-white rounded-lg text-xs font-semibold"
        >
          Return to Classes
        </button>
      </div>
    );
  }

  const handleGoBack = () => {
    if (onBack) onBack();
    else if (onNavigate) onNavigate('classes');
  };

  const handleGoToAssignment = (asgId: string) => {
    if (onNavigateToAssignment) onNavigateToAssignment(asgId);
    else if (onNavigate) onNavigate('assignment', asgId);
  };

  const isTeacher = user?.role === 'teacher' && classData.teacherId === user.id;

  const classAssignments = assignments.filter((a) => a.classId === classData.id);
  const classMaterials = materials.filter((m) => m.classId === classData.id);
  const classAnnouncements = announcements.filter((a) => a.classId === classData.id);
  const classMembers = members.filter((m) => m.classId === classData.id);
  const classTopics = topics.filter((t) => t.classId === classData.id);

  const teacherMembers = classMembers.filter((m) => m.role === 'teacher');
  const studentMembers = classMembers.filter((m) => m.role === 'student');

  const filteredStudents = studentMembers.filter((s) =>
    s.userName.toLowerCase().includes(peopleSearch.toLowerCase()) ||
    s.userEmail.toLowerCase().includes(peopleSearch.toLowerCase())
  );

  const copyCode = () => {
    navigator.clipboard.writeText(classData.classCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    createAnnouncement(classData.id, announcementText, []);
    setAnnouncementText('');
    setIsAnnouncing(false);
  };

  const handleAddComment = (targetId: string) => {
    const text = commentInput[targetId];
    if (!text || !text.trim()) return;
    addComment(targetId, 'announcement', text);
    setCommentInput((prev) => ({ ...prev, [targetId]: '' }));
  };

  const handleCreateTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    createTopic(classData.id, newTopicName);
    setNewTopicName('');
    setShowAddTopicModal(false);
  };

  const handleEditTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopic || !editTopicName.trim()) return;
    updateTopic(editingTopic.id, editTopicName);
    setEditingTopic(null);
  };

  const openClassEdit = () => {
    setEditClassName(classData.name);
    setEditClassSection(classData.section);
    setEditClassSubject(classData.subject);
    setEditClassRoom(classData.room || '');
    setEditClassDesc(classData.description || '');
    setShowEditClassModal(true);
  };

  const handleSaveClassEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateClass(classData.id, {
      name: editClassName,
      section: editClassSection,
      subject: editClassSubject,
      room: editClassRoom,
      description: editClassDesc,
    });
    setShowEditClassModal(false);
  };

  const handleCreateMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle.trim()) return;

    const attachments = matFileName.trim() ? [
      {
        id: `att_${Date.now()}`,
        name: matFileName.trim(),
        url: matUrl.trim() || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        type: matType === 'pdf' ? 'application/pdf' : 'application/octet-stream',
        size: 1540000,
      }
    ] : undefined;

    createMaterial({
      title: matTitle.trim(),
      classId: classData.id,
      className: classData.name,
      teacherId: user?.id || classData.teacherId,
      teacherName: user?.name || classData.teacherName,
      type: matType,
      topic: matTopic.trim() || undefined,
      description: matDesc.trim() || undefined,
      content: matContent.trim() || undefined,
      url: matUrl.trim() || undefined,
      attachments,
    });

    setMatTitle('');
    setMatTopic('');
    setMatDesc('');
    setMatContent('');
    setMatUrl('');
    setMatFileName('');
    setShowAddMaterialModal(false);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Back button */}
      <div>
        <button
          onClick={handleGoBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5F6368] hover:text-[#202124] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Classes
        </button>
      </div>

      {/* Class Banner (Google Classroom Style Header) */}
      <div className="relative overflow-hidden rounded-xl bg-[#1A73E8] p-6 sm:p-8 text-white shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded bg-white/20 text-xs font-medium">
              {classData.section} {classData.subject ? `• ${classData.subject}` : ''}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1.5">
              {classData.name}
            </h1>
            <p className="text-xs text-white/90 mt-1">
              Instructor: {classData.teacherName} {classData.room ? `• Room: ${classData.room}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Class Code Box */}
            <div className="p-2.5 bg-white/10 rounded-lg border border-white/20 flex items-center gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-100">Class Code</p>
                <p className="text-base font-bold font-mono tracking-wider">{classData.classCode}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={copyCode}
                  className="p-1.5 bg-white/20 hover:bg-white/30 rounded-md transition-colors text-white"
                  title="Copy Class Code"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                {isTeacher && (
                  <button
                    onClick={() => {
                      if (confirm('Generate a new class code? Existing students will keep their access.')) {
                        generateClassCode(classData.id);
                        setCodeRegenerated(true);
                        setTimeout(() => setCodeRegenerated(false), 2000);
                      }
                    }}
                    className="p-1.5 bg-white/20 hover:bg-white/30 rounded-md transition-colors text-white"
                    title="Regenerate class code"
                  >
                    <RotateCcw className={`w-4 h-4 ${codeRegenerated ? 'animate-spin' : ''}`} />
                  </button>
                )}
              </div>
            </div>

            {/* Teacher Edit Button */}
            {isTeacher && (
              <button
                onClick={openClassEdit}
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 text-white transition-colors"
                title="Edit Class Details"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Google Classroom: Stream, Classwork, Materials, People) */}
      <div className="flex border-b border-[#DADCE0] gap-4">
        {[
          { id: 'stream', label: 'Stream' },
          { id: 'classwork', label: 'Classwork' },
          { id: 'materials', label: 'Materials' },
          { id: 'people', label: 'People' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-[#1A73E8] text-[#1A73E8]'
                : 'border-transparent text-[#5F6368] hover:text-[#202124]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: STREAM */}
      {activeTab === 'stream' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Upcoming widget */}
          <div className="lg:col-span-1 space-y-4">
            <div className="p-4 bg-white border border-[#DADCE0] rounded-xl space-y-2">
              <h3 className="text-xs font-semibold text-[#202124]">Upcoming</h3>
              {classAssignments.length === 0 ? (
                <p className="text-xs text-[#5F6368]">Woohoo, no work due soon!</p>
              ) : (
                <div className="space-y-2 pt-1">
                  {classAssignments.slice(0, 3).map((a) => (
                    <div
                      key={a.id}
                      onClick={() => handleGoToAssignment(a.id)}
                      className="cursor-pointer group"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <p className="text-xs font-medium text-[#202124] group-hover:text-[#1A73E8] truncate">
                          {a.title}
                        </p>
                        <DueSoonBadge dueDate={a.dueDate} size="sm" showCountdown={false} />
                      </div>
                      <p className="text-[11px] text-[#5F6368]">
                        Due {formatDate(a.dueDate)}
                      </p>
                    </div>
                  ))}
                  <button
                    onClick={() => setActiveTab('classwork')}
                    className="text-xs font-semibold text-[#1A73E8] hover:underline pt-2 block"
                  >
                    View all
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Announcements & Posts Feed */}
          <div className="lg:col-span-3 space-y-4">
            {/* Announce to class box */}
            {isTeacher && (
              <div className="bg-white border border-[#DADCE0] rounded-xl p-4 shadow-xs">
                {!isAnnouncing ? (
                  <button
                    onClick={() => setIsAnnouncing(true)}
                    className="w-full text-left text-xs text-[#5F6368] hover:text-[#202124] py-2 px-3 rounded-lg bg-slate-50 border border-[#DADCE0] flex items-center gap-2"
                  >
                    <span>Announce something to your class...</span>
                  </button>
                ) : (
                  <form onSubmit={handlePostAnnouncement} className="space-y-3">
                    <textarea
                      rows={3}
                      value={announcementText}
                      onChange={(e) => setAnnouncementText(e.target.value)}
                      placeholder="Announce something to your class..."
                      autoFocus
                      className="w-full p-3 bg-[#F8F9FA] border border-[#DADCE0] rounded-lg text-xs text-[#202124] focus:outline-hidden focus:border-[#1A73E8] focus:bg-white"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAnnouncing(false);
                          setAnnouncementText('');
                        }}
                        className="px-3.5 py-1.5 text-xs text-[#5F6368] hover:text-[#202124] font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!announcementText.trim()}
                        className="px-4 py-1.5 bg-[#1A73E8] hover:bg-[#1557B0] disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                      >
                        Post
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Unified Stream items (Announcements + Assignments) */}
            {classAnnouncements.length === 0 && classAssignments.length === 0 ? (
              <EmptyState
                title="This is where you can talk to your class"
                description="Use the stream to share announcements, post assignments, and respond to student questions."
              />
            ) : (
              <div className="space-y-4">
                {/* Announcements Feed */}
                {classAnnouncements.map((anc) => (
                  <div
                    key={anc.id}
                    className="bg-white border border-[#DADCE0] rounded-xl p-5 space-y-4 shadow-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {anc.authorAvatar ? (
                          <img src={anc.authorAvatar} alt={anc.authorName} className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#1A73E8] text-white font-bold flex items-center justify-center text-xs">
                            {anc.authorName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-semibold text-[#202124]">{anc.authorName}</p>
                          <p className="text-[11px] text-[#5F6368]">{formatDate(anc.createdAt)}</p>
                        </div>
                      </div>

                      {isTeacher && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingAnnouncementId(anc.id);
                              setEditingAnnouncementText(anc.content);
                            }}
                            className="text-[#5F6368] hover:text-[#1A73E8] p-1"
                            title="Edit announcement"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this announcement?')) {
                                deleteAnnouncement(anc.id);
                              }
                            }}
                            className="text-[#5F6368] hover:text-[#D93025] p-1"
                            title="Delete announcement"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {editingAnnouncementId === anc.id ? (
                      <div className="space-y-2">
                        <textarea
                          rows={3}
                          value={editingAnnouncementText}
                          onChange={(e) => setEditingAnnouncementText(e.target.value)}
                          className="w-full p-2.5 bg-[#F8F9FA] border border-[#DADCE0] rounded-lg text-xs text-[#202124] focus:outline-hidden focus:border-[#1A73E8] focus:bg-white"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingAnnouncementId(null)}
                            className="px-3 py-1 text-xs text-[#5F6368] hover:text-[#202124]"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (editingAnnouncementText.trim()) {
                                updateAnnouncement(anc.id, editingAnnouncementText.trim());
                                setEditingAnnouncementId(null);
                              }
                            }}
                            className="px-3.5 py-1 bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded text-xs font-semibold shadow-xs"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p 
                        onClick={() => {
                          if (user?.role === 'student' && classData) {
                            recordMaterialView(anc.id, classData.id);
                          }
                        }}
                        className="text-xs text-[#202124] whitespace-pre-wrap leading-relaxed cursor-pointer"
                      >
                        {anc.content}
                      </p>
                    )}

                    {/* Attachments if any */}
                    {anc.attachments && anc.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {anc.attachments.map((att) => (
                          <div
                            key={att.id}
                            onClick={() => {
                              if (user?.role === 'student' && classData) {
                                recordMaterialView(anc.id, classData.id);
                              }
                            }}
                            className="inline-flex items-center gap-2 p-2 bg-[#F8F9FA] hover:bg-slate-100 border border-[#DADCE0] rounded-lg text-xs cursor-pointer text-[#202124] transition-colors"
                          >
                            <FileText className="w-4 h-4 text-[#1A73E8]" />
                            <span className="font-medium truncate max-w-xs">{att.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* TEACHER SEEN STATUS CARD (Strictly for Teachers & Admin only) */}
                    {isTeacher && (
                      <div className="mt-3 p-3 bg-[#F8F9FA] border border-[#DADCE0] rounded-lg space-y-2">
                        {(() => {
                          const enrolledStudents = members.filter(
                            (m) => m.classId === classData?.id && m.role === 'student'
                          );
                          const ancViews = materialViews.filter((v) => v.materialId === anc.id);
                          const seenCount = enrolledStudents.filter((s) =>
                            ancViews.some((v) => v.studentId === s.userId)
                          ).length;
                          const total = Math.max(enrolledStudents.length, 1);
                          const pct = Math.round((seenCount / total) * 100);

                          return (
                            <>
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-[#202124] flex items-center gap-1.5">
                                  <Eye className="w-4 h-4 text-[#1A73E8]" />
                                  <strong>{seenCount}</strong> / {enrolledStudents.length} students have seen
                                </span>
                                <span className="font-bold text-[#1A73E8]">{pct}%</span>
                              </div>
                              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-[#1A73E8] h-full rounded-full transition-all duration-300"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <div className="flex justify-end pt-0.5">
                                <button
                                  onClick={() => {
                                    setSelectedMaterialForModal({
                                      id: anc.id,
                                      title: anc.content.slice(0, 45) + (anc.content.length > 45 ? '...' : ''),
                                      type: 'announcement',
                                      postedAt: anc.createdAt,
                                    });
                                    setShowSeenModal(true);
                                  }}
                                  className="px-3 py-1 bg-white hover:bg-slate-50 border border-[#DADCE0] text-[#1A73E8] hover:text-[#1557B0] rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5" /> View Seen Status
                                </button>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}

                    {/* STUDENT SEEN STATUS (Student only sees their own status, NEVER other students!) */}
                    {!isTeacher && user?.role === 'student' && (
                      <div className="flex items-center justify-between text-[11px] text-[#5F6368] pt-1 border-t border-[#DADCE0]/50">
                        {materialViews.some((v) => v.materialId === anc.id && v.studentId === user.id) ? (
                          <span className="inline-flex items-center gap-1 text-[#188038] font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCheck className="w-3.5 h-3.5 text-[#188038]" /> You opened this material
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              if (classData) recordMaterialView(anc.id, classData.id);
                            }}
                            className="text-[#1A73E8] hover:underline font-medium flex items-center gap-1"
                          >
                            <span className="w-2 h-2 rounded-full border border-[#1A73E8] inline-block" /> Mark as seen
                          </button>
                        )}
                      </div>
                    )}

                    {/* Comments Section */}
                    <div className="pt-3 border-t border-[#DADCE0] space-y-2">
                      {comments
                        .filter((c) => c.targetId === anc.id)
                        .map((cmt) => (
                          <div key={cmt.id} className="flex items-start justify-between text-xs py-1">
                            <div className="flex items-start gap-2">
                              <span className="font-semibold text-[#202124]">{cmt.authorName}:</span>
                              <span className="text-[#5F6368]">{cmt.content}</span>
                            </div>
                            {(cmt.authorId === user?.id || isTeacher) && (
                              <button
                                onClick={() => deleteComment(cmt.id)}
                                className="text-[#5F6368] hover:text-[#D93025] text-[11px]"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        ))}

                      {/* Add comment */}
                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          value={commentInput[anc.id] || ''}
                          onChange={(e) => setCommentInput({ ...commentInput, [anc.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddComment(anc.id);
                          }}
                          placeholder="Add class comment..."
                          className="flex-1 px-3 py-1.5 text-xs bg-[#F8F9FA] border border-[#DADCE0] rounded-lg text-[#202124] focus:outline-hidden focus:border-[#1A73E8] focus:bg-white"
                        />
                        <button
                          onClick={() => handleAddComment(anc.id)}
                          className="p-1.5 text-[#1A73E8] hover:bg-blue-50 rounded-lg"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Assignment Notifications in Stream */}
                {classAssignments.map((asg) => (
                  <div
                    key={asg.id}
                    onClick={() => handleGoToAssignment(asg.id)}
                    className="bg-white border border-[#DADCE0] hover:border-[#1A73E8] rounded-xl p-4 flex items-center justify-between gap-4 cursor-pointer transition-colors shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-blue-50 text-[#1A73E8] flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#202124] truncate">
                          {asg.teacherName} posted a new assignment: {asg.title}
                        </p>
                        <p className="text-[11px] text-[#5F6368]">
                          {formatRelativeTime(asg.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <DueSoonBadge dueDate={asg.dueDate} size="sm" />
                      <span className="text-[11px] font-medium text-[#5F6368]">
                        Due {formatDate(asg.dueDate)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CLASSWORK (Organized by Topics) */}
      {activeTab === 'classwork' && (
        <div className="space-y-6">
          {/* Classwork Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-[#DADCE0]">
            <div>
              <h2 className="text-base font-semibold text-[#202124]">Coursework & Topics</h2>
              <p className="text-xs text-[#5F6368]">Assignments organized by syllabus topics</p>
            </div>

            {isTeacher && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddTopicModal(true)}
                  className="px-3 py-1.5 text-xs font-semibold bg-white border border-[#DADCE0] hover:bg-slate-50 text-[#202124] rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <FolderPlus className="w-4 h-4 text-[#5F6368]" /> New Topic
                </button>
                <button
                  onClick={() => openCreateAssignmentModal?.(classData.id)}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus className="w-4 h-4" /> Create Assignment
                </button>
              </div>
            )}
          </div>

          {/* Grouped by Topics */}
          {classAssignments.length === 0 && classTopics.length === 0 ? (
            <EmptyState
              title="This is where you'll assign work"
              description="You can add assignments and questions that are organized into units or modules with topics."
              actionLabel={isTeacher ? 'Create Assignment' : undefined}
              onAction={() => openCreateAssignmentModal?.(classData.id)}
            />
          ) : (
            <div className="space-y-8">
              {/* Render each topic */}
              {classTopics.map((top) => {
                const topicAssignments = classAssignments.filter((a) => a.topic === top.name);

                return (
                  <div key={top.id} className="space-y-3">
                    <div className="flex items-center justify-between border-b-2 border-[#1A73E8] pb-1.5">
                      <h3 className="text-base font-bold text-[#202124]">{top.name}</h3>
                      {isTeacher && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingTopic(top);
                              setEditTopicName(top.name);
                            }}
                            className="text-xs text-[#5F6368] hover:text-[#1A73E8] font-medium"
                          >
                            Rename
                          </button>
                          <span className="text-[#DADCE0]">•</span>
                          <button
                            onClick={() => {
                              if (confirm(`Delete topic "${top.name}"? Assignments will remain uncategorized.`)) {
                                deleteTopic(top.id);
                              }
                            }}
                            className="text-xs text-[#5F6368] hover:text-[#D93025] font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {topicAssignments.length === 0 ? (
                      <p className="text-xs text-[#5F6368] italic py-2">No assignments under this topic yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {topicAssignments.map((a) => {
                          const view = views.find((v) => v.assignmentId === a.id && v.studentId === user?.id);
                          const sub = submissions.find((s) => s.assignmentId === a.id && s.studentId === user?.id);

                          return (
                            <div
                              key={a.id}
                              onClick={() => handleGoToAssignment(a.id)}
                              className="bg-white border border-[#DADCE0] hover:border-[#1A73E8] hover:shadow-xs rounded-lg p-3.5 flex items-center justify-between gap-4 cursor-pointer transition-all"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 rounded-full bg-blue-50 text-[#1A73E8]">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="text-xs font-semibold text-[#202124] truncate">{a.title}</h4>
                                    <DueSoonBadge dueDate={a.dueDate} size="sm" />
                                  </div>
                                  <p className="text-[11px] text-[#5F6368]">Due {formatDate(a.dueDate)} • {a.points} points</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                {user?.role === 'student' ? (
                                  <StatusBadge
                                    seen={!!view}
                                    submissionStatus={sub?.status}
                                    dueDate={a.dueDate}
                                    firstSeenAt={view?.firstSeenAt}
                                    lastSeenAt={view?.lastSeenAt}
                                    submittedAt={sub?.submittedAt}
                                    grade={sub?.grade}
                                    points={a.points}
                                  />
                                ) : (
                                  <div className="flex items-center gap-2.5">
                                    {(() => {
                                      const enrolled = members.filter((m) => m.classId === classData?.id && m.role === 'student');
                                      const asgViews = views.filter((v) => v.assignmentId === a.id);
                                      const seenCount = enrolled.filter((s) => asgViews.some((v) => v.studentId === s.userId)).length;
                                      const total = Math.max(enrolled.length, 1);
                                      const pct = Math.round((seenCount / total) * 100);
                                      const turnedIn = submissions.filter((s) => s.assignmentId === a.id).length;

                                      return (
                                        <>
                                          <div className="text-right hidden sm:block">
                                            <span className="text-xs font-semibold text-[#1A73E8] block">
                                              {seenCount} / {enrolled.length} seen ({pct}%)
                                            </span>
                                            <span className="text-[10px] text-[#5F6368]">
                                              {turnedIn} turned in
                                            </span>
                                          </div>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedMaterialForModal({
                                                id: a.id,
                                                title: a.title,
                                                type: 'assignment',
                                                postedAt: a.createdAt,
                                              });
                                              setShowSeenModal(true);
                                            }}
                                            className="px-2.5 py-1 text-xs font-semibold text-[#1A73E8] bg-blue-50 hover:bg-blue-100 rounded-md flex items-center gap-1 transition-colors"
                                            title="View student seen status"
                                          >
                                            <Eye className="w-3.5 h-3.5" /> Seen Status
                                          </button>
                                        </>
                                      );
                                    })()}
                                    {isTeacher && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (confirm(`Delete assignment "${a.title}"?`)) {
                                            deleteAssignment(a.id);
                                          }
                                        }}
                                        className="p-1 text-[#5F6368] hover:text-[#D93025]"
                                        title="Delete assignment"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Uncategorized assignments (No Topic) */}
              {classAssignments.filter((a) => !a.topic || !classTopics.some((t) => t.name === a.topic)).length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-bold text-[#5F6368] uppercase tracking-wider border-b border-[#DADCE0] pb-1">
                    Uncategorized Assignments
                  </h3>
                  <div className="space-y-2">
                    {classAssignments
                      .filter((a) => !a.topic || !classTopics.some((t) => t.name === a.topic))
                      .map((a) => {
                        const view = views.find((v) => v.assignmentId === a.id && v.studentId === user?.id);
                        const sub = submissions.find((s) => s.assignmentId === a.id && s.studentId === user?.id);

                        return (
                          <div
                            key={a.id}
                            onClick={() => handleGoToAssignment(a.id)}
                            className="bg-white border border-[#DADCE0] hover:border-[#1A73E8] rounded-lg p-3.5 flex items-center justify-between gap-4 cursor-pointer transition-all"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="p-2 rounded-full bg-slate-100 text-[#5F6368]">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="text-xs font-semibold text-[#202124] truncate">{a.title}</h4>
                                  <DueSoonBadge dueDate={a.dueDate} size="sm" />
                                </div>
                                <p className="text-[11px] text-[#5F6368]">Due {formatDate(a.dueDate)} • {a.points} points</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              {user?.role === 'student' ? (
                                <StatusBadge
                                  seen={!!view}
                                  submissionStatus={sub?.status}
                                  dueDate={a.dueDate}
                                  firstSeenAt={view?.firstSeenAt}
                                  lastSeenAt={view?.lastSeenAt}
                                  submittedAt={sub?.submittedAt}
                                  grade={sub?.grade}
                                  points={a.points}
                                />
                              ) : (
                                <div className="flex items-center gap-2.5">
                                  {(() => {
                                    const enrolled = members.filter((m) => m.classId === classData?.id && m.role === 'student');
                                    const asgViews = views.filter((v) => v.assignmentId === a.id);
                                    const seenCount = enrolled.filter((s) => asgViews.some((v) => v.studentId === s.userId)).length;
                                    const total = Math.max(enrolled.length, 1);
                                    const pct = Math.round((seenCount / total) * 100);
                                    const turnedIn = submissions.filter((s) => s.assignmentId === a.id).length;

                                    return (
                                      <>
                                        <div className="text-right hidden sm:block">
                                          <span className="text-xs font-semibold text-[#1A73E8] block">
                                            {seenCount} / {enrolled.length} seen ({pct}%)
                                          </span>
                                          <span className="text-[10px] text-[#5F6368]">
                                            {turnedIn} turned in
                                          </span>
                                        </div>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedMaterialForModal({
                                              id: a.id,
                                              title: a.title,
                                              type: 'assignment',
                                              postedAt: a.createdAt,
                                            });
                                            setShowSeenModal(true);
                                          }}
                                          className="px-2.5 py-1 text-xs font-semibold text-[#1A73E8] bg-blue-50 hover:bg-blue-100 rounded-md flex items-center gap-1 transition-colors"
                                          title="View student seen status"
                                        >
                                          <Eye className="w-3.5 h-3.5" /> Seen Status
                                        </button>
                                      </>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MATERIALS (Course Notes, PDFs, and Seen Tracking) */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-[#DADCE0]">
            <div>
              <h2 className="text-base font-semibold text-[#202124]">Course Materials & Notes</h2>
              <p className="text-xs text-[#5F6368]">
                {isTeacher 
                  ? 'Track WhatsApp-style student seen/unseen interaction for every study resource.'
                  : 'Reference notes, lecture slides, and PDFs provided by your instructor.'}
              </p>
            </div>

            {isTeacher && (
              <button
                onClick={() => setShowAddMaterialModal(true)}
                className="px-3.5 py-1.5 text-xs font-semibold bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" /> Add Material
              </button>
            )}
          </div>

          {/* Materials List */}
          {classMaterials.length === 0 ? (
            <EmptyState
              title="No materials uploaded yet"
              description={isTeacher 
                ? "Provide lecture notes, PDFs, or study guides. You'll see in real time which students have opened them."
                : "Your teacher hasn't uploaded any study materials for this course yet."}
              actionLabel={isTeacher ? 'Add First Material' : undefined}
              onAction={() => setShowAddMaterialModal(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classMaterials.map((mat) => {
                const enrolled = members.filter((m) => m.classId === classData.id && m.role === 'student');
                const mViews = materialViews.filter((v) => v.materialId === mat.id && v.seen);
                const seenCount = enrolled.filter((st) => mViews.some((v) => v.studentId === st.userId)).length;
                const total = Math.max(enrolled.length, 1);
                const pct = Math.round((seenCount / total) * 100);
                const myView = materialViews.find((v) => v.materialId === mat.id && v.studentId === user?.id);

                return (
                  <div
                    key={mat.id}
                    onClick={() => {
                      if (user?.role === 'student') {
                        recordMaterialView(mat.id, classData.id);
                      }
                    }}
                    className="bg-white border border-[#DADCE0] hover:border-slate-400 hover:shadow-md rounded-xl p-5 flex flex-col justify-between transition-all group cursor-pointer text-left"
                  >
                    <div className="space-y-3">
                      {/* Top Type badge & delete */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="p-2 rounded-lg bg-slate-50 border border-[#DADCE0] shrink-0">
                          {mat.type === 'pdf' ? <FileText className="w-5 h-5 text-[#D93025]" /> :
                           mat.type === 'notes' ? <BookMarked className="w-5 h-5 text-[#188038]" /> :
                           mat.type === 'video' ? <Video className="w-5 h-5 text-[#7627BB]" /> :
                           mat.type === 'link' ? <Link2 className="w-5 h-5 text-[#1A73E8]" /> :
                           <FileText className="w-5 h-5 text-[#1A73E8]" />}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#1A73E8]">
                            {mat.type}
                          </span>
                          {isTeacher && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Delete material "${mat.title}"?`)) {
                                  deleteMaterial(mat.id);
                                }
                              }}
                              className="p-1 text-[#5F6368] hover:text-[#D93025] rounded transition-colors"
                              title="Delete material"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Title & Metadata */}
                      <div>
                        <h3 className="text-sm font-bold text-[#202124] group-hover:text-[#1A73E8] transition-colors">
                          {mat.title}
                        </h3>
                        {mat.topic && (
                          <p className="text-xs text-[#1A73E8] font-medium mt-0.5">
                            {mat.topic}
                          </p>
                        )}
                        <p className="text-[11px] text-[#5F6368] mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Posted {formatRelativeTime(mat.createdAt)}
                        </p>
                      </div>

                      {mat.description && (
                        <p className="text-xs text-[#5F6368] line-clamp-2 leading-relaxed">
                          {mat.description}
                        </p>
                      )}

                      {/* Attachments */}
                      {mat.attachments && mat.attachments.length > 0 && (
                        <div className="p-2 bg-slate-50 border border-[#DADCE0] rounded-lg flex items-center justify-between text-xs">
                          <span className="font-medium text-[#202124] truncate flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-[#1A73E8]" /> {mat.attachments[0].name}
                          </span>
                          <span className="text-[11px] text-[#5F6368]">PDF</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Status: Teacher sees class progress, Student sees ONLY personal status */}
                    <div className="pt-4 mt-4 border-t border-[#DADCE0]">
                      {isTeacher ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-[#202124] flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5 text-[#1A73E8]" />
                              <strong>{seenCount}</strong> / {enrolled.length} seen
                            </span>
                            <span className="font-bold text-[#1A73E8]">{pct}%</span>
                          </div>

                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#1A73E8] h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMaterialForModal({
                                id: mat.id,
                                title: mat.title,
                                type: mat.type as any,
                                postedAt: mat.createdAt,
                              });
                              setShowSeenModal(true);
                            }}
                            className="w-full py-1.5 bg-blue-50 hover:bg-blue-100 text-[#1A73E8] rounded-md text-xs font-semibold flex items-center justify-center gap-1 transition-colors mt-2"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Seen Status
                          </button>
                        </div>
                      ) : (
                        <div>
                          {myView?.seen ? (
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#188038] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <CheckCheck className="w-3.5 h-3.5 text-[#188038]" /> You viewed this
                              </span>
                              <span className="text-[10px] text-[#5F6368]">
                                {formatRelativeTime(myView.lastSeenAt || myView.firstSeenAt)}
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => recordMaterialView(mat.id, classData.id)}
                              className="w-full py-1.5 bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1 transition-colors shadow-2xs"
                            >
                              <BookOpen className="w-3.5 h-3.5" /> Open / Mark as Read
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PEOPLE */}
      {activeTab === 'people' && (
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Teachers Section */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-[#1A73E8] border-b-2 border-[#1A73E8] pb-2 flex items-center justify-between">
              <span>Teachers</span>
              <span className="text-xs font-normal text-[#5F6368]">{teacherMembers.length} teacher</span>
            </h2>

            <div className="divide-y divide-[#DADCE0] bg-white border border-[#DADCE0] rounded-xl overflow-hidden">
              {teacherMembers.map((t) => (
                <div key={t.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {t.userAvatar ? (
                      <img src={t.userAvatar} alt={t.userName} className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#1A73E8] text-white font-bold flex items-center justify-center text-xs">
                        {t.userName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-[#202124]">{t.userName}</p>
                      <p className="text-[11px] text-[#5F6368]">{t.userEmail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Students Section */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b-2 border-[#1A73E8] pb-2">
              <h2 className="text-xl font-bold text-[#1A73E8]">Classmates</h2>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <input
                  type="text"
                  value={peopleSearch}
                  onChange={(e) => setPeopleSearch(e.target.value)}
                  placeholder="Filter students..."
                  className="px-3 py-1 text-xs bg-white border border-[#DADCE0] rounded-lg text-[#202124] focus:border-[#1A73E8] outline-hidden"
                />
                <span className="text-xs font-semibold text-[#5F6368] shrink-0">
                  {studentMembers.length} students
                </span>
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center bg-white border border-[#DADCE0] rounded-xl text-xs text-[#5F6368]">
                {peopleSearch ? 'No students match your filter.' : 'No students enrolled yet. Share the class code with them!'}
              </div>
            ) : (
              <div className="divide-y divide-[#DADCE0] bg-white border border-[#DADCE0] rounded-xl overflow-hidden">
                {filteredStudents.map((s) => (
                  <div key={s.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      {s.userAvatar ? (
                        <img src={s.userAvatar} alt={s.userName} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-200 font-bold flex items-center justify-center text-xs text-[#5F6368]">
                          {s.userName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-semibold text-[#202124]">{s.userName}</p>
                        <p className="text-[11px] text-[#5F6368]">{s.userEmail}</p>
                      </div>
                    </div>

                    {isTeacher && (
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${s.userName} from this class?`)) {
                            removeMember(classData.id, s.userId);
                          }
                        }}
                        className="text-xs text-[#D93025] hover:underline font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: CREATE TOPIC */}
      {showAddTopicModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DADCE0] rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#202124]">Add Topic</h3>
            <form onSubmit={handleCreateTopicSubmit} className="space-y-3">
              <input
                type="text"
                autoFocus
                required
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                placeholder="Topic name (e.g. Memory Management)"
                className="w-full px-3 py-2 text-xs border border-[#DADCE0] rounded-lg text-[#202124] focus:border-[#1A73E8] outline-hidden"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTopicModal(false)}
                  className="px-3 py-1.5 text-xs text-[#5F6368] hover:text-[#202124]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1A73E8] hover:bg-[#1557B0] text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT TOPIC */}
      {editingTopic && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DADCE0] rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#202124]">Rename Topic</h3>
            <form onSubmit={handleEditTopicSubmit} className="space-y-3">
              <input
                type="text"
                autoFocus
                required
                value={editTopicName}
                onChange={(e) => setEditTopicName(e.target.value)}
                placeholder="Topic name"
                className="w-full px-3 py-2 text-xs border border-[#DADCE0] rounded-lg text-[#202124] focus:border-[#1A73E8] outline-hidden"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTopic(null)}
                  className="px-3 py-1.5 text-xs text-[#5F6368] hover:text-[#202124]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1A73E8] hover:bg-[#1557B0] text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CLASS */}
      {showEditClassModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DADCE0] rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#202124]">Edit Class Details</h3>
            <form onSubmit={handleSaveClassEdit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#5F6368] mb-1">Class Name *</label>
                <input
                  type="text"
                  required
                  value={editClassName}
                  onChange={(e) => setEditClassName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#DADCE0] rounded-lg text-[#202124] focus:border-[#1A73E8] outline-hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#5F6368] mb-1">Section</label>
                  <input
                    type="text"
                    value={editClassSection}
                    onChange={(e) => setEditClassSection(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#DADCE0] rounded-lg text-[#202124] focus:border-[#1A73E8] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#5F6368] mb-1">Subject</label>
                  <input
                    type="text"
                    value={editClassSubject}
                    onChange={(e) => setEditClassSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#DADCE0] rounded-lg text-[#202124] focus:border-[#1A73E8] outline-hidden"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#5F6368] mb-1">Room</label>
                <input
                  type="text"
                  value={editClassRoom}
                  onChange={(e) => setEditClassRoom(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#DADCE0] rounded-lg text-[#202124] focus:border-[#1A73E8] outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#5F6368] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editClassDesc}
                  onChange={(e) => setEditClassDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#DADCE0] rounded-lg text-[#202124] focus:border-[#1A73E8] outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditClassModal(false)}
                  className="px-3.5 py-1.5 text-xs text-[#5F6368] hover:text-[#202124]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1A73E8] hover:bg-[#1557B0] text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD MATERIAL TO CLASS */}
      {showAddMaterialModal && (
        <div
          onClick={() => setShowAddMaterialModal(false)}
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 cursor-default animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#DADCE0] rounded-xl shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] overflow-hidden text-left"
          >
            <div className="p-5 border-b border-[#DADCE0] flex items-center justify-between bg-[#F8F9FA]">
              <div>
                <h2 className="text-base font-bold text-[#202124]">Post Study Material</h2>
                <p className="text-xs text-[#5F6368]">
                  Upload lecture notes, PDFs, or links with student seen/unseen tracking.
                </p>
              </div>
              <button
                onClick={() => setShowAddMaterialModal(false)}
                className="p-1.5 text-[#5F6368] hover:text-[#202124] rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMaterialSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">Material Title *</label>
                <input
                  type="text"
                  required
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  placeholder="e.g. Unit 3 Notes — Network Layer Notes.pdf"
                  className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#DADCE0] rounded-lg text-[#202124] focus:border-[#1A73E8] focus:bg-white outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1">Type *</label>
                  <select
                    value={matType}
                    onChange={(e) => setMatType(e.target.value as Material['type'])}
                    className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#DADCE0] rounded-lg text-[#202124] focus:border-[#1A73E8] outline-hidden font-medium capitalize"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="notes">Lecture Notes</option>
                    <option value="document">Document</option>
                    <option value="video">Video Lecture</option>
                    <option value="link">External Link</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1">Topic / Unit</label>
                  <input
                    type="text"
                    value={matTopic}
                    onChange={(e) => setMatTopic(e.target.value)}
                    placeholder="e.g. Unit 3: Memory"
                    className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#DADCE0] rounded-lg text-[#202124] focus:border-[#1A73E8] focus:bg-white outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={matDesc}
                  onChange={(e) => setMatDesc(e.target.value)}
                  placeholder="Brief summary of what this material covers..."
                  className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#DADCE0] rounded-lg text-[#202124] focus:border-[#1A73E8] focus:bg-white outline-hidden leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  {matType === 'link' || matType === 'video' ? 'Resource URL' : 'Attached File Name'}
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={matFileName}
                    onChange={(e) => setMatFileName(e.target.value)}
                    placeholder="e.g. Unit_3_Lecture_Notes.pdf"
                    className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#DADCE0] rounded-lg text-[#202124] focus:border-[#1A73E8] focus:bg-white outline-hidden"
                  />
                  {(matType === 'link' || matType === 'video') && (
                    <input
                      type="url"
                      value={matUrl}
                      onChange={(e) => setMatUrl(e.target.value)}
                      placeholder="https://example.com/resource"
                      className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#DADCE0] rounded-lg text-[#202124] focus:border-[#1A73E8] focus:bg-white outline-hidden"
                    />
                  )}
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-[#1A73E8] flex items-center gap-2">
                <Eye className="w-4 h-4 shrink-0" />
                <span>
                  WhatsApp-style seen ticks will track which students open this material.
                </span>
              </div>

              <div className="pt-3 border-t border-[#DADCE0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMaterialModal(false)}
                  className="px-4 py-2 border border-[#DADCE0] hover:bg-slate-50 text-[#5F6368] rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Publish Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MATERIAL SEEN TRACKING (Strictly accessible to Teachers & Admin) */}
      {selectedMaterialForModal && (
        <MaterialSeenModal
          isOpen={showSeenModal}
          onClose={() => {
            setShowSeenModal(false);
            setSelectedMaterialForModal(null);
          }}
          materialId={selectedMaterialForModal.id}
          materialTitle={selectedMaterialForModal.title}
          materialType={selectedMaterialForModal.type}
          classId={classData?.id || ''}
          className={classData?.name}
          postedAt={selectedMaterialForModal.postedAt}
        />
      )}
    </div>
  );
};
