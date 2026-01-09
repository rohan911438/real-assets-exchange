import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Coins, 
  TrendingUp, 
  Users, 
  Search,
  Plus,
  ArrowRight,
  Sparkles,
  Shield,
  ChartBar,
  Wallet,
  CreditCard
} from 'lucide-react';

interface EmptyStateProps {
  type: 'assets' | 'liquidity' | 'positions' | 'portfolio' | 'trades' | 'lending';
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'secondary' | 'outline';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const emptyStateConfig = {
  assets: {
    icon: Building2,
    defaultTitle: 'No Real-World Assets Found',
    defaultDescription: 'Discover tokenized real estate, bonds, and commodities. Start building your portfolio with verified, high-yield assets.',
    suggestions: [
      '🏠 Real Estate tokens starting at $100',
      '💰 Government bonds with 8.2% APY',
      '🏭 Commodity tokens with instant liquidity'
    ],
    demoAssets: [
      { name: 'NYC Real Estate', apy: '12.5%', price: '$125.50', type: 'Real Estate' },
      { name: 'US Treasury Bond', apy: '8.2%', price: '$98.75', type: 'Bonds' },
      { name: 'Gold Commodity', apy: '6.8%', price: '$1,850.00', type: 'Commodities' }
    ]
  },
  liquidity: {
    icon: Coins,
    defaultTitle: 'No Liquidity Positions',
    defaultDescription: 'Earn rewards by providing liquidity to RWA trading pairs. Start earning fees on every trade.',
    suggestions: [
      '💎 Earn 0.3% fees on all trades',
      '🎯 Low impermanent loss with stable RWAs',
      '🏆 Additional yield farming rewards'
    ]
  },
  positions: {
    icon: TrendingUp,
    defaultTitle: 'No Trading Positions',
    defaultDescription: 'Start trading tokenized real-world assets with professional tools and AI-powered insights.',
    suggestions: [
      '📊 AI-powered price predictions',
      '⚡ Instant settlement on Mantle',
      '🛡️ Regulatory compliance built-in'
    ]
  },
  portfolio: {
    icon: Wallet,
    defaultTitle: 'Portfolio Empty',
    defaultDescription: 'Build your diversified portfolio with real-world assets. Start with verified, income-generating tokens.',
    suggestions: [
      '🎯 Start with $100 minimum investment',
      '📈 Track performance in real-time',
      '💰 Earn passive income from holdings'
    ]
  },
  trades: {
    icon: ChartBar,
    defaultTitle: 'No Trading History',
    defaultDescription: 'Your trades and transactions will appear here. Make your first trade to get started.',
    suggestions: [
      '⚡ Low fees on Mantle network',
      '🔒 Secure and compliant trading',
      '📱 Professional trading interface'
    ]
  },
  lending: {
    icon: CreditCard,
    defaultTitle: 'No Lending Positions',
    defaultDescription: 'Use your RWA tokens as collateral to unlock liquidity without selling your assets.',
    suggestions: [
      '💸 Borrow up to 75% of asset value',
      '📉 Competitive interest rates',
      '🔄 Flexible repayment terms'
    ]
  }
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  action,
  secondaryAction,
  className
}) => {
  const config = emptyStateConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center p-12 text-center ${className}`}
    >
      {/* Icon with glow effect */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="relative mb-6"
      >
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
          <Icon className="h-8 w-8 text-primary" />
        </div>
      </motion.div>

      {/* Title & Description */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-6 max-w-md"
      >
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {title || config.defaultTitle}
        </h3>
        <p className="text-muted-foreground">
          {description || config.defaultDescription}
        </p>
      </motion.div>

      {/* Suggestions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-8 space-y-2"
      >
        {config.suggestions.map((suggestion, index) => (
          <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            {suggestion}
          </div>
        ))}
      </motion.div>

      {/* Demo Assets for asset type */}
      {type === 'assets' && config.demoAssets && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-6 w-full max-w-md"
        >
          <div className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Popular Assets
          </div>
          <div className="space-y-2">
            {config.demoAssets.map((asset, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{asset.name}</div>
                    <Badge variant="secondary" className="text-xs">
                      {asset.type}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{asset.price}</div>
                  <div className="text-xs text-green-500">{asset.apy} APY</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant || 'default'}
            className="gap-2 min-w-[140px]"
          >
            <Plus className="h-4 w-4" />
            {action.label}
          </Button>
        )}
        
        {secondaryAction && (
          <Button
            onClick={secondaryAction.onClick}
            variant="outline"
            className="gap-2 min-w-[140px]"
          >
            <Search className="h-4 w-4" />
            {secondaryAction.label}
          </Button>
        )}
      </motion.div>

      {/* Help text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-6 text-xs text-muted-foreground"
      >
        Need help? Check our{' '}
        <button className="text-primary hover:underline">
          getting started guide
        </button>
      </motion.div>
    </motion.div>
  );
};

// Specialized empty state for wallet connection
export const WalletEmptyState: React.FC<{ onConnect: () => void }> = ({ onConnect }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center p-12 text-center"
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
      className="relative mb-6"
    >
      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
        <Wallet className="h-8 w-8 text-primary" />
      </div>
    </motion.div>

    <h3 className="text-xl font-semibold text-foreground mb-2">
      Connect Your Wallet
    </h3>
    <p className="text-muted-foreground mb-6 max-w-md">
      Connect MetaMask to access real-world asset trading, lending, and yield farming on Mantle Network.
    </p>

    <div className="mb-6 space-y-2">
      {[
        '🔒 Secure wallet integration',
        '⚡ Low fees on Mantle network',
        '🛡️ Regulatory compliance included'
      ].map((feature, index) => (
        <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          {feature}
        </div>
      ))}
    </div>

    <Button onClick={onConnect} className="gap-2">
      <Wallet className="h-4 w-4" />
      Connect Wallet
      <ArrowRight className="h-4 w-4" />
    </Button>
  </motion.div>
);