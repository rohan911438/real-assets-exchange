import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockAssets, formatCurrency, formatPercent } from '@/data/mockData';
import { useWallet } from '@/contexts/WalletContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  AlertTriangle,
  Info,
  ArrowDownUp,
  Wallet,
  Shield,
  Clock,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Generate mock price data
const generatePriceData = (basePrice: number, days: number) => {
  const data = [];
  let price = basePrice * 0.9;
  for (let i = 0; i < days; i++) {
    price = price + (Math.random() - 0.45) * (basePrice * 0.02);
    data.push({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      price: Math.max(price, basePrice * 0.8),
    });
  }
  return data;
};

export const Trade = () => {
  const [searchParams] = useSearchParams();
  const assetId = searchParams.get('asset') || mockAssets[0].id;
  const selectedAsset = mockAssets.find((a) => a.id === assetId) || mockAssets[0];
  
  const { isKYCVerified, completeKYC } = useWallet();
  const { toast } = useToast();
  
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [timeframe, setTimeframe] = useState('1M');

  const priceData = useMemo(() => {
    const days = timeframe === '1D' ? 24 : timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : timeframe === '3M' ? 90 : 365;
    return generatePriceData(selectedAsset.price, days);
  }, [selectedAsset.price, timeframe]);

  const usdcAmount = amount ? (parseFloat(amount) * selectedAsset.price).toFixed(2) : '0.00';
  const priceImpact = amount && parseFloat(amount) > 100 ? ((parseFloat(amount) / 1000) * 0.1).toFixed(2) : '0.00';
  const estimatedGas = '0.02';

  const handleTrade = () => {
    if (!isKYCVerified) {
      toast({
        title: 'KYC Required',
        description: 'Please complete KYC verification to trade.',
        variant: 'destructive',
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Trade Submitted',
      description: `Your ${tradeType} order for ${amount} ${selectedAsset.symbol} has been submitted.`,
    });
    setAmount('');
  };

  const isPositive = selectedAsset.priceChange24h >= 0;

  return (
    <Layout showFooter={false}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left Side - Asset Info & Chart */}
          <div className="lg:col-span-3 space-y-6">
            {/* Asset Header */}
            <div className="glass-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <Select 
                    value={selectedAsset.id} 
                    onValueChange={(v) => window.location.href = `/trade?asset=${v}`}
                  >
                    <SelectTrigger className="w-64 input-dark">
                      <SelectValue>
                        <span className="font-semibold">{selectedAsset.name}</span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {mockAssets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{asset.name}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {asset.symbol}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Badge variant="outline" className={cn(
                  'gap-1',
                  selectedAsset.type === 'Real Estate' && 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                  selectedAsset.type === 'Bond' && 'bg-green-500/20 text-green-400 border-green-500/30',
                  selectedAsset.type === 'Invoice' && 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                  selectedAsset.type === 'Commodity' && 'bg-purple-500/20 text-purple-400 border-purple-500/30',
                  selectedAsset.type === 'Equipment' && 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
                )}>
                  {selectedAsset.type}
                </Badge>
              </div>

              <div className="flex items-end gap-4 mb-6">
                <div>
                  <p className="text-4xl font-bold text-foreground">
                    ${selectedAsset.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className={cn(
                  'flex items-center gap-1 text-lg font-medium pb-1',
                  isPositive ? 'text-success' : 'text-destructive'
                )}>
                  {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  {formatPercent(selectedAsset.priceChange24h)}
                </div>
              </div>

              {/* Timeframe Selector */}
              <div className="flex gap-2 mb-4">
                {['1D', '1W', '1M', '3M', '1Y'].map((tf) => (
                  <Button
                    key={tf}
                    variant={timeframe === tf ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setTimeframe(tf)}
                  >
                    {tf}
                  </Button>
                ))}
              </div>

              {/* Price Chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={priceData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis 
                      domain={['dataMin', 'dataMax']} 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickFormatter={(v) => `$${v.toFixed(0)}`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="glass-card p-3">
                              <p className="text-foreground font-medium">
                                ${(payload[0].value as number).toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {payload[0].payload.date}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorPrice)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Asset Information Tabs */}
            <div className="glass-card p-6">
              <Tabs defaultValue="overview">
                <TabsList className="bg-secondary/50 mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="yield">Yield Details</TabsTrigger>
                  <TabsTrigger value="compliance">Compliance</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <p className="text-muted-foreground">{selectedAsset.description}</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-secondary/30">
                      <p className="text-sm text-muted-foreground">Total Supply</p>
                      <p className="text-lg font-semibold text-foreground">
                        {selectedAsset.totalSupply.toLocaleString()} {selectedAsset.symbol}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/30">
                      <p className="text-sm text-muted-foreground">Market Cap</p>
                      <p className="text-lg font-semibold text-foreground">
                        {formatCurrency(selectedAsset.marketCap)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/30">
                      <p className="text-sm text-muted-foreground">24h Volume</p>
                      <p className="text-lg font-semibold text-foreground">
                        {formatCurrency(selectedAsset.volume24h)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/30">
                      <p className="text-sm text-muted-foreground">Contract Address</p>
                      <p className="text-lg font-semibold text-foreground font-mono">
                        {selectedAsset.contractAddress}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="yield" className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-secondary/30">
                      <p className="text-sm text-muted-foreground">Current APY</p>
                      <p className="text-2xl font-bold text-success">{selectedAsset.apy}%</p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/30">
                      <p className="text-sm text-muted-foreground">Distribution Frequency</p>
                      <p className="text-lg font-semibold text-foreground">
                        {selectedAsset.distributionFrequency}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/30">
                      <p className="text-sm text-muted-foreground">Next Distribution</p>
                      <p className="text-lg font-semibold text-foreground">
                        {selectedAsset.nextDistribution}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/30">
                      <p className="text-sm text-muted-foreground">TVL</p>
                      <p className="text-lg font-semibold text-foreground">
                        {formatCurrency(selectedAsset.tvl)}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="compliance" className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-secondary/30 flex items-center gap-3">
                      <Shield className={cn(
                        'h-6 w-6',
                        selectedAsset.kycRequired ? 'text-warning' : 'text-success'
                      )} />
                      <div>
                        <p className="text-sm text-muted-foreground">KYC Required</p>
                        <p className="font-semibold text-foreground">
                          {selectedAsset.kycRequired ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/30 flex items-center gap-3">
                      <CheckCircle className={cn(
                        'h-6 w-6',
                        selectedAsset.accreditedOnly ? 'text-warning' : 'text-success'
                      )} />
                      <div>
                        <p className="text-sm text-muted-foreground">Accredited Investor Only</p>
                        <p className="font-semibold text-foreground">
                          {selectedAsset.accreditedOnly ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                  </div>
                  {selectedAsset.jurisdictionRestrictions.length > 0 && (
                    <div className="p-4 rounded-lg bg-secondary/30">
                      <p className="text-sm text-muted-foreground mb-2">Restricted Jurisdictions</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedAsset.jurisdictionRestrictions.map((j) => (
                          <Badge key={j} variant="outline" className="badge-danger">
                            {j}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* AI Analysis */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">AI Analysis</h3>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-secondary/30 text-center">
                  <p className="text-sm text-muted-foreground mb-1">AI Predicted Price</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${selectedAsset.aiPredictedPrice.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAsset.aiConfidence}% confidence
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Recommendation</p>
                  <Badge className={cn(
                    'text-lg px-4 py-1',
                    selectedAsset.aiRecommendation === 'BUY' && 'bg-success text-success-foreground',
                    selectedAsset.aiRecommendation === 'HOLD' && 'bg-warning text-warning-foreground',
                    selectedAsset.aiRecommendation === 'SELL' && 'bg-destructive text-destructive-foreground'
                  )}>
                    {selectedAsset.aiRecommendation}
                  </Badge>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Risk Score</p>
                  <Badge variant="outline" className={cn(
                    'text-lg px-4 py-1',
                    selectedAsset.riskScore === 'Low' && 'badge-success',
                    selectedAsset.riskScore === 'Medium' && 'badge-warning',
                    selectedAsset.riskScore === 'High' && 'badge-danger'
                  )}>
                    {selectedAsset.riskScore}
                  </Badge>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">{selectedAsset.aiReasoning}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Trading Panel */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6 sticky top-24">
              <Tabs value={tradeType} onValueChange={(v) => setTradeType(v as 'buy' | 'sell')}>
                <TabsList className="w-full bg-secondary/50 mb-6">
                  <TabsTrigger value="buy" className="flex-1">Buy</TabsTrigger>
                  <TabsTrigger value="sell" className="flex-1">Sell</TabsTrigger>
                </TabsList>

                <div className="space-y-6">
                  {/* Amount Input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Amount ({selectedAsset.symbol})</Label>
                      <Button variant="ghost" size="sm" className="h-auto p-0 text-primary">
                        Max
                      </Button>
                    </div>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="input-dark text-lg h-12"
                    />
                  </div>

                  {/* USDC Amount */}
                  <div className="space-y-2">
                    <Label>Total (USDC)</Label>
                    <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-foreground">
                          ${parseFloat(usdcAmount).toLocaleString()}
                        </span>
                        <Badge variant="outline">USDC</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Slippage */}
                  <div className="space-y-2">
                    <Label>Slippage Tolerance</Label>
                    <div className="flex gap-2">
                      {['0.1', '0.5', '1.0'].map((s) => (
                        <Button
                          key={s}
                          variant={slippage === s ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSlippage(s)}
                        >
                          {s}%
                        </Button>
                      ))}
                      <Input
                        type="number"
                        value={slippage}
                        onChange={(e) => setSlippage(e.target.value)}
                        className="input-dark w-20"
                      />
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-3 p-4 rounded-lg bg-secondary/30">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">You {tradeType === 'buy' ? 'Pay' : 'Receive'}</span>
                      <span className="text-foreground">${usdcAmount} USDC</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">You {tradeType === 'buy' ? 'Receive' : 'Pay'}</span>
                      <span className="text-foreground">{amount || '0'} {selectedAsset.symbol}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Price Impact</span>
                      <span className={cn(
                        parseFloat(priceImpact) > 0.5 ? 'text-warning' : 'text-success'
                      )}>
                        {priceImpact}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Estimated Gas</span>
                      <span className="text-foreground">{estimatedGas} MNT</span>
                    </div>
                  </div>

                  {/* KYC Warning */}
                  {!isKYCVerified && (
                    <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-warning">KYC Required</p>
                          <p className="text-sm text-muted-foreground">
                            Complete verification to trade this asset.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={completeKYC}
                          >
                            Verify Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Trade Button */}
                  <Button
                    variant="gradient"
                    size="lg"
                    className="w-full"
                    onClick={handleTrade}
                    disabled={!amount || parseFloat(amount) <= 0}
                  >
                    <ArrowDownUp className="h-5 w-5 mr-2" />
                    {tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedAsset.symbol}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By trading, you agree to our Terms of Service
                  </p>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
