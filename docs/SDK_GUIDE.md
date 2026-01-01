# RWA DEX SDK Documentation

## Overview
The RWA DEX SDK provides a comprehensive toolkit for interacting with Real-World Asset (RWA) decentralized exchanges on the Mantle Sepolia network. It includes MetaMask wallet integration, contract interactions, and a smooth user experience for trading tokenized real-world assets.

## Features
- 🔗 **MetaMask Integration**: Seamless wallet connection and network management
- 🌐 **Mantle Sepolia Support**: Optimized for Mantle's L2 network
- 📜 **Smart Contract Integration**: Full ABI support for all deployed contracts
- ⚡ **Type Safety**: Full TypeScript support with comprehensive types
- 🎯 **React Hooks**: Ready-to-use React hooks for wallet state management
- 🛡️ **Error Handling**: Comprehensive error management and user feedback

## Installation

```bash
npm install @rwa-dex/sdk
# or
yarn add @rwa-dex/sdk
# or
bun add @rwa-dex/sdk
```

## Quick Start

### Basic Setup

```typescript
import { RWADex } from '@rwa-dex/sdk';

// Initialize the SDK
const sdk = new RWADex();

// Connect wallet
try {
  const walletState = await sdk.connectWallet();
  console.log('Connected:', walletState);
} catch (error) {
  console.error('Connection failed:', error);
}
```

### React Integration

```tsx
import React from 'react';
import { useWallet, useWalletConnection } from '@rwa-dex/sdk';

function WalletComponent() {
  const { walletState } = useWallet();
  const { connect, disconnect, switchNetwork } = useWalletConnection();

  return (
    <div>
      {walletState.isConnected ? (
        <div>
          <p>Connected: {walletState.address}</p>
          {!walletState.isCorrectNetwork && (
            <button onClick={switchNetwork}>
              Switch to Mantle Sepolia
            </button>
          )}
          <button onClick={disconnect}>Disconnect</button>
        </div>
      ) : (
        <button onClick={connect}>Connect MetaMask</button>
      )}
    </div>
  );
}
```

## Configuration

### Network Configuration

```typescript
// Using predefined networks
const rwa = new RWADex({
  network: 'mantle-mainnet' // or 'mantle-testnet'
});

// Using custom network
const rwa = new RWADex({
  network: {
    name: 'Custom Mantle',
    chainId: 5000,
    rpcUrl: 'https://your-rpc-url.com',
    contracts: {
      dexCore: '0x...',
      factory: '0x...',
      // ... other contracts
    }
  }
});
```

### Provider Configuration

```typescript
import { ethers } from 'ethers';

// Using custom provider
const provider = new ethers.JsonRpcProvider('https://your-rpc.com');
const rwa = new RWADex({
  network: 'mantle-testnet',
  provider: provider
});

// Using wallet connection
const rwa = new RWADex({
  network: 'mantle-testnet',
  privateKey: 'your-private-key'
});
```

## Core Features

### Asset Management

#### List Assets

```typescript
// Get all assets
const { assets, pagination } = await rwa.listAssets();

// Filter assets
const { assets } = await rwa.listAssets({
  type: 'RealEstate',
  minAPY: 5,
  maxAPY: 15,
  jurisdiction: 'US',
  page: 1,
  limit: 10,
  sortBy: 'apy',
  sortOrder: 'desc'
});

console.log(`Found ${assets.length} real estate assets`);
```

#### Get Asset Details

```typescript
const asset = await rwa.getAsset('0x742d35Cc7970');

console.log({
  name: asset.name,
  symbol: asset.symbol,
  currentPrice: asset.currentPrice,
  apy: asset.apy,
  assetType: asset.assetType,
  tvl: asset.tvl,
  maturityDate: new Date(parseInt(asset.maturityDate) * 1000)
});
```

### Trading

#### Preview Swap

```typescript
const preview = await rwa.previewSwap({
  tokenIn: '0x742d35Cc7970', // RWA token
  tokenOut: '0xA0b86a33E644', // USDC
  amountIn: ethers.parseEther('1.0') // 1 RWA token
});

console.log({
  amountOut: ethers.formatUnits(preview.amountOut, 6), // USDC has 6 decimals
  priceImpact: `${preview.priceImpact}%`,
  fee: ethers.formatUnits(preview.fee, 6),
  minimumAmountOut: ethers.formatUnits(preview.minimumAmountOut, 6)
});
```

#### Execute Swap

