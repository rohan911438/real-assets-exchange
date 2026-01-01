/**
 * MetaMask Wallet Integration for Mantle Sepolia
 * Provides smooth UX for wallet connection and network switching
 */

import { ethers, BrowserProvider } from 'ethers';
import * as React from 'react';

// Define window.ethereum interface
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Check for window availability
const isWindowAvailable = typeof window !== 'undefined';

// Network configuration for Mantle Sepolia
export const MANTLE_SEPOLIA = {
  chainId: '0x138B', // 5003 in hex
  chainIdNumber: 5003,
  chainName: 'Mantle Sepolia',
  rpcUrls: ['https://rpc.sepolia.mantle.xyz'],
  blockExplorerUrls: ['https://explorer.sepolia.mantle.xyz'],
  nativeCurrency: {
    name: 'MNT',
    symbol: 'MNT',
    decimals: 18,
  },
};

export interface WalletState {
  isConnected: boolean;
  address?: string;
  provider?: BrowserProvider;
  signer?: ethers.Signer;
  chainId?: number;
  isCorrectNetwork: boolean;
}

export class WalletManager {
  private state: WalletState = {
    isConnected: false,
    isCorrectNetwork: false,
  };

  private listeners: Set<(state: WalletState) => void> = new Set();

  constructor() {
    this.initializeEventListeners();
  }

  /**
   * Check if MetaMask is installed
   */
  public isMetaMaskInstalled(): boolean {
    return isWindowAvailable && Boolean(window.ethereum?.isMetaMask);
  }

  /**
   * Connect to MetaMask wallet
   */
  public async connect(): Promise<WalletState> {
    try {
      if (!this.isMetaMaskInstalled()) {
        throw new WalletNotInstalledError();
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new WalletConnectionError('No accounts found. Please unlock MetaMask and try again.');
      }

      // Create provider and signer
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();

      this.state = {
        isConnected: true,
        address: accounts[0],
        provider,
        signer: await provider.getSigner(),
        chainId: Number(network.chainId),
        isCorrectNetwork: Number(network.chainId) === MANTLE_SEPOLIA.chainIdNumber,
      };

      this.notifyListeners();

      // If not on correct network, prompt to switch
      if (!this.state.isCorrectNetwork) {
        await this.switchToMantleSepolia();
      }

      return this.state;
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  /**
   * Switch to Mantle Sepolia network
   */
  public async switchToMantleSepolia(): Promise<void> {
    try {
      // Try to switch to Mantle Sepolia
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MANTLE_SEPOLIA.chainId }],
      });
    } catch (switchError: any) {
      // If the chain hasn't been added to MetaMask, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: MANTLE_SEPOLIA.chainId,
                chainName: MANTLE_SEPOLIA.chainName,
                rpcUrls: MANTLE_SEPOLIA.rpcUrls,
                blockExplorerUrls: MANTLE_SEPOLIA.blockExplorerUrls,
                nativeCurrency: MANTLE_SEPOLIA.nativeCurrency,
              },
            ],
          });
        } catch (addError: any) {
          throw new NetworkSwitchError('Failed to add Mantle Sepolia network to MetaMask');
        }
      } else {
        throw new NetworkSwitchError('Failed to switch to Mantle Sepolia network');
      }
    }

    // Update state after network switch
    if (this.state.provider) {
      const network = await this.state.provider.getNetwork();
      this.state.chainId = Number(network.chainId);
      this.state.isCorrectNetwork = Number(network.chainId) === MANTLE_SEPOLIA.chainIdNumber;
      this.notifyListeners();
    }
  }

  /**
   * Disconnect wallet
   */
  public async disconnect(): Promise<void> {
    this.state = {
      isConnected: false,
      isCorrectNetwork: false,
    };
    this.notifyListeners();
  }

  /**
   * Get current wallet state
   */
  public getState(): WalletState {
    return { ...this.state };
  }

  /**
   * Check connection status
   */
  public async checkConnection(): Promise<WalletState> {
    try {
      if (!this.isMetaMaskInstalled()) {
        return this.state;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });

      if (accounts.length > 0) {
        const provider = new BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();

        this.state = {
          isConnected: true,
          address: accounts[0],
          provider,
          signer: await provider.getSigner(),
          chainId: Number(network.chainId),
          isCorrectNetwork: Number(network.chainId) === MANTLE_SEPOLIA.chainIdNumber,
        };
      }

      this.notifyListeners();
      return this.state;
    } catch (error) {
      console.error('Failed to check connection:', error);
      return this.state;
    }
  }

  /**
   * Subscribe to wallet state changes
   */
  public subscribe(listener: (state: WalletState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get formatted address (shortened)
   */
  public getFormattedAddress(address?: string): string {
    const addr = address || this.state.address;
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }

  /**
   * Get balance of connected wallet
   */
  public async getBalance(): Promise<string | null> {
    try {
      if (!this.state.provider || !this.state.address) {
        return null;
      }

      const balance = await this.state.provider.getBalance(this.state.address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get balance:', error);
      return null;
    }
  }

  /**
   * Initialize event listeners for account and network changes
   */
  private initializeEventListeners(): void {
    if (!isWindowAvailable || !window.ethereum) {
      return;
    }

    // Listen for account changes
    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        this.disconnect();
      } else {
        this.state.address = accounts[0];
        this.notifyListeners();
      }
    });

    // Listen for network changes
    window.ethereum.on('chainChanged', (chainId: string) => {
      const chainIdNumber = parseInt(chainId, 16);
      this.state.chainId = chainIdNumber;
      this.state.isCorrectNetwork = chainIdNumber === MANTLE_SEPOLIA.chainIdNumber;
      this.notifyListeners();

      // Reload the page when network changes to avoid issues
      if (isWindowAvailable && window.location) {
        window.location.reload();
      }
    });

    // Listen for connection
    window.ethereum.on('connect', (connectInfo: { chainId: string }) => {
      console.log('MetaMask connected:', connectInfo);
    });

    // Listen for disconnection
    window.ethereum.on('disconnect', (error: any) => {
      console.log('MetaMask disconnected:', error);
      this.disconnect();
    });
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getState());
      } catch (error) {
        console.error('Error in wallet state listener:', error);
      }
    });
  }
}

