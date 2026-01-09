import { RWADex } from '../RWADex';

describe('RWADex SDK', () => {
  const testConfig = {
    network: 'mantle-testnet' as const,
  };

  it('should initialize without errors', () => {
    const sdk = new RWADex(testConfig);
    expect(sdk).toBeDefined();
  });

  it('should have correct default configuration', () => {
    const sdk = new RWADex(testConfig);
    const walletState = sdk.getWalletState();
    expect(walletState.isConnected).toBe(false);
  });
});