```typescript
try {
  const tx = await rwa.swap({
    tokenIn: '0x742d35Cc7970',
    tokenOut: '0xA0b86a33E644',
    amountIn: ethers.parseEther('1.0'),
    minAmountOut: ethers.parseUnits('95.0', 6), // Minimum 95 USDC
    slippage: 0.5, // 0.5% slippage tolerance
    deadline: 20 * 60 // 20 minutes
  });

  console.log(`Transaction submitted: ${tx.hash}`);
  
  const receipt = await tx.wait();
  console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
} catch (error) {
  console.error('Swap failed:', error.message);
}
```

### Liquidity Management

#### Add Liquidity

```typescript
const tx = await rwa.addLiquidity({
  token: '0x742d35Cc7970', // RWA token
  amountToken: ethers.parseEther('10.0'), // 10 RWA tokens
  amountUSDC: ethers.parseUnits('1000', 6), // 1000 USDC
  minLiquidity: ethers.parseEther('0.1'), // Minimum LP tokens
  deadline: Math.floor(Date.now() / 1000) + 20 * 60
});

await tx.wait();
console.log('Liquidity added successfully');
```

#### Remove Liquidity

```typescript
const tx = await rwa.removeLiquidity({
  token: '0x742d35Cc7970',
  liquidity: ethers.parseEther('5.0'), // LP tokens to remove
  minAmount0: ethers.parseEther('4.8'), // Min RWA tokens
  minAmount1: ethers.parseUnits('480', 6), // Min USDC
  deadline: Math.floor(Date.now() / 1000) + 20 * 60
});

await tx.wait();
console.log('Liquidity removed successfully');
```

### Portfolio Management

#### Get Portfolio

```typescript
const portfolio = await rwa.getPortfolio('0x742d35Cc7970');

console.log({
  totalValue: ethers.formatEther(portfolio.totalValue),
  totalYield: ethers.formatEther(portfolio.totalYield),
  assetCount: portfolio.assets.length,
  performance: portfolio.performance
});

// List all assets in portfolio
portfolio.assets.forEach(asset => {
  console.log(`${asset.symbol}: ${ethers.formatEther(asset.balance)} tokens`);
  console.log(`  Value: $${ethers.formatEther(asset.value)}`);
  console.log(`  Claimable Yield: $${ethers.formatEther(asset.claimableYield)}`);
});
```

#### Claim Yield

```typescript
const tx = await rwa.claimYield('0x742d35Cc7970');
await tx.wait();

console.log('Yield claimed successfully');
```

### Lending

#### Deposit Collateral

```typescript
const tx = await rwa.depositCollateral({
  token: '0x742d35Cc7970', // RWA token as collateral
  amount: ethers.parseEther('10.0') // 10 tokens
});

const receipt = await tx.wait();
console.log('Collateral deposited');
```

#### Borrow

```typescript
const tx = await rwa.borrow({
  positionId: 0,
  amount: ethers.parseUnits('5000', 6) // Borrow 5000 USDC
});

await tx.wait();
console.log('Borrowed successfully');
```

#### Get Lending Position

```typescript
const position = await rwa.getLendingPosition('0x742d35Cc7970', 0);

console.log({
  collateralAmount: ethers.formatEther(position.collateralAmount),
  borrowedAmount: ethers.formatUnits(position.borrowedAmount, 6),
  healthFactor: position.healthFactor,
  interestRate: `${position.interestRate / 100}% APY`
});
```

### AI Integration

#### Get Price Prediction

```typescript
const prediction = await rwa.getAIPrediction('0x742d35Cc7970');

console.log({
  currentPrice: prediction.current_price,
  predictedPrice: prediction.predicted_price,
  confidence: `${prediction.confidence * 100}%`,
  recommendation: prediction.recommendation,
  reasoning: prediction.reasoning,
  riskScore: prediction.risk_score
});
```

### Compliance Checking

```typescript
const compliance = await rwa.checkCompliance('0x742d35Cc7970');

console.log({
  isVerified: compliance.isVerified,
  level: compliance.level,
  jurisdiction: compliance.jurisdiction,
  canTrade: compliance.canTrade,
  restrictions: compliance.restrictions
});
```

## Event Listening

### Listen to Swap Events

```typescript
const events = await rwa.getEvents('Swap', 'dexCore', {
  fromBlock: -1000, // Last 1000 blocks
  toBlock: 'latest'
});

events.forEach(event => {
  console.log(`Swap: ${event.args.user} traded ${event.args.amountIn} for ${event.args.amountOut}`);
});
```

## Error Handling

The SDK provides structured error handling:

