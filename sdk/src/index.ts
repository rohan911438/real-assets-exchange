// Main SDK exports
export { RWADex } from './RWADex';

// Export all types
export * from './types';

// Export constants
export * from './constants';

// Export wallet functionality
export * from './wallet';

// Export deployed ABIs
export { DEPLOYED_ABIS } from './abis';

// Utility functions
export { ethers } from 'ethers';

// Version
export const VERSION = '1.0.0';

// Default export
export { RWADex as default } from './RWADex';