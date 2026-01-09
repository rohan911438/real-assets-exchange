import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { WalletConnection } from '@/components/WalletConnection';
import { truncateAddress } from '@/data/mockData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Wallet, ChevronDown, User, Settings, LogOut, Menu, X, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Marketplace', path: '/marketplace' },
  { name: 'Trade', path: '/trade' },
  { name: 'Liquidity', path: '/liquidity' },
  { name: 'Lending', path: '/lending' },
  { name: 'Analytics', path: '/analytics' },
];

export const Header = () => {
  const { isConnected, address, disconnect } = useWallet();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/30">
      {/* Glassmorphic background */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div 
              className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-light shadow-lg group-hover:shadow-glow-sm transition-shadow duration-300"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-lg font-bold text-white font-display">R</span>
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-xl bg-primary/50 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
            </motion.div>
            <span className="text-xl font-bold text-foreground font-display tracking-tight">
              RWA-<span className="gradient-text">DEX</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          {isConnected && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'nav-link text-sm font-medium',
                    location.pathname === link.path && 'active'
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Mantle Branding */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20"
            >
              <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse shadow-purple-glow" />
              <span className="text-xs font-medium text-purple-400">⚡ Powered by Mantle</span>
            </motion.div>

            {isConnected && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20"
              >
                <div className="h-2 w-2 rounded-full bg-success animate-pulse shadow-success-glow" />
                <span className="text-xs font-medium text-success">🤖 AI Ready • 🛡️ KYC Verified</span>
              </motion.div>
            )}

            {isConnected ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="gap-2 rounded-xl border-border/50 bg-secondary/50 backdrop-blur-sm hover:bg-secondary/80 hover:border-primary/30"
                  >
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                      <Wallet className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="hidden sm:inline font-mono text-sm">{truncateAddress(address!)}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 rounded-xl border-border/50 bg-card/95 backdrop-blur-xl shadow-elevated"
                >
                  <div className="px-3 py-2 border-b border-border/30">
                    <p className="text-xs text-muted-foreground mb-1">Connected Wallet</p>
                    <button 
                      onClick={handleCopyAddress}
                      className="flex items-center gap-2 text-sm font-mono text-foreground hover:text-primary transition-colors"
                    >
                      {truncateAddress(address!)}
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  <div className="py-1">
                    <DropdownMenuItem asChild className="rounded-lg mx-1 cursor-pointer">
                      <Link to="/profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        View Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg mx-1 cursor-pointer">
                      <Link to="/profile" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator className="bg-border/30" />
                  <div className="py-1">
                    <DropdownMenuItem 
                      onClick={disconnect} 
                      className="text-destructive rounded-lg mx-1 cursor-pointer hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Disconnect
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <WalletConnection 
                variant="glow" 
                size="default"
                className="gap-2 rounded-xl shadow-glow-sm hover:shadow-glow transition-shadow duration-300"
                showIcon={true}
                fullWidth={false}
              />
            )}

            {/* Mobile Menu Button */}
            {isConnected && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-xl"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isConnected && mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="md:hidden py-4 border-t border-border/30 overflow-hidden"
            >
              <div className="flex flex-col gap-1">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center px-4 py-3 rounded-xl transition-all duration-200',
                        location.pathname === link.path
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      )}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};