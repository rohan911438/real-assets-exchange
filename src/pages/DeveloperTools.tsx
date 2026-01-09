import React from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Code, 
  Terminal, 
  FileText, 
  Zap, 
  Shield, 
  Brain,
  Container,
  Database,
  Cpu,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { useState } from 'react';

export const DeveloperTools = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sdkExample = `import { RWADex } from '@rwa-dex/sdk';

// Initialize SDK
const sdk = new RWADex();

// Connect wallet
const wallet = await sdk.connectWallet();

// Get RWA assets
const assets = await sdk.getAssets({
  type: 'RealEstate',
  minAPY: 8.0
});

// Execute trade with AI analysis
const prediction = await sdk.getAIPrediction(assets[0].id);
const trade = await sdk.swap({
  fromToken: 'USDC',
  toToken: assets[0].address,
  amount: '1000',
  slippage: 0.5
});`;

  const apiExample = `curl -X GET "https://api.rwa-dex.com/api/assets" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json"

# Response:
{
  "success": true,
  "data": {
    "assets": [
      {
        "id": "nyc-real-estate-1",
        "name": "NYC Premium Real Estate",
        "type": "RealEstate",
        "apy": 12.5,
        "price": 125.50,
        "aiConfidence": 95,
        "compliance": "Level3"
      }
    ]
  }
}`;

  const stats = [
    { label: 'REST API Endpoints', value: '9', icon: Terminal, color: 'text-blue-500' },
    { label: 'Smart Contracts', value: '7', icon: Shield, color: 'text-green-500' },
    { label: 'AI Models', value: '3', icon: Brain, color: 'text-purple-500' },
    { label: 'Docker Services', value: '4', icon: Container, color: 'text-orange-500' }
  ];  const infrastructure = [
    {
      name: 'TypeScript SDK',
      description: 'Complete development toolkit for RWA trading',
      features: ['MetaMask Integration', 'React Hooks', 'Type Safety', 'Error Handling'],
      status: 'Published',
      link: 'https://npmjs.com/package/@rwa-dex/sdk'
    },
    {
      name: 'REST API',
      description: 'Backend services for assets, trading, and compliance',
      features: ['JWT Authentication', 'Rate Limiting', 'Redis Caching', 'PostgreSQL'],
      status: 'Live',
      link: '/api/docs'
    },
    {
      name: 'AI Engine',
      description: 'Machine learning for price prediction and risk analysis',
      features: ['Random Forest', 'Risk Scoring', 'Anomaly Detection', '95% Accuracy'],
      status: 'Active',
      link: '/ai/docs'
    },
    {
      name: 'Smart Contracts',
      description: 'Solidity contracts deployed on Mantle Sepolia',
      features: ['DEX Core', 'RWA Tokens', 'Compliance', 'Lending Protocol'],
      status: 'Deployed',
      link: 'https://explorer.sepolia.mantle.xyz'
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Developer Infrastructure
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Production-ready tools and APIs for building on the RWA ecosystem
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="glass-card p-6 text-center">
                  <Icon className={'h-8 w-8 mx-auto mb-3 ' + stat.color} />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </motion.div>

          {/* Infrastructure Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-2 gap-6 mb-12"
          >
            {infrastructure.map((item, index) => (
              <div key={index} className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">{item.name}</h3>
                  <Badge 
                    className={
                      item.status === 'Live' || item.status === 'Published' ? 
                      'bg-green-500/10 text-green-600 border-green-500/20' :
                      item.status === 'Active' ?
                      'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                      'bg-purple-500/10 text-purple-600 border-purple-500/20'
                    }
                  >
                    {item.status}
                  </Badge>
                </div>
                
                <p className="text-muted-foreground mb-4">{item.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.features.map((feature, fIndex) => (
                    <Badge key={fIndex} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full gap-2">
                  <ExternalLink className="h-4 w-4" />
                  View Documentation
                </Button>
              </div>
            ))}
          </motion.div>

          {/* Code Examples */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* SDK Example */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  TypeScript SDK
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyCode(sdkExample, 'sdk')}
                  className="gap-2"
                >
                  {copiedCode === 'sdk' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copiedCode === 'sdk' ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              
              <pre className="text-sm bg-black/20 p-4 rounded-lg overflow-x-auto">
                <code className="text-green-400">{sdkExample}</code>
              </pre>
            </motion.div>

            {/* API Example */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  REST API
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyCode(apiExample, 'api')}
                  className="gap-2"
                >
                  {copiedCode === 'api' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copiedCode === 'api' ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              
              <pre className="text-sm bg-black/20 p-4 rounded-lg overflow-x-auto">
                <code className="text-blue-400">{apiExample}</code>
              </pre>
            </motion.div>
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-center mt-12"
          >
            <div className="glass-card p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-semibold mb-4">Ready to Build?</h3>
              <p className="text-muted-foreground mb-6">
                Get started with our comprehensive documentation and join the RWA revolution
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="gap-2">
                  <FileText className="h-4 w-4" />
                  View Documentation
                </Button>
                <Button variant="outline" className="gap-2">
                  <Code className="h-4 w-4" />
                  Try SDK
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};