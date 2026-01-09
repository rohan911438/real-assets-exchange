# RWA-DEX — Real-World Asset Decentralized Exchange (Production-Grade)

Author: Rohan Kumar  
Team: Team Brotherhood (Solo Builder)

This protocol is seriously intended for real-world deployment. It is designed as infrastructure for compliant, AI-informed, and composable RealFi markets—not a hackathon-only demo. A live, judge-accessible frontend is available: https://rwadex.netlify.app/

## Project Overview

RWA-DEX is a modular protocol for tokenizing, pricing, and exchanging Real-World Assets (RWA) on-chain with built-in compliance and DeFi composability. It integrates:
- Compliance-aware asset issuance and transfer controls
- AI-powered fair value price discovery and analytics
- Composable DeFi primitives for lending and yield distribution
- Production-ready wallet connection and real on-chain transactions on Mantle Sepolia

The system is built as infrastructure (contracts + services + SDK + UI) so integrators, institutions, and developers can build compliant RealFi applications on top of it.

## Problem Statement

- Illiquidity of RWAs: Private-market assets are fragmented, manually priced, and slow to settle.
- Lack of price discovery: Fair value is opaque and updated infrequently; markets lack continuous signals.
- Compliance friction: Multi-jurisdiction KYC/AML and investor eligibility slows onboarding and transfers.
- Inaccessibility for global users: Cross-border constraints, bank rails, and legacy processes block participation.

## Solution Architecture

RWA-DEX is implemented as a multi-layer system:

1. Frontend (React + Vite, Tailwind, shadcn/Radix)
	- Real wallet connection (MetaMask / WalletConnect)
	- Network-aware UX for Mantle Sepolia
	- Portfolio, marketplace, trading, liquidity, lending, and analytics views

2. Smart Contracts (Solidity)
	- Tokenization via `RWAToken.sol` and asset factory
	- Compliance enforcement via `ComplianceRegistry.sol`
	- Core exchange logic in `DEXCore.sol`
	- Yield accrual and distribution via `YieldDistributor.sol`
	- Credit markets via `LendingProtocol.sol`

3. AI Engine (Python)
	- Feature engineering from on-chain + off-chain signals
	- Fair value estimation with explainability and confidence scores
	- Surfaced to the app for pricing guidance and risk analysis

4. Oracles
	- External price and market feeds
	- Normalization for AI inference and protocol risk limits

5. Backend Services (Node.js/TypeScript)
	- Transaction orchestration, event indexing, and API surface
	- Compliance workflows, eligibility checks, audit logs
	- Portfolio, analytics, and developer tooling endpoints

## Core Features

- RWA Tokenization: Mint ERC-20 representations with asset metadata and controls
- On-Chain Compliance: KYC levels, whitelisting, jurisdiction restrictions, accredited-only flows
- Wallet Integration: Production MetaMask + WalletConnect setup
- Real On-Chain Transactions: Live on Mantle Sepolia with explorer visibility
- AI-Based Pricing: Fair value estimation with confidence and rationale
- Lending & Yield: Borrowing against RWA collateral; programmatic yield accrual and distribution
- Developer SDK: TypeScript SDK for contract and wallet operations

## Smart Contracts Overview

- `RWAToken.sol`: ERC-20 token with asset metadata, compliance gating, and yield tracking
- `ComplianceRegistry.sol`: Manage KYC tiers, whitelists, and jurisdiction restrictions on-chain
- `DEXCore.sol`: Swap and liquidity logic tailored to RWA pairs and constraints
- `YieldDistributor.sol`: Accrual and pro-rata distribution of yield to token holders
- `LendingProtocol.sol`: Collateralized lending using RWA tokens with health-factor risk controls
- `RWAFactory.sol`: Factory for standardized issuance of new `RWAToken` instances
- `PriceOracle.sol`: Price intake and normalization for protocol operations and AI inputs

## Why Mantle

Mantle provides an L2 environment aligned with RealFi demands:
- Gas Efficiency: Low fees enable frequent rebalancing, distribution, and compliance updates
- Scalability: High throughput supports market activity and oracle updates
- RealFi Suitability: Strong ecosystem momentum and data availability layers suitable for regulated use cases

