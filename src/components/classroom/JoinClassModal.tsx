import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Class } from '../../types';

interface JoinClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoined?: (cls: Class) => void;
  onSuccess?: (classId: string) => void;
}

export const JoinClassModal: React.FC<JoinClassModalProps> = ({ 
  isOpen, 
  onClose, 
  onJoined,
  onSuccess 
}) => {
  const { joinClass } = useData();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
    setCode('');
    setError(null);
    setSuccessMsg(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!code.trim()) {
      setError('Please enter a class code.');
      return;
    }

    try {
      const targetClass = joinClass(code.trim());
      setSuccessMsg(`Joined ${targetClass.name}!`);
      setTimeout(() => {
        handleModalClose();
        if (onJoined) onJoined(targetClass);
        if (onSuccess) onSuccess(targetClass.id);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Invalid class code. Please check with your teacher.');
    }
  };

  return (
    <div 
      onClick={handleModalClose}
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-in fade-in duration-100"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-[#DADCE0] rounded-xl shadow-xl max-w-md w-full p-6 space-y-5 text-left animate-in zoom-in-95 duration-100"
      >
        <div className="flex justify-between items-center pb-3 border-b border-[#DADCE0]">
          <h3 className="text-base font-bold text-[#202124] flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#1A73E8]" /> Join Class
          </h3>
          <button 
            onClick={handleModalClose} 
            className="p-1 text-[#5F6368] hover:text-[#202124] rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-[#D93025] text-xs rounded-lg border border-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 text-[#188038] text-xs rounded-lg border border-emerald-200 flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#202124] mb-1">
              Class Code *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. OS2026 or DS2026"
              className="w-full px-3 py-2.5 bg-[#F8F9FA] text-[#202124] rounded-lg border border-[#DADCE0] text-center font-mono text-base font-bold tracking-widest focus:border-[#1A73E8] focus:bg-white outline-hidden uppercase"
            />
            <p className="text-[11px] text-[#5F6368] mt-1.5">
              Ask your teacher for the class code, then enter it here.
            </p>
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
              Join
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
