import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ExternalLink
} from 'lucide-react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  onDismiss: (id: string) => void;
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: AlertTriangle,
  loading: AlertTriangle
};

const toastColors = {
  success: 'border-green-500/20 bg-green-500/10 text-green-600',
  error: 'border-red-500/20 bg-red-500/10 text-red-600',
  warning: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-600',
  info: 'border-blue-500/20 bg-blue-500/10 text-blue-600',
  loading: 'border-blue-500/20 bg-blue-500/10 text-blue-600'
};

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  description,
  action,
  duration = 5000,
  onDismiss
}) => {
  const [progress, setProgress] = useState(100);
  const Icon = toastIcons[type];

  useEffect(() => {
    if (duration === 0) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100));
        if (newProgress <= 0) {
          onDismiss(id);
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration, id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      className={`
        relative w-full max-w-sm rounded-lg border p-4 shadow-lg backdrop-blur-sm
        ${toastColors[type]}
      `}
    >
      {duration > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-black/10 rounded-t-lg overflow-hidden">
          <motion.div
            className="h-full bg-current opacity-50"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      )}

      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
        
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{title}</div>
          {description && (
            <div className="text-xs text-muted-foreground mt-1">
              {description}
            </div>
          )}
          
          {action && (
            <div className="mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={action.onClick}
                className="h-7 text-xs"
              >
                {action.label}
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          )}
        </div>

        <button
          onClick={() => onDismiss(id)}
          className="text-current/60 hover:text-current transition-colors"
        >
          <XCircle className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};

export interface ToastContextType {
  addToast: (toast: Omit<ToastProps, 'id' | 'onDismiss'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (toast: Omit<ToastProps, 'id' | 'onDismiss'>): string => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastProps = {
      ...toast,
      id,
      onDismiss: removeToast
    };
    setToasts(prev => [...prev, newToast]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAll = () => {
    setToasts([]);
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast, clearAll }}>
      {children}
      
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <Toast key={toast.id} {...toast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const useSuccessToast = () => {
  const { addToast } = useToast();
  return (title: string, description?: string, action?: ToastProps['action']) =>
    addToast({ type: 'success', title, description, action });
};

export const useErrorToast = () => {
  const { addToast } = useToast();
  return (title: string, description?: string, action?: ToastProps['action']) =>
    addToast({ type: 'error', title, description, action });
};

export const useTxToast = () => {
  const { addToast } = useToast();
  const [copied, setCopied] = useState('');

  const copyHash = async (hash: string) => {
    await navigator.clipboard.writeText(hash);
    setCopied(hash);
    setTimeout(() => setCopied(''), 2000);
  };

  return {
    pending: (hash: string) => addToast({
      type: 'loading',
      title: 'Transaction Pending',
      description: `Hash: ${hash.slice(0, 10)}...`,
      action: {
        label: copied === hash ? 'Copied!' : 'Copy Hash',
        onClick: () => copyHash(hash)
      },
      duration: 0
    }),
    
    success: (hash: string, amount?: string, token?: string) => addToast({
      type: 'success', 
      title: 'Transaction Confirmed',
      description: amount && token ? `${amount} ${token} transferred successfully` : undefined,
      action: {
        label: 'View Details',
        onClick: () => window.open(`https://explorer.sepolia.mantle.xyz/tx/${hash}`, '_blank')
      }
    }),
    
    error: (message: string) => addToast({
      type: 'error',
      title: 'Transaction Failed', 
      description: message
    })
  };
};
