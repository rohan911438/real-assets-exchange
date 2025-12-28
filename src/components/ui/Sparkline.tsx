import { cn } from '@/lib/utils';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  positive?: boolean;
  className?: string;
}

export const Sparkline = ({
  data,
  width = 80,
  height = 24,
  positive = true,
  className,
}: SparklineProps) => {
  if (!data.length) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const gradientId = `sparkline-gradient-${Math.random().toString(36).slice(2)}`;

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`}
      className={cn(
        positive ? 'sparkline-up' : 'sparkline-down',
        className
      )}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop 
            offset="0%" 
            stopColor={positive ? 'hsl(160 84% 45%)' : 'hsl(0 84% 60%)'} 
            stopOpacity="0.4" 
          />
          <stop 
            offset="100%" 
            stopColor={positive ? 'hsl(160 84% 45%)' : 'hsl(0 84% 60%)'} 
            stopOpacity="0" 
          />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#${gradientId})`}
      />
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-chart-grow"
        style={{ 
          strokeDasharray: 1000,
          strokeDashoffset: 0,
        }}
      />
    </svg>
  );
};