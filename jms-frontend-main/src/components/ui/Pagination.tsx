import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPrevPage,
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const delta = 1;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  const btnStyle = (isActive: boolean, isDisabled: boolean): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '34px',
    height: '34px',
    padding: '0 8px',
    borderRadius: '8px',
    fontSize: '0.82rem',
    fontWeight: isActive ? 700 : 500,
    color: isActive ? '#FFFFFF' : isDisabled ? '#CBD5E1' : '#475569',
    background: isActive ? '#141518' : 'transparent',
    border: isActive ? 'none' : '1px solid transparent',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s',
    opacity: isDisabled ? 0.5 : 1,
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '12px 0' }}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrevPage && page <= 1}
        style={btnStyle(false, !hasPrevPage && page <= 1)}
        title="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {getPageNumbers().map((p, i) =>
        typeof p === 'string' ? (
          <span key={`ellipsis-${i}`} style={{ padding: '0 4px', color: '#94A3B8', fontSize: '0.8rem' }}>
            {p}
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            style={{
              ...btnStyle(p === page, false),
              ...(p !== page ? { ':hover': { background: '#F1F5F9' } } as any : {}),
            }}
            onMouseEnter={(e) => {
              if (p !== page) (e.target as HTMLElement).style.background = '#F1F5F9';
            }}
            onMouseLeave={(e) => {
              if (p !== page) (e.target as HTMLElement).style.background = 'transparent';
            }}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNextPage && page >= totalPages}
        style={btnStyle(false, !hasNextPage && page >= totalPages)}
        title="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};
