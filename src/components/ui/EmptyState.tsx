import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white border border-[#DADCE0] rounded-2xl shadow-xs">
      <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-[#1A73E8] mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-[#202124]">{title}</h3>
      <p className="mt-1 text-sm text-[#5F6368] max-w-sm">{description}</p>
      
      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#1A73E8] hover:bg-[#1557B0] rounded-xl shadow-xs transition-colors"
            >
              {actionLabel}
            </button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#202124] bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
