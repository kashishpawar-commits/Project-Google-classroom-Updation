import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-[#DADCE0]/60 rounded-md ${className}`} />
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
    <div className="space-y-4">
      <Skeleton className="h-8 w-48 rounded-md" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-44 rounded-xl" />
        <Skeleton className="h-44 rounded-xl" />
      </div>
    </div>
  </div>
);

export const TableSkeleton: React.FC = () => (
  <div className="space-y-3">
    <Skeleton className="h-10 w-full rounded-lg" />
    {[1, 2, 3, 4, 5].map((i) => (
      <Skeleton key={i} className="h-14 w-full rounded-lg" />
    ))}
  </div>
);

export const AssignmentCardSkeleton: React.FC = () => (
  <div className="p-5 border border-[#DADCE0] rounded-xl space-y-3 bg-white">
    <div className="flex justify-between items-center">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
    <Skeleton className="h-4 w-2/3" />
    <div className="pt-2 flex justify-between items-center">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-24 rounded-lg" />
    </div>
  </div>
);
