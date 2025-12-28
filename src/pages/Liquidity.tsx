import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { mockAssets, mockLiquidityPositions, formatCurrency } from '@/data/mockData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Minus, Coins, ArrowRight, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Liquidity = () => {
  const [selectedAsset, setSelectedAsset] = useState(mockAssets[0].id);
  const [rwaAmount, setRwaAmount] = useState('');
  const [usdcAmount, setUsdcAmount] = useState('');
  const { toast } = useToast();

  const asset = mockAssets.find((a) => a.id === selectedAsset)!;
  
  // Calculate estimated values
  const estimatedLP = rwaAmount && usdcAmount ? 
    Math.sqrt(parseFloat(rwaAmount) * parseFloat(usdcAmount)).toFixed(2) : '0';
  const poolShare = rwaAmount && parseFloat(rwaAmount) > 0 ? 
    ((parseFloat(rwaAmount) * asset.price) / (asset.tvl + parseFloat(rwaAmount) * asset.price) * 100).toFixed(2) : '0';
  const projectedApy = 3.5; // Mock APY from fees

  const handleAddLiquidity = () => {
    if (!rwaAmount || !usdcAmount) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter both amounts.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Liquidity Added',
      description: `Successfully added liquidity to ${asset.symbol}/USDC pool.`,
    });
    setRwaAmount('');
    setUsdcAmount('');
  };

  const handleRemoveLiquidity = (poolId: string) => {
    toast({
      title: 'Liquidity Removed',
      description: 'Successfully removed liquidity from the pool.',
    });
  };

  const handleClaimFees = (poolId: string) => {
    toast({
      title: 'Fees Claimed',
      description: 'Successfully claimed your trading fees.',
    });
  };

  return (
    <Layout showFooter={false}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Liquidity</h1>
          <p className="text-muted-foreground">Provide liquidity to earn trading fees</p>
        </div>

        <Tabs defaultValue="add" className="space-y-6">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="add" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Liquidity
            </TabsTrigger>
            <TabsTrigger value="positions" className="gap-2">
              <Coins className="h-4 w-4" />
              My Positions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Add Liquidity Form */}
              <div className="glass-card p-6 space-y-6">
                <h2 className="text-lg font-semibold text-foreground">Add Liquidity</h2>

                {/* Select RWA Token */}
                <div className="space-y-2">
                  <Label>Select RWA Token</Label>
                  <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                    <SelectTrigger className="input-dark">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mockAssets.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          <div className="flex items-center gap-2">
                            <span>{a.name}</span>
                            <Badge variant="outline" className="text-xs">{a.symbol}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* RWA Amount */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>{asset.symbol} Amount</Label>
                    <span className="text-sm text-muted-foreground">
                      Balance: 15.5 {asset.symbol}
                    </span>
                  </div>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={rwaAmount}
                    onChange={(e) => {
                      setRwaAmount(e.target.value);
                      if (e.target.value) {
                        setUsdcAmount((parseFloat(e.target.value) * asset.price).toFixed(2));
                      }
                    }}
                    className="input-dark"
                  />
                </div>

                <div className="flex justify-center">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>

                {/* USDC Amount */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>USDC Amount</Label>
                    <span className="text-sm text-muted-foreground">
                      Balance: 25,000 USDC
                    </span>
                  </div>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={usdcAmount}
                    onChange={(e) => {
                      setUsdcAmount(e.target.value);
                      if (e.target.value) {
                        setRwaAmount((parseFloat(e.target.value) / asset.price).toFixed(4));
                      }
                    }}
                    className="input-dark"
                  />
                </div>

                {/* Summary */}
                <div className="p-4 rounded-lg bg-secondary/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Estimated LP Tokens</span>
                    <span className="font-medium text-foreground">{estimatedLP} LP</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Pool Share</span>
                    <span className="font-medium text-foreground">{poolShare}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Projected APY (from fees)</span>
                    <span className="font-medium text-success">{projectedApy}%</span>
                  </div>
                </div>

                <Button
                  variant="gradient"
                  className="w-full"
                  onClick={handleAddLiquidity}
                  disabled={!rwaAmount || !usdcAmount}
                >
                  Add Liquidity
                </Button>
              </div>

              {/* Info Panel */}
              <div className="glass-card p-6 space-y-6">
                <h2 className="text-lg font-semibold text-foreground">Pool Information</h2>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-secondary/30">
                    <p className="text-sm text-muted-foreground mb-1">Pool</p>
                    <p className="text-lg font-semibold text-foreground">
                      {asset.symbol}/USDC
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-secondary/30">
                    <p className="text-sm text-muted-foreground mb-1">Total Liquidity</p>
                    <p className="text-lg font-semibold text-foreground">
                      {formatCurrency(asset.tvl * 2)}
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-secondary/30">
                    <p className="text-sm text-muted-foreground mb-1">24h Volume</p>
                    <p className="text-lg font-semibold text-foreground">
                      {formatCurrency(asset.volume24h)}
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-secondary/30">
                    <p className="text-sm text-muted-foreground mb-1">Fee Tier</p>
                    <p className="text-lg font-semibold text-foreground">0.3%</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground">
                      By providing liquidity, you'll earn 0.3% of all trades on this pair proportional to your share of the pool.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="positions">
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/30">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Pool</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">Your Liquidity</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">Pool Share</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">APY</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">Unclaimed Fees</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockLiquidityPositions.map((position) => {
                      const positionAsset = mockAssets.find((a) => a.id === position.assetId)!;
                      return (
                        <tr key={position.id} className="border-t border-border/50 hover:bg-secondary/20 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{position.poolName}</span>
                              <Badge variant="outline" className="text-xs">
                                {positionAsset.type}
                              </Badge>
                            </div>
                          </td>
                          <td className="p-4 text-right font-medium text-foreground">
                            {formatCurrency(position.liquidity)}
                          </td>
                          <td className="p-4 text-right text-foreground">
                            {position.poolShare.toFixed(2)}%
                          </td>
                          <td className="p-4 text-right text-success font-medium">
                            {position.apyFromFees.toFixed(1)}%
                          </td>
                          <td className="p-4 text-right text-success font-medium">
                            ${position.unclaimedFees.toFixed(2)}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleClaimFees(position.id)}
                              >
                                Claim
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveLiquidity(position.id)}
                              >
                                Remove
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {mockLiquidityPositions.length === 0 && (
                <div className="p-12 text-center">
                  <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No liquidity positions found.</p>
                  <p className="text-sm text-muted-foreground">Add liquidity to start earning fees.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};
