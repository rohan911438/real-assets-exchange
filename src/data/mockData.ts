export interface RWAAsset {
  id: string;
  name: string;
  symbol: string;
  type: 'Real Estate' | 'Bond' | 'Invoice' | 'Commodity' | 'Equipment';
  price: number;
  priceChange24h: number;
  apy: number;
  tvl: number;
  volume24h: number;
  marketCap: number;
  totalSupply: number;
  description: string;
  contractAddress: string;
  aiPredictedPrice: number;
  aiConfidence: number;
  aiRecommendation: 'BUY' | 'HOLD' | 'SELL';
  aiReasoning: string;
  riskScore: 'Low' | 'Medium' | 'High';
  kycRequired: boolean;
  accreditedOnly: boolean;
  jurisdictionRestrictions: string[];
  distributionFrequency: string;
  nextDistribution: string;
  image: string;
}

export interface UserHolding {
  assetId: string;
  quantity: number;
  avgBuyPrice: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'yield' | 'deposit' | 'withdraw';
  assetId: string;
  assetName: string;
  amount: number;
  price: number;
  total: number;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
}

export interface LiquidityPosition {
  id: string;
  poolName: string;
  assetId: string;
  liquidity: number;
  poolShare: number;
  apyFromFees: number;
  unclaimedFees: number;
}

export interface Loan {
  id: string;
  collateralAssetId: string;
  collateralAmount: number;
  collateralValue: number;
  borrowedAmount: number;
  interestRate: number;
  healthFactor: number;
  startDate: Date;
}

