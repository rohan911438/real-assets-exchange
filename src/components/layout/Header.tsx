import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { truncateAddress } from '@/data/mockData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Wallet, ChevronDown, User, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navLinks = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Marketplace', path: '/marketplace' },
  { name: 'Trade', path: '/trade' },
  { name: 'Liquidity', path: '/liquidity' },
  { name: 'Lending', path: '/lending' },
  { name: 'Analytics', path: '/analytics' },
];

export const Header = () => {
  const { isConnected, address, connect, disconnect } = useWallet();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-500">
              <span className="text-lg font-bold text-primary-foreground">R</span>
            </div>
            <span className="text-xl font-bold text-foreground">RWA-DEX</span>
          </Link>

          {/* Desktop Navigation */}
          {isConnected && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'nav-link',
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
            {isConnected && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs text-muted-foreground">Mantle Testnet</span>
              </div>
            )}

            {isConnected ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Wallet className="h-4 w-4" />
                    <span className="hidden sm:inline">{truncateAddress(address!)}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      View Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={disconnect} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={connect} variant="gradient" className="gap-2">
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </Button>
            )}

            {/* Mobile Menu Button */}
            {isConnected && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isConnected && mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'px-4 py-3 rounded-lg transition-colors',
                    location.pathname === link.path
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary'
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
