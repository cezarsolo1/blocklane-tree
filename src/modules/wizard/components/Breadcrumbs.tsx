/**
 * Breadcrumbs Component
 * 
 * Shows navigation path through the decision tree.
 */

import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  path: string[];
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate: (path: string[]) => void;
  className?: string;
}

export const Breadcrumbs = ({ items, onNavigate, className }: BreadcrumbsProps) => {
  if (items.length <= 1) {
    return null;
  }

  return (
    <nav className={cn("flex items-center space-x-1 text-sm text-gray-500", className)}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index === 0 ? (
            <button
              onClick={() => onNavigate(item.path)}
              className="flex items-center gap-1 hover:text-gray-700 transition-colors"
            >
              <Home className="h-4 w-4" />
              {item.label}
            </button>
          ) : (
            <button
              onClick={() => onNavigate(item.path)}
              className="hover:text-gray-700 transition-colors"
            >
              {item.label}
            </button>
          )}
          
          {index < items.length - 1 && (
            <ChevronRight className="h-4 w-4 mx-1" />
          )}
        </div>
      ))}
    </nav>
  );
};