export const mockAssets: RWAAsset[] = [
  {
    id: 'manhattan-re',
    name: 'Manhattan Real Estate Token',
    symbol: 'MRE',
    type: 'Real Estate',
    price: 2156,
    priceChange24h: 2.3,
    apy: 8.2,
    tvl: 1250000,
    volume24h: 450000,
    marketCap: 4500000,
    totalSupply: 2087,
    description: 'Tokenized ownership of premium Manhattan commercial real estate portfolio including 3 Class A office buildings in Midtown.',
    contractAddress: '0x1234...5678',
    aiPredictedPrice: 2280,
    aiConfidence: 85,
    aiRecommendation: 'BUY',
    aiReasoning: 'Strong rental income growth and low vacancy rates support price appreciation. NYC commercial real estate showing resilience.',
    riskScore: 'Low',
    kycRequired: true,
    accreditedOnly: true,
    jurisdictionRestrictions: ['Iran', 'North Korea', 'Cuba'],
    distributionFrequency: 'Monthly',
    nextDistribution: '2024-02-01',
    image: '/placeholder.svg'
  },
  {
    id: 'treasury-1y',
    name: 'US Treasury 1Y Bond',
    symbol: 'UST1Y',
    type: 'Bond',
    price: 98.50,
    priceChange24h: -0.5,
    apy: 4.5,
    tvl: 890000,
    volume24h: 280000,
    marketCap: 2100000,
    totalSupply: 21320,
    description: 'Tokenized US Treasury bonds with 1-year maturity. Backed 1:1 by actual Treasury securities held in custody.',
    contractAddress: '0x2345...6789',
    aiPredictedPrice: 99.20,
    aiConfidence: 92,
    aiRecommendation: 'HOLD',
    aiReasoning: 'Stable yield with minimal risk. Fed policy suggests rates will remain elevated through Q2.',
    riskScore: 'Low',
    kycRequired: true,
    accreditedOnly: false,
    jurisdictionRestrictions: ['Iran', 'North Korea'],
    distributionFrequency: 'Quarterly',
    nextDistribution: '2024-03-15',
    image: '/placeholder.svg'
  },
  {
    id: 'invoice-pool',
    name: 'Invoice Factoring Pool',
    symbol: 'INVP',
    type: 'Invoice',
    price: 1050,
    priceChange24h: 1.1,
    apy: 6.8,
    tvl: 620000,
    volume24h: 95000,
    marketCap: 1050000,
    totalSupply: 1000,
    description: 'Diversified pool of factored invoices from Fortune 500 companies. Short-duration, high-quality receivables.',
    contractAddress: '0x3456...7890',
    aiPredictedPrice: 1065,
    aiConfidence: 78,
    aiRecommendation: 'BUY',
    aiReasoning: 'Strong credit quality of underlying invoices. Default rates near historic lows.',
    riskScore: 'Medium',
    kycRequired: true,
    accreditedOnly: true,
    jurisdictionRestrictions: [],
    distributionFrequency: 'Weekly',
    nextDistribution: '2024-01-22',
    image: '/placeholder.svg'
  },
  {
    id: 'gold-token',
    name: 'Tokenized Gold Reserve',
    symbol: 'TGLD',
    type: 'Commodity',
    price: 1985,
    priceChange24h: 0.8,
    apy: 0,
    tvl: 980000,
    volume24h: 320000,
    marketCap: 3200000,
    totalSupply: 1612,
    description: 'Each token represents 1 troy ounce of gold stored in Swiss vaults. Fully audited and redeemable.',
    contractAddress: '0x4567...8901',
    aiPredictedPrice: 2050,
    aiConfidence: 72,
    aiRecommendation: 'BUY',
    aiReasoning: 'Geopolitical uncertainty and inflation concerns support gold prices. Central bank buying remains strong.',
    riskScore: 'Low',
    kycRequired: true,
    accreditedOnly: false,
    jurisdictionRestrictions: [],
    distributionFrequency: 'N/A',
    nextDistribution: 'N/A',
    image: '/placeholder.svg'
  },
  {
    id: 'equipment-lease',
    name: 'Heavy Equipment Lease Fund',
    symbol: 'HELF',
    type: 'Equipment',
    price: 525,
    priceChange24h: -1.2,
    apy: 9.5,
    tvl: 420000,
    volume24h: 45000,
    marketCap: 525000,
    totalSupply: 1000,
    description: 'Fund owning construction and industrial equipment leased to major contractors on long-term agreements.',
    contractAddress: '0x5678...9012',
    aiPredictedPrice: 510,
    aiConfidence: 65,
    aiRecommendation: 'HOLD',
    aiReasoning: 'Infrastructure spending supports demand but rising rates pressure valuations.',
    riskScore: 'Medium',
    kycRequired: true,
    accreditedOnly: true,
    jurisdictionRestrictions: [],
    distributionFrequency: 'Monthly',
    nextDistribution: '2024-02-01',
    image: '/placeholder.svg'
  },
  {
    id: 'london-re',
    name: 'London Prime Property Fund',
    symbol: 'LPPF',
    type: 'Real Estate',
    price: 3450,
    priceChange24h: 1.5,
    apy: 7.2,
    tvl: 1800000,
    volume24h: 380000,
    marketCap: 5520000,
    totalSupply: 1600,
    description: 'Portfolio of prime residential properties in Central London. Strong rental yields and capital appreciation.',
    contractAddress: '0x6789...0123',
    aiPredictedPrice: 3580,
    aiConfidence: 80,
    aiRecommendation: 'BUY',
    aiReasoning: 'Post-Brexit recovery and international demand driving London property values.',
    riskScore: 'Low',
    kycRequired: true,
    accreditedOnly: true,
    jurisdictionRestrictions: ['Russia', 'Belarus'],
    distributionFrequency: 'Quarterly',
    nextDistribution: '2024-03-31',
    image: '/placeholder.svg'
  },
  {
    id: 'corp-bonds',
    name: 'Investment Grade Corp Bonds',
    symbol: 'IGCB',
    type: 'Bond',
    price: 102.25,
    priceChange24h: 0.3,
    apy: 5.8,
    tvl: 750000,
    volume24h: 190000,
    marketCap: 1840000,
    totalSupply: 18000,
    description: 'Diversified portfolio of AAA to A rated corporate bonds from major US companies.',
    contractAddress: '0x7890...1234',
    aiPredictedPrice: 103.50,
    aiConfidence: 88,
    aiRecommendation: 'HOLD',
    aiReasoning: 'Solid credit quality with attractive spread over treasuries. Limited upside in current rate environment.',
    riskScore: 'Low',
    kycRequired: true,
    accreditedOnly: false,
    jurisdictionRestrictions: [],
    distributionFrequency: 'Monthly',
    nextDistribution: '2024-02-15',
    image: '/placeholder.svg'
  },
  {
    id: 'agri-land',
    name: 'Midwest Agricultural Land',
    symbol: 'AGRL',
    type: 'Real Estate',
    price: 875,
    priceChange24h: 0.2,
    apy: 4.2,
    tvl: 560000,
    volume24h: 35000,
    marketCap: 875000,
    totalSupply: 1000,
    description: 'Productive farmland in Iowa and Illinois leased to established agricultural operators.',
    contractAddress: '0x8901...2345',
    aiPredictedPrice: 890,
    aiConfidence: 75,
    aiRecommendation: 'HOLD',
    aiReasoning: 'Stable cash flows from long-term leases. Land values historically resilient.',
    riskScore: 'Low',
    kycRequired: true,
    accreditedOnly: false,
    jurisdictionRestrictions: [],
    distributionFrequency: 'Annually',
    nextDistribution: '2024-12-01',
    image: '/placeholder.svg'
  },
  {
    id: 'music-royalties',
    name: 'Music Royalty Income Fund',
    symbol: 'MRIF',
    type: 'Invoice',
    price: 156,
    priceChange24h: 3.5,
    apy: 11.2,
    tvl: 340000,
    volume24h: 68000,
    marketCap: 468000,
    totalSupply: 3000,
    description: 'Portfolio of music streaming royalties from top 100 Billboard artists.',
    contractAddress: '0x9012...3456',
    aiPredictedPrice: 165,
    aiConfidence: 70,
    aiRecommendation: 'BUY',
    aiReasoning: 'Streaming growth continues to accelerate. Catalog values at all-time highs.',
    riskScore: 'Medium',
    kycRequired: true,
    accreditedOnly: true,
    jurisdictionRestrictions: [],
    distributionFrequency: 'Monthly',
    nextDistribution: '2024-02-01',
    image: '/placeholder.svg'
  },
  {
    id: 'silver-token',
    name: 'Tokenized Silver Bullion',
    symbol: 'TSLV',
    type: 'Commodity',
    price: 23.45,
    priceChange24h: -0.8,
    apy: 0,
    tvl: 280000,
    volume24h: 95000,
    marketCap: 562800,
    totalSupply: 24000,
    description: 'Each token backed by 1 oz of silver bullion stored in LBMA-approved vaults.',
    contractAddress: '0x0123...4567',
    aiPredictedPrice: 25.00,
    aiConfidence: 68,
    aiRecommendation: 'BUY',
    aiReasoning: 'Industrial demand growth from solar panels and electronics. Undervalued relative to gold.',
    riskScore: 'Medium',
    kycRequired: true,
    accreditedOnly: false,
    jurisdictionRestrictions: [],
    distributionFrequency: 'N/A',
    nextDistribution: 'N/A',
    image: '/placeholder.svg'
  }
];