```typescript
import { RWAError, ContractError, APIError, NetworkError } from '@rwa-dex/sdk';

try {
  await rwa.swap({...});
} catch (error) {
  if (error instanceof ContractError) {
    console.error('Contract interaction failed:', error.message);
    console.error('Details:', error.details);
  } else if (error instanceof APIError) {
    console.error('API request failed:', error.message);
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
  } else if (error instanceof RWAError) {
    console.error('RWA SDK error:', error.code, error.message);
  }
}
```

## Advanced Usage

### Custom Gas Settings

```typescript
const tx = await rwa.swap(
  {
    tokenIn: '0x742d35Cc7970',
    tokenOut: '0xA0b86a33E644',
    amountIn: ethers.parseEther('1.0'),
    minAmountOut: ethers.parseUnits('95.0', 6)
  },
  {
    gasLimit: '200000',
    maxFeePerGas: ethers.parseUnits('20', 'gwei'),
    maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei')
  }
);
```

### Batch Operations

```typescript
// Check multiple assets
const assetAddresses = ['0x742d35Cc7970', '0x123...', '0x456...'];
const assets = await Promise.all(
  assetAddresses.map(address => rwa.getAsset(address))
);

// Get AI predictions for all assets
const predictions = await Promise.all(
  assetAddresses.map(address => rwa.getAIPrediction(address))
);
```

### Utility Functions

```typescript
// Get network info
const network = rwa.getNetwork();
console.log(`Connected to ${network.name} (Chain ID: ${network.chainId})`);

// Get provider
const provider = rwa.getProvider();
const blockNumber = await provider.getBlockNumber();

// Check if wallet is connected
const signer = rwa.getSigner();
if (signer) {
  const address = await signer.getAddress();
  console.log(`Connected wallet: ${address}`);
}
```

## TypeScript Support

The SDK is fully typed for excellent TypeScript support:

```typescript
import { Asset, SwapParams, Portfolio, AIPrediction } from '@rwa-dex/sdk';

// All types are available for import
const handleAsset = (asset: Asset) => {
  // TypeScript knows the structure of Asset
  console.log(asset.name, asset.currentPrice);
};

// Generic API responses
import { APIResponse } from '@rwa-dex/sdk';

const response: APIResponse<Asset> = await api.get('/assets/0x...');
if (response.success && response.data) {
  handleAsset(response.data);
}
```

## Testing

```typescript
// Mock the SDK for testing
import { RWADex } from '@rwa-dex/sdk';

jest.mock('@rwa-dex/sdk');

const mockRWA = RWADex as jest.MockedClass<typeof RWADex>;
mockRWA.prototype.getAsset.mockResolvedValue({
  address: '0x742d35Cc7970',
  name: 'Test Asset',
  currentPrice: '100',
  // ... other properties
});
```

## Best Practices

### 1. Error Handling
Always wrap SDK calls in try-catch blocks:

```typescript
try {
  const result = await rwa.swap(params);
  // Handle success
} catch (error) {
  // Handle specific error types
  if (error instanceof ContractError) {
    // Maybe retry or show user-friendly message
  }
}
```

### 2. Transaction Management
Wait for transaction confirmations:

```typescript
const tx = await rwa.swap(params);
console.log(`Transaction submitted: ${tx.hash}`);

const receipt = await tx.wait();
console.log(`Confirmed in block: ${receipt.blockNumber}`);
```

### 3. Rate Limiting
Be mindful of API rate limits:

```typescript
// Use Promise.all for concurrent requests
const [asset1, asset2] = await Promise.all([
  rwa.getAsset('0x123...'),
  rwa.getAsset('0x456...')
]);

// Add delays for many sequential requests
for (const address of manyAddresses) {
  await rwa.getAsset(address);
  await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
}
```

### 4. Environment Management
Use different configurations for different environments:

```typescript
const config = {
  network: process.env.NODE_ENV === 'production' ? 'mantle-mainnet' : 'mantle-testnet',
  apiBaseUrl: process.env.API_BASE_URL,
  apiKey: process.env.API_KEY
};

const rwa = new RWADex(config);
```

## Migration Guide

### From v0.x to v1.x

1. Update imports:
   ```typescript
   // Old
   import RWADex from '@rwa-dex/sdk';
   
   // New
   import { RWADex } from '@rwa-dex/sdk';
   ```

2. Configuration changes:
   ```typescript
   // Old
   const rwa = new RWADex('mantle-testnet', { apiKey: '...' });
   
   // New
   const rwa = new RWADex({ 
     network: 'mantle-testnet',
     apiKey: '...'
   });
   ```

3. Method signature changes - see [CHANGELOG.md](./CHANGELOG.md)

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines on contributing to the SDK.

## License

MIT License - see [LICENSE](../LICENSE)