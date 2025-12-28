import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FloatingElementsProps {
  className?: string;
}

export const FloatingElements = ({ className }: FloatingElementsProps) => {
  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {/* Gradient orbs */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(262 83% 60% / 0.15), transparent 70%)',
          top: '-20%',
          left: '10%',
        }}
        animate={{
          y: [0, 30, 0],
          x: [0, 20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(239 84% 67% / 0.12), transparent 70%)',
          top: '30%',
          right: '-10%',
        }}
        animate={{
          y: [0, -40, 0],
          x: [0, -30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(187 92% 50% / 0.1), transparent 70%)',
          bottom: '10%',
          left: '20%',
        }}
        animate={{
          y: [0, -20, 0],
          x: [0, 15, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Floating geometric shapes */}
      <motion.div
        className="absolute w-20 h-20 border border-primary/20 rounded-xl"
        style={{ top: '15%', left: '5%' }}
        animate={{
          y: [0, -30, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      <motion.div
        className="absolute w-16 h-16 border border-primary-light/20 rounded-full"
        style={{ top: '60%', right: '15%' }}
        animate={{
          y: [0, 25, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute w-12 h-12 border border-info/20"
        style={{ 
          top: '40%', 
          left: '80%',
          transform: 'rotate(45deg)',
        }}
        animate={{
          y: [0, -20, 0],
          rotate: [45, 135, 45],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Glowing dots */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-primary/40"
          style={{
            top: `${20 + i * 15}%`,
            left: `${10 + i * 12}%`,
            boxShadow: '0 0 20px hsl(239 84% 67% / 0.5)',
          }}
          animate={{
            opacity: [0.4, 1, 0.4],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
};