import { Layout } from '@/components/layout/Layout';
import { StatCard } from '@/components/StatCard';
import { mockAssets, platformStats, formatCurrency } from '@/data/mockData';
import { BarChart3, Activity, Users, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Generate mock volume data
const volumeData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  volume: Math.floor(Math.random() * 500000) + 100000,
}));

// Generate mock TVL data
const tvlData = Array.from({ length: 30 }, (_, i) => {
  const baseValue = 3000000;
  const growth = i * 50000 + Math.random() * 100000;
  return {
    date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    tvl: baseValue + growth,
  };
});

// Asset type distribution
const typeDistribution = mockAssets.reduce((acc, asset) => {
  const existing = acc.find((item) => item.name === asset.type);
  if (existing) {
    existing.value += asset.tvl;
  } else {
    acc.push({ name: asset.type, value: asset.tvl });
  }
  return acc;
}, [] as { name: string; value: number }[]);

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#a855f7', '#06b6d4'];

export const Analytics = () => {
  // Top assets by volume
  const topByVolume = [...mockAssets]
    .sort((a, b) => b.volume24h - a.volume24h)
    .slice(0, 5);

  // Highest yield assets
  const highestYield = [...mockAssets]
    .sort((a, b) => b.apy - a.apy)
    .slice(0, 5);

  return (
    <Layout showFooter={false}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
          <p className="text-muted-foreground">Platform statistics and market insights</p>
        </div>

        {/* Top Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="24h Volume"
            value={formatCurrency(platformStats.volume24h)}
            change="+12.5%"
            changeType="positive"
            icon={BarChart3}
          />
          <StatCard
            title="24h Transactions"
            value={platformStats.transactions24h.toLocaleString()}
            change="+8.3%"
            changeType="positive"
            icon={Activity}
          />
          <StatCard
            title="Unique Traders (24h)"
            value={platformStats.uniqueTraders24h.toLocaleString()}
            change="+5.2%"
            changeType="positive"
            icon={Users}
          />
          <StatCard
            title="Average APY"
            value={`${platformStats.averageApy}%`}
            change="+0.3%"
            changeType="positive"
            icon={TrendingUp}
          />
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Volume Chart */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Volume (Last 30 Days)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeData}>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    interval={4}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="glass-card p-3">
                            <p className="text-foreground font-medium">
                              {formatCurrency(payload[0].value as number)}
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
                  <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* TVL Chart */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">TVL Growth</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tvlData}>
                  <defs>
                    <linearGradient id="colorTvl" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    interval={4}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="glass-card p-3">
                            <p className="text-foreground font-medium">
                              {formatCurrency(payload[0].value as number)}
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
                    dataKey="tvl"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTvl)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Distribution & Leaderboards */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Asset Type Distribution */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Asset Distribution</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {typeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {typeDistribution.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {formatCurrency(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top by Volume */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Top by Volume</h3>
            <div className="space-y-4">
              {topByVolume.map((asset, index) => (
                <div key={asset.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-4">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{asset.symbol}</p>
                      <p className="text-xs text-muted-foreground">{asset.name}</p>
                    </div>
                  </div>
                  <span className="font-medium text-foreground">
                    {formatCurrency(asset.volume24h)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Highest Yield */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Highest Yield</h3>
            <div className="space-y-4">
              {highestYield.map((asset, index) => (
                <div key={asset.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-4">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{asset.symbol}</p>
                      <p className="text-xs text-muted-foreground">{asset.name}</p>
                    </div>
                  </div>
                  <span className="font-medium text-success">
                    {asset.apy}% APY
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Market Stats Table */}
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">All Assets</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/30">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Asset</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Price</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">24h Change</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">24h Volume</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">TVL</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">APY</th>
                </tr>
              </thead>
              <tbody>
                {mockAssets.map((asset) => (
                  <tr key={asset.id} className="border-t border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">{asset.name}</p>
                        <p className="text-sm text-muted-foreground">{asset.symbol}</p>
                      </div>
                    </td>
                    <td className="p-4 text-right font-medium text-foreground">
                      ${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`p-4 text-right font-medium ${asset.priceChange24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {asset.priceChange24h >= 0 ? '+' : ''}{asset.priceChange24h.toFixed(2)}%
                    </td>
                    <td className="p-4 text-right text-foreground">
                      {formatCurrency(asset.volume24h)}
                    </td>
                    <td className="p-4 text-right text-foreground">
                      {formatCurrency(asset.tvl)}
                    </td>
                    <td className="p-4 text-right font-medium text-success">
                      {asset.apy}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};
