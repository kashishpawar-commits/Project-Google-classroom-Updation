import React, { useState, useEffect } from 'react';
import { BookOpen, Copy, Check, X } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Class } from '../../types';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (cls: Class) => void;
  onSuccess?: (classId: string) => void;
}

export const CreateClassModal: React.FC<CreateClassModalProps> = ({ 
  isOpen, 
  onClose, 
  onCreated,
  onSuccess 
}) => {
  const { createClass } = useData();

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [section, setSection] = useState('');
  const [room, setRoom] = useState('');
  const [description, setDescription] = useState('');

  const [createdClass, setCreatedClass] = useState<Class | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleModalClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleModalClose = () => {
    setName('');
    setSubject('');
    setSection('');
    setRoom('');
    setDescription('');
    setCreatedClass(null);
    setError(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Class name is required.');
      return;
    }

    try {
      const newClass = createClass({
        name: name.trim(),
        subject: subject.trim(),
        section: section.trim(),
        room: room.trim(),
        description: description.trim(),
      });

      setCreatedClass(newClass);
      if (onCreated) onCreated(newClass);
      if (onSuccess) onSuccess(newClass.id);
    } catch (err: any) {
      setError(err.message || 'Failed to create class.');
    }
  };

  const copyCode = () => {
    if (createdClass) {
      navigator.clipboard.writeText(createdClass.classCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      onClick={handleModalClose}
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-in fade-in duration-100"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-[#DADCE0] rounded-xl shadow-xl max-w-lg w-full p-6 space-y-5 text-left animate-in zoom-in-95 duration-100"
      >
        <div className="flex justify-between items-center pb-3 border-b border-[#DADCE0]">
          <h3 className="text-base font-bold text-[#202124] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#1A73E8]" /> Create Class
          </h3>
          <button 
            onClick={handleModalClose} 
            className="p-1 text-[#5F6368] hover:text-[#202124] rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-[#D93025] text-xs rounded-lg border border-rose-200">
            {error}
          </div>
        )}

        {createdClass ? (
          <div className="space-y-5 text-center py-4">
            <div className="w-12 h-12 bg-emerald-50 text-[#188038] rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-[#202124]">Class Created Successfully!</h4>
              <p className="text-xs text-[#5F6368] mt-1">
                Share this class code with students to let them join.
              </p>
            </div>

            <div className="p-4 bg-[#F8F9FA] rounded-xl flex items-center justify-between border border-[#DADCE0] max-w-xs mx-auto">
              <span className="font-mono text-2xl font-bold text-[#1A73E8] tracking-wider">
                {createdClass.classCode}
              </span>
              <button
                onClick={copyCode}
                className="px-3 py-1.5 bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <button
              onClick={handleModalClose}
              className="w-full py-2.5 bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              Done & Go to Class
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1">
                Class Name (required) *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Operating Systems"
                className="w-full px-3 py-2 bg-[#F8F9FA] text-[#202124] rounded-lg border border-[#DADCE0] text-xs focus:border-[#1A73E8] focus:bg-white outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">Section</label>
                <input
                  type="text"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  placeholder="CS-301"
                  className="w-full px-3 py-2 bg-[#F8F9FA] text-[#202124] rounded-lg border border-[#DADCE0] text-xs focus:border-[#1A73E8] focus:bg-white outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Computer Science"
                  className="w-full px-3 py-2 bg-[#F8F9FA] text-[#202124] rounded-lg border border-[#DADCE0] text-xs focus:border-[#1A73E8] focus:bg-white outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1">Room / Location</label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Lab 402 or Online Zoom"
                className="w-full px-3 py-2 bg-[#F8F9FA] text-[#202124] rounded-lg border border-[#DADCE0] text-xs focus:border-[#1A73E8] focus:bg-white outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Course syllabus, goals, and expectations..."
                className="w-full px-3 py-2 bg-[#F8F9FA] text-[#202124] rounded-lg border border-[#DADCE0] text-xs focus:border-[#1A73E8] focus:bg-white outline-hidden"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-[#DADCE0]">
              <button
                type="button"
                onClick={handleModalClose}
                className="px-4 py-2 text-xs font-medium text-[#5F6368] hover:text-[#202124] rounded-lg hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                Create
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
