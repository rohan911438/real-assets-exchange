import { useEffect, useRef, useState } from 'react';
import CountUp from 'react-countup';
import { cn } from '@/lib/utils';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
  preserveValue?: boolean;
}

export const AnimatedCounter = ({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 2,
  className,
  preserveValue = false,
}: AnimatedCounterProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} className={cn('font-mono tabular-nums', className)}>
      {isVisible ? (
        <CountUp
          start={0}
          end={value}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          duration={duration}
          separator=","
          preserveValue={preserveValue}
          useEasing
        />
      ) : (
        `${prefix}0${suffix}`
      )}
    </span>
  );
};