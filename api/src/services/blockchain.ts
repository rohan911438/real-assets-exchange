import { ethers } from 'ethers';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';

// Import contract ABIs (you'll need to generate these from your contracts)
import DEXCoreABI from '../abis/DEXCore.json';
import RWAFactoryABI from '../abis/RWAFactory.json';
import ComplianceRegistryABI from '../abis/ComplianceRegistry.json';
import LendingProtocolABI from '../abis/LendingProtocol.json';
import YieldDistributorABI from '../abis/YieldDistributor.json';
import PriceOracleABI from '../abis/PriceOracle.json';
import RWATokenABI from '../abis/RWAToken.json';

export class BlockchainServiceClass {
  private provider: ethers.Provider | null = null;
  private signer: ethers.Signer | null = null;
  
  // Contract instances
  public dexCore: ethers.Contract | null = null;
  public factory: ethers.Contract | null = null;
  public compliance: ethers.Contract | null = null;
  public lending: ethers.Contract | null = null;
  public yieldDistributor: ethers.Contract | null = null;
  public priceOracle: ethers.Contract | null = null;

  // Contract addresses
  private addresses = {
    dexCore: process.env.DEX_CORE_ADDRESS!,
    factory: process.env.RWA_FACTORY_ADDRESS!,
    compliance: process.env.COMPLIANCE_REGISTRY_ADDRESS!,
    lending: process.env.LENDING_PROTOCOL_ADDRESS!,
    yieldDistributor: process.env.YIELD_DISTRIBUTOR_ADDRESS!,
    priceOracle: process.env.PRICE_ORACLE_ADDRESS!,
  };

  async initialize() {
    try {
      // Initialize provider
      const rpcUrl = process.env.NODE_ENV === 'production' 
        ? process.env.MANTLE_RPC_URL 
        : process.env.MANTLE_TESTNET_RPC_URL;

      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Test connection
      await this.provider.getBlockNumber();
      logger.info('Connected to blockchain');

      // Initialize signer if private key is provided
      if (process.env.PRIVATE_KEY) {
        this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
        logger.info('Wallet initialized');
      }

      // Initialize contract instances
      this.initializeContracts();

      // Start event listeners
      this.setupEventListeners();

    } catch (error) {
      logger.error('Failed to initialize blockchain service:', error);
      throw error;
    }
  }

  private initializeContracts() {
    if (!this.provider) throw new Error('Provider not initialized');

    this.dexCore = new ethers.Contract(
      this.addresses.dexCore,
      DEXCoreABI,
      this.signer || this.provider
    );

    this.factory = new ethers.Contract(
      this.addresses.factory,
      RWAFactoryABI,
      this.signer || this.provider
    );

    this.compliance = new ethers.Contract(
      this.addresses.compliance,
      ComplianceRegistryABI,
      this.signer || this.provider
    );

    this.lending = new ethers.Contract(
      this.addresses.lending,
      LendingProtocolABI,
      this.signer || this.provider
    );

    this.yieldDistributor = new ethers.Contract(
      this.addresses.yieldDistributor,
      YieldDistributorABI,
      this.signer || this.provider
    );

    this.priceOracle = new ethers.Contract(
      this.addresses.priceOracle,
      PriceOracleABI,
      this.signer || this.provider
    );

    logger.info('Smart contracts initialized');
  }

  private setupEventListeners() {
    if (!this.dexCore || !this.factory) return;

    // Listen to DEX events
    this.dexCore.on('Swap', (user, tokenIn, tokenOut, amountIn, amountOut, fee, event) => {
      logger.info('Swap event detected:', {
        user, tokenIn, tokenOut, amountIn: amountIn.toString(), 
        amountOut: amountOut.toString(), fee: fee.toString(),
        txHash: event.transactionHash
      });
      // Add to event processing queue
      this.processSwapEvent(user, tokenIn, tokenOut, amountIn, amountOut, fee, event);
    });

    // Listen to new token creation events
    this.factory.on('TokenCreated', (tokenAddress, creator, name, symbol, assetType, event) => {
      logger.info('New RWA token created:', {
        tokenAddress, creator, name, symbol, assetType,
        txHash: event.transactionHash
      });
      this.processTokenCreatedEvent(tokenAddress, creator, name, symbol, assetType, event);
    });

    logger.info('Event listeners set up');
  }

  // Contract interaction methods
  async getAssetInfo(tokenAddress: string) {
    try {
      const tokenContract = new ethers.Contract(tokenAddress, RWATokenABI, this.provider);
      
      const [name, symbol, decimals, totalSupply, assetInfo] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.decimals(),
        tokenContract.totalSupply(),
        tokenContract.getAssetInfo()
      ]);

