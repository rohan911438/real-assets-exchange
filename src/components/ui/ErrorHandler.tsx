import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  RefreshCw, 
  Wifi, 
  Clock, 
  ShieldAlert, 
  CreditCard,
  XCircle,
  Info,
  CheckCircle,
  Zap
} from 'lucide-react';

export interface RWAError {
  code: string;
  message: string;
  details?: string;
  action?: 'retry' | 'reconnect' | 'switch_network' | 'refresh' | 'contact_support';
}

interface ErrorHandlerProps {
  error: RWAError | Error | string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  variant?: 'toast' | 'inline' | 'modal';
}

// Human-readable error mappings
const ERROR_MAPPINGS: Record<string, Partial<RWAError>> = {
  // Network errors
  'NETWORK_ERROR': {
    message: 'Network connection issue',
    details: 'Please check your internet connection and try again.',
    action: 'retry'
  },
  'RPC_ERROR': {
    message: 'Blockchain connection failed',
    details: 'Unable to connect to Mantle network. This might be temporary.',
    action: 'retry'
  },
  'WRONG_NETWORK': {
    message: 'Wrong network detected',
    details: 'Please switch to Mantle Sepolia network in your wallet.',
    action: 'switch_network'
  },
  
  // Wallet errors
  'USER_REJECTED': {
    message: 'Transaction cancelled',
    details: 'You cancelled the transaction in your wallet.',
    action: 'retry'
  },
  'INSUFFICIENT_FUNDS': {
    message: 'Insufficient funds',
    details: 'You don\'t have enough tokens or gas to complete this transaction.',
    action: 'refresh'
  },
  'WALLET_NOT_CONNECTED': {
    message: 'Wallet not connected',
    details: 'Please connect your MetaMask wallet to continue.',
    action: 'reconnect'
  },
  
  // Contract errors
  'COMPLIANCE_REQUIRED': {
    message: 'KYC verification required',
    details: 'Complete identity verification to access this feature.',
    action: 'contact_support'
  },
  'SLIPPAGE_EXCEEDED': {
    message: 'Price moved too much',
    details: 'The price changed while processing. Try increasing slippage tolerance.',
    action: 'retry'
  },
  'INSUFFICIENT_LIQUIDITY': {
    message: 'Not enough liquidity',
    details: 'There isn\'t enough liquidity for this trade size. Try a smaller amount.',
    action: 'retry'
  },
  
  // API errors
  'RATE_LIMITED': {
    message: 'Too many requests',
    details: 'Please wait a moment before trying again.',
    action: 'retry'
  },
  'SERVER_ERROR': {
    message: 'Service temporarily unavailable',
    details: 'Our servers are experiencing issues. Please try again in a few minutes.',
    action: 'retry'
  },
  'AI_ANALYSIS_FAILED': {
    message: 'AI analysis unavailable',
    details: 'Price prediction service is temporarily down. You can still trade manually.',
    action: 'refresh'
  }
};

// Convert raw errors to user-friendly format
export const normalizeError = (error: any): RWAError => {
  if (typeof error === 'string') {
    return { code: 'UNKNOWN', message: error };
  }
  
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Check for known error patterns
    if (message.includes('user rejected') || message.includes('user denied')) {
      return { ...ERROR_MAPPINGS.USER_REJECTED, code: 'USER_REJECTED' } as RWAError;
    }
    
    if (message.includes('insufficient funds') || message.includes('insufficient balance')) {
      return { ...ERROR_MAPPINGS.INSUFFICIENT_FUNDS, code: 'INSUFFICIENT_FUNDS' } as RWAError;
    }
    
    if (message.includes('network') || message.includes('rpc')) {
      return { ...ERROR_MAPPINGS.RPC_ERROR, code: 'RPC_ERROR' } as RWAError;
    }
    
    if (message.includes('slippage')) {
      return { ...ERROR_MAPPINGS.SLIPPAGE_EXCEEDED, code: 'SLIPPAGE_EXCEEDED' } as RWAError;
    }
    
    // Fallback
    return {
      code: 'UNKNOWN',
      message: 'Something went wrong',
      details: 'Please try again or contact support if the problem persists.'
    };
  }
  
  // Already normalized error
  if ('code' in error) {
    return error as RWAError;
  }
  
  return { code: 'UNKNOWN', message: 'An unexpected error occurred' };
};