export const mockUserHoldings: UserHolding[] = [
  {
    assetId: 'manhattan-re',
    quantity: 10,
    avgBuyPrice: 2100,
    currentValue: 21560,
    unrealizedPnL: 560,
    unrealizedPnLPercent: 2.67
  },
  {
    assetId: 'treasury-1y',
    quantity: 50,
    avgBuyPrice: 99.00,
    currentValue: 4925,
    unrealizedPnL: -25,
    unrealizedPnLPercent: -0.51
  },
  {
    assetId: 'invoice-pool',
    quantity: 5,
    avgBuyPrice: 1020,
    currentValue: 5250,
    unrealizedPnL: 150,
    unrealizedPnLPercent: 2.94
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: 'tx1',
    type: 'buy',
    assetId: 'manhattan-re',
    assetName: 'Manhattan Real Estate Token',
    amount: 5,
    price: 2100,
    total: 10500,
    timestamp: new Date('2024-01-15T10:30:00'),
    status: 'completed'
  },
  {
    id: 'tx2',
    type: 'buy',
    assetId: 'treasury-1y',
    assetName: 'US Treasury 1Y Bond',
    amount: 50,
    price: 99.00,
    total: 4950,
    timestamp: new Date('2024-01-14T14:20:00'),
    status: 'completed'
  },
  {
    id: 'tx3',
    type: 'yield',
    assetId: 'manhattan-re',
    assetName: 'Manhattan Real Estate Token',
    amount: 0,
    price: 0,
    total: 147.50,
    timestamp: new Date('2024-01-10T00:00:00'),
    status: 'completed'
  },
  {
    id: 'tx4',
    type: 'buy',
    assetId: 'manhattan-re',
    assetName: 'Manhattan Real Estate Token',
    amount: 5,
    price: 2100,
    total: 10500,
    timestamp: new Date('2024-01-08T09:15:00'),
    status: 'completed'
  },
  {
    id: 'tx5',
    type: 'buy',
    assetId: 'invoice-pool',
    assetName: 'Invoice Factoring Pool',
    amount: 5,
    price: 1020,
    total: 5100,
    timestamp: new Date('2024-01-05T16:45:00'),
    status: 'completed'
  }
];

export const mockLiquidityPositions: LiquidityPosition[] = [
  {
    id: 'lp1',
    poolName: 'MRE/USDC',
    assetId: 'manhattan-re',
    liquidity: 12500,
    poolShare: 2.5,
    apyFromFees: 3.2,
    unclaimedFees: 45.80
  },
  {
    id: 'lp2',
    poolName: 'TGLD/USDC',
    assetId: 'gold-token',
    liquidity: 8200,
    poolShare: 1.8,
    apyFromFees: 2.8,
    unclaimedFees: 28.50
  }
];

export const mockLoans: Loan[] = [
  {
    id: 'loan1',
    collateralAssetId: 'manhattan-re',
    collateralAmount: 3,
    collateralValue: 6468,
    borrowedAmount: 2500,
    interestRate: 8.5,
    healthFactor: 1.72,
    startDate: new Date('2024-01-10')
  }
];

export const platformStats = {
  totalValueLocked: 4200000,
  totalAssets: 12,
  activeTraders: 1450,
  totalVolume: 8700000,
  volume24h: 1250000,
  transactions24h: 342,
  uniqueTraders24h: 89,
  averageApy: 6.2
};

export const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatNumber = (value: number, decimals: number = 2): string => {
  return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

export const formatPercent = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

export const truncateAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