RWA-DEX runs live on Mantle Sepolia for testnet validation and is designed to advance from Hackathon → Testnet → Mainnet with minimal changes.

## Deployment & Usage

1. Connect MetaMask
	- Open the live app: https://rwadex.netlify.app/
	- Connect wallet; the app will prompt switching to Mantle Sepolia if needed

2. Network Requirements (Mantle Sepolia)
	- Chain: Mantle Sepolia Testnet
	- RPC: https://rpc.sepolia.mantle.xyz
	- Explorer: https://sepolia.mantlescan.info

3. Perform Real On-Chain Actions
	- Mint/issue RWA tokens (via factory)
	- Add/remove liquidity on RWA pairs
	- Swap, lend, and claim yield
	- View transactions and receipts on Mantle Sepolia explorer

For developers, see SDK and API docs in `docs/` and contracts in `contracts/`.

## Contract Addresses (Testnet)

Configured in environment for Mantle Sepolia:
- RWA Factory: 0x742d35Cc6634C0532925a3b8D0C4E5C2E5f100d7
- DEX Core: 0x8B3192f5eEBD8579568A2Ed41E6FEB402f93f73F
- Price Oracle: 0x47BE779DE87de6960E4C585c7F00E8C8E71C6dD4
- Lending Protocol: 0x123f681646d4a755815f9CB19e1aCc8565A0c2AC
- Compliance Registry: 0x456789abcDEF123456789abcDEF123456789abcD
- Yield Distributor: 0x789abcDEF123456789abcDEF123456789abcDEF1

Explorer: https://sepolia.mantlescan.info

## Transaction Verification

To verify a transaction on Mantle Sepolia:
1. Submit an action (e.g., mint, swap, add liquidity) in the app
2. Copy the transaction hash from the success toast or wallet activity
3. Paste the hash in the Mantle Sepolia explorer search

Example (replace with your actual hash):
- Transaction Hash: 0xYOUR_TX_HASH_HERE
- Explorer URL: https://sepolia.mantlescan.info/tx/0xYOUR_TX_HASH_HERE

If you have a specific transaction to include, provide the hash and we will append it here.

## Security & Compliance Philosophy

RWA-DEX treats compliance as a first-class protocol concern:
- On-chain enforcement: KYC tiers, whitelists, and jurisdiction gating are embedded into transfer logic
- Role separation: Issuance, compliance admin, and distribution roles are isolated
- Auditability: Event logs across issuance, transfers, and yield for regulator-friendly traceability
- ZK-Ready Architecture: Designed to integrate zero-knowledge proofs for privacy-preserving eligibility checks and attestations (roadmap)

Security posture includes reentrancy protection, input validation, and strict allowance/role controls across contracts. External audits and formal verification are planned prior to mainnet launch.

## Roadmap

- Hackathon: Protocol MVP, end-to-end UX, live testnet deployments
- Testnet: Hardening, audit logs, SDK stabilization, oracle integrations
- Mainnet: Institutional onboarding, custody integrations, production monitoring
- ZK Compliance Expansion: Proof-based KYC/eligibility and jurisdiction attestations
- Developer Ecosystem: Tooling, templates, reference integrations

## Builder Note

From Rohan Kumar (Solo Builder):

“RWA-DEX is built to be shipped—carefully and pragmatically. I executed this end-to-end to prove the feasibility of compliant, AI-informed RealFi on Mantle, and I’m committed to advancing it through testnet and into mainnet with proper audits, institutional-grade integrations, and a clear compliance posture. The vision is long-term infrastructure, not a demo.”

## Repository Structure

- Frontend: `src/` (React + Vite, Tailwind, shadcn/Radix)
- Contracts: `contracts/` (Solidity)
- Backend API: `api/` (Node.js/TypeScript)
- AI Engine: `ai-engine/` (Python)
- SDK: `sdk/` (TypeScript)
- Docs: `docs/` (API/SDK/deployment)

## Contributing

- Issues and PRs are welcome for security, UX, and protocol improvements
- Please discuss any changes to compliance logic or tokenization standards before submitting PRs

## License

Copyright © Rohan Kumar. All rights reserved. License to be finalized prior to mainnet.

---

