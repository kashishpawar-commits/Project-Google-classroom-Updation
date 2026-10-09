import React, { useState, useEffect } from 'react';
import { CheckSquare, Paperclip, Send, FileText, Check, X } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatDate } from '../../lib/utils';

interface SubmissionsManagerModalProps {
  isOpen?: boolean;
  submissionId?: string | null;
  assignmentId?: string | null;
  onClose: () => void;
}

export const SubmissionsManagerModal: React.FC<SubmissionsManagerModalProps> = ({
  isOpen = true,
  submissionId,
  assignmentId,
  onClose,
}) => {
  const { submissions, assignments, gradeSubmission } = useData();

  const asgSubmissions = assignmentId
    ? submissions.filter((s) => s.assignmentId === assignmentId)
    : [];

  const initialSubmission =
    submissions.find((s) => s.id === submissionId) ||
    asgSubmissions[0] ||
    null;

  const [activeSubId, setActiveSubId] = useState<string | null>(initialSubmission?.id || null);

  const submission =
    submissions.find((s) => s.id === activeSubId) ||
    initialSubmission;

  const assignment =
    (assignmentId ? assignments.find((a) => a.id === assignmentId) : null) ||
    (submission ? assignments.find((a) => a.id === submission.assignmentId) : null);

  const [score, setScore] = useState<number>(submission?.grade ?? 100);
  const [feedback, setFeedback] = useState<string>(submission?.feedback ?? '');
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    if (submission) {
      setScore(submission.grade ?? (assignment?.points ? Math.round(assignment.points * 0.9) : 90));
      setFeedback(submission.feedback ?? 'Good work on this assignment.');
    }
  }, [submission?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (isOpen === false) return null;

  if (!assignment) return null;

  if (!submission) {
    return (
      <div 
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className="bg-white border border-[#DADCE0] rounded-xl shadow-xl max-w-md w-full p-6 text-center space-y-4"
        >
          <FileText className="w-10 h-10 text-[#5F6368] mx-auto opacity-40" />
          <h3 className="text-base font-bold text-[#202124]">No Submissions Yet</h3>
          <p className="text-xs text-[#5F6368]">
            No students have turned in work for <span className="font-semibold text-[#202124]">{assignment.title}</span> yet.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#202124] rounded-lg text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submission) return;
    gradeSubmission(submission.id, Number(score), feedback);
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      onClose();
    }, 1000);
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-in fade-in duration-100"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-[#DADCE0] rounded-xl shadow-xl max-w-xl w-full p-6 space-y-5 text-left animate-in zoom-in-95 duration-100"
      >
        <div className="flex justify-between items-center pb-3 border-b border-[#DADCE0]">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#1A73E8] bg-blue-50 px-2 py-0.5 rounded">
              {assignment.title}
            </span>
            <h3 className="text-base font-bold text-[#202124] mt-1">
              Grade Student Submission
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 text-[#5F6368] hover:text-[#202124] rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Selector Tab if multiple submissions */}
        {asgSubmissions.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 border-b border-[#DADCE0]">
            {asgSubmissions.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSubId(s.id)}
                className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  s.id === submission.id
                    ? 'bg-[#1A73E8] text-white font-semibold'
                    : 'bg-slate-100 text-[#5F6368] hover:bg-slate-200'
                }`}
              >
                {s.studentName} {s.status === 'graded' ? '✓' : ''}
              </button>
            ))}
          </div>
        )}

        {/* Submission Details */}
        <div className="p-3.5 bg-[#F8F9FA] rounded-xl border border-[#DADCE0] space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#202124]">{submission.studentName}</span>
            <span className="text-[11px] text-[#5F6368]">{formatDate(submission.submittedAt)}</span>
          </div>

          {submission.textResponse && (
            <p className="text-xs text-[#202124] bg-white p-2.5 rounded border border-[#DADCE0] italic">
              "{submission.textResponse}"
            </p>
          )}

          {submission.attachments && submission.attachments.length > 0 && (
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[#5F6368]">Attached Files:</span>
              <div className="flex flex-wrap gap-1.5">
                {submission.attachments.map((att) => (
                  <span key={att.id} className="inline-flex items-center gap-1 text-xs bg-white px-2 py-1 rounded border border-[#DADCE0] text-[#1A73E8]">
                    <Paperclip className="w-3.5 h-3.5" /> {att.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Grade Form */}
        <form onSubmit={handleGradeSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1">
                Grade / Points (max {assignment.points})
              </label>
              <input
                type="number"
                min={0}
                max={assignment.points}
                required
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-[#DADCE0] rounded-lg text-[#202124] font-semibold focus:border-[#1A73E8] outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1">
                Current Status
              </label>
              <div className="py-2 text-xs font-semibold text-[#188038]">
                {submission.status === 'graded' ? 'Already Graded' : 'Submitted (Ready for review)'}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202124] mb-1">
              Feedback to Student
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide constructive feedback for the student..."
              className="w-full p-2.5 text-xs border border-[#DADCE0] rounded-lg text-[#202124] focus:border-[#1A73E8] outline-hidden"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-[#DADCE0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#5F6368] hover:text-[#202124] rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              {successMsg ? 'Saved!' : 'Return Grade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
