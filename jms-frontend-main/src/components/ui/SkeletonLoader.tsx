import React from 'react';

interface SkeletonLoaderProps {
  type: 'table' | 'cards' | 'detail';
  rows?: number;
  columns?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type, rows = 5, columns = 4 }) => {
  if (type === 'table') {
    return (
      <div style={{ padding: '4px 0' }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton-row">
            {Array.from({ length: columns }).map((_, j) => (
              <div key={j} className="skeleton skeleton-text" style={{ width: `${60 + Math.random() * 30}%` }} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div className="grid-auto">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="glass-card" style={{ padding: '20px' }}>
            <div className="skeleton skeleton-text-short" />
            <div className="skeleton skeleton-heading" />
            <div className="skeleton skeleton-text" />
          </div>
        ))}
      </div>
    );
  }

  // Detail skeleton
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="skeleton skeleton-heading" style={{ width: '40%' }} />
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text" style={{ width: '65%' }} />
        <div className="skeleton skeleton-text-short" />
      </div>
    </div>
  );
};
