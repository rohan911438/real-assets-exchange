# RWA DEX Backend System

A comprehensive backend system for a Real World Asset (RWA) Decentralized Exchange built on Mantle Network.

## 🏗️ Architecture Overview

This project consists of four main components:

```
rwa-dex-backend/
├── contracts/           # Solidity smart contracts (already implemented)
├── api/                # Node.js/Express backend API
├── ai-engine/          # Python FastAPI AI pricing engine  
├── sdk/                # TypeScript SDK for developers
└── docs/               # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Docker and Docker Compose
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd real-assets-exchange
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Or run services individually:**

   **API Service:**
   ```bash
   cd api
   npm install
   npm run dev
   ```

   **AI Engine:**
   ```bash
   cd ai-engine
   pip install -r requirements.txt
   python main.py
   ```

   **SDK:**
   ```bash
   cd sdk
   npm install
   npm run build
   ```

### Service URLs

- API: http://localhost:5000
- AI Engine: http://localhost:8001
- Nginx Proxy: http://localhost:80
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## 📚 API Documentation

### Authentication

All API endpoints requiring authentication use JWT tokens obtained through wallet signature verification.

#### POST `/api/auth/nonce/:address`
Get a nonce for wallet signature.

#### POST `/api/auth/connect`
Verify wallet signature and get JWT token.

```json
{
  "address": "0x...",
  "signature": "0x...",
  "message": "Please sign this message..."
}
```

### Asset Management

#### GET `/api/assets`
List all RWA tokens with optional filters.

Query Parameters:
- `type`: Asset type (RealEstate, Bond, Invoice, Commodity, Equipment)
- `minAPY`, `maxAPY`: APY range filters
- `minPrice`, `maxPrice`: Price range filters
- `jurisdiction`: Asset jurisdiction
- `page`, `limit`: Pagination
- `sortBy`, `sortOrder`: Sorting

#### GET `/api/assets/:tokenAddress`
Get detailed asset information.

#### POST `/api/assets/create`
Create new RWA token (authorized issuers only).

### Trading

#### POST `/api/trade/preview`
Preview trade outcome without execution.

#### GET `/api/market/prices`
Get current prices for all assets.

### Portfolio

#### GET `/api/portfolio/:address`
Get user's complete portfolio.

#### GET `/api/portfolio/:address/yield`
Get claimable yield for all assets.

### AI Integration

#### POST `/api/ai/predict-price`
Get AI price prediction for an asset.

#### POST `/api/ai/risk-score`
Calculate risk score for an asset.

#### POST `/api/ai/portfolio-analysis`
Analyze portfolio and get recommendations.

## 🤖 AI Engine Documentation

The AI engine provides machine learning-powered insights for RWA tokens.

### Features

1. **Price Prediction**: Random Forest model predicting fair value
2. **Risk Scoring**: Multi-factor risk assessment
3. **Anomaly Detection**: Isolation Forest for unusual patterns
4. **Portfolio Analysis**: Diversification and optimization recommendations

### Models

#### Price Prediction Model
- **Algorithm**: Random Forest Regression
- **Features**: Asset characteristics, market data, liquidity metrics, technical indicators
- **Output**: Predicted price + confidence score

#### Risk Scoring System
- **Components**: Liquidity risk, volatility risk, market cap risk, compliance risk, asset quality risk
- **Weights**: Configurable via environment variables
- **Output**: 0-100 risk score with categorization

#### Anomaly Detection
- **Algorithm**: Isolation Forest
- **Purpose**: Detect market manipulation, unusual trading patterns
- **Output**: Anomaly flag + confidence score

### API Endpoints

#### POST `/api/ai/predict-price`
```json
{
  "token_address": "0x...",
  "name": "Property Token",
  "asset_type": "RealEstate",
  "total_asset_value": 1000000,
  "current_price": 100,
  "volume_24h": 50000,
  "yield_rate": 800
}
```

Response:
```json
{
  "predicted_price": 105.5,
  "confidence_score": 0.85,
  "recommendation": "BUY",
  "reasoning": "AI model predicts asset is undervalued by 5.5%"
}
```

## 💻 SDK Documentation

The TypeScript SDK provides easy integration with RWA DEX contracts and APIs.

### Installation

```bash
npm install @rwa-dex/sdk
```

### Basic Usage

```typescript
import { RWADex } from '@rwa-dex/sdk';

// Initialize SDK
const rwa = new RWADex({
  network: 'mantle-testnet',
  privateKey: 'your-private-key', // Optional for read-only
  apiBaseUrl: 'http://localhost:5000/api',
  aiEngineUrl: 'http://localhost:8001/api/ai'
});

// Get asset information
const asset = await rwa.getAsset('0x...');

// Preview a swap
const preview = await rwa.previewSwap({
  tokenIn: '0x...',
  tokenOut: '0x...',
  amountIn: '1000000000000000000', // 1 token
  minAmountOut: '950000000000000000'  // 0.95 tokens minimum
});

