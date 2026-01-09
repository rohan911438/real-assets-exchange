import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';

interface WalletConnectionProps {
  variant?: 'default' | 'glow' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'xl';
  className?: string;
  showIcon?: boolean;
  fullWidth?: boolean;
}

export const WalletConnection = ({ 
  variant = 'glow', 
  size = 'xl', 
  className = '',
  showIcon = true,
  fullWidth = false 
}: WalletConnectionProps) => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button 
                    onClick={openConnectModal} 
                    variant={variant} 
                    size={size} 
                    className={`gap-2 ${fullWidth ? 'w-full' : 'w-full sm:w-auto'} ${className}`}
                  >
                    {showIcon && <Wallet className="h-5 w-5" />}
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button 
                    onClick={openChainModal} 
                    variant="destructive" 
                    size={size}
                    className={`gap-2 ${fullWidth ? 'w-full' : 'w-full sm:w-auto'} ${className}`}
                  >
                    Wrong network
                  </Button>
                );
              }

              return (
                <div className="flex gap-3">
                  <Button
                    onClick={openChainModal}
                    variant="outline"
                    size={size}
                    className="gap-2"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 12, height: 12 }}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </Button>

                  <Button 
                    onClick={openAccountModal} 
                    variant={variant} 
                    size={size}
                    className={`gap-2 ${className}`}
                  >
                    {account.displayName}
                    {account.displayBalance
                      ? ` (${account.displayBalance})`
                      : ''}
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};