const getErrorIcon = (code: string) => {
  switch (code) {
    case 'NETWORK_ERROR':
    case 'RPC_ERROR':
      return Wifi;
    case 'WRONG_NETWORK':
      return Zap;
    case 'USER_REJECTED':
      return XCircle;
    case 'INSUFFICIENT_FUNDS':
      return CreditCard;
    case 'WALLET_NOT_CONNECTED':
      return CreditCard;
    case 'COMPLIANCE_REQUIRED':
      return ShieldAlert;
    case 'RATE_LIMITED':
      return Clock;
    case 'SERVER_ERROR':
    case 'AI_ANALYSIS_FAILED':
      return AlertTriangle;
    default:
      return AlertTriangle;
  }
};

const getErrorVariant = (code: string) => {
  switch (code) {
    case 'USER_REJECTED':
      return 'default';
    case 'COMPLIANCE_REQUIRED':
      return 'destructive';
    case 'WRONG_NETWORK':
    case 'WALLET_NOT_CONNECTED':
      return 'destructive';
    case 'INSUFFICIENT_FUNDS':
      return 'destructive';
    case 'RATE_LIMITED':
      return 'default';
    default:
      return 'destructive';
  }
};

export const ErrorHandler: React.FC<ErrorHandlerProps> = ({
  error,
  onRetry,
  onDismiss,
  className,
  variant = 'inline'
}) => {
  const normalizedError = normalizeError(error);
  const Icon = getErrorIcon(normalizedError.code);
  const alertVariant = getErrorVariant(normalizedError.code);

  const ActionButton = () => {
    if (!normalizedError.action || !onRetry) return null;
    
    const actions = {
      retry: { label: 'Try Again', icon: RefreshCw },
      reconnect: { label: 'Connect Wallet', icon: CreditCard },
      switch_network: { label: 'Switch Network', icon: Zap },
      refresh: { label: 'Refresh', icon: RefreshCw },
      contact_support: { label: 'Get Help', icon: Info }
    };
    
    const action = actions[normalizedError.action];
    
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="gap-2"
      >
        <action.icon className="h-4 w-4" />
        {action.label}
      </Button>
    );
  };

  if (variant === 'toast') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        className="fixed bottom-4 right-4 max-w-md z-50"
      >
        <Alert variant={alertVariant} className="shadow-lg border-2">
          <Icon className="h-4 w-4" />
          <AlertTitle className="flex items-center justify-between">
            {normalizedError.message}
            {onDismiss && (
              <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground">
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </AlertTitle>
          {normalizedError.details && (
            <AlertDescription className="mt-2">
              {normalizedError.details}
            </AlertDescription>
          )}
          {normalizedError.action && (
            <div className="mt-3">
              <ActionButton />
            </div>
          )}
        </Alert>
      </motion.div>
    );
  }

  return (
    <Alert variant={alertVariant} className={className}>
      <Icon className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        {normalizedError.message}
        {onDismiss && (
          <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground">
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </AlertTitle>
      {normalizedError.details && (
        <AlertDescription className="mt-2">
          {normalizedError.details}
        </AlertDescription>
      )}
      {normalizedError.action && (
        <div className="mt-3 flex gap-2">
          <ActionButton />
        </div>
      )}
    </Alert>
  );
};

// Success message component
export const SuccessMessage: React.FC<{
  message: string;
  details?: string;
  onDismiss?: () => void;
  action?: { label: string; onClick: () => void };
  className?: string;
}> = ({ message, details, onDismiss, action, className }) => (
  <Alert className={className}>
    <CheckCircle className="h-4 w-4" />
    <AlertTitle className="flex items-center justify-between text-green-700">
      {message}
      {onDismiss && (
        <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground">
          <XCircle className="h-4 w-4" />
        </button>
      )}
    </AlertTitle>
    {details && (
      <AlertDescription className="mt-2 text-green-600">
        {details}
      </AlertDescription>
    )}
    {action && (
      <div className="mt-3">
        <Button variant="outline" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      </div>
    )}
  </Alert>
);

// Hook for error handling
export const useErrorHandler = () => {
  const [error, setError] = React.useState<RWAError | null>(null);

  const showError = React.useCallback((err: any) => {
    setError(normalizeError(err));
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  const ErrorComponent = React.useCallback(
    ({ onRetry }: { onRetry?: () => void }) => {
      if (!error) return null;
      
      return (
        <ErrorHandler
          error={error}
          onRetry={onRetry}
          onDismiss={clearError}
        />
      );
    },
    [error, clearError]
  );

  return { error, showError, clearError, ErrorComponent };
};