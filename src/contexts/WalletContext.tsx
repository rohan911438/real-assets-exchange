import React, { createContext, useContext, useState, useCallback } from 'react';

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  isKYCVerified: boolean;
  connect: () => void;
  disconnect: () => void;
  completeKYC: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isKYCVerified, setIsKYCVerified] = useState(false);

  const connect = useCallback(() => {
    // Simulate wallet connection
    const mockAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f5AAb2';
    setAddress(mockAddress);
    setIsConnected(true);
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setIsConnected(false);
    setIsKYCVerified(false);
  }, []);

  const completeKYC = useCallback(() => {
    setIsKYCVerified(true);
  }, []);

  return (
    <WalletContext.Provider value={{ isConnected, address, isKYCVerified, connect, disconnect, completeKYC }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
