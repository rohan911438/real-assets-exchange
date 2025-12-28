import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';
import React from 'react';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
  hover?: boolean;
  glow?: boolean;
  className?: string;
}

export const GlassCard = ({
  children,
  hover = false,
  glow = false,
  className,
  ...props
}: GlassCardProps) => {
  return (
    <motion.div
      className={cn(
        'glass-card',
        hover && 'glass-card-hover cursor-pointer',
        glow && 'pulse-glow',
        className
      )}
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  );
};