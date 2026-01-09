import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { config } from '@/lib/wagmi';
import { WalletProvider, useWallet } from "./contexts/WalletContext";
import Index from "./pages/Index";
import { Dashboard } from "./pages/Dashboard";
import { Marketplace } from "./pages/Marketplace";
import { Trade } from "./pages/Trade";
import { Liquidity } from "./pages/Liquidity";
import { Lending } from "./pages/Lending";
import { Analytics } from "./pages/Analytics";
import { Profile } from "./pages/Profile";
import { DeveloperTools } from "./pages/DeveloperTools";
import NotFound from "./pages/NotFound";

// Import RainbowKit styles
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isConnected } = useWallet();
  
  if (!isConnected) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/marketplace"
        element={
          <ProtectedRoute>
            <Marketplace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trade"
        element={
          <ProtectedRoute>
            <Trade />
          </ProtectedRoute>
        }
      />
      <Route
        path="/liquidity"
        element={
          <ProtectedRoute>
            <Liquidity />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lending"
        element={
          <ProtectedRoute>
            <Lending />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/developer"
        element={
          <DeveloperTools />
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider 
        theme={darkTheme({
          accentColor: '#7c3aed',
          accentColorForeground: 'white',
          borderRadius: 'medium',
        })}
      >
        <TooltipProvider>
          <WalletProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </WalletProvider>
        </TooltipProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
