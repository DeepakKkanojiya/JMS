import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight size={12} className="breadcrumb-separator" />
            )}
            {isLast || !item.path ? (
              <span className="breadcrumb-current">{item.label}</span>
            ) : (
              <Link to={item.path}>{item.label}</Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