      return {
        address: tokenAddress,
        name,
        symbol,
        decimals,
        totalSupply: totalSupply.toString(),
        assetType: assetInfo[0],
        totalAssetValue: assetInfo[1].toString(),
        yieldRate: assetInfo[2].toString(),
        maturityDate: assetInfo[3].toString(),
        jurisdiction: assetInfo[4],
        assetURI: assetInfo[5]
      };
    } catch (error) {
      logger.error('Error getting asset info:', error);
      throw createError.blockchain('Failed to fetch asset information');
    }
  }

  async getUserBalance(tokenAddress: string, userAddress: string): Promise<string> {
    try {
      const tokenContract = new ethers.Contract(tokenAddress, RWATokenABI, this.provider);
      const balance = await tokenContract.balanceOf(userAddress);
      return balance.toString();
    } catch (error) {
      logger.error('Error getting user balance:', error);
      throw createError.blockchain('Failed to fetch user balance');
    }
  }

  async getPoolInfo(tokenAddress: string) {
    try {
      if (!this.dexCore) throw new Error('DEX contract not initialized');
      
      const poolInfo = await this.dexCore.getPoolInfo(tokenAddress);
      
      return {
        reserve0: poolInfo.reserve0.toString(),
        reserve1: poolInfo.reserve1.toString(),
        totalLiquidity: poolInfo.totalLiquidity.toString(),
        lastPrice: poolInfo.lastPrice.toString(),
        lastUpdateTime: poolInfo.lastUpdateTime.toString()
      };
    } catch (error) {
      logger.error('Error getting pool info:', error);
      throw createError.blockchain('Failed to fetch pool information');
    }
  }

  async previewSwap(tokenIn: string, tokenOut: string, amountIn: string) {
    try {
      if (!this.dexCore) throw new Error('DEX contract not initialized');
      
      const preview = await this.dexCore.previewSwap(tokenIn, tokenOut, amountIn);
      
      return {
        amountOut: preview.amountOut.toString(),
        priceImpact: preview.priceImpact.toString(),
        fee: preview.fee.toString()
      };
    } catch (error) {
      logger.error('Error previewing swap:', error);
      throw createError.blockchain('Failed to preview swap');
    }
  }

  async getPrice(tokenAddress: string): Promise<{ price: string; timestamp: string }> {
    try {
      if (!this.priceOracle) throw new Error('Price oracle not initialized');
      
      const priceData = await this.priceOracle.getPrice(tokenAddress);
      
      return {
        price: priceData[0].toString(),
        timestamp: priceData[1].toString()
      };
    } catch (error) {
      logger.error('Error getting price:', error);
      throw createError.blockchain('Failed to fetch price');
    }
  }

  async checkCompliance(userAddress: string, tokenAddress: string): Promise<boolean> {
    try {
      if (!this.compliance) throw new Error('Compliance contract not initialized');
      
      // Get asset jurisdiction and compliance requirements
      const assetInfo = await this.getAssetInfo(tokenAddress);
      const isVerified = await this.compliance.checkCompliance(
        userAddress,
        assetInfo.jurisdiction,
        false // requiresAccredited - determine based on asset type
      );
      
      return isVerified;
    } catch (error) {
      logger.error('Error checking compliance:', error);
      return false;
    }
  }

  // Event processing methods
  private async processSwapEvent(user: string, tokenIn: string, tokenOut: string, amountIn: any, amountOut: any, fee: any, event: any) {
    // Add to database/queue for processing
    // This would update trade history, volume stats, etc.
  }

  private async processTokenCreatedEvent(tokenAddress: string, creator: string, name: string, symbol: string, assetType: any, event: any) {
    // Add new token to database
    // Update asset registry
  }

  // Gas estimation helpers
  async estimateGas(contractMethod: any, ...args: any[]) {
    try {
      const gasEstimate = await contractMethod.estimateGas(...args);
      // Add 20% buffer for safety
      return gasEstimate.mul(120).div(100);
    } catch (error) {
      logger.error('Gas estimation failed:', error);
      throw createError.blockchain('Failed to estimate gas');
    }
  }

  // Transaction helpers
  async waitForTransaction(txHash: string) {
    try {
      if (!this.provider) throw new Error('Provider not initialized');
      
      const receipt = await this.provider.waitForTransactionReceipt(txHash);
      return receipt;
    } catch (error) {
      logger.error('Error waiting for transaction:', error);
      throw createError.blockchain('Transaction failed');
    }
  }
}

export const BlockchainService = new BlockchainServiceClass();