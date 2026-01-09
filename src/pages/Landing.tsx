import { useNavigate } from 'react-router-dom';
import { useWallet } from '@/contexts/WalletContext';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WalletConnection } from '@/components/WalletConnection';
import { mockAssets, platformStats, formatCurrency } from '@/data/mockData';
import { AssetCard } from '@/components/AssetCard';
import {
  Wallet,
  Shield,
  Zap,
  Brain,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Users,
  BarChart3,
  Lock,
  Building2,
  Landmark,
  Receipt,
} from 'lucide-react';
import { useEffect } from 'react';

export const Landing = () => {
  const { isConnected } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected) {
      navigate('/dashboard');
    }
  }, [isConnected, navigate]);

  const featuredAssets = mockAssets.slice(0, 3);

  const stats = [
    { label: 'Total Value Locked', value: formatCurrency(platformStats.totalValueLocked), icon: Lock },
    { label: 'Total Assets', value: platformStats.totalAssets.toString(), icon: Building2 },
    { label: 'Active Traders', value: `${platformStats.activeTraders.toLocaleString()}+`, icon: Users },
    { label: 'Total Volume', value: formatCurrency(platformStats.totalVolume), icon: BarChart3 },
  ];

  const steps = [
    {
      step: '01',
      title: 'Complete KYC Verification',
      description: 'Quick and secure identity verification to ensure compliance.',
      icon: Shield,
    },
    {
      step: '02',
      title: 'Browse & Trade Assets',
      description: 'Explore tokenized real estate, bonds, and cash-flow assets.',
      icon: TrendingUp,
    },
    {
      step: '03',
      title: 'Earn Yield Distributions',
      description: 'Receive automatic yield payments directly to your wallet.',
      icon: Zap,
    },
  ];

  const features = [
    {
      title: 'AI-Powered Pricing',
      description: 'Advanced algorithms analyze market data to provide fair value estimates.',
      icon: Brain,
    },
    {
      title: 'Compliant Trading',
      description: 'Built-in KYC/AML compliance for regulatory peace of mind.',
      icon: Shield,
    },
    {
      title: 'Instant Settlement',
      description: 'Trades settle instantly on the blockchain, no waiting.',
      icon: Zap,
    },
    {
      title: 'Low Fees on Mantle',
      description: "Benefit from Mantle's low transaction costs.",
      icon: CheckCircle,
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-hero-pattern" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/20 blur-[120px] rounded-full opacity-50" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="outline" className="px-4 py-2 text-sm border-primary/30 bg-primary/10">
              <span className="text-primary">Now Live on Mantle Network</span>
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight animate-fade-in">
              Trade Real Assets.{' '}
              <span className="gradient-text">Earn Real Yield.</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in delay-100">
              Access tokenized real estate, bonds, and cash-flow assets with built-in compliance and AI-powered pricing
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in delay-200">
              <WalletConnection />
              <Button variant="outline" size="xl" className="gap-2 w-full sm:w-auto">
                Learn More
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-muted-foreground/50 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border/50 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center space-y-2 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-2">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Assets */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Featured Assets</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our curated selection of high-quality tokenized real-world assets
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredAssets.map((asset, index) => (
              <div
                key={asset.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <AssetCard asset={asset} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div
                key={step.step}
                className="relative group animate-slide-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="glass-card p-8 h-full relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-6xl font-bold text-primary/10 group-hover:text-primary/20 transition-colors">
                    {step.step}
                  </div>
                  <div className="relative z-10">
                    <div className="p-3 rounded-xl bg-primary/10 inline-flex mb-6">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                    <ArrowRight className="h-8 w-8 text-primary/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why RWA-DEX */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Why RWA-DEX?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The most advanced platform for trading tokenized real-world assets
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="glass-card-hover p-6 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-3 rounded-xl bg-primary/10 inline-flex mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Ready to Start Trading?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of traders accessing real-world asset yields on the blockchain
            </p>
            <WalletConnection className="gap-2" />
          </div>
        </div>
      </section>
    </Layout>
  );
};
