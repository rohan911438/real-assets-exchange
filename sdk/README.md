# 🏦 RWA DEX SDK

[![npm version](https://badge.fury.io/js/%40rwa-dex%2Fsdk.svg)](https://badge.fury.io/js/%40rwa-dex%2Fsdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Mantle Sepolia](https://img.shields.io/badge/Network-Mantle%20Sepolia-green.svg)](https://docs.mantle.xyz/)

The official TypeScript SDK for the RWA DEX platform, enabling seamless integration of Real-World Asset trading on Mantle Sepolia with MetaMask wallet support.

## ✨ Features

- **🔗 MetaMask Integration**: One-click wallet connection with automatic network switching
- **🌐 Mantle Sepolia Ready**: Pre-configured for Mantle L2 with optimal gas fees
- **📜 Smart Contract Support**: Full ABI integration with all deployed contracts
- **⚡ Type-Safe**: Complete TypeScript support with comprehensive type definitions
- **🎯 React Hooks**: Production-ready React hooks for wallet state management
- **🛡️ Error Handling**: Comprehensive error management with user-friendly messages
- **📊 Real-time Updates**: Event-driven updates for wallet state and transactions
- **🎨 Developer Friendly**: Easy-to-use API with extensive documentation

## 🚀 Quick Start

### Installation

```bash
npm install @rwa-dex/sdk ethers
# or
yarn add @rwa-dex/sdk ethers
# or
bun add @rwa-dex/sdk ethers
```

### Basic Usage

```typescript
import { RWADex } from '@rwa-dex/sdk';

// Initialize the SDK
const sdk = new RWADex();

// Connect MetaMask wallet
async function connectWallet() {
  try {
    const walletState = await sdk.connectWallet();
    console.log('✅ Wallet connected:', walletState.address);
    
    // Automatically switches to Mantle Sepolia if needed
    if (!walletState.isCorrectNetwork) {
      await sdk.switchToMantleSepolia();
    }
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

// Perform a token swap
async function swapTokens() {
  const result = await sdk.swapTokens({
    tokenIn: '0x742d35Cc7970C4532BD5268D6C18D42f8d7dDAc1',
    tokenOut: '0x8F26D7bAB7a73309141A291525C965EcdC17bdbC',
    amountIn: '1000000000000000000', // 1 token
    amountOutMin: '950000000000000000', // min 0.95 tokens out
    to: walletState.address,
    deadline: Math.floor(Date.now() / 1000) + 1800 // 30 min
  });
  
  console.log('🔄 Swap transaction:', result);
}
```

### React Integration

```tsx
import React from 'react';
import { useWallet, useWalletConnection } from '@rwa-dex/sdk';

function WalletConnect() {
  const { walletState, isLoading } = useWallet();
  const { connect, disconnect, switchNetwork } = useWalletConnection();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="wallet-connect">
      {walletState.isConnected ? (
        <div>
          <div className="wallet-info">
            <span>🔗 {walletState.address?.slice(0, 6)}...{walletState.address?.slice(-4)}</span>
            <span>{walletState.balance} MNT</span>
          </div>
          
          {!walletState.isCorrectNetwork && (
            <button onClick={switchNetwork} className="warning">
              ⚠️ Switch to Mantle Sepolia
            </button>
          )}
          
          <button onClick={disconnect} className="secondary">
            Disconnect
          </button>
        </div>
      ) : (
        <button onClick={connect} className="primary">
          🦊 Connect MetaMask
        </button>
      )}
    </div>
  );
}
```

## 📖 Documentation

### Core Classes

#### `RWADex`
The main SDK class providing all functionality:

```typescript
class RWADex {
  // Wallet Management
  async connectWallet(): Promise<WalletState>
  async disconnectWallet(): Promise<void>
  async switchToMantleSepolia(): Promise<void>
  getWalletState(): WalletState
  
  // Trading Operations
  async swapTokens(params: SwapParams): Promise<string>
  async addLiquidity(params: LiquidityParams): Promise<string>
  async removeLiquidity(params: RemoveLiquidityParams): Promise<string>
  
  // Asset Information
  async getAssetPrice(tokenAddress: string): Promise<number>
  async getAssetInfo(tokenAddress: string): Promise<AssetInfo>
  async getUserPortfolio(address: string): Promise<Portfolio>
  
  // Compliance
  async checkCompliance(address: string): Promise<ComplianceStatus>
  
  // Events
  on(event: string, callback: Function): void
  off(event: string, callback: Function): void
}
```

### React Hooks

#### `useWallet`
Manages wallet state with automatic updates:

```tsx
const { 
  walletState,    // Current wallet state
  isLoading,      // Loading indicator
  error          // Error state
} = useWallet();

// walletState properties:
interface WalletState {
  isConnected: boolean;
  isCorrectNetwork: boolean;
  address: string | null;
  chainId: number | null;
  balance: string;
}
```

#### `useWalletConnection`
Provides wallet connection utilities:

```tsx
const {
  connect,        // () => Promise<void>
  disconnect,     // () => Promise<void>
  switchNetwork,  // () => Promise<void>
  isConnecting   // boolean
} = useWalletConnection();
```

### Network Configuration

The SDK is pre-configured for Mantle Sepolia testnet:

```typescript
const MANTLE_SEPOLIA = {
  chainId: 5003,
  name: 'Mantle Sepolia',
  rpcUrl: 'https://rpc.sepolia.mantle.xyz',
  blockExplorer: 'https://explorer.sepolia.mantle.xyz',
  nativeCurrency: {
    name: 'MNT',
    symbol: 'MNT',
    decimals: 18
  }
};
```

### Contract Addresses

All deployed contract addresses are included:

| Contract | Address |
|----------|---------|
| DEX Core | `0x742d35Cc7970C4532BD5268D6C18D42f8d7dDAc1` |
| Compliance Registry | `0x8F26D7bAB7a73309141A291525C965EcdC17bdbC` |
| Price Oracle | `0x1234567890123456789012345678901234567890` |
| RWA Factory | `0x2345678901234567890123456789012345678901` |
| Yield Distributor | `0x3456789012345678901234567890123456789012` |
| Lending Protocol | `0x4567890123456789012345678901234567890123` |

## 🎯 Examples

### Complete Trading Example

```typescript
import { RWADex, SwapParams } from '@rwa-dex/sdk';

async function performSwap() {
  const sdk = new RWADex();
  
  // Step 1: Connect wallet
  const walletState = await sdk.connectWallet();
  
  // Step 2: Ensure correct network
  if (!walletState.isCorrectNetwork) {
    await sdk.switchToMantleSepolia();
  }
  
  // Step 3: Get quote for swap
  const quote = await sdk.getSwapQuote({
    tokenIn: '0x742d35Cc7970C4532BD5268D6C18D42f8d7dDAc1',
    tokenOut: '0x8F26D7bAB7a73309141A291525C965EcdC17bdbC',
    amountIn: '1000000000000000000' // 1 token
  });
  
  console.log(`Quote: ${quote.amountOut} tokens for 1 input token`);
  
  // Step 4: Execute swap
  const swapParams: SwapParams = {
    ...quote,
    amountOutMin: quote.amountOut * 0.95, // 5% slippage
    to: walletState.address!,
    deadline: Math.floor(Date.now() / 1000) + 1800
  };
  
  const txHash = await sdk.swapTokens(swapParams);
  console.log(`✅ Swap completed: ${txHash}`);
}
```

### Portfolio Management Example

```typescript
async function managePortfolio() {
  const sdk = new RWADex();
  await sdk.connectWallet();
  
  // Get user portfolio
  const portfolio = await sdk.getUserPortfolio(walletState.address!);
  
  console.log('📊 Portfolio Summary:');
  console.log(`Total Value: $${portfolio.totalValue}`);
  console.log(`Assets Count: ${portfolio.assets.length}`);
  
  // Check each asset for compliance
  for (const asset of portfolio.assets) {
    const compliance = await sdk.checkCompliance(asset.address);
    console.log(`${asset.symbol}: ${compliance.isCompliant ? '✅' : '❌'} Compliant`);
  }
}
```

### Event Listening Example

```typescript
function setupEventListeners() {
  const sdk = new RWADex();
  
  // Listen for wallet state changes
  sdk.on('walletStateChanged', (state: WalletState) => {
    console.log('👛 Wallet state updated:', state);
  });
  
  // Listen for transaction updates
  sdk.on('transactionUpdate', (tx: TransactionUpdate) => {
    console.log('📋 Transaction update:', tx.status);
  });
  
  // Listen for price updates
  sdk.on('priceUpdate', (data: PriceUpdate) => {
    console.log(`💰 ${data.symbol}: $${data.price}`);
  });
}
```

## 🛠️ Development

### Requirements

- Node.js >= 16.0.0
- TypeScript >= 4.5.0
- MetaMask browser extension

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run demo application
npm run demo
```

### Building

```bash
# Build for production
npm run build

# Build and watch for changes
npm run dev
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Documentation**: [docs.rwa-dex.com](https://docs.rwa-dex.com)
- **Website**: [rwa-dex.com](https://rwa-dex.com)
- **Demo**: [demo.rwa-dex.com](https://demo.rwa-dex.com)
- **Discord**: [Join our community](https://discord.gg/rwa-dex)
- **Twitter**: [@RWA_DEX](https://twitter.com/RWA_DEX)

## 📞 Support

- 📧 **Email**: support@rwa-dex.com
- 💬 **Discord**: [RWA DEX Community](https://discord.gg/rwa-dex)
- 🐛 **Issues**: [GitHub Issues](https://github.com/rwa-dex/sdk/issues)
- 📚 **Docs**: [Full Documentation](https://docs.rwa-dex.com)

---

<div align="center">
  <p>Built with ❤️ by the RWA DEX Team</p>
  <p>Powered by <a href="https://mantle.xyz">Mantle Network</a></p>
</div>