// Singleton instance
let walletManager: WalletManager | null = null;

/**
 * Get the global wallet manager instance
 */
export function getWalletManager(): WalletManager {
  if (!walletManager) {
    walletManager = new WalletManager();
  }
  return walletManager;
}

/**
 * Hook-style helper for React components
 */
export function useWallet() {
  const manager = getWalletManager();
  
  return {
    ...manager.getState(),
    connect: () => manager.connect(),
    disconnect: () => manager.disconnect(),
    switchNetwork: () => manager.switchToMantleSepolia(),
    subscribe: (listener: (state: WalletState) => void) => manager.subscribe(listener),
    getFormattedAddress: (addr?: string) => manager.getFormattedAddress(addr),
    getBalance: () => manager.getBalance(),
    checkConnection: () => manager.checkConnection(),
  };
}

/**
 * React hook for wallet connection status
 */
export function useWalletConnection() {
  const [state, setState] = React.useState<WalletState>(getWalletManager().getState());
  
  React.useEffect(() => {
    const manager = getWalletManager();
    const unsubscribe = manager.subscribe(setState);
    
    // Check connection on mount
    manager.checkConnection();
    
    return unsubscribe;
  }, []);
  
  return state;
}

/**
 * Error classes for better error handling
 */
export class WalletNotInstalledError extends Error {
  constructor() {
    super('MetaMask wallet is not installed');
    this.name = 'WalletNotInstalledError';
  }
}

export class WalletConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WalletConnectionError';
  }
}

export class NetworkSwitchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkSwitchError';
  }
}

/**
 * Utility function to handle wallet errors gracefully
 */
export function handleWalletError(error: any): string {
  if (error instanceof WalletNotInstalledError) {
    return 'Please install MetaMask wallet to continue.';
  }
  
  if (error instanceof WalletConnectionError) {
    return error.message;
  }
  
  if (error instanceof NetworkSwitchError) {
    return error.message;
  }
  
  if (error.code === 4001) {
    return 'Connection request was rejected by user.';
  }
  
  if (error.code === -32002) {
    return 'Connection request is already pending. Please check MetaMask.';
  }
  
  return error.message || 'An unexpected error occurred.';
}