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
