import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 2000,
  decimals = 0,
  prefix = '',
  suffix = '',
  className
}) => {
  const [current, setCurrent] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const start = 0;
    const end = value;
    const increment = (end - start) / (duration / 16); // 60 FPS
    
    let currentValue = start;
    const timer = setInterval(() => {
      currentValue += increment;
      
      if (currentValue >= end) {
        setCurrent(end);
        clearInterval(timer);
      } else {
        setCurrent(currentValue);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration, isVisible]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const displayValue = current.toFixed(decimals);

  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('font-mono', className)}
    >
      {prefix}{displayValue}{suffix}
    </motion.span>
  );
};

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export const MiniSparkline: React.FC<SparklineProps> = ({
  data,
  width = 60,
  height = 20,
  color = 'currentColor',
  strokeWidth = 1.5,
  className
}) => {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <motion.svg
      width={width}
      height={height}
      className={className}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1, ease: 'easeInOut' }}
    >
      <motion.polyline
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />
    </motion.svg>
  );
};

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  className?: string;
  showPercentage?: boolean;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 40,
  strokeWidth = 4,
  color = '#3b82f6',
  backgroundColor = '#e5e7eb',
  className,
  showPercentage = false
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn('relative', className)}>
      <motion.svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          strokeLinecap="round"
        />
      </motion.svg>
      
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatedCounter
            value={progress}
            duration={1000}
            suffix="%"
            className="text-xs font-medium"
          />
        </div>
      )}
    </div>
  );
};

interface PerformanceIndicatorProps {
  value: number;
  baseline?: number;
  label?: string;
  className?: string;
}

export const PerformanceIndicator: React.FC<PerformanceIndicatorProps> = ({
  value,
  baseline = 0,
  label,
  className
}) => {
  const change = value - baseline;
  const percentChange = baseline !== 0 ? (change / baseline) * 100 : 0;
  const isPositive = change >= 0;
  
  const intensity = Math.min(Math.abs(percentChange) / 10, 1); // Cap at 10% for max intensity
  
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium',
        isPositive 
          ? `bg-green-500/10 text-green-600 border border-green-500/20` 
          : `bg-red-500/10 text-red-600 border border-red-500/20`,
        className
      )}
      style={{
        backgroundColor: isPositive 
          ? `rgba(34, 197, 94, ${0.1 + intensity * 0.1})` 
          : `rgba(239, 68, 68, ${0.1 + intensity * 0.1})`
      }}
    >
      <motion.div
        animate={{ y: isPositive ? [0, -2, 0] : [0, 2, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className={cn(
          'text-xs',
          isPositive ? 'text-green-500' : 'text-red-500'
        )}
      >
        {isPositive ? '↗' : '↘'}
      </motion.div>
      
      <div>
        <AnimatedCounter 
          value={Math.abs(percentChange)} 
          decimals={1} 
          suffix="%" 
        />
        {label && <span className="text-xs text-muted-foreground ml-1">{label}</span>}
      </div>
    </motion.div>
  );
};