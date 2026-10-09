import React, { useState } from 'react';
import { getStatusMeta, formatDate } from '../../lib/utils';

interface StatusBadgeProps {
  seen: boolean;
  submissionStatus?: 'submitted' | 'graded' | 'late' | 'returned';
  dueDate?: string;
  firstSeenAt?: string;
  lastSeenAt?: string;
  submittedAt?: string;
  grade?: number;
  points?: number;
  size?: 'sm' | 'md' | 'lg';
  showTimestampOnHover?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  seen,
  submissionStatus,
  dueDate,
  firstSeenAt,
  lastSeenAt,
  submittedAt,
  grade,
  points = 100,
  size = 'md',
  showTimestampOnHover = true,
}) => {
  const meta = getStatusMeta(seen, submissionStatus, dueDate);
  const [showTooltip, setShowTooltip] = useState(false);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 space-x-1',
    md: 'text-xs px-2.5 py-1 space-x-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 space-x-2 font-semibold',
  }[size];

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`inline-flex items-center rounded-full border transition-all duration-200 cursor-default ${meta.bgColor} ${meta.color} ${meta.borderColor} ${sizeClasses}`}
      >
        <span className="font-mono font-bold tracking-tight">{meta.icon}</span>
        <span>{meta.label}</span>
        {meta.code === 'graded' && grade !== undefined && (
          <span className="ml-1 text-[11px] opacity-90 font-mono">
            ({grade}/{points})
          </span>
        )}
      </div>

      {showTimestampOnHover && showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs z-50 p-2.5 bg-[#202124] text-white text-xs rounded-lg shadow-xl border border-slate-700 animate-in fade-in duration-150">
          <div className="space-y-1">
            {meta.code === 'not_seen' && (
              <p className="text-slate-300">Student has not opened this assignment yet.</p>
            )}
            {firstSeenAt && (
              <div>
                <span className="text-slate-400">First Seen: </span>
                <span className="font-medium text-blue-300">{formatDate(firstSeenAt)}</span>
              </div>
            )}
            {lastSeenAt && lastSeenAt !== firstSeenAt && (
              <div>
                <span className="text-slate-400">Last Seen: </span>
                <span className="font-medium text-blue-300">{formatDate(lastSeenAt)}</span>
              </div>
            )}
            {submittedAt && (
              <div>
                <span className="text-slate-400">Submitted: </span>
                <span className="font-medium text-emerald-300">{formatDate(submittedAt)}</span>
              </div>
            )}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#202124]" />
        </div>
      )}
    </div>
  );
};
