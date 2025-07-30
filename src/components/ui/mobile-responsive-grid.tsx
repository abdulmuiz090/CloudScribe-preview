
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MobileResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

export const MobileResponsiveGrid = ({ 
  children, 
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 }
}: MobileResponsiveGridProps) => {
  const gridCols = `grid-cols-${cols.mobile} sm:grid-cols-${cols.tablet} lg:grid-cols-${cols.desktop}`;
  
  return (
    <div className={cn(
      'grid gap-4 sm:gap-6 lg:gap-8',
      gridCols,
      className
    )}>
      {children}
    </div>
  );
};
