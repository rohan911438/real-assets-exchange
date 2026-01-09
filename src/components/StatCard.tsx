import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { AnimatedCounter } from './ui/AnimatedCounter';
import { Sparkline } from './ui/Sparkline';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: LucideIcon;
  sparklineData?: number[];
  className?: string;
  delay?: number;
}

export const StatCard = ({
  title,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  change,
  changeType = 'neutral',
  icon: Icon,
  sparklineData,
  className,
  delay = 0,
}: StatCardProps) => {
  const isPositive = changeType === 'positive';
  const isNegative = changeType === 'negative';
  
  // Handle both number and string values
  const isNumeric = typeof value === 'number';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1, ease: 'easeOut' }}
      className={cn('stat-card group', className)}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold text-foreground font-display tracking-tight">
            {isNumeric ? (
              <AnimatedCounter 
                value={value as number} 
                prefix={prefix} 
                suffix={suffix}
                decimals={decimals}
                duration={2.5}
              />
            ) : (
              <span>{value}</span>
            )}
          </p>
          {change && (
            <div className="flex items-center gap-2">
              <p
                className={cn(
                  'text-sm font-medium flex items-center gap-1',
                  isPositive && 'text-success',
                  isNegative && 'text-destructive',
                  !isPositive && !isNegative && 'text-muted-foreground'
                )}
              >
                {change}
              </p>
              {sparklineData && sparklineData.length > 0 && (
                <Sparkline 
                  data={sparklineData} 
                  positive={isPositive || changeType === 'neutral'}
                  width={60}
                  height={20}
                />
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-300">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
      </div>
      
      {/* Decorative gradient line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
};