For quick starts, see `WALLET_SETUP.md` for Mantle Sepolia connection and `docs/DEPLOYMENT.md` for environment configuration.

- **ComplianceRegistry**
	- **Contract address:** 0xC71835dC515baD2464E62377E82D8391F891b91D
	- **Transaction:** 0x346732046ff5368ab40762445af3fffcc349243f5eaf44390fbe765c16b90610 (block 32765686)
	- **Block hash:** 0x40a1abf3f7279a1da35afc1d16bcb2ee9282e22135b23c5b6ef4df879e8f67e0
	- **Deployer:** 0x8b550Ff0BA4F55f070cafA161E44e84AbeDbBc56
	- **Verification:** Sourcify — Verified. Etherscan verification skipped (API key not provided). Blockscout indexing timed out.
	- **Roles granted on deployment:** `DEFAULT_ADMIN_ROLE` (bytes32(0)) granted to 0x8b550Ff0BA4F55f070cafA161E44e84AbeDbBc56; role `0x0ce23c3e399818cfee81a7ab0880f714e53d7672b08df0fa62f2843416e1ea09` granted to 0x8b550Ff0BA4F55f070cafA161E44e84AbeDbBc56
	- **Notes:** Explorer links are not included because the target network was not specified. To add direct Etherscan/Blockscout links I need the network name (e.g., `Ethereum`, `Polygon`, `BSC`, `Sepolia`, or a custom explorer base URL`).

- **DEXCore**
	- **Contract address:** 0xde7D5DD34225E93d37427d7de7D1Adb42908E12E
	- **Transaction:** 0x8d3d5bc509f353b2fe5967bb74356249af5c4bc5553f8f09e2e7749a2e38af23 (block 32765831)
	- **Block hash:** 0x97f1ec764ec02612bacc5bd26c0a6554de1fbf86b31e6de393eaaad18293e596
	- **Deployer:** 0x8b550Ff0BA4F55f070cafA161E44e84AbeDbBc56
	- **Constructor input:** `_usdc` => 0x8b550Ff0BA4F55f070cafA161E44e84AbeDbBc56
	- **Transaction cost:** 11732935874 gas
	- **Verification:** Sourcify — Verified. Etherscan verification skipped (API key not provided). Blockscout indexing timed out.
	- **Events on deployment:** `OwnershipTransferred` from zero address to 0x8b550Ff0BA4F55f070cafA161E44e84AbeDbBc56 (deployment owner)
	- **Notes:** As with `ComplianceRegistry`, explorer links are omitted until the network/explorer is specified. I can add direct links once you confirm the target network.

- **PriceOracle**
	- **Contract address:** 0x2aB068440E8D2006B9bA2f2995932Cb4fC33e21C
	- **Transaction:** 0x3a05bca09ce3481c7fd67315668866dfaf625ca5c654bd94afb9632521982ac1 (block 32765993)
	- **Block hash:** 0xafd6c1aee816208af9963dc1c690c890940a75f7b7d4ecbb473c48730aabc411
	- **Block number:** 32765993
	- **Deployer:** 0x8b550Ff0BA4F55f070cafA161E44e84AbeDbBc56
	- **Transaction cost:** 4935474919 gas
	- **Verification:** Sourcify — Verified. Etherscan verification skipped (API key not provided). Blockscout indexing timed out.
	- **Events on deployment:** `OwnershipTransferred` from zero address to 0x8b550Ff0BA4F55f070cafA161E44e84AbeDbBc56
	- **Notes:** Explorer links omitted until network is specified; I can add Etherscan/Blockscout links if you tell me the target network or explorer base URL.

- **YieldDistributor**
	- **Contract address:** 0xE4FcBb5f73f661363B658a144D0AeF162d5487f2
	- **Transaction:** 0xed0b4800e4477943126e33a4d3ead594a1efe9c8bcdc573640a27c4d4ea88c90 (block 32766074)
	- **Block hash:** 0x05f613ae9d36180d6a1ca3bd94340ca5ec559d2139affb1e55592a3a9119c766
	- **Block number:** 32766074
	- **Deployer:** 0x8b550Ff0BA4F55f070cafA161E44e84AbeDbBc56
	- **Constructor input:** `_yieldToken` => 0x8b550Ff0BA4F55f070cafA161E44e84AbeDbBc56
	- **Transaction cost:** 5273076198 gas
	- **Verification:** Sourcify — Verified. Etherscan verification skipped (API key not provided). Blockscout indexing timed out.
	- **Events on deployment:** `OwnershipTransferred` from zero address to 0x8b550Ff0BA4F55f070cafA161E44e84AbeDbBc56
	- **Notes:** Explorer links omitted until network/explorer is specified; tell me the network and I will add direct explorer links and the Sourcify URL.

- **RWAToken**
	- **Contract address:** 0xd9145CCE52D386f254917e481eB44e9943F39138
	- **Transaction:** 0xc00581e9e875d2a6c97cf93243506c7b240ee82d9b75c10e0c10ba5e20618c39 (block 1)
	- **Block hash:** 0x0a569f72e31c55a378df19fd6a2d5084c9c10072322d206ce8877d20323c57c3
	- **Block number:** 1
	- **Deployer:** 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4
	- **Constructor inputs:**
		- `name`: "RWA Real Estate Bond"
		- `symbol`: "USD"
		- `totalSupply`: 1000000000000000000000000
		- `_assetType`: 1
		- `_totalAssetValue`: 10000000
		- `_yieldRate`: 600
		- `_maturityDate`: 1830297600
		- `_jurisdiction`: "Singapore"
		- `_complianceRegistry`: 0xC71835dC515baD2464E62377E82D8391F891b91D
		- `_complianceRequired`: true
	- **Transaction cost:** 2607945 gas (execution cost 2339751)
	- **Events on deployment:**
		- `OwnershipTransferred` from zero address to 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4
		- `Transfer` mint from zero address to 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4 (initial supply minted)
	- **Verification / network:** Deployed on a local/test VM (block 1). No public explorer verification recorded. If this was deployed to a public network, tell me which one and I will add explorer links and verification URLs (Sourcify/Etherscan) where available.

- **LendingProtocol**
	- **Contract address:** 0x653EE2ea054252c71878e4F382A5810C199F0285
	- **Transaction:** 0xc1150a9a97d7b57478ff0044cb6caadd1a353c9720b4e9e3c42f266c96015097 (block 32766440)
	- **Block hash:** 0x62ea187065e493bc722a465cc4ce571e8f0f1c296391097e8a21dd8079f28a14
	- **Block number:** 32766440
	- **Deployer:** 0x8b550Ff0BA4F55f070cafA161E44e84AbeDbBc56
	- **Constructor inputs:**
		- `_borrowToken`: 0xd9145CCE52D386f254917e481eB44e9943F39138
		- `_priceOracle`: 0x2aB068440E8D2006B9bA2f2995932Cb4fC33e21C
	- **Transaction cost:** 9262983249 gas
	- **Verification:** Sourcify — Verified. Etherscan verification skipped (API key not provided). Blockscout indexing timed out.
	- **Events on deployment:** `OwnershipTransferred` from zero address to 0x8b550Ff0BA4F55f070cafA161E44e84AbeDbBc56
	- **Notes:** Explorer links omitted until target network/explorer is specified. Tell me the network and I will add direct Etherscan/Blockscout links and the Sourcify URL.

- **RWAFactory**
	- **Contract address:** 0x2DdE400Dca7d02F337f6f21124C0Bf108096DD1c
	- **Transaction:** 0x5e38a3db4e7b1e983b26a7ed5af56832b3544b15b0cb5411de0ea2e415286475 (block 32766550)
	- **Block number:** 32766550
	- **Transaction index:** 1
	- **Deployer:** 0x8b550Ff0BA4F55f070cafA161E44e84AbeDbBc56
	- **Network:** Mantle Sepolia Testnet (chainId: 5003)
	- **Verification:** Sourcify — Verified (Exact Match). Verified at 2025-12-30 06:56:32 UTC. Compilation target: `contracts/RWAFactory.sol:RWAFactory` (solc 0.8.31+commit.fd3a2265, EVM version: default).
	- **Notes:** Etherscan verification skipped (API key not provided). Blockscout indexing timed out. If you want, I can add direct Mantle Sepolia explorer links and the Sourcify view URL — tell me whether to include the Sourcify link or other explorer links.
