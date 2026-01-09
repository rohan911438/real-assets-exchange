import React from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/contexts/WalletContext';
import { StatusDashboard } from '@/components/ui/StatusIndicator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Shield, 
  Brain, 
  Activity,
  Settings,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

interface DemoConfigProps {
  onToggleDemo: () => void;
  demoMode: boolean;
}

export const DemoModeConfig: React.FC<DemoConfigProps> = ({ onToggleDemo, demoMode }) => {
  const { 
    networkStatus, 
    complianceStatus, 
    isConnected 
  } = useWallet();

  if (!isConnected && !demoMode) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="glass-card p-4 space-y-4">
        {/* Demo Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="text-sm font-medium">Demo Configuration</span>
            {demoMode && (
              <Badge variant="secondary" className="text-xs">
                Judge Mode Active
              </Badge>
            )}
          </div>
          
          <Button
            variant={demoMode ? "default" : "outline"}
            size="sm"
            onClick={onToggleDemo}
            className="gap-2"
          >
            {demoMode ? (
              <>
                <Activity className="h-4 w-4" />
                Demo Mode
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Enable Demo
              </>
            )}
          </Button>
        </div>

        {/* Demo Features */}
        {demoMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3 border-t border-border/50 pt-3"
          >
            <div className="text-xs text-muted-foreground">
              Demo mode optimizations:
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1 text-green-600">
                <Shield className="h-3 w-3" />
                <span>Auto KYC Verified</span>
              </div>
              <div className="flex items-center gap-1 text-blue-600">
                <Brain className="h-3 w-3" />
                <span>High AI Confidence</span>
              </div>
              <div className="flex items-center gap-1 text-purple-600">
                <Zap className="h-3 w-3" />
                <span>Fast Animations</span>
              </div>
              <div className="flex items-center gap-1 text-orange-600">
                <Activity className="h-3 w-3" />
                <span>Mock Data</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs">
              <HelpCircle className="h-3 w-3" />
              <span>Perfect for judge demonstrations - no network required</span>
            </div>
          </motion.div>
        )}

        {/* Status Dashboard */}
        <div className="grid grid-cols-2 gap-2">
          <StatusDashboard
            networkStatus={demoMode ? 'excellent' : networkStatus}
            complianceStatus={demoMode ? 'excellent' : complianceStatus}
            oracleStatus={demoMode ? 'excellent' : 'good'}
            aiStatus={demoMode ? 'excellent' : 'good'}
            aiConfidence={demoMode ? 95 : 78}
            oracleLastUpdate={demoMode ? '2s ago' : '1m ago'}
            className="text-xs"
          />
        </div>
        
        {/* Quick Actions */}
        {demoMode && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs gap-1">
              <ExternalLink className="h-3 w-3" />
              Judge Guide
            </Button>
            <Button variant="outline" size="sm" className="text-xs gap-1">
              <Activity className="h-3 w-3" />
              Auto Demo
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Global demo configuration
export const DEMO_CONFIG = {
  // Performance optimizations
  animationSpeed: 150, // Fast animations for judges
  autoProgress: true,
  highlightFeatures: true,
  
  // Content optimizations  
  mockData: {
    assets: [
      {
        name: 'Premium NYC Real Estate',
        symbol: 'NYC-RE',
        price: '$125.50',
        apy: '12.5%',
        change24h: 8.2,
        liquidity: '$2.4M',
        verified: true,
        type: 'Real Estate'
      },
      {
        name: 'US Treasury Bond',
        symbol: 'USTB',
        price: '$98.75',
        apy: '8.2%', 
        change24h: 0.5,
        liquidity: '$15.8M',
        verified: true,
        type: 'Government Bonds'
      },
      {
        name: 'Gold Commodity Token',
        symbol: 'GOLD',
        price: '$1,850.00',
        apy: '6.8%',
        change24h: -2.1,
        liquidity: '$8.9M',
        verified: true,
        type: 'Commodities'
      }
    ],
    portfolio: {
      totalValue: '$12,450.00',
      totalGain: '+$1,890.50',
      totalGainPercent: 18.2,
      yieldEarned: '$245.80'
    },
    aiPredictions: {
      confidence: 95,
      priceTarget: '$135.20',
      timeframe: '7 days',
      risk: 'Low'
    }
  },
  
  // Judge-specific settings
  explainMode: true,
  successBias: true, // Show profitable scenarios
  realTimeUpdates: false, // Stable demo data
  failSafes: true // Never show empty/error states
};
