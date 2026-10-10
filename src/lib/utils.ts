import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateClassCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'CF-';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function formatDate(dateString: string | Date): string {
  if (!dateString) return '';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return '';
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatShortDate(dateString: string | Date): string {
  if (!dateString) return '';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return '';
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatRelativeTime(dateString: string | Date): string {
  if (!dateString) return '';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatShortDate(date);
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export interface StatusMeta {
  code: 'not_seen' | 'seen' | 'submitted' | 'graded' | 'late';
  label: string;
  icon: string; // tick representation
  color: string;
  bgColor: string;
  borderColor: string;
}

export function getStatusMeta(
  seen: boolean,
  submissionStatus?: 'submitted' | 'graded' | 'late' | 'returned',
  dueDate?: string
): StatusMeta {
  const isLate = dueDate && new Date() > new Date(dueDate) && !submissionStatus;

  if (submissionStatus === 'graded' || submissionStatus === 'returned') {
    return {
      code: 'graded',
      label: 'Graded',
      icon: '✓✓',
      color: 'text-[#188038]',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    };
  }

  if (submissionStatus === 'submitted') {
    return {
      code: 'submitted',
      label: 'Submitted',
      icon: '✓✓',
      color: 'text-[#1A73E8]',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    };
  }

  if (isLate || submissionStatus === 'late') {
    return {
      code: 'late',
      label: 'Late',
      icon: '⚠',
      color: 'text-[#B06000]',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    };
  }

  if (seen) {
    return {
      code: 'seen',
      label: 'Seen',
      icon: '✓',
      color: 'text-[#1A73E8]',
      bgColor: 'bg-blue-50/70',
      borderColor: 'border-blue-200',
    };
  }

  return {
    code: 'not_seen',
    label: 'Not Seen',
    icon: '○',
    color: 'text-[#5F6368]',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-200',
  };
}

/**
 * Checks if a deadline falls within the next 48 hours (and has not already passed).
 */
export function isDueSoon(dueDateString?: string | Date): boolean {
  if (!dueDateString) return false;
  const dueDate = typeof dueDateString === 'string' ? new Date(dueDateString) : dueDateString;
  const now = new Date();
  const diffInMs = dueDate.getTime() - now.getTime();
  return diffInMs > 0 && diffInMs <= 48 * 60 * 60 * 1000;
}

/**
 * Returns formatted hours/days remaining for a task due within the next 48 hours.
 */
export function getDueSoonTimeRemaining(dueDateString?: string | Date): { hours: number; label: string } | null {
  if (!dueDateString) return null;
  const dueDate = typeof dueDateString === 'string' ? new Date(dueDateString) : dueDateString;
  const now = new Date();
  const diffInMs = dueDate.getTime() - now.getTime();
  if (diffInMs <= 0 || diffInMs > 48 * 60 * 60 * 1000) return null;

  const hours = Math.ceil(diffInMs / (1000 * 60 * 60));
  if (hours <= 1) return { hours, label: '< 1h left' };
  if (hours < 24) return { hours, label: `${hours}h left` };
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return { 
    hours, 
    label: remainingHours > 0 ? `${days}d ${remainingHours}h left` : `${days}d left` 
  };
}