// Execute swap
const tx = await rwa.swap({
  tokenIn: '0x...',
  tokenOut: '0x...',
  amountIn: '1000000000000000000',
  minAmountOut: '950000000000000000'
});

await tx.wait();

// Get AI prediction
const prediction = await rwa.getAIPrediction('0x...');
console.log(prediction.recommendation); // BUY, HOLD, or SELL
```

### Available Methods

#### Asset Management
- `getAsset(address)`: Get asset details
- `listAssets(filters?)`: List assets with filters

#### Trading
- `previewSwap(params)`: Preview swap outcome
- `swap(params, options?)`: Execute swap

#### Liquidity
- `addLiquidity(params, options?)`: Add liquidity to pool
- `removeLiquidity(params, options?)`: Remove liquidity

#### Portfolio
- `getPortfolio(address)`: Get user portfolio
- `claimYield(tokenAddress, options?)`: Claim yield

#### Lending
- `depositCollateral(params, options?)`: Deposit collateral
- `borrow(params, options?)`: Borrow against collateral

#### AI Integration
- `getAIPrediction(tokenAddress)`: Get AI price prediction

## 🔧 Smart Contracts

The system uses 7 main smart contracts (already implemented):

1. **RWAToken.sol**: ERC-20 token representing real world assets
2. **RWAFactory.sol**: Factory for deploying new RWA tokens
3. **DEXCore.sol**: Hybrid DEX with AMM and order book
4. **ComplianceRegistry.sol**: KYC/AML compliance management
5. **LendingProtocol.sol**: Lending against RWA collateral
6. **YieldDistributor.sol**: Automated yield distribution
7. **PriceOracle.sol**: Price feeds for RWA tokens

### Contract Addresses

Update your `.env` file with deployed contract addresses:

```bash
DEX_CORE_ADDRESS=0x...
RWA_FACTORY_ADDRESS=0x...
COMPLIANCE_REGISTRY_ADDRESS=0x...
LENDING_PROTOCOL_ADDRESS=0x...
YIELD_DISTRIBUTOR_ADDRESS=0x...
PRICE_ORACLE_ADDRESS=0x...
```

## 🔒 Security

### API Security
- JWT authentication with wallet signatures
- Rate limiting (100 requests/15 min per IP)
- CORS configuration
- Input validation with Joi/Pydantic
- Helmet.js security headers

### Smart Contract Security
- OpenZeppelin base contracts
- ReentrancyGuard on all state-changing functions
- Access control with roles
- Pausable functionality for emergencies
- Comprehensive testing required

### Infrastructure Security
- Environment variable separation
- Docker container isolation
- Nginx reverse proxy with rate limiting
- Database connection pooling
- Redis for secure session management

## 📊 Monitoring & Logging

### Application Monitoring
- Winston logging with structured JSON
- Health check endpoints on all services
- Error tracking and alerting
- Performance monitoring

### Blockchain Monitoring
- Event listeners for contract interactions
- Transaction status tracking
- Gas usage monitoring
- Failed transaction alerting

### AI Model Monitoring
- Prediction accuracy tracking
- Model drift detection
- Performance metrics logging
- Automated retraining triggers

## 🚀 Deployment

### Docker Production Deployment

1. **Build production images:**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. **Deploy to cloud:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Environment Configuration

For production, update environment variables:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-host:5432/rwa_dex
REDIS_URL=redis://prod-redis:6379
JWT_SECRET=production-secret-very-long-and-random
MANTLE_RPC_URL=https://rpc.mantle.xyz
```

## 🧪 Testing

### API Testing
```bash
cd api
npm test
```

### AI Engine Testing
```bash
cd ai-engine
pytest
```

### SDK Testing
```bash
cd sdk
npm test
```

### Integration Testing
```bash
# Run all services
docker-compose up -d

# Run integration tests
npm run test:integration
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript/Python style guides
- Write comprehensive tests (>80% coverage)
- Document all public APIs
- Use semantic versioning
- Follow conventional commits

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- Documentation: [Full API Docs](./docs/)
- Issues: [GitHub Issues](https://github.com/rwa-dex/backend/issues)
- Discord: [Community Discord](https://discord.gg/rwa-dex)
- Email: support@rwa-dex.com

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core smart contracts
- ✅ Backend API
- ✅ AI pricing engine
- ✅ TypeScript SDK
- ⏳ Frontend integration

### Phase 2 (Next)
- [ ] Advanced AI features
- [ ] Cross-chain bridge
- [ ] Mobile SDK
- [ ] Governance token
- [ ] DAO implementation

### Phase 3 (Future)
- [ ] Institutional features
- [ ] Advanced derivatives
- [ ] Multi-chain deployment
- [ ] Regulatory compliance tools