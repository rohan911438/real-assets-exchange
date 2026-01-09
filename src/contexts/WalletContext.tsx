import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  isKYCVerified: boolean;
  networkStatus: 'excellent' | 'good' | 'warning' | 'error' | 'loading';
  complianceStatus: 'excellent' | 'good' | 'warning' | 'error' | 'loading';
  demoMode: boolean;
  balance: string;
  connect: () => void;
  disconnect: () => void;
  completeKYC: () => void;
  setDemoMode: (enabled: boolean) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isKYCVerified, setIsKYCVerified] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<'excellent' | 'good' | 'warning' | 'error' | 'loading'>('loading');
  const [complianceStatus, setComplianceStatus] = useState<'excellent' | 'good' | 'warning' | 'error' | 'loading'>('loading');
  const [demoMode, setDemoMode] = useState(false);
  const [balance, setBalance] = useState('0.00');

  // Simulate network status updates
  useEffect(() => {
    if (isConnected) {
      setNetworkStatus('excellent');
      setComplianceStatus(isKYCVerified ? 'excellent' : 'warning');
      setBalance('2.45 MNT');
    } else {
      setNetworkStatus('error');
      setComplianceStatus('error');
      setBalance('0.00');
    }
  }, [isConnected, isKYCVerified]);

  const connect = useCallback(() => {
    setNetworkStatus('loading');
    // Simulate connection delay for better UX
    setTimeout(() => {
      const mockAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f5AAb2';
      setAddress(mockAddress);
      setIsConnected(true);
      setNetworkStatus('excellent');
      setBalance('2.45 MNT');
    }, 1000);
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setIsConnected(false);
    setIsKYCVerified(false);
  }, []);

  const completeKYC = useCallback(() => {
    setComplianceStatus('loading');
    // Simulate KYC processing with smooth transition
    setTimeout(() => {
      setIsKYCVerified(true);
      setComplianceStatus('excellent');
    }, 1500);
  }, []);

  return (
    <WalletContext.Provider value={{ 
      isConnected, 
      address, 
      isKYCVerified, 
      networkStatus, 
      complianceStatus, 
      demoMode, 
      balance, 
      connect, 
      disconnect, 
      completeKYC, 
      setDemoMode 
    }}>
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
