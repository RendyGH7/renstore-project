import React from 'react';

interface SkeletonProps {
  count?: number;
  className?: string;
  type?: 'card' | 'table-row' | 'detail';
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({ 
  count = 4, 
  className = '', 
  type = 'card' 
}) => {
  if (type === 'table-row') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <tr key={i} className="border-b border-slate-100">
            <td className="py-4 px-4"><div className="h-4 animate-shimmer rounded w-24"></div></td>
            <td className="py-4 px-4"><div className="h-4 animate-shimmer rounded w-40"></div></td>
            <td className="py-4 px-4"><div className="h-4 animate-shimmer rounded w-20"></div></td>
            <td className="py-4 px-4"><div className="h-4 animate-shimmer rounded w-16"></div></td>
            <td className="py-4 px-4"><div className="h-4 animate-shimmer rounded w-24"></div></td>
          </tr>
        ))}
      </>
    );
  }

  if (type === 'detail') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="w-full aspect-square bg-white rounded-3xl border border-slate-200/80 p-8 flex items-center justify-center">
          <div className="w-3/4 h-3/4 animate-shimmer rounded-2xl"></div>
        </div>
        <div className="space-y-4">
          <div className="h-4 animate-shimmer rounded w-1/4"></div>
          <div className="h-8 animate-shimmer rounded w-3/4"></div>
          <div className="h-6 animate-shimmer rounded w-1/3"></div>
          <div className="h-24 bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
            <div className="h-4 animate-shimmer rounded w-full"></div>
            <div className="h-4 animate-shimmer rounded w-5/6"></div>
          </div>
          <div className="h-12 animate-shimmer rounded-xl w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-3 shadow-xs">
          <div className="w-full aspect-square animate-shimmer rounded-xl"></div>
          <div className="h-4 animate-shimmer rounded w-3/4"></div>
          <div className="h-3 animate-shimmer rounded w-1/2"></div>
          <div className="h-5 animate-shimmer rounded w-1/3 pt-2"></div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
