import React, { useState, useEffect } from 'react';
import { FileText, Plus, Paperclip, Trash2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Assignment, Attachment } from '../../types';
import { formatFileSize } from '../../lib/utils';

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClassId?: string;
  preselectedClassId?: string;
  onCreated?: (asg: Assignment) => void;
  onSuccess?: (assignmentId: string) => void;
}

export const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({
  isOpen,
  onClose,
  defaultClassId,
  preselectedClassId,
  onCreated,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { classes, topics, createAssignment } = useData();

  const teacherClasses = classes.filter((c) => c.teacherId === user?.id);
  const initialClassId = preselectedClassId || defaultClassId || (teacherClasses[0]?.id || '');

  const [classId, setClassId] = useState(initialClassId);
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [points, setPoints] = useState(100);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [dueTime, setDueTime] = useState('23:59');
  const [topic, setTopic] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedClassId || defaultClassId) {
      setClassId(preselectedClassId || defaultClassId || '');
    }
  }, [preselectedClassId, defaultClassId]);

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
    setTitle('');
    setInstructions('');
    setError(null);
    setAttachments([]);
    onClose();
  };

  const selectedClass = classes.find((c) => c.id === classId) || teacherClasses[0];
  const classTopics = topics.filter((t) => t.classId === selectedClass?.id);

  const handleFileUploadSim = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAtts: Attachment[] = Array.from(files).map((f: File) => ({
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: f.name,
      url: '#',
      type: f.type || 'application/octet-stream',
      size: f.size,
    }));

    setAttachments((prev) => [...prev, ...newAtts]);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = (status: 'published' | 'draft') => (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Assignment title is required.');
      return;
    }

    if (!selectedClass) {
      setError('Please select a valid class.');
      return;
    }

    try {
      const isoDue = `${dueDate}T${dueTime}:00Z`;

      const newAsg = createAssignment({
        classId: selectedClass.id,
        className: selectedClass.name,
        teacherId: user!.id,
        teacherName: user!.name,
        title: title.trim(),
        instructions: instructions.trim(),
        points: Number(points) || 100,
        dueDate: isoDue,
        dueTime,
        attachments,
        topic: topic.trim() || undefined,
        status,
      });

      handleModalClose();
      if (onCreated) onCreated(newAsg);
      if (onSuccess) onSuccess(newAsg.id);
    } catch (err: any) {
      setError(err.message || 'Failed to create assignment.');
    }
  };

  return (
    <div 
      onClick={handleModalClose}
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-in fade-in duration-100"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-[#DADCE0] rounded-xl shadow-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto text-left animate-in zoom-in-95 duration-100"
      >
        <div className="flex justify-between items-center pb-3 border-b border-[#DADCE0]">
          <h3 className="text-base font-bold text-[#202124] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1A73E8]" /> Create Assignment
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

        <form className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1">
                Class *
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F9FA] text-[#202124] rounded-lg border border-[#DADCE0] text-xs focus:border-[#1A73E8] focus:bg-white outline-hidden"
              >
                {teacherClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.section})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1">
                Topic
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  list="topic-suggestions"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Select or type a topic..."
                  className="w-full px-3 py-2 bg-[#F8F9FA] text-[#202124] rounded-lg border border-[#DADCE0] text-xs focus:border-[#1A73E8] focus:bg-white outline-hidden"
                />
                <datalist id="topic-suggestions">
                  {classTopics.map((t) => (
                    <option key={t.id} value={t.name} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202124] mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CPU Scheduling Simulator Lab"
              className="w-full px-3 py-2 bg-[#F8F9FA] text-[#202124] rounded-lg border border-[#DADCE0] text-xs focus:border-[#1A73E8] focus:bg-white outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202124] mb-1">
              Instructions
            </label>
            <textarea
              rows={4}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Detailed guidelines, objectives, and submission rules..."
              className="w-full px-3 py-2 bg-[#F8F9FA] text-[#202124] rounded-lg border border-[#DADCE0] text-xs focus:border-[#1A73E8] focus:bg-white outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1">Points</label>
              <input
                type="number"
                min={0}
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#F8F9FA] text-[#202124] rounded-lg border border-[#DADCE0] text-xs focus:border-[#1A73E8] focus:bg-white outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F9FA] text-[#202124] rounded-lg border border-[#DADCE0] text-xs focus:border-[#1A73E8] focus:bg-white outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1">Due Time</label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F9FA] text-[#202124] rounded-lg border border-[#DADCE0] text-xs focus:border-[#1A73E8] focus:bg-white outline-hidden"
              />
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-semibold text-[#202124]">
              Attachments / Resource Files
            </label>
            <label className="flex items-center gap-2 p-2.5 border border-dashed border-[#DADCE0] rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <Paperclip className="w-4 h-4 text-[#1A73E8]" />
              <span className="text-xs font-medium text-[#1A73E8]">Attach reference PDF, code, or document</span>
              <input type="file" multiple onChange={handleFileUploadSim} className="hidden" />
            </label>

            {attachments.length > 0 && (
              <div className="space-y-1">
                {attachments.map((att) => (
                  <div key={att.id} className="p-2 bg-slate-50 border border-[#DADCE0] rounded-lg flex justify-between items-center text-xs">
                    <span className="font-medium text-[#202124] truncate">{att.name} ({formatFileSize(att.size)})</span>
                    <button type="button" onClick={() => removeAttachment(att.id)} className="text-[#D93025]">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#DADCE0] flex justify-end gap-2">
            <button
              type="button"
              onClick={handleModalClose}
              className="px-4 py-2 text-xs font-medium text-[#5F6368] hover:text-[#202124] rounded-lg hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit('draft')}
              className="px-4 py-2 border border-[#DADCE0] text-[#202124] rounded-lg text-xs font-medium hover:bg-slate-50"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={handleSubmit('published')}
              className="px-4 py-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              Assign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
