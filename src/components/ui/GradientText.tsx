import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GradientTextProps {
  children: ReactNode;
  variant?: 'primary' | 'accent' | 'success' | 'warning';
  className?: string;
  animate?: boolean;
}

export const GradientText = ({
  children,
  variant = 'primary',
  className,
  animate = false,
}: GradientTextProps) => {
  const gradientClasses = {
    primary: 'bg-gradient-to-r from-primary to-primary-light',
    accent: 'bg-gradient-to-r from-info to-primary',
    success: 'bg-gradient-to-r from-success to-info',
    warning: 'bg-gradient-to-r from-warning to-destructive',
  };

  return (
    <span
      className={cn(
        'bg-clip-text text-transparent',
        gradientClasses[variant],
        animate && 'animate-gradient-shift bg-[length:200%_200%]',
        className
      )}
    >
      {children}
    </span>
  );
};