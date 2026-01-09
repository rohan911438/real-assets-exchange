import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { mantleSepolia } from '@/lib/wagmi';

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
  // Wagmi hooks
  const { address, isConnected: wagmiConnected, chain } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { data: balanceData } = useBalance({
    address,
    chainId: mantleSepolia.id,
  });

  // Local state
  const [isKYCVerified, setIsKYCVerified] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<'excellent' | 'good' | 'warning' | 'error' | 'loading'>('loading');
  const [complianceStatus, setComplianceStatus] = useState<'excellent' | 'good' | 'warning' | 'error' | 'loading'>('loading');
  const [demoMode, setDemoMode] = useState(false);

  // Check if connected to correct network
  const isCorrectNetwork = chain?.id === mantleSepolia.id;
  const isConnected = wagmiConnected && isCorrectNetwork;

  // Format balance
  const balance = balanceData 
    ? `${parseFloat(balanceData.formatted).toFixed(4)} ${balanceData.symbol}`
    : '0.00 MNT';

  // Update network and compliance status
  useEffect(() => {
    if (wagmiConnected) {
      if (isCorrectNetwork) {
        setNetworkStatus('excellent');
        setComplianceStatus(isKYCVerified ? 'excellent' : 'warning');
      } else {
        setNetworkStatus('warning'); // Wrong network
        setComplianceStatus('warning');
      }
    } else {
      setNetworkStatus('error');
      setComplianceStatus('error');
    }
  }, [wagmiConnected, isCorrectNetwork, isKYCVerified]);

  const connect = useCallback(async () => {
    // This will be handled by RainbowKit connect button
    // Just update status for UX
    setNetworkStatus('loading');
  }, []);

  const disconnect = useCallback(() => {
    wagmiDisconnect();
    setIsKYCVerified(false);
  }, [wagmiDisconnect]);

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
      address: address || null, 
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
