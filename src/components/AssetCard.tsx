import { Link } from 'react-router-dom';
import { RWAAsset, formatCurrency, formatPercent } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Sparkles, Building2, Receipt, Landmark, Box, Gem, Shield, Brain, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssetCardProps {
  asset: RWAAsset;
}

const typeIcons = {
  'Real Estate': Building2,
  'Bond': Landmark,
  'Invoice': Receipt,
  'Commodity': Gem,
  'Equipment': Box,
};

const typeColors = {
  'Real Estate': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Bond': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Invoice': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Commodity': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Equipment': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

export const AssetCard = ({ asset }: AssetCardProps) => {
  const TypeIcon = typeIcons[asset.type];
  const isPositive = asset.priceChange24h >= 0;
  
  const getValuationBadge = () => {
    const diff = ((asset.aiPredictedPrice - asset.price) / asset.price) * 100;
    if (diff > 3) return { label: 'Undervalued', class: 'badge-success' };
    if (diff < -3) return { label: 'Overvalued', class: 'badge-danger' };
    return { label: 'Fair Value', class: 'bg-secondary text-muted-foreground border-border' };
  };
  
  const valuation = getValuationBadge();

  return (
    <div className="glass-card-hover group overflow-hidden">
      {/* Header with type badge */}
      <div className="p-4 pb-0 flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <Badge variant="outline" className={cn('gap-1', typeColors[asset.type])}>
            <TypeIcon className="h-3 w-3" />
            {asset.type}
          </Badge>
          <Badge className="text-xs bg-green-500/10 text-green-600 border-green-500/20 gap-1">
            <Shield className="h-3 w-3" />
            RWA Certified
          </Badge>
        </div>
        <div className="text-right">
          <div className={cn(
            'flex items-center gap-1 text-sm font-medium mb-1',
            isPositive ? 'text-success' : 'text-destructive'
          )}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {formatPercent(asset.priceChange24h)}
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Brain className="h-3 w-3 text-blue-500" />
            <span className="text-blue-600 font-medium">95% AI</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <div>
          <h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors">
            {asset.name}
          </h3>
          <p className="text-sm text-muted-foreground">{asset.symbol}</p>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-foreground">
              ${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-muted-foreground">Current Price</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-success">{asset.apy}%</p>
            <p className="text-sm text-muted-foreground">APY</p>
          </div>
        </div>

        {/* AI Indicator */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border/50">
          <Sparkles className="h-4 w-4 text-primary" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">AI Fair Value</p>
            <p className="text-sm font-medium text-foreground">
              ${asset.aiPredictedPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <Badge variant="outline" className={valuation.class}>
            {valuation.label}
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">TVL</p>
            <p className="font-medium text-foreground">{formatCurrency(asset.tvl)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">24h Volume</p>
            <p className="font-medium text-foreground">{formatCurrency(asset.volume24h)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button asChild variant="gradient" className="flex-1">
            <Link to={`/trade?asset=${asset.id}`}>
              Trade Now
            </Link>
          </Button>
          <Button variant="outline" size="icon" title="Legal Documents">
            <FileText className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
