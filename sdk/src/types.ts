// Type definitions for RWA DEX SDK

export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  contracts: {
    dexCore: string;
    factory: string;
    compliance: string;
    lending: string;
    yieldDistributor: string;
    priceOracle: string;
  };
  blockExplorer?: string;
}

export interface SDKConfig {
  network: 'mantle-mainnet' | 'mantle-testnet' | NetworkConfig;
  provider?: any; // ethers.Provider
  privateKey?: string;
  apiBaseUrl?: string;
  aiEngineUrl?: string;
  apiKey?: string;
}

export interface Asset {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  assetType: AssetType;
  totalAssetValue: string;
  yieldRate: number;
  maturityDate: string;
  jurisdiction: string;
  assetURI: string;
  currentPrice: string;
  apy: number;
  tvl: string;
  liquidity: {
    reserve0: string;
    reserve1: string;
    totalLiquidity: string;
    lastPrice: string;
  };
}

export enum AssetType {
  RealEstate = 0,
  Bond = 1,
  Invoice = 2,
  Commodity = 3,
  Equipment = 4
}

export interface AssetFilters {
  type?: string;
  minAPY?: number;
  maxAPY?: number;
  minPrice?: number;
  maxPrice?: number;
  jurisdiction?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  minAmountOut: string;
  slippage?: number;
  deadline?: number;
}

export interface SwapPreview {
  amountOut: string;
  priceImpact: string;
  fee: string;
  minimumAmountOut: string;
  route: string[];
}

export interface LiquidityParams {
  token: string;
  amountToken: string;
  amountUSDC: string;
  minLiquidity?: string;
  deadline?: number;
}

export interface RemoveLiquidityParams {
  token: string;
  liquidity: string;
  minAmount0?: string;
  minAmount1?: string;
  deadline?: number;
}

export interface PortfolioAsset extends Asset {
  balance: string;
  value: string;
  claimableYield: string;
  performance24h: number;
}

export interface Portfolio {
  totalValue: string;
  totalYield: string;
  assets: PortfolioAsset[];
  performance: {
    daily: number;
    weekly: number;
    monthly: number;
    allTime: number;
  };
}

export interface ComplianceStatus {
  isVerified: boolean;
  level: string;
  jurisdiction: string;
  canTrade: boolean;
  restrictions: string[];
}

export interface CollateralParams {
  token: string;
  amount: string;
}

export interface BorrowParams {
  positionId: number;
  amount: string;
}

export interface LendingPosition {
  id: number;
  collateralToken: string;
  collateralAmount: string;
  borrowedAmount: string;
  healthFactor: string;
  liquidationPrice: string;
  interestRate: number;
}

export interface AIPrediction {
  predictedPrice: number;
  confidence: number;
  recommendation: 'BUY' | 'HOLD' | 'SELL';
  reasoning: string;
  riskScore: number;
  timestamp: string;
}

export interface TransactionOptions {
  gasLimit?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

export interface TransactionResponse {
  hash: string;
  wait: () => Promise<any>;
}

export interface EventFilter {
  fromBlock?: number;
  toBlock?: number;
  address?: string;
  topics?: string[];
}

export interface RWAEvent {
  event: string;
  address: string;
  blockNumber: number;
  transactionHash: string;
  args: any;
  timestamp: number;
}

// API Response types
export interface APIResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: any;
  } | null;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Error types
export class RWAError extends Error {
  public code: string;
  public details?: any;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', details?: any) {
    super(message);
    this.name = 'RWAError';
    this.code = code;
    this.details = details;
  }
}

export class ContractError extends RWAError {
  constructor(message: string, details?: any) {
    super(message, 'CONTRACT_ERROR', details);
    this.name = 'ContractError';
  }
}

export class APIError extends RWAError {
  constructor(message: string, details?: any) {
    super(message, 'API_ERROR', details);
    this.name = 'APIError';
  }
}

export class NetworkError extends RWAError {
  constructor(message: string, details?: any) {
    super(message, 'NETWORK_ERROR', details);
    this.name = 'NetworkError';
  }
}