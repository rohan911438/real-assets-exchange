import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

interface EnhancedSkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'avatar' | 'button' | 'metric';
  lines?: number;
  animated?: boolean;
}

export const EnhancedSkeleton: React.FC<EnhancedSkeletonProps> = ({
  className,
  variant = 'text',
  lines = 1,
  animated = true
}) => {
  const baseClasses = 'bg-gradient-to-r from-muted/20 via-muted/40 to-muted/20 rounded-md';
  const animationClasses = animated ? 'animate-pulse' : '';

  const variants = {
    text: 'h-4 w-full',
    card: 'h-32 w-full',
    avatar: 'h-10 w-10 rounded-full',
    button: 'h-10 w-24',
    metric: 'h-8 w-20',
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              baseClasses,
              animationClasses,
              variants.text,
              i === lines - 1 ? 'w-3/4' : 'w-full',
              className
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        baseClasses,
        animationClasses,
        variants[variant],
        className
      )}
    />
  );
};

// Asset Card Skeleton
export const AssetCardSkeleton: React.FC = () => (
  <div className="glass-card p-6 space-y-4">
    <div className="flex items-center gap-3">
      <EnhancedSkeleton variant="avatar" />
      <div className="flex-1 space-y-2">
        <EnhancedSkeleton className="h-5 w-32" />
        <EnhancedSkeleton className="h-3 w-20" />
      </div>
      <EnhancedSkeleton variant="metric" />
    </div>
    
    <div className="space-y-2">
      <EnhancedSkeleton lines={2} />
    </div>
    
    <div className="flex justify-between items-center pt-2 border-t border-border/50">
      <EnhancedSkeleton className="h-6 w-16" />
      <EnhancedSkeleton variant="button" />
    </div>
  </div>
);

// Portfolio Loading Skeleton
export const PortfolioSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Stats Grid */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass-card p-4 space-y-2">
          <EnhancedSkeleton className="h-4 w-24" />
          <EnhancedSkeleton className="h-8 w-20" />
          <EnhancedSkeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
    
    {/* Asset List */}
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <AssetCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// Trading Interface Skeleton
export const TradingSkeleton: React.FC = () => (
  <div className="grid md:grid-cols-2 gap-6">
    <div className="glass-card p-6 space-y-4">
      <EnhancedSkeleton className="h-6 w-32" />
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <EnhancedSkeleton className="h-4 w-20" />
          <EnhancedSkeleton className="h-4 w-24" />
        </div>
        <EnhancedSkeleton className="h-12 w-full" />
        <EnhancedSkeleton className="h-4 w-full" />
      </div>
      <EnhancedSkeleton className="h-10 w-full" />
    </div>
    
    <div className="glass-card p-6 space-y-4">
      <EnhancedSkeleton className="h-6 w-40" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <EnhancedSkeleton className="h-4 w-24" />
            <EnhancedSkeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export { Skeleton };
