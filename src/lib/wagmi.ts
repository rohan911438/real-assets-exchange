import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { createConfig, http } from 'wagmi';
import { mantleSepoliaTestnet } from 'wagmi/chains';

// Define Mantle Sepolia testnet chain
const mantleSepolia = {
  id: 5003,
  name: 'Mantle Sepolia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Mantle',
    symbol: 'MNT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.sepolia.mantle.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Mantle Sepolia Explorer',
      url: 'https://sepolia.mantlescan.xyz',
    },
  },
  testnet: true,
} as const;

export const config = getDefaultConfig({
  appName: 'Real Assets Exchange',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_WALLET_CONNECT_PROJECT_ID_HERE',
  chains: [mantleSepolia],
  transports: {
    [mantleSepolia.id]: http(),
  },
  ssr: false, // Since this is a client-side app
});

export { mantleSepolia };