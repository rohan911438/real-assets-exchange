import { ethers } from 'ethers';
import axios, { AxiosInstance } from 'axios';
import { getWalletManager, WalletManager, WalletState } from './wallet';
import { DEPLOYED_ABIS } from './abis';

import {
  SDKConfig,
  NetworkConfig,
  Asset,
  AssetFilters,
  SwapParams,
  SwapPreview,
  LiquidityParams,
  RemoveLiquidityParams,
  Portfolio,
  ComplianceStatus,
  CollateralParams,
  BorrowParams,
  LendingPosition,
  AIPrediction,
  TransactionOptions,
  TransactionResponse,
  RWAEvent,
  EventFilter,
  APIResponse,
  RWAError,
  ContractError,
  APIError,
  NetworkError
} from './types';
import { NETWORKS, ABIS, DEFAULT_SLIPPAGE, DEFAULT_DEADLINE } from './constants';

export class RWADex {
  private provider: ethers.Provider;
  private signer?: ethers.Signer;
  private network: NetworkConfig;
  private api: AxiosInstance;
  private aiApi: AxiosInstance;
  private walletManager: WalletManager;
  
  // Contract instances
  private contracts: {
    dexCore?: ethers.Contract;
    factory?: ethers.Contract;
    compliance?: ethers.Contract;
    lending?: ethers.Contract;
    yieldDistributor?: ethers.Contract;
    priceOracle?: ethers.Contract;
  } = {};

  constructor(config: SDKConfig) {
    // Initialize network configuration
    if (typeof config.network === 'string') {
      this.network = NETWORKS[config.network];
      if (!this.network) {
        throw new RWAError(`Unsupported network: ${config.network}`, 'INVALID_NETWORK');
      }
    } else {
      this.network = config.network;
    }

    // Initialize provider
    if (config.provider) {
      this.provider = config.provider;
    } else {
      this.provider = new ethers.JsonRpcProvider(this.network.rpcUrl);
    }

    // Initialize signer if private key provided
    if (config.privateKey) {
      this.signer = new ethers.Wallet(config.privateKey, this.provider);
    }

    // Initialize API clients
    this.api = axios.create({
      baseURL: config.apiBaseUrl || 'http://localhost:5000/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
      }
    });

