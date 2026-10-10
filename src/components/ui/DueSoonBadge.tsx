import React, { useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { isDueSoon, getDueSoonTimeRemaining, formatDate } from '../../lib/utils';

interface DueSoonBadgeProps {
  dueDate: string;
  size?: 'sm' | 'md';
  showCountdown?: boolean;
  className?: string;
}

export const DueSoonBadge: React.FC<DueSoonBadgeProps> = ({
  dueDate,
  size = 'md',
  showCountdown = true,
  className = '',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!isDueSoon(dueDate)) {
    return null;
  }

  const remaining = getDueSoonTimeRemaining(dueDate);

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-[11px] px-2.5 py-0.5 gap-1.5',
  }[size];

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <span
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`inline-flex items-center font-bold tracking-tight rounded-full bg-amber-50 text-amber-800 border border-amber-300/80 shadow-2xs cursor-default select-none transition-all hover:bg-amber-100 ${sizeClasses}`}
        title={`Due within 48 hours: ${formatDate(dueDate)}`}
      >
        {/* Pulsing Alert Dot */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
        </span>

        <Clock className="w-3 h-3 text-amber-700 shrink-0" />
        <span>Due Soon</span>

        {showCountdown && remaining && (
          <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-amber-200/60 text-amber-900 font-mono text-[10px]">
            {remaining.label}
          </span>
        )}
      </span>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs z-50 p-2 bg-[#202124] text-white text-[11px] rounded-lg shadow-xl border border-slate-700 animate-in fade-in duration-150 pointer-events-none">
          <div className="flex items-center gap-1.5 font-semibold text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Upcoming Deadline Alert</span>
          </div>
          <p className="text-slate-300 mt-0.5">
            This task is due on <strong className="text-white">{formatDate(dueDate)}</strong>.
          </p>
          {remaining && (
            <p className="text-amber-200 font-medium mt-0.5">
              Approx. {remaining.label}
            </p>
          )}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#202124]" />
        </div>
      )}
    </div>
  );
};
