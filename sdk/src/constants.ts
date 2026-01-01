import { NetworkConfig } from './types';

export const NETWORKS: Record<string, NetworkConfig> = {
  'mantle-mainnet': {
    name: 'Mantle Network',
    chainId: 5000,
    rpcUrl: 'https://rpc.mantle.xyz',
    contracts: {
      dexCore: '0x0000000000000000000000000000000000000000',
      factory: '0x0000000000000000000000000000000000000000',
      compliance: '0x0000000000000000000000000000000000000000',
      lending: '0x0000000000000000000000000000000000000000',
      yieldDistributor: '0x0000000000000000000000000000000000000000',
      priceOracle: '0x0000000000000000000000000000000000000000',
    },
    blockExplorer: 'https://explorer.mantle.xyz'
  },
  'mantle-testnet': {
    name: 'Mantle Testnet',
    chainId: 5001,
    rpcUrl: 'https://rpc.testnet.mantle.xyz',
    contracts: {
      dexCore: '0x0000000000000000000000000000000000000000',
      factory: '0x0000000000000000000000000000000000000000',
      compliance: '0x0000000000000000000000000000000000000000',
      lending: '0x0000000000000000000000000000000000000000',
      yieldDistributor: '0x0000000000000000000000000000000000000000',
      priceOracle: '0x0000000000000000000000000000000000000000',
    },
    blockExplorer: 'https://explorer.testnet.mantle.xyz'
  },
  'mantle-sepolia': {
    name: 'Mantle Sepolia',
    chainId: 5003,
    rpcUrl: 'https://rpc.sepolia.mantle.xyz',
    contracts: {
      // TODO: Replace with your actual deployed contract addresses
      dexCore: '0x0000000000000000000000000000000000000000',
      factory: '0x0000000000000000000000000000000000000000',
      compliance: '0x0000000000000000000000000000000000000000',
      lending: '0x0000000000000000000000000000000000000000',
      yieldDistributor: '0x0000000000000000000000000000000000000000',
      priceOracle: '0x0000000000000000000000000000000000000000',
    },
    blockExplorer: 'https://explorer.sepolia.mantle.xyz'
  }
};

export const DEFAULT_SLIPPAGE = 0.5; // 0.5%
export const DEFAULT_DEADLINE = 20 * 60; // 20 minutes
export const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

// Common contract ABIs (simplified for demo)
export const ABIS = {
  ERC20: [
    'function balanceOf(address owner) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function symbol() view returns (string)',
    'function name() view returns (string)',
    'function decimals() view returns (uint8)',
    'function totalSupply() view returns (uint256)'
  ],
  DEXCore: [
    'function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut) returns (uint256)',
    'function addLiquidity(address token, uint256 amountToken, uint256 amountUSDC, uint256 minLiquidity) returns (uint256)',
    'function removeLiquidity(address token, uint256 liquidity, uint256 minAmount0, uint256 minAmount1) returns (uint256, uint256)',
    'function previewSwap(address tokenIn, address tokenOut, uint256 amountIn) view returns (uint256 amountOut, uint256 priceImpact, uint256 fee)',
    'function getPoolInfo(address token) view returns (tuple(uint256 reserve0, uint256 reserve1, uint256 totalLiquidity, uint256 lastPrice, uint256 lastUpdateTime))',
    'event Swap(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut, uint256 fee)'
  ],
  RWAToken: [
    'function getAssetInfo() view returns (uint8 assetType, uint256 totalAssetValue, uint256 yieldRate, uint256 maturityDate, string jurisdiction, string assetURI)',
    'function getClaimableYield(address user) view returns (uint256)',
    'function claimYield() returns (uint256)',
    'function whitelist(address) view returns (bool)',
    'event YieldClaimed(address indexed user, uint256 amount)'
  ],
  ComplianceRegistry: [
    'function DEFAULT_ADMIN_ROLE() view returns (bytes32)',
    'function VERIFIER_ROLE() view returns (bytes32)',
    'function checkCompliance(address user, string assetJurisdiction, bool requiresAccredited) view returns (bool)',
    'function complianceData(address user) view returns (bool isVerified, uint8 level, string jurisdiction, uint256 verificationTimestamp, uint256 expiryTimestamp)',
    'function getRoleAdmin(bytes32 role) view returns (bytes32)',
    'function grantRole(bytes32 role, address account)',
    'function hasRole(bytes32 role, address account) view returns (bool)',
    'function isVerified(address user) view returns (bool)',
    'function meetsRequirement(address user, uint8 requiredLevel) view returns (bool)',
    'function pause()',
    'function paused() view returns (bool)',
    'function renounceRole(bytes32 role, address callerConfirmation)',
    'function revokeRole(bytes32 role, address account)',
    'function revokeVerification(address user)',
    'function supportsInterface(bytes4 interfaceId) view returns (bool)',
    'function unpause()',
    'function updateMerkleRoot(bytes32 newRoot)',
    'function verifiedAddressesMerkleRoot() view returns (bytes32)',
    'function verifyAddress(address user, uint8 level, string jurisdiction, uint256 validityPeriod)',
    'function verifyZKProof(bytes32[] proof, bytes32 leaf) view returns (bool)',
    'event AddressVerified(address indexed user, uint8 level, string jurisdiction)',
    'event MerkleRootUpdated(bytes32 newRoot)',
    'event VerificationRevoked(address indexed user)'
  ],
  LendingProtocol: [
    'function depositCollateral(address collateralToken, uint256 amount) returns (uint256 positionId)',
    'function borrow(uint256 positionId, uint256 amount)',
    'function repay(uint256 positionId, uint256 amount)',
    'function getPosition(address user, uint256 positionId) view returns (address collateralToken, uint256 collateralAmount, uint256 borrowedAmount, uint256 borrowTimestamp, uint256 lastInterestUpdate, bool active)',
    'function calculateHealthFactor(address user, uint256 positionId, uint256 borrowedAmount) view returns (uint256)',
    'event CollateralDeposited(address indexed user, uint256 indexed positionId, address collateralToken, uint256 amount)'
  ]
};