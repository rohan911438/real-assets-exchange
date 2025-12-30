# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

# Real Assets Exchange

Real Assets Exchange is a front-end reference application for a tokenized real-asset marketplace. It demonstrates a modern React + TypeScript + Vite UI with components for discovering, trading, and managing liquidity for on-chain representations of physical assets.

**Quick Summary**

- **Product:** A UI prototype for listing, trading, and managing tokenized real-world assets.
- **Focus:** Marketplace, trading, lending, liquidity management, and analytics dashboards.
- **Audience:** Front-end developers, product designers, and blockchain teams evaluating UX patterns for asset-backed marketplaces.

**Key Features**

- **Marketplace:** Browse asset listings and view asset details.
- **Trading:** Order entry and trading flows (UI-only or connected to backend integrations).
- **Liquidity & Lending:** Pages to add/remove liquidity and view lending markets.
- **Dashboard & Analytics:** User dashboard, portfolio view, and analytics charts.
- **Wallet Integration:** `WalletContext` for connecting a wallet and managing session state.
- **Component Library:** shadcn + Radix UI powered components and Tailwind CSS utilities.
- **Mock Data:** Local mock data for quickly previewing UI flows (`src/data/mockData.ts`).

**Pages (in `src/pages`)**

- `Landing` : Marketing / home page
- `Marketplace` : Asset discovery and listings
- `Trade` : Trading interface
- `Liquidity` : Liquidity pools and management
- `Lending` : Lending markets overview
- `Dashboard` : User portfolio and actions
- `Analytics` : Charts and metrics
- `Profile` : User account and settings
- `NotFound` : 404 page

**Tech Stack**

- **Framework:** Vite + React + TypeScript
- **Styling:** Tailwind CSS (+ tailwindcss-animate)
- **UI primitives:** Radix UI + shadcn components
- **State & Data:** React context, `@tanstack/react-query` (present in deps)
- **Charts & UI libs:** Recharts, framer-motion, lucide-react

Installation & Local Development

1. Install dependencies:

```bash
npm install
```

2. Start local dev server:

```bash
npm run dev
```

Available scripts (from `package.json`):

- `dev`: Start Vite dev server
- `build`: Build production assets
- `build:dev`: Build with development mode
- `preview`: Serve built assets locally
- `lint`: Run ESLint

Development Notes

- UI is component-driven under `src/components` with a `ui/` subfolder containing many reusable primitives.
- Wallet context lives in `src/contexts/WalletContext.tsx` and is the recommended integration point for wallet providers.
- Mock data and simple utils are in `src/data` and `src/lib/utils.ts` for quick prototyping without a backend.

Contributing

- Open issues or PRs for improvements.
- Keep changes focused and follow existing code style.

License

- Add a license file or update this README with the appropriate license for your project.

Where to look next

- UI entry: `src/main.tsx`
- Layout components: `src/components/layout`
- Mock data: `src/data/mockData.ts`

If you want, I can also:

- Add a short demo GIF or screenshots to this README
- Add a CONTRIBUTING.md and CODE_OF_CONDUCT
- Wire up a basic backend mock or API contract

---
Updated to reflect the project's purpose and developer setup.

**Contracts**

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