    this.aiApi = axios.create({
      baseURL: config.aiEngineUrl || 'http://localhost:8001/api/ai',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
      }
    });

    // Initialize wallet manager
    this.walletManager = getWalletManager();
    
    // Subscribe to wallet changes
    this.walletManager.subscribe(this.handleWalletChange.bind(this));

    // Initialize contracts
    this.initializeContracts();
  }

  private initializeContracts(): void {
    const signerOrProvider = this.signer || this.provider;

    this.contracts.dexCore = new ethers.Contract(
      this.network.contracts.dexCore,
      DEPLOYED_ABIS.DEXCore,
      signerOrProvider
    );

    this.contracts.compliance = new ethers.Contract(
      this.network.contracts.compliance,
      DEPLOYED_ABIS.ComplianceRegistry,
      signerOrProvider
    );

    this.contracts.lending = new ethers.Contract(
      this.network.contracts.lending,
      DEPLOYED_ABIS.LendingProtocol || ABIS.LendingProtocol,
      signerOrProvider
    );

    this.contracts.priceOracle = new ethers.Contract(
      this.network.contracts.priceOracle,
      DEPLOYED_ABIS.PriceOracle,
      signerOrProvider
    );
  }

  /**
   * Handle wallet state changes
   */
  private handleWalletChange(state: WalletState): void {
    if (state.isConnected && state.provider && state.signer) {
      this.provider = state.provider;
      this.signer = state.signer;
      this.initializeContracts();
    } else {
      this.signer = undefined;
      this.initializeContracts();
    }
  }

  // Wallet Management Methods
  
  /**
   * Connect to MetaMask wallet
   */
  public async connectWallet(): Promise<WalletState> {
    try {
      const walletState = await this.walletManager.connect();
      return walletState;
    } catch (error: any) {
      throw new RWAError(`Failed to connect wallet: ${(error as Error)?.message || 'Unknown error'}`, 'WALLET_CONNECTION_FAILED');
    }
  }

  /**
   * Disconnect wallet
   */
  public async disconnectWallet(): Promise<void> {
    await this.walletManager.disconnect();
  }

  /**
   * Get current wallet state
   */
  public getWalletState(): WalletState {
    return this.walletManager.getState();
  }

  /**
   * Check if wallet is connected and on correct network
   */
  public isWalletReady(): boolean {
    const state = this.walletManager.getState();
    return state.isConnected && state.isCorrectNetwork;
  }

  /**
   * Switch to Mantle Sepolia network
   */
  public async switchToMantleSepolia(): Promise<void> {
    await this.walletManager.switchToMantleSepolia();
  }

  // Asset Management Methods
  async getAsset(tokenAddress: string): Promise<Asset> {
    try {
      const response = await this.api.get<APIResponse<Asset>>(`/assets/${tokenAddress}`);
      
      if (!response.data.success || !response.data.data) {
        throw new APIError(response.data.error?.message || 'Failed to fetch asset');
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`API request failed: ${error.message}`);
      }
      throw error;
    }
  }

  async listAssets(filters?: AssetFilters): Promise<{ assets: Asset[]; pagination: any }> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await this.api.get<APIResponse<{ assets: Asset[]; pagination: any }>>(
        `/assets?${params.toString()}`
      );

      if (!response.data.success || !response.data.data) {
        throw new APIError(response.data.error?.message || 'Failed to fetch assets');
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`API request failed: ${error.message}`);
      }
      throw error;
    }
  }

  // Trading Methods
  async previewSwap(params: SwapParams): Promise<SwapPreview> {
    try {
      if (!this.contracts.dexCore) {
        throw new ContractError('DEX contract not initialized');
      }

      const result = await this.contracts.dexCore.previewSwap(
        params.tokenIn,
        params.tokenOut,
        params.amountIn
      );

      const slippage = params.slippage || DEFAULT_SLIPPAGE;
      const minAmountOut = ethers.parseUnits(
        (parseFloat(ethers.formatUnits(result.amountOut)) * (1 - slippage / 100)).toString(),
        18
      );

      return {
        amountOut: result.amountOut.toString(),
        priceImpact: result.priceImpact.toString(),
        fee: result.fee.toString(),
        minimumAmountOut: minAmountOut.toString(),
        route: [params.tokenIn, params.tokenOut]
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new ContractError(`Swap preview failed: ${error.message}`);
      }
      throw error;
    }
  }

  async swap(params: SwapParams, options?: TransactionOptions): Promise<TransactionResponse> {
    try {
      if (!this.signer) {
        throw new RWAError('Signer required for transactions', 'NO_SIGNER');
      }

      if (!this.contracts.dexCore) {
        throw new ContractError('DEX contract not initialized');
      }

      // Check token approvals first
      await this.ensureTokenApproval(params.tokenIn, params.amountIn);

      const deadline = Math.floor(Date.now() / 1000) + (params.deadline || DEFAULT_DEADLINE);
      
      const tx = await this.contracts.dexCore.swap(
        params.tokenIn,
        params.tokenOut,
        params.amountIn,
        params.minAmountOut,
        {
          ...options,
          ...(deadline && { deadline })
        }
      );

      return {
        hash: tx.hash,
        wait: () => tx.wait()
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new ContractError(`Swap failed: ${error.message}`);
      }
      throw error;
    }
  }

  // Liquidity Methods
  async addLiquidity(params: LiquidityParams, options?: TransactionOptions): Promise<TransactionResponse> {
    try {
      if (!this.signer) {
        throw new RWAError('Signer required for transactions', 'NO_SIGNER');
      }

      if (!this.contracts.dexCore) {
        throw new ContractError('DEX contract not initialized');
      }

      // Ensure token approvals
      await this.ensureTokenApproval(params.token, params.amountToken);
      await this.ensureTokenApproval(this.getUSDCAddress(), params.amountUSDC);

      const tx = await this.contracts.dexCore.addLiquidity(
        params.token,
        params.amountToken,
        params.amountUSDC,
        params.minLiquidity || '0',
        options
      );

      return {
        hash: tx.hash,
        wait: () => tx.wait()
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new ContractError(`Add liquidity failed: ${error.message}`);
      }
      throw error;
    }
  }

  async removeLiquidity(params: RemoveLiquidityParams, options?: TransactionOptions): Promise<TransactionResponse> {
    try {
      if (!this.signer) {
        throw new RWAError('Signer required for transactions', 'NO_SIGNER');
      }

      if (!this.contracts.dexCore) {
        throw new ContractError('DEX contract not initialized');
      }

      const tx = await this.contracts.dexCore.removeLiquidity(
        params.token,
        params.liquidity,
        params.minAmount0 || '0',
        params.minAmount1 || '0',
        options
      );

      return {
        hash: tx.hash,
        wait: () => tx.wait()
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new ContractError(`Remove liquidity failed: ${error.message}`);
      }
      throw error;
    }
  }

  // Portfolio Methods
  async getPortfolio(address: string): Promise<Portfolio> {
    try {
      const response = await this.api.get<APIResponse<Portfolio>>(`/portfolio/${address}`);

      if (!response.data.success || !response.data.data) {
        throw new APIError(response.data.error?.message || 'Failed to fetch portfolio');
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`API request failed: ${error.message}`);
      }
      throw error;
    }
  }

  async claimYield(tokenAddress: string, options?: TransactionOptions): Promise<TransactionResponse> {
    try {
      if (!this.signer) {
        throw new RWAError('Signer required for transactions', 'NO_SIGNER');
      }

      const tokenContract = new ethers.Contract(tokenAddress, ABIS.RWAToken, this.signer);
      const tx = await tokenContract.claimYield(options);

      return {
        hash: tx.hash,
        wait: () => tx.wait()
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new ContractError(`Claim yield failed: ${error.message}`);
      }
      throw error;
    }
  }

  // Compliance Methods
  async checkCompliance(address: string): Promise<ComplianceStatus> {
    try {
      if (!this.contracts.compliance) {
        throw new ContractError('Compliance contract not initialized');
      }

      const complianceData = await this.contracts.compliance.complianceData(address);
      
      return {
        isVerified: complianceData.isVerified,
        level: complianceData.level.toString(),
        jurisdiction: complianceData.jurisdiction,
        canTrade: complianceData.isVerified && Date.now() / 1000 < complianceData.expiryTimestamp,
        restrictions: [] // Would be populated based on jurisdiction and level
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new ContractError(`Compliance check failed: ${error.message}`);
      }
      throw error;
    }
  }

  // Lending Methods
  async depositCollateral(params: CollateralParams, options?: TransactionOptions): Promise<TransactionResponse> {
    try {
      if (!this.signer) {
        throw new RWAError('Signer required for transactions', 'NO_SIGNER');
      }

      if (!this.contracts.lending) {
        throw new ContractError('Lending contract not initialized');
      }

      await this.ensureTokenApproval(params.token, params.amount);

      const tx = await this.contracts.lending.depositCollateral(
        params.token,
        params.amount,
        options
      );

      return {
        hash: tx.hash,
        wait: () => tx.wait()
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new ContractError(`Deposit collateral failed: ${error.message}`);
      }
      throw error;
    }
  }

  async borrow(params: BorrowParams, options?: TransactionOptions): Promise<TransactionResponse> {
    try {
      if (!this.signer) {
        throw new RWAError('Signer required for transactions', 'NO_SIGNER');
      }

      if (!this.contracts.lending) {
        throw new ContractError('Lending contract not initialized');
      }

      const tx = await this.contracts.lending.borrow(
        params.positionId,
        params.amount,
        options
      );

      return {
        hash: tx.hash,
        wait: () => tx.wait()
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new ContractError(`Borrow failed: ${error.message}`);
      }
      throw error;
    }
  }

  async getLendingPosition(address: string, positionId: number): Promise<LendingPosition> {
    try {
      if (!this.contracts.lending) {
        throw new ContractError('Lending contract not initialized');
      }

      const position = await this.contracts.lending.getPosition(address, positionId);
      const healthFactor = await this.contracts.lending.calculateHealthFactor(
        address,
        positionId,
        position.borrowedAmount
      );

      return {
        id: positionId,
        collateralToken: position.collateralToken,
        collateralAmount: position.collateralAmount.toString(),
        borrowedAmount: position.borrowedAmount.toString(),
        healthFactor: healthFactor.toString(),
        liquidationPrice: '0', // Would need calculation
        interestRate: 600 // Would come from contract
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new ContractError(`Get lending position failed: ${error.message}`);
      }
      throw error;
    }
  }

  // AI Integration Methods
  async getAIPrediction(tokenAddress: string): Promise<AIPrediction> {
    try {
      // First get asset data
      const asset = await this.getAsset(tokenAddress);
      
      const response = await this.aiApi.post<AIPrediction>('/predict-price', {
        token_address: tokenAddress,
        name: asset.name,
        symbol: asset.symbol,
        asset_type: asset.assetType,
        total_asset_value: parseFloat(asset.totalAssetValue),
        current_price: parseFloat(asset.currentPrice),
        yield_rate: asset.yieldRate,
        // Add more fields as needed
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`AI prediction request failed: ${error.message}`);
      }
      throw error;
    }
  }

  // Event Listening Methods
  async getEvents(
    eventName: string,
    contract: 'dexCore' | 'factory' | 'lending',
    filter?: EventFilter
  ): Promise<RWAEvent[]> {
    try {
      const contractInstance = this.contracts[contract];
      if (!contractInstance) {
        throw new ContractError(`${contract} contract not initialized`);
      }

      const eventFilter = contractInstance.filters[eventName]();
      const events = await contractInstance.queryFilter(
        eventFilter,
        filter?.fromBlock,
        filter?.toBlock
      );

      return events.map(event => ({
        event: (event as any)?.eventName || eventName,
        address: event.address,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        args: (event as any)?.args || {},
        timestamp: 0 // Would need to fetch block timestamp
      }));
    } catch (error) {
      if (error instanceof Error) {
        throw new ContractError(`Get events failed: ${error.message}`);
      }
      throw error;
    }
  }

  // Utility Methods
  private async ensureTokenApproval(tokenAddress: string, amount: string): Promise<void> {
    if (!this.signer) {
      throw new RWAError('Signer required for token approval', 'NO_SIGNER');
    }

    const tokenContract = new ethers.Contract(tokenAddress, ABIS.ERC20, this.signer);
    const signerAddress = await this.signer.getAddress();
    const spenderAddress = this.network.contracts.dexCore;

    const allowance = await tokenContract.allowance(signerAddress, spenderAddress);
    
    if (allowance < amount) {
      const tx = await tokenContract.approve(spenderAddress, amount);
      await tx.wait();
    }
  }

  private getUSDCAddress(): string {
    // This would be the actual USDC contract address on the network
    return '0xA0b86a33E6441D9E8E99C0B5c0aE4E5F4e1d00f5'; // Placeholder
  }

  // Getters
  getNetwork(): NetworkConfig {
    return this.network;
  }

  getProvider(): ethers.Provider {
    return this.provider;
  }

  getSigner(): ethers.Signer | undefined {
    return this.signer;
  }

  // Connect wallet
  async connect(privateKey: string): Promise<void> {
    this.signer = new ethers.Wallet(privateKey, this.provider);
    this.initializeContracts(); // Re-initialize with signer
  }

  // Disconnect wallet
  disconnect(): void {
    this.signer = undefined;
    this.initializeContracts(); // Re-initialize without signer
  }
}