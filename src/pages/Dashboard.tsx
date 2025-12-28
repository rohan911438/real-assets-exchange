import { Layout } from '@/components/layout/Layout';
import { StatCard } from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  mockAssets,
  mockUserHoldings,
  mockTransactions,
  formatCurrency,
  formatPercent,
} from '@/data/mockData';
import { Link } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Coins,
  Gift,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

export const Dashboard = () => {
  // Calculate portfolio stats
  const totalValue = mockUserHoldings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalPnL = mockUserHoldings.reduce((sum, h) => sum + h.unrealizedPnL, 0);
  const totalPnLPercent = (totalPnL / (totalValue - totalPnL)) * 100;
  const totalYieldEarned = 342.50;
  const claimableYield = 89.20;

  // Get asset details for holdings
  const holdingsWithDetails = mockUserHoldings.map((holding) => {
    const asset = mockAssets.find((a) => a.id === holding.assetId)!;
    return { ...holding, asset };
  });

  // Portfolio composition data for pie chart
  const compositionData = holdingsWithDetails.map((h) => ({
    name: h.asset.type,
    value: h.currentValue,
    color: h.asset.type === 'Real Estate' ? '#6366f1' : 
           h.asset.type === 'Bond' ? '#10b981' : '#f59e0b',
  }));

  // Aggregate by type
  const aggregatedComposition = compositionData.reduce((acc, curr) => {
    const existing = acc.find((item) => item.name === curr.name);
    if (existing) {
      existing.value += curr.value;
    } else {
      acc.push({ ...curr });
    }
    return acc;
  }, [] as typeof compositionData);

  const avgApy = holdingsWithDetails.reduce((sum, h) => sum + h.asset.apy * h.currentValue, 0) / totalValue;

  return (
    <Layout showFooter={false}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your portfolio overview.</p>
        </div>

        {/* Portfolio Overview */}
        <div className="grid lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Portfolio Value"
            value={formatCurrency(totalValue)}
            change={formatPercent(totalPnLPercent)}
            changeType={totalPnLPercent >= 0 ? 'positive' : 'negative'}
            icon={Wallet}
            className="lg:col-span-1"
          />
          <StatCard
            title="24h Change"
            value={formatCurrency(Math.abs(totalPnL))}
            change={formatPercent(totalPnLPercent)}
            changeType={totalPnLPercent >= 0 ? 'positive' : 'negative'}
            icon={totalPnLPercent >= 0 ? TrendingUp : TrendingDown}
          />
          <StatCard
            title="Total Yield Earned"
            value={formatCurrency(totalYieldEarned)}
            change="All time"
            changeType="neutral"
            icon={Coins}
          />
          <div className="stat-card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Claimable Yield</p>
                <p className="text-2xl font-bold text-success">{formatCurrency(claimableYield)}</p>
              </div>
              <div className="p-3 rounded-lg bg-success/10">
                <Gift className="h-5 w-5 text-success" />
              </div>
            </div>
            <Button variant="success" size="sm" className="w-full">
              Claim All
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Portfolio Composition */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Portfolio Composition</h2>
              <PieChart className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={aggregatedComposition}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {aggregatedComposition.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="glass-card p-2 text-sm">
                            <p className="text-foreground font-medium">{payload[0].name}</p>
                            <p className="text-muted-foreground">
                              {formatCurrency(payload[0].value as number)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {aggregatedComposition.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {((item.value / totalValue) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* My Assets */}
          <div className="lg:col-span-2 glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">My Assets</h2>
              <Link to="/marketplace">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Asset</th>
                    <th className="text-right py-3 text-sm font-medium text-muted-foreground">Quantity</th>
                    <th className="text-right py-3 text-sm font-medium text-muted-foreground">Value</th>
                    <th className="text-right py-3 text-sm font-medium text-muted-foreground">24h</th>
                    <th className="text-right py-3 text-sm font-medium text-muted-foreground">APY</th>
                    <th className="text-right py-3 text-sm font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {holdingsWithDetails.map((holding) => (
                    <tr key={holding.assetId} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-4">
                        <div>
                          <p className="font-medium text-foreground">{holding.asset.name}</p>
                          <p className="text-sm text-muted-foreground">{holding.asset.symbol}</p>
                        </div>
                      </td>
                      <td className="text-right py-4 text-foreground">{holding.quantity}</td>
                      <td className="text-right py-4 font-medium text-foreground">
                        {formatCurrency(holding.currentValue)}
                      </td>
                      <td className="text-right py-4">
                        <span className={cn(
                          'flex items-center justify-end gap-1',
                          holding.unrealizedPnLPercent >= 0 ? 'text-success' : 'text-destructive'
                        )}>
                          {holding.unrealizedPnLPercent >= 0 ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4" />
                          )}
                          {formatPercent(holding.unrealizedPnLPercent)}
                        </span>
                      </td>
                      <td className="text-right py-4 text-success font-medium">
                        {holding.asset.apy}%
                      </td>
                      <td className="text-right py-4">
                        <Link to={`/trade?asset=${holding.assetId}`}>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Stats & Recent Transactions */}
        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          {/* Quick Stats */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Assets Owned</span>
                <span className="font-medium text-foreground">{mockUserHoldings.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Active Positions</span>
                <span className="font-medium text-foreground">{mockUserHoldings.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Average APY</span>
                <span className="font-medium text-success">{avgApy.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="lg:col-span-2 glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
              <Link to="/profile">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {mockTransactions.slice(0, 5).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'p-2 rounded-lg',
                      tx.type === 'buy' && 'bg-success/20',
                      tx.type === 'sell' && 'bg-destructive/20',
                      tx.type === 'yield' && 'bg-primary/20'
                    )}>
                      {tx.type === 'buy' && <ArrowDownRight className="h-4 w-4 text-success" />}
                      {tx.type === 'sell' && <ArrowUpRight className="h-4 w-4 text-destructive" />}
                      {tx.type === 'yield' && <Coins className="h-4 w-4 text-primary" />}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {tx.type === 'yield' ? 'Yield Distribution' : `${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)} ${tx.assetName}`}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {tx.timestamp.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      'font-medium',
                      tx.type === 'buy' ? 'text-foreground' : 
                      tx.type === 'sell' ? 'text-destructive' : 'text-success'
                    )}>
                      {tx.type === 'buy' ? '-' : '+'}${tx.total.toLocaleString()}
                    </p>
                    <Badge variant="outline" className="badge-success text-xs">
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
