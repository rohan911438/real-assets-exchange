import { cn } from '@/lib/utils';

interface ShimmerLoaderProps {
  className?: string;
  lines?: number;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export const ShimmerLoader = ({ 
  className,
  lines = 1,
  rounded = 'md',
}: ShimmerLoaderProps) => {
  const roundedClass = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  }[rounded];

  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'shimmer h-4',
            roundedClass,
            i === lines - 1 && lines > 1 && 'w-3/4'
          )}
        />
      ))}
    </div>
  );
};

export const CardShimmer = ({ className }: { className?: string }) => (
  <div className={cn('glass-card p-6 space-y-4', className)}>
    <div className="flex items-center justify-between">
      <ShimmerLoader className="w-24" />
      <div className="shimmer h-10 w-10 rounded-full" />
    </div>
    <ShimmerLoader className="w-32 h-8" />
    <ShimmerLoader className="w-20" />
  </div>
);

export const TableRowShimmer = ({ cols = 5 }: { cols?: number }) => (
  <div className="flex items-center gap-4 p-4 border-b border-border/30">
    {Array.from({ length: cols }).map((_, i) => (
      <div key={i} className="flex-1">
        <ShimmerLoader className={i === 0 ? 'w-32' : 'w-20'} />
      </div>
    ))}
  </div>
);