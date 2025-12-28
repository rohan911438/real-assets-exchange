import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockAssets, mockUserHoldings, mockLoans, formatCurrency } from '@/data/mockData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wallet, AlertTriangle, Info, ArrowRight, Plus, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export const Lending = () => {
  const [selectedCollateral, setSelectedCollateral] = useState(mockAssets[0].id);
  const [collateralAmount, setCollateralAmount] = useState('');
  const { toast } = useToast();

  const asset = mockAssets.find((a) => a.id === selectedCollateral)!;
  
  // User's holdings of selected asset
  const holding = mockUserHoldings.find((h) => h.assetId === selectedCollateral);
  const maxCollateral = holding ? holding.quantity : 0;

  // Calculate borrowing capacity (50% LTV)
  const LTV = 0.5;
  const collateralValue = collateralAmount ? parseFloat(collateralAmount) * asset.price : 0;
  const borrowingCapacity = collateralValue * LTV;
  const interestRate = 8.5;

  // Health factor calculation
  const getHealthFactor = (borrowed: number, collateralVal: number) => {
    if (borrowed === 0) return 999;
    return (collateralVal * 0.8) / borrowed; // 80% liquidation threshold
  };

  const getHealthColor = (factor: number) => {
    if (factor >= 2) return 'bg-success';
    if (factor >= 1.5) return 'bg-warning';
    return 'bg-destructive';
  };

  const handleBorrow = () => {
    if (!collateralAmount || parseFloat(collateralAmount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid collateral amount.',
        variant: 'destructive',
      });
      return;
    }

    if (parseFloat(collateralAmount) > maxCollateral) {
      toast({
        title: 'Insufficient Balance',
        description: 'You don\'t have enough collateral.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Loan Created',
      description: `Successfully borrowed ${formatCurrency(borrowingCapacity)} USDC.`,
    });
    setCollateralAmount('');
  };

  const handleRepay = (loanId: string) => {
    toast({
      title: 'Loan Repaid',
      description: 'Your loan has been repaid and collateral released.',
    });
  };

  const handleAddCollateral = (loanId: string) => {
    toast({
      title: 'Collateral Added',
      description: 'Additional collateral has been added to your position.',
    });
  };

  return (
    <Layout showFooter={false}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Lending</h1>
          <p className="text-muted-foreground">Borrow USDC against your RWA holdings</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Borrow Section */}
          <div className="glass-card p-6 space-y-6">
            <h2 className="text-lg font-semibold text-foreground">Borrow</h2>

            {/* Select Collateral */}
            <div className="space-y-2">
              <Label>Select Collateral Asset</Label>
              <Select value={selectedCollateral} onValueChange={setSelectedCollateral}>
                <SelectTrigger className="input-dark">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockAssets.slice(0, 5).map((a) => (
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

            {/* Collateral Amount */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Collateral Amount</Label>
                <span className="text-sm text-muted-foreground">
                  Available: {maxCollateral} {asset.symbol}
                </span>
              </div>
              <Input
                type="number"
                placeholder="0.00"
                value={collateralAmount}
                onChange={(e) => setCollateralAmount(e.target.value)}
                className="input-dark"
                max={maxCollateral}
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Collateral Value</span>
                <span className="text-foreground">{formatCurrency(collateralValue)}</span>
              </div>
            </div>

            {/* Borrowing Capacity */}
            <div className="p-4 rounded-lg bg-secondary/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Max LTV</span>
                <span className="font-medium text-foreground">50%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Available to Borrow</span>
                <span className="text-xl font-bold text-success">{formatCurrency(borrowingCapacity)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Interest Rate (APR)</span>
                <span className="font-medium text-foreground">{interestRate}%</span>
              </div>
            </div>

            {/* Health Factor Preview */}
            {borrowingCapacity > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Health Factor Preview</span>
                  <span className="text-sm font-medium text-success">
                    {getHealthFactor(borrowingCapacity, collateralValue).toFixed(2)}
                  </span>
                </div>
                <Progress 
                  value={Math.min((1 / getHealthFactor(borrowingCapacity, collateralValue)) * 100, 100)}
                  className="h-2"
                />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-3 w-3" />
                  Liquidation at health factor &lt; 1.0
                </div>
              </div>
            )}

            <Button
              variant="gradient"
              className="w-full"
              onClick={handleBorrow}
              disabled={!collateralAmount || parseFloat(collateralAmount) <= 0 || borrowingCapacity <= 0}
            >
              Borrow {formatCurrency(borrowingCapacity)} USDC
            </Button>

            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  If your health factor drops below 1.0, your collateral may be liquidated to repay the loan.
                </p>
              </div>
            </div>
          </div>

          {/* Your Loans Section */}
          <div className="glass-card p-6 space-y-6">
            <h2 className="text-lg font-semibold text-foreground">Your Loans</h2>

            {mockLoans.length > 0 ? (
              <div className="space-y-4">
                {mockLoans.map((loan) => {
                  const loanAsset = mockAssets.find((a) => a.id === loan.collateralAssetId)!;
                  const healthFactor = loan.healthFactor;
                  
                  return (
                    <div key={loan.id} className="p-4 rounded-lg bg-secondary/30 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{loanAsset.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {loan.collateralAmount} {loanAsset.symbol} collateral
                          </p>
                        </div>
                        <Badge variant="outline" className={cn(
                          healthFactor >= 2 ? 'badge-success' :
                          healthFactor >= 1.5 ? 'badge-warning' : 'badge-danger'
                        )}>
                          Health: {healthFactor.toFixed(2)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Collateral Value</p>
                          <p className="font-medium text-foreground">{formatCurrency(loan.collateralValue)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Borrowed</p>
                          <p className="font-medium text-foreground">{formatCurrency(loan.borrowedAmount)} USDC</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Interest Rate</p>
                          <p className="font-medium text-foreground">{loan.interestRate}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Start Date</p>
                          <p className="font-medium text-foreground">
                            {loan.startDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Health Factor Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Health Factor</span>
                          <span className={cn(
                            'font-medium',
                            healthFactor >= 2 ? 'text-success' :
                            healthFactor >= 1.5 ? 'text-warning' : 'text-destructive'
                          )}>
                            {healthFactor.toFixed(2)}
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              'h-full transition-all',
                              getHealthColor(healthFactor)
                            )}
                            style={{ width: `${Math.min((healthFactor / 3) * 100, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleRepay(loan.id)}
                        >
                          Repay
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1"
                          onClick={() => handleAddCollateral(loan.id)}
                        >
                          <Plus className="h-3 w-3" />
                          Add Collateral
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No active loans.</p>
                <p className="text-sm text-muted-foreground">Borrow against your RWA holdings to get started.</p>
              </div>
            )}

            {/* Info */}
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground mb-1">How Lending Works</p>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Deposit RWA tokens as collateral</li>
                    <li>• Borrow up to 50% of collateral value in USDC</li>
                    <li>• Pay interest over time</li>
                    <li>• Repay to unlock your collateral</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
