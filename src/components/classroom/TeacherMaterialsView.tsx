import React, { useState } from 'react';
import { 
  FileText, Plus, Eye, Search, Filter, Trash2, 
  Download, ExternalLink, BookOpen, Clock, Users, 
  CheckCheck, Video, Link2, BookMarked, X, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Material } from '../../types';
import { formatDate, formatRelativeTime } from '../../lib/utils';
import { MaterialSeenModal } from './MaterialSeenModal';

interface TeacherMaterialsViewProps {
  onNavigate?: (view: string, id?: string) => void;
  openCreateModal?: () => void;
}

export const TeacherMaterialsView: React.FC<TeacherMaterialsViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { 
    classes, members, materials, materialViews, 
    createMaterial, deleteMaterial 
  } = useData();

  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Seen Modal State
  const [selectedMaterialForSeen, setSelectedMaterialForSeen] = useState<Material | null>(null);

  // New Material Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newClassId, setNewClassId] = useState<string>('');
  const [newType, setNewType] = useState<Material['type']>('pdf');
  const [newTopic, setNewTopic] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [newUrl, setNewUrl] = useState<string>('');
  const [newFileName, setNewFileName] = useState<string>('');

  // PRIVACY RESTRICTION: STRICTLY FOR TEACHERS ONLY
  if (user?.role !== 'teacher' && user?.role !== 'admin') {
    return (
      <div className="p-12 text-center bg-white border border-[#DADCE0] rounded-xl space-y-3">
        <FileText className="w-12 h-12 text-[#5F6368] mx-auto opacity-50" />
        <h3 className="text-base font-bold text-[#202124]">Teacher Access Only</h3>
        <p className="text-xs text-[#5F6368]">
          Material seen/unseen tracking is confidential and strictly accessible to course instructors.
        </p>
      </div>
    );
  }

  // Teacher's classes
  const myClasses = classes.filter((c) => c.teacherId === user.id);
  const myClassIds = new Set(myClasses.map((c) => c.id));

  // Teacher's materials
  const myMaterials = materials.filter((m) => myClassIds.has(m.classId));

  // Filtered materials
  const filteredMaterials = myMaterials
    .filter((m) => {
      if (selectedClassId !== 'all' && m.classId !== selectedClassId) return false;
      if (selectedType !== 'all' && m.type !== selectedType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          m.title.toLowerCase().includes(q) ||
          (m.description && m.description.toLowerCase().includes(q)) ||
          (m.topic && m.topic.toLowerCase().includes(q))
        );
      }
      return true;
    });

  // Global engagement metrics for teacher
  const totalMaterials = myMaterials.length;
  const enrolledStudentIds = new Set(
    members.filter((m) => myClassIds.has(m.classId) && m.role === 'student').map((m) => m.userId)
  );
  const totalEnrolledStudents = enrolledStudentIds.size;

  // Calculate overall seen %
  let totalStudentMaterialPairs = 0;
  let seenStudentMaterialPairs = 0;

  myMaterials.forEach((mat) => {
    const classStudents = members.filter((m) => m.classId === mat.classId && m.role === 'student');
    totalStudentMaterialPairs += classStudents.length;
    const views = materialViews.filter((v) => v.materialId === mat.id && v.seen);
    const seenCount = classStudents.filter((st) => views.some((v) => v.studentId === st.userId)).length;
    seenStudentMaterialPairs += seenCount;
  });

  const overallSeenPct = totalStudentMaterialPairs > 0 
    ? Math.round((seenStudentMaterialPairs / totalStudentMaterialPairs) * 100) 
    : 0;

  const handleOpenCreateModal = () => {
    if (myClasses.length > 0) {
      setNewClassId(myClasses[0].id);
    }
    setNewTitle('');
    setNewType('pdf');
    setNewTopic('');
    setNewDesc('');
    setNewContent('');
    setNewUrl('');
    setNewFileName('');
    setShowCreateModal(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newClassId) return;

    const targetClass = myClasses.find((c) => c.id === newClassId);

    const attachments = newFileName.trim() ? [
      {
        id: `att_${Date.now()}`,
        name: newFileName.trim(),
        url: newUrl.trim() || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        type: newType === 'pdf' ? 'application/pdf' : 'application/octet-stream',
        size: 1540000,
      }
    ] : undefined;

    createMaterial({
      title: newTitle.trim(),
      classId: newClassId,
      className: targetClass?.name,
      teacherId: user.id,
      teacherName: user.name,
      type: newType,
      topic: newTopic.trim() || undefined,
      description: newDesc.trim() || undefined,
      content: newContent.trim() || undefined,
      url: newUrl.trim() || undefined,
      attachments,
    });

    setShowCreateModal(false);
  };

  const getTypeIcon = (type: Material['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-[#D93025]" />;
      case 'notes':
        return <BookMarked className="w-5 h-5 text-[#188038]" />;
      case 'video':
        return <Video className="w-5 h-5 text-[#7627BB]" />;
      case 'link':
        return <Link2 className="w-5 h-5 text-[#1A73E8]" />;
      case 'document':
      default:
        return <FileText className="w-5 h-5 text-[#1A73E8]" />;
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-[#DADCE0]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#202124]">Materials & Seen Tracking</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-[#188038] border border-emerald-200">
              Instructor View
            </span>
          </div>
          <p className="text-xs text-[#5F6368] mt-0.5">
            Monitor real-time WhatsApp-style student seen/unseen interaction across all notes, PDFs, and resources.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Material
          </button>
        </div>
      </div>

      {/* Engagement Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#DADCE0] p-4 rounded-xl shadow-2xs">
          <p className="text-[11px] font-semibold text-[#5F6368] uppercase tracking-wider">Total Materials</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-[#202124]">{totalMaterials}</span>
            <span className="text-xs text-[#5F6368]">across {myClasses.length} courses</span>
          </div>
        </div>

        <div className="bg-white border border-[#DADCE0] p-4 rounded-xl shadow-2xs">
          <p className="text-[11px] font-semibold text-[#5F6368] uppercase tracking-wider">Total Enrolled</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-[#202124]">{totalEnrolledStudents}</span>
            <span className="text-xs text-[#5F6368]">students</span>
          </div>
        </div>

        <div className="bg-white border border-[#DADCE0] p-4 rounded-xl shadow-2xs">
          <p className="text-[11px] font-semibold text-[#5F6368] uppercase tracking-wider">Overall Seen Rate</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-[#188038]">{overallSeenPct}%</span>
            <span className="text-xs text-[#188038] font-semibold flex items-center gap-1">
              <CheckCheck className="w-3.5 h-3.5" /> Active
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#DADCE0] p-4 rounded-xl shadow-2xs">
          <p className="text-[11px] font-semibold text-[#5F6368] uppercase tracking-wider">Unseen Material Views</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-[#B06000]">
              {Math.max(0, totalStudentMaterialPairs - seenStudentMaterialPairs)}
            </span>
            <span className="text-xs text-[#B06000]">pending opens</span>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white border border-[#DADCE0] p-4 rounded-xl shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#5F6368] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search material title, notes, unit..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8F9FA] border border-[#DADCE0] rounded-lg text-[#202124] focus:border-[#1A73E8] focus:bg-white outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Class selector */}
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-2 text-xs bg-[#F8F9FA] border border-[#DADCE0] rounded-lg text-[#202124] focus:border-[#1A73E8] outline-hidden font-medium"
          >
            <option value="all">All Classes ({myClasses.length})</option>
            {myClasses.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} ({cls.section})
              </option>
            ))}
          </select>

          {/* Type selector */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-xs bg-[#F8F9FA] border border-[#DADCE0] rounded-lg text-[#202124] focus:border-[#1A73E8] outline-hidden font-medium capitalize"
          >
            <option value="all">All Types</option>
            <option value="pdf">PDF Files</option>
            <option value="notes">Lecture Notes</option>
            <option value="document">Documents</option>
            <option value="video">Videos</option>
            <option value="link">Links</option>
          </select>
        </div>
      </div>

      {/* Materials Cards Grid */}
      {filteredMaterials.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[#DADCE0] rounded-xl space-y-4">
          <BookOpen className="w-12 h-12 text-[#5F6368] mx-auto opacity-40" />
          <h3 className="text-base font-bold text-[#202124]">No materials found</h3>
          <p className="text-xs text-[#5F6368] max-w-md mx-auto">
            {searchQuery || selectedClassId !== 'all' || selectedType !== 'all'
              ? 'Try adjusting your search query or filters to find materials.'
              : 'Post your first notes, reference PDF, or study guide for your students.'}
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-lg text-xs font-semibold"
          >
            + Create First Material
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((mat) => {
            const classData = myClasses.find((c) => c.id === mat.classId);
            const enrolledStudents = members.filter(
              (m) => m.classId === mat.classId && m.role === 'student'
            );
            const totalStudents = Math.max(enrolledStudents.length, 1);
            const views = materialViews.filter((v) => v.materialId === mat.id && v.seen);
            const seenCount = enrolledStudents.filter((st) =>
              views.some((v) => v.studentId === st.userId)
            ).length;
            const seenPercentage = Math.round((seenCount / totalStudents) * 100);

            return (
              <div
                key={mat.id}
                className="bg-white border border-[#DADCE0] hover:border-slate-400 hover:shadow-md rounded-xl p-5 flex flex-col justify-between transition-all duration-150 group"
              >
                <div className="space-y-3">
                  {/* Top Header Badge & Type */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-[#DADCE0] shrink-0">
                      {getTypeIcon(mat.type)}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#1A73E8] border border-blue-100">
                        {mat.type}
                      </span>
                      <button
                        onClick={() => {
                          if (confirm(`Delete material "${mat.title}"?`)) {
                            deleteMaterial(mat.id);
                          }
                        }}
                        className="p-1 text-[#5F6368] hover:text-[#D93025] hover:bg-rose-50 rounded transition-colors"
                        title="Delete material"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Metadata */}
                  <div>
                    <h3 className="text-sm font-bold text-[#202124] group-hover:text-[#1A73E8] line-clamp-2 transition-colors">
                      {mat.title}
                    </h3>
                    <p className="text-xs text-[#5F6368] font-medium mt-1">
                      {classData?.name || mat.className || 'Class'}
                      {mat.topic ? ` • ${mat.topic}` : ''}
                    </p>
                    <p className="text-[11px] text-[#5F6368] mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Posted {formatRelativeTime(mat.createdAt)}
                    </p>
                  </div>

                  {/* Description preview */}
                  {mat.description && (
                    <p className="text-xs text-[#5F6368] line-clamp-2 leading-relaxed">
                      {mat.description}
                    </p>
                  )}

                  {/* Attachment indicator if any */}
                  {mat.attachments && mat.attachments.length > 0 && (
                    <div className="p-2 bg-slate-50 border border-[#DADCE0] rounded-lg flex items-center justify-between text-[11px]">
                      <span className="font-medium text-[#202124] truncate flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#1A73E8]" /> {mat.attachments[0].name}
                      </span>
                      <span className="text-[#5F6368] shrink-0">PDF</span>
                    </div>
                  )}
                </div>

                {/* TEACHER SEEN PROGRESS BAR & ACTIONS */}
                <div className="pt-4 mt-4 border-t border-[#DADCE0] space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-[#202124] flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-[#1A73E8]" />
                        <strong>{seenCount}</strong> / {enrolledStudents.length} students have seen
                      </span>
                      <span className="font-bold text-[#1A73E8]">{seenPercentage}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-[#DADCE0]/50">
                      <div
                        className="bg-[#1A73E8] h-full rounded-full transition-all duration-300"
                        style={{ width: `${seenPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* View Seen Status Trigger */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setSelectedMaterialForSeen(mat)}
                      className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-[#1A73E8] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Eye className="w-4 h-4" /> View Seen Status
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* WHATSAPP-STYLE SEEN STATUS MODAL */}
      {selectedMaterialForSeen && (
        <MaterialSeenModal
          isOpen={!!selectedMaterialForSeen}
          onClose={() => setSelectedMaterialForSeen(null)}
          materialId={selectedMaterialForSeen.id}
          materialTitle={selectedMaterialForSeen.title}
          materialType={selectedMaterialForSeen.type as any}
          classId={selectedMaterialForSeen.classId}
          className={selectedMaterialForSeen.className}
          postedAt={selectedMaterialForSeen.createdAt}
        />
      )}

      {/* CREATE NEW MATERIAL MODAL */}
      {showCreateModal && (
        <div
          onClick={() => setShowCreateModal(false)}
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 cursor-default animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#DADCE0] rounded-xl shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] overflow-hidden text-left"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-[#DADCE0] flex items-center justify-between bg-[#F8F9FA]">
              <div>
                <h2 className="text-base font-bold text-[#202124]">Post New Study Material</h2>
                <p className="text-xs text-[#5F6368]">
                  Upload lecture notes, PDFs, or links with real-time student seen tracking.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-[#5F6368] hover:text-[#202124] rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">Select Course *</label>
                <select
                  required
                  value={newClassId}
                  onChange={(e) => setNewClassId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#DADCE0] rounded-lg text-[#202124] focus:border-[#1A73E8] outline-hidden font-medium"
                >
                  {myClasses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.section})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">Material Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Unit 3 Notes — Network Layer Architecture.pdf"
                  className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#DADCE0] rounded-lg text-[#202124] focus:border-[#1A73E8] focus:bg-white outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1">Type *</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as Material['type'])}
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
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="e.g. Unit 3: Memory"
                    className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#DADCE0] rounded-lg text-[#202124] focus:border-[#1A73E8] focus:bg-white outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">Description / Summary</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Brief summary of what this material covers..."
                  className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#DADCE0] rounded-lg text-[#202124] focus:border-[#1A73E8] focus:bg-white outline-hidden leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  {newType === 'link' || newType === 'video' ? 'Resource URL' : 'Attached File Name'}
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="e.g. Unit_3_Lecture_Notes.pdf"
                    className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#DADCE0] rounded-lg text-[#202124] focus:border-[#1A73E8] focus:bg-white outline-hidden"
                  />
                  {(newType === 'link' || newType === 'video') && (
                    <input
                      type="url"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      placeholder="https://example.com/lecture-video"
                      className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#DADCE0] rounded-lg text-[#202124] focus:border-[#1A73E8] focus:bg-white outline-hidden"
                    />
                  )}
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-[#1A73E8] flex items-center gap-2">
                <Eye className="w-4 h-4 shrink-0" />
                <span>
                  Every enrolled student will have a personalized seen/unseen status tracked locally.
                </span>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-[#DADCE0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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
    </div>
  );
};
