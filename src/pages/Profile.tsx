import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWallet } from '@/contexts/WalletContext';
import { mockTransactions, formatCurrency, truncateAddress } from '@/data/mockData';
import {
  User,
  Settings,
  Shield,
  Copy,
  CheckCircle,
  Clock,
  Download,
  Bell,
  Moon,
  Globe,
  AlertTriangle,
  Coins,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export const Profile = () => {
  const { address, isKYCVerified, completeKYC, disconnect } = useWallet();
  const { toast } = useToast();
  
  const [copied, setCopied] = useState(false);
  const [slippageTolerance, setSlippageTolerance] = useState('0.5');
  const [notifications, setNotifications] = useState({
    trades: true,
    yields: true,
    priceAlerts: false,
    newsletter: false,
  });

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      toast({
        title: 'Address Copied',
        description: 'Wallet address copied to clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExport = () => {
    toast({
      title: 'Export Started',
      description: 'Your transaction history is being prepared for download.',
    });
  };

  return (
    <Layout showFooter={false}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Profile & Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Wallet Connected</p>
                  <Badge variant="outline" className="mt-1">
                    Mantle Testnet
                  </Badge>
                </div>
              </div>

              {/* Wallet Address */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Wallet Address</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 rounded-lg bg-secondary/50 text-foreground font-mono text-sm">
                    {truncateAddress(address || '')}
                  </code>
                  <Button variant="outline" size="icon" onClick={copyAddress}>
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* KYC Status */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">KYC Status</Label>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-2">
                    <Shield className={cn(
                      'h-5 w-5',
                      isKYCVerified ? 'text-success' : 'text-warning'
                    )} />
                    <span className={cn(
                      'font-medium',
                      isKYCVerified ? 'text-success' : 'text-warning'
                    )}>
                      {isKYCVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                  {!isKYCVerified && (
                    <Button size="sm" onClick={completeKYC}>
                      Verify Now
                    </Button>
                  )}
                </div>
              </div>

              {/* Account Created */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Account Created</Label>
                <div className="flex items-center gap-2 text-foreground">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  January 15, 2024
                </div>
              </div>

              {/* Disconnect */}
              <Button
                variant="outline"
                className="w-full text-destructive hover:bg-destructive/10"
                onClick={disconnect}
              >
                Disconnect Wallet
              </Button>
            </div>
          </div>

          {/* Settings & History */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="settings">
              <TabsList className="bg-secondary/50 mb-6">
                <TabsTrigger value="settings" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Transaction History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="settings">
                <div className="space-y-6">
                  {/* Notifications */}
                  <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Bell className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">Trade Confirmations</p>
                          <p className="text-sm text-muted-foreground">Get notified when trades are completed</p>
                        </div>
                        <Switch
                          checked={notifications.trades}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, trades: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">Yield Distributions</p>
                          <p className="text-sm text-muted-foreground">Get notified when yield is distributed</p>
                        </div>
                        <Switch
                          checked={notifications.yields}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, yields: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">Price Alerts</p>
                          <p className="text-sm text-muted-foreground">Get notified on significant price changes</p>
                        </div>
                        <Switch
                          checked={notifications.priceAlerts}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, priceAlerts: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">Newsletter</p>
                          <p className="text-sm text-muted-foreground">Receive weekly market updates</p>
                        </div>
                        <Switch
                          checked={notifications.newsletter}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, newsletter: checked })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Trading Preferences */}
                  <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Settings className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">Trading Preferences</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Default Slippage Tolerance</Label>
                        <Select value={slippageTolerance} onValueChange={setSlippageTolerance}>
                          <SelectTrigger className="input-dark">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0.1">0.1%</SelectItem>
                            <SelectItem value="0.5">0.5%</SelectItem>
                            <SelectItem value="1.0">1.0%</SelectItem>
                            <SelectItem value="2.0">2.0%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Display */}
                  <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Globe className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">Display</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Language</Label>
                        <Select defaultValue="en">
                          <SelectTrigger className="input-dark">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="fr">Français</SelectItem>
                            <SelectItem value="de">Deutsch</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">Dark Mode</p>
                          <p className="text-sm text-muted-foreground">Use dark theme</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history">
                <div className="glass-card overflow-hidden">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">Transaction History</h3>
                    <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                  </div>

                  <div className="divide-y divide-border/50">
                    {mockTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors"
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
                              {tx.type === 'yield' ? 'Yield Distribution' : 
                                `${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)} ${tx.assetName}`}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {tx.timestamp.toLocaleDateString()} {tx.timestamp.toLocaleTimeString()}
                            </div>
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
                          {tx.type !== 'yield' && (
                            <p className="text-sm text-muted-foreground">
                              {tx.amount} @ ${tx.price.toLocaleString()}
                            </p>
                          )}
                          <Badge variant="outline" className="badge-success text-xs mt-1">
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};
