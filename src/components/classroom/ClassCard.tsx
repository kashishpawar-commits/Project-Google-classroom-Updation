import React, { useState } from 'react';
import { Users, BookOpen, MoreVertical, Copy, Edit, Trash2, LogOut, Check, X } from 'lucide-react';
import { Class } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface ClassCardProps {
  cls: Class;
  onClick: () => void;
  onEdit?: (cls: Class) => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({ cls, onClick, onEdit }) => {
  const { user } = useAuth();
  const { members, assignments, deleteClass, leaveClass, updateClass } = useData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(cls.name);
  const [editSection, setEditSection] = useState(cls.section);
  const [editSubject, setEditSubject] = useState(cls.subject);
  const [editRoom, setEditRoom] = useState(cls.room || '');
  const [editDesc, setEditDesc] = useState(cls.description || '');

  const isTeacher = user?.role === 'teacher' && cls.teacherId === user.id;
  const memberCount = members.filter((m) => m.classId === cls.id && m.role === 'student').length;
  const asgCount = assignments.filter((a) => a.classId === cls.id).length;

  const copyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(cls.classCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setMenuOpen(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${cls.name}"? This action cannot be undone.`)) {
      deleteClass(cls.id);
    }
    setMenuOpen(false);
  };

  const handleLeave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to unenroll from "${cls.name}"?`)) {
      leaveClass(cls.id);
    }
    setMenuOpen(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (onEdit) {
      onEdit(cls);
    } else {
      setEditName(cls.name);
      setEditSection(cls.section);
      setEditSubject(cls.subject);
      setEditRoom(cls.room || '');
      setEditDesc(cls.description || '');
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    updateClass(cls.id, {
      name: editName.trim(),
      section: editSection.trim(),
      subject: editSubject.trim(),
      room: editRoom.trim() || undefined,
      description: editDesc.trim() || undefined,
    });
    setShowEditModal(false);
  };

  // Subtle clean header color based on subject/id
  const getBannerBg = (color?: string) => {
    if (color && !color.startsWith('from-')) return color;
    const colors = ['bg-[#1A73E8]', 'bg-[#188038]', 'bg-[#7627BB]', 'bg-[#B06000]', 'bg-[#007B83]'];
    const charCode = cls.name.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
  };

  return (
    <div
      onClick={onClick}
      className="bg-white border border-[#DADCE0] hover:border-slate-400 hover:shadow-md rounded-xl overflow-hidden transition-all duration-150 cursor-pointer flex flex-col justify-between group h-64"
    >
      {/* Top Banner (Google Classroom Header) */}
      <div className={`p-4 ${getBannerBg(cls.bannerColor)} text-white relative min-h-[96px] flex flex-col justify-between`}>
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 pr-2">
            <h3 className="text-lg font-semibold tracking-tight truncate group-hover:underline">
              {cls.name}
            </h3>
            <p className="text-xs text-white/90 truncate">
              {cls.section} {cls.subject ? `• ${cls.subject}` : ''}
            </p>
          </div>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-1 rounded-full text-white/90 hover:text-white hover:bg-black/10 transition-colors"
              title="Class options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {menuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-1 w-44 bg-white border border-[#DADCE0] rounded-xl shadow-lg z-20 py-1 text-left text-xs animate-in fade-in duration-100"
              >
                <button
                  onClick={copyCode}
                  className="w-full px-3.5 py-2 text-[#202124] hover:bg-slate-50 flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#5F6368]" />}
                  <span>{copied ? 'Copied code!' : 'Copy class code'}</span>
                </button>

                {isTeacher && (
                  <>
                    <button
                      onClick={handleEdit}
                      className="w-full px-3.5 py-2 text-[#202124] hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4 text-[#5F6368]" />
                      <span>Edit class</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full px-3.5 py-2 text-[#D93025] hover:bg-rose-50 flex items-center gap-2 border-t border-[#DADCE0]"
                    >
                      <Trash2 className="w-4 h-4 text-[#D93025]" />
                      <span>Delete class</span>
                    </button>
                  </>
                )}

                {!isTeacher && user?.role === 'student' && (
                  <button
                    onClick={handleLeave}
                    className="w-full px-3.5 py-2 text-[#D93025] hover:bg-rose-50 flex items-center gap-2 border-t border-[#DADCE0]"
                  >
                    <LogOut className="w-4 h-4 text-[#D93025]" />
                    <span>Unenroll</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-white/90 mt-1 truncate">
          {cls.teacherName}
        </p>
      </div>

      {/* Body Info */}
      <div className="p-4 flex-1 flex flex-col justify-between text-left">
        <p className="text-xs text-[#5F6368] line-clamp-2">
          {cls.description || (cls.room ? `Room: ${cls.room}` : 'No description provided.')}
        </p>

        <div className="pt-3 border-t border-[#DADCE0] flex items-center justify-between text-xs text-[#5F6368]">
          <span className="flex items-center gap-1.5 font-medium">
            <Users className="w-4 h-4 text-[#1A73E8]" /> {memberCount} students
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <BookOpen className="w-4 h-4 text-[#188038]" /> {asgCount} assignments
          </span>
        </div>
      </div>

      {/* Edit Class Modal */}
      {showEditModal && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowEditModal(false);
          }}
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 cursor-default"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#DADCE0] rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 text-left"
          >
            <div className="flex justify-between items-center pb-2 border-b border-[#DADCE0]">
              <h3 className="text-base font-bold text-[#202124]">Edit Class</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 text-[#5F6368] hover:text-[#202124] rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">Class Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F9FA] text-[#202124] rounded-lg border border-[#DADCE0] text-xs focus:border-[#1A73E8] focus:bg-white outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1">Section</label>
                  <input
                    type="text"
                    value={editSection}
                    onChange={(e) => setEditSection(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F9FA] text-[#202124] rounded-lg border border-[#DADCE0] text-xs focus:border-[#1A73E8] focus:bg-white outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1">Subject</label>
                  <input
                    type="text"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F9FA] text-[#202124] rounded-lg border border-[#DADCE0] text-xs focus:border-[#1A73E8] focus:bg-white outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">Room</label>
                <input
                  type="text"
                  value={editRoom}
                  onChange={(e) => setEditRoom(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F9FA] text-[#202124] rounded-lg border border-[#DADCE0] text-xs focus:border-[#1A73E8] focus:bg-white outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
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
