import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Shield, 
  Activity, 
  Brain, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  WifiOff 
} from 'lucide-react';

interface StatusIndicatorProps {
  type: 'network' | 'compliance' | 'oracle' | 'ai' | 'connection';
  status: 'excellent' | 'good' | 'warning' | 'error' | 'loading';
  value?: string;
  confidence?: number;
  lastUpdate?: string;
  className?: string;
}

const statusConfig = {
  network: {
    excellent: { icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    good: { icon: Zap, color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/20' },
    warning: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    error: { icon: WifiOff, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' },
    loading: { icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
  },
  compliance: {
    excellent: { icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    good: { icon: Shield, color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/20' },
    warning: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    error: { icon: Shield, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' },
    loading: { icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
  },
  oracle: {
    excellent: { icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    good: { icon: Clock, color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/20' },
    warning: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    error: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' },
    loading: { icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
  },
  ai: {
    excellent: { icon: Brain, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    good: { icon: Brain, color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/20' },
    warning: { icon: Brain, color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    error: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' },
    loading: { icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
  },
  connection: {
    excellent: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    good: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/20' },
    warning: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    error: { icon: WifiOff, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' },
    loading: { icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
  },
};

const statusLabels = {
  network: {
    excellent: 'Mantle Sepolia • Optimal',
    good: 'Mantle Sepolia • Connected',
    warning: 'Mantle Sepolia • Slow',
    error: 'Wrong Network',
    loading: 'Connecting to Network...',
  },
  compliance: {
    excellent: 'KYC Level 3 Verified',
    good: 'KYC Level 2 Verified',
    warning: 'KYC Pending Review',
    error: 'KYC Required',
    loading: 'Verifying Compliance...',
  },
  oracle: {
    excellent: 'Price Data Fresh',
    good: 'Price Data Recent',
    warning: 'Price Data Stale',
    error: 'Price Data Unavailable',
    loading: 'Loading Price Data...',
  },
  ai: {
    excellent: 'AI Analysis Ready',
    good: 'AI Analysis Available',
    warning: 'AI Confidence Low',
    error: 'AI Analysis Failed',
    loading: 'Processing AI Analysis...',
  },
  connection: {
    excellent: 'All Systems Optimal',
    good: 'Connected',
    warning: 'Connection Issues',
    error: 'Disconnected',
    loading: 'Connecting...',
  },
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  type,
  status,
  value,
  confidence,
  lastUpdate,
  className
}) => {
  const config = statusConfig[type][status];
  const Icon = config.icon;
  const label = statusLabels[type][status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm',
        config.bg,
        className
      )}
    >
      <div className="relative">
        <Icon 
          className={cn('h-4 w-4', config.color)} 
          {...(status === 'loading' && { className: cn('h-4 w-4 animate-spin', config.color) })}
        />
        {status === 'excellent' && (
          <div className={cn('absolute inset-0 h-4 w-4 animate-ping rounded-full opacity-20', config.color.replace('text-', 'bg-'))} />
        )}
      </div>
      
      <div className="flex-1">
        <div className="font-medium">{label}</div>
        
        {/* Additional info */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {value && <span>{value}</span>}
          {confidence !== undefined && (
            <span className={cn(
              'font-medium',
              confidence >= 90 ? 'text-emerald-500' : 
              confidence >= 70 ? 'text-green-500' :
              confidence >= 50 ? 'text-yellow-500' : 'text-red-500'
            )}>
              {confidence}% confidence
            </span>
          )}
          {lastUpdate && <span>Updated {lastUpdate}</span>}
        </div>
      </div>
    </motion.div>
  );
};

// Composite status dashboard
export const StatusDashboard: React.FC<{
  networkStatus: 'excellent' | 'good' | 'warning' | 'error' | 'loading';
  complianceStatus: 'excellent' | 'good' | 'warning' | 'error' | 'loading';
  oracleStatus: 'excellent' | 'good' | 'warning' | 'error' | 'loading';
  aiStatus: 'excellent' | 'good' | 'warning' | 'error' | 'loading';
  aiConfidence?: number;
  oracleLastUpdate?: string;
  className?: string;
}> = ({
  networkStatus,
  complianceStatus, 
  oracleStatus,
  aiStatus,
  aiConfidence,
  oracleLastUpdate,
  className
}) => {
  return (
    <div className={cn('grid gap-2', className)}>
      <StatusIndicator type="network" status={networkStatus} />
      <StatusIndicator type="compliance" status={complianceStatus} />
      <StatusIndicator 
        type="oracle" 
        status={oracleStatus} 
        lastUpdate={oracleLastUpdate}
      />
      <StatusIndicator 
        type="ai" 
        status={aiStatus} 
        confidence={aiConfidence}
      />
    </div>
  );
};

// Simplified header status bar
export const HeaderStatusBar: React.FC<{
  networkStatus: 'excellent' | 'good' | 'warning' | 'error' | 'loading';
  complianceStatus: 'excellent' | 'good' | 'warning' | 'error' | 'loading';
  className?: string;
}> = ({ networkStatus, complianceStatus, className }) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <StatusIndicator 
        type="network" 
        status={networkStatus}
        className="px-2 py-1 text-xs"
      />
      <StatusIndicator 
        type="compliance" 
        status={complianceStatus}
        className="px-2 py-1 text-xs"
      />
    </div>
  );
};