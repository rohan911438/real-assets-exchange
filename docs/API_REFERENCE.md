# RWA DEX API Documentation

Complete REST API documentation for the RWA DEX platform.

## Base URL

- Development: `http://localhost:5000/api`
- Production: `https://api.rwa-dex.com/api`

## Authentication

Most endpoints require JWT authentication obtained through wallet signature verification.

### Headers
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

## Response Format

All API responses follow this structure:

```json
{
  "success": boolean,
  "data": object | array | null,
  "error": {
    "code": string,
    "message": string,
    "details": object
  } | null,
  "timestamp": string
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `BAD_REQUEST` | Invalid request parameters |
| `UNAUTHORIZED` | Authentication required or invalid token |
| `FORBIDDEN` | Access denied |
| `NOT_FOUND` | Resource not found |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INSUFFICIENT_BALANCE` | Insufficient token balance |
| `COMPLIANCE_REQUIRED` | KYC verification required |
| `BLOCKCHAIN_ERROR` | Smart contract interaction failed |
| `INTERNAL_ERROR` | Server error |

## Authentication Endpoints

### GET `/auth/nonce/:address`

Get nonce for wallet signature.

**Parameters:**
- `address` (path): Ethereum address

**Response:**
```json
{
  "success": true,
  "data": {
    "nonce": "abc123...",
    "message": "Please sign this message to authenticate..."
  }
}
```

### POST `/auth/connect`

Verify wallet signature and get JWT token.

**Body:**
```json
{
  "address": "0x742d35Cc7970C1C2dE54DfB8b3E82F0F68659C03",
  "signature": "0x1234...",
  "message": "Please sign this message..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "address": "0x742d35cc7970c1c2de54dfb8b3e82f0f68659c03",
    "expiresIn": "7d"
  }
}
```

### GET `/auth/verify`

Verify token validity.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "address": "0x742d35cc7970c1c2de54dfb8b3e82f0f68659c03",
    "expiresAt": "2025-01-08T10:30:00Z"
  }
}
```

## Asset Endpoints

### GET `/assets`

List all available RWA tokens.

**Query Parameters:**
- `type`: Asset type filter (`RealEstate`, `Bond`, `Invoice`, `Commodity`, `Equipment`)
- `minAPY`: Minimum APY filter
- `maxAPY`: Maximum APY filter
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `jurisdiction`: Jurisdiction filter
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sortBy`: Sort field (`name`, `price`, `apy`, `tvl`)
- `sortOrder`: Sort order (`asc`, `desc`)

**Example:**
```
GET /assets?type=RealEstate&minAPY=5&maxAPY=15&page=1&limit=10&sortBy=apy&sortOrder=desc
```

**Response:**
```json
{
  "success": true,
  "data": {
    "assets": [
      {
        "address": "0x742d35Cc7970C1C2dE54DfB8b3E82F0F68659C03",
        "name": "NYC Property Token",
        "symbol": "NYCPT",
        "decimals": 18,
        "assetType": "RealEstate",
        "totalAssetValue": "5000000",
        "yieldRate": 800,
        "maturityDate": "1735689600",
        "jurisdiction": "US",
        "currentPrice": "100.50",
        "apy": 8.0,
        "tvl": "2500000",
        "liquidity": {
          "reserve0": "50000000000000000000000",
          "reserve1": "2500000000000",
          "totalLiquidity": "1118033988749895000000",
          "lastPrice": "100500000000000000000"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 42,
      "itemsPerPage": 10
    }
  }
}
```

### GET `/assets/:tokenAddress`

Get detailed asset information.

**Parameters:**
- `tokenAddress` (path): Token contract address

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "0x742d35Cc7970C1C2dE54DfB8b3E82F0F68659C03",
    "name": "NYC Property Token",
    "symbol": "NYCPT",
    "decimals": 18,
    "assetType": "RealEstate",
    "totalAssetValue": "5000000",
    "yieldRate": 800,
    "maturityDate": "1735689600",
    "jurisdiction": "US",
    "assetURI": "https://ipfs.io/ipfs/QmX...",
    "currentPrice": "100.50",
    "priceTimestamp": "1704067200",
    "apy": 8.0,
    "tvl": "2500000",
    "liquidity": {
      "reserve0": "50000000000000000000000",
      "reserve1": "2500000000000",
      "totalLiquidity": "1118033988749895000000",
      "lastPrice": "100500000000000000000",
      "lastUpdateTime": "1704067200"
    },
    "userCanTrade": true,
    "compliance": {
      "required": true,
      "userVerified": true
    }
  }
}
```

### GET `/assets/:tokenAddress/history`

Get price history for an asset.

**Parameters:**
- `tokenAddress` (path): Token contract address

**Query Parameters:**
- `period`: Time period (`24h`, `7d`, `30d`, `90d`, `1y`)
- `interval`: Data interval (`1h`, `4h`, `1d`, `1w`)

**Response:**
```json
{
  "success": true,
  "data": {
    "tokenAddress": "0x742d35Cc7970C1C2dE54DfB8b3E82F0F68659C03",
    "period": "24h",
    "interval": "1h",
    "history": [
      {
        "timestamp": "2025-01-01T00:00:00Z",
        "price": "100.25",
        "volume": 8500,
        "trades": 45
      },
      {
        "timestamp": "2025-01-01T01:00:00Z",
        "price": "100.50",
        "volume": 12300,
        "trades": 67
      }
    ]
  }
}
```

### POST `/assets/create` 🔒

Create new RWA token (authorized issuers only).

**Body:**
```json
{
  "name": "Miami Property Token",
  "symbol": "MIPT",
  "totalSupply": 1000000,
  "assetType": "RealEstate",
  "totalAssetValue": 10000000,
  "yieldRate": 750,
  "maturityDate": 1767225600,
  "jurisdiction": "US",
  "complianceRequired": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tokenAddress": "0x123...",
    "name": "Miami Property Token",
    "symbol": "MIPT",
    "message": "Token creation initiated. Transaction pending confirmation.",
    "estimatedConfirmationTime": "2-5 minutes"
  }
}
```

## Market Endpoints

### GET `/market/prices`

Get current prices for all assets.

**Response:**
```json
{
  "success": true,
  "data": {
    "prices": [
      {
        "tokenAddress": "0x742d35Cc7970C1C2dE54DfB8b3E82F0F68659C03",
        "symbol": "NYCPT",
        "price": "100.50",
        "change24h": 2.5,
        "volume24h": "150000",
        "timestamp": "1704067200"
      }
    ],
    "lastUpdated": "2025-01-01T12:00:00Z"
  }
}
```

### GET `/market/volume`

Get 24h trading volume.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalVolume24h": "5500000",
    "volumeChange24h": 15.2,
    "topAssets": [
      {
        "tokenAddress": "0x742d35Cc7970C1C2dE54DfB8b3E82F0F68659C03",
        "symbol": "NYCPT",
        "volume24h": "150000"
      }
    ]
  }
}
```

### GET `/market/stats`

Get overall market statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalValueLocked": "125000000",
    "totalVolume24h": "5500000",
    "totalAssets": 42,
    "activeTraders24h": 1250,
    "averageAPY": 7.8,
    "totalYieldDistributed": "950000",
    "marketCap": "89000000"
  }
}
```

## Trading Endpoints

### POST `/trade/preview` 🔒

Preview trade outcome.

**Body:**
```json
{
  "tokenIn": "0x742d35Cc7970C1C2dE54DfB8b3E82F0F68659C03",
  "tokenOut": "0xA0b86a33E6441D9E8E99C0B5c0aE4E5F4e1d00f5",
  "amountIn": "1000000000000000000"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "amountOut": "100500000",
    "priceImpact": "0.15",
    "fee": "301500",
    "minimumAmountOut": "100199250",
    "route": ["0x742d35...", "0xA0b86a..."],
    "gasEstimate": "180000"
  }
}
```

### GET `/trade/history/:address` 🔒

Get user's trading history.

**Parameters:**
- `address` (path): User address

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `type`: Trade type filter (`swap`, `add_liquidity`, `remove_liquidity`)

**Response:**
```json
{
  "success": true,
  "data": {
    "trades": [
      {
        "id": "123",
        "type": "swap",
        "tokenIn": "0x742d35...",
        "tokenOut": "0xA0b86a...",
        "amountIn": "1000000000000000000",
        "amountOut": "100500000",
        "fee": "301500",
        "timestamp": "2025-01-01T12:00:00Z",
        "txHash": "0xabc123...",
        "status": "completed"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25
    }
  }
}
```

## Portfolio Endpoints

### GET `/portfolio/:address` 🔒

Get user's complete portfolio.

**Parameters:**
- `address` (path): User address

**Response:**
```json
{
  "success": true,
  "data": {
    "totalValue": "25000000000000000000000",
    "totalYield": "2000000000000000000000",
    "performance": {
      "daily": 1.5,
      "weekly": 8.2,
      "monthly": 25.7,
      "allTime": 125.3
    },
    "assets": [
      {
        "address": "0x742d35Cc7970C1C2dE54DfB8b3E82F0F68659C03",
        "name": "NYC Property Token",
        "symbol": "NYCPT",
        "balance": "250000000000000000000",
        "value": "25125000000000000000000",
        "claimableYield": "500000000000000000000",
        "performance24h": 2.1,
        "apy": 8.0,
        "allocation": 45.5
      }
    ]
  }
}
```

### GET `/portfolio/:address/assets` 🔒

Get list of assets user owns.

**Response:**
```json
{
  "success": true,
  "data": {
    "assets": [
      {
        "tokenAddress": "0x742d35...",
        "symbol": "NYCPT",
        "balance": "250000000000000000000",
        "value": "25125000000000000000000"
      }
    ],
    "totalAssets": 3,
    "totalValue": "55000000000000000000000"
  }
}
```

### GET `/portfolio/:address/yield` 🔒

Get claimable yield for all assets.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalClaimableYield": "1500000000000000000000",
    "yields": [
      {
        "tokenAddress": "0x742d35...",
        "symbol": "NYCPT",
        "claimableAmount": "500000000000000000000",
        "lastClaimed": "2024-12-25T00:00:00Z",
        "accumulatedSince": "2024-12-26T00:00:00Z"
      }
    ]
  }
}
```

### GET `/portfolio/:address/transactions` 🔒

Get transaction history with pagination.

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `type`: Transaction type filter

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "tx123",
        "type": "swap",
        "txHash": "0xabc...",
        "from": "0x742d35...",
        "to": "0xA0b86a...",
        "amount": "1000000000000000000",
        "valueUsd": "100.50",
        "timestamp": "2025-01-01T12:00:00Z",
        "status": "completed",
        "gasUsed": "180000"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 95
    }
  }
}
```

## Liquidity Endpoints

### GET `/liquidity/pools` 🔒

List all liquidity pools.

**Response:**
```json
{
  "success": true,
  "data": {
    "pools": [
      {
        "tokenAddress": "0x742d35...",
        "symbol": "NYCPT",
        "reserve0": "50000000000000000000000",
        "reserve1": "5000000000000",
        "totalLiquidity": "1118033988749895000000",
        "apy": 12.5,
        "volume24h": "150000000000",
        "fees24h": "450000000"
      }
    ]
  }
}
```

### GET `/liquidity/positions/:address` 🔒

Get user's LP positions.

**Parameters:**
- `address` (path): User address

**Response:**
```json
{
  "success": true,
  "data": {
    "positions": [
      {
        "tokenAddress": "0x742d35...",
        "symbol": "NYCPT",
        "lpBalance": "5000000000000000000",
        "share": "0.45",
        "token0Amount": "2250000000000000000000",
        "token1Amount": "225000000000",
        "value": "45000000000000000000000",
        "earnings24h": "125000000000000000000",
        "apy": 12.5
      }
    ],
    "totalValue": "75000000000000000000000",
    "totalEarnings24h": "300000000000000000000"
  }
}
```

## Lending Endpoints

### GET `/lending/markets`

Get lending market data.

**Response:**
```json
{
  "success": true,
  "data": {
    "markets": [
      {
        "collateralToken": "0x742d35...",
        "symbol": "NYCPT",
        "totalCollateral": "10000000000000000000000",
        "totalBorrowed": "4000000000000",
        "borrowAPY": 6.0,
        "ltv": 50,
        "liquidationThreshold": 80,
        "utilizationRate": 40.0
      }
    ],
    "totalCollateral": "50000000000000000000000",
    "totalBorrowed": "20000000000000"
  }
}
```

### GET `/lending/positions/:address` 🔒

Get user's borrowed/collateral positions.

**Parameters:**
- `address` (path): User address

**Response:**
```json
{
  "success": true,
  "data": {
    "positions": [
      {
        "positionId": 0,
        "collateralToken": "0x742d35...",
        "collateralAmount": "10000000000000000000000",
        "borrowedAmount": "4000000000000",
        "healthFactor": "1.25",
        "liquidationPrice": "80.00",
        "interestAccrued": "50000000",
        "lastUpdate": "2025-01-01T12:00:00Z"
      }
    ],
    "totalCollateralValue": "100000000000000000000000",
    "totalBorrowedValue": "40000000000000",
    "totalHealthFactor": "2.5"
  }
}
```

## Analytics Endpoints

### GET `/analytics/tvl`

Get Total Value Locked over time.

**Query Parameters:**
- `period`: Time period (`24h`, `7d`, `30d`, `90d`, `1y`)

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "30d",
    "currentTVL": "125000000",
    "change": 15.8,
    "history": [
      {
        "timestamp": "2024-12-02T00:00:00Z",
        "tvl": "108000000"
      },
      {
        "timestamp": "2024-12-03T00:00:00Z",
        "tvl": "110000000"
      }
    ]
  }
}
```

### GET `/analytics/volume`

Get trading volume by time period.

**Response:**
```json
{
  "success": true,
  "data": {
    "volume24h": "5500000",
    "volume7d": "32000000",
    "volume30d": "145000000",
    "volumeGrowth": {
      "daily": 12.5,
      "weekly": 8.3,
      "monthly": 25.7
    }
  }
}
```

### GET `/analytics/topAssets`

Get top performing assets.

**Query Parameters:**
- `metric`: Ranking metric (`volume`, `apy`, `tvl`, `performance`)
- `period`: Time period for performance metrics

**Response:**
```json
{
  "success": true,
  "data": {
    "metric": "apy",
    "topAssets": [
      {
        "tokenAddress": "0x742d35...",
        "symbol": "NYCPT",
        "name": "NYC Property Token",
        "value": 12.5,
        "rank": 1
      }
    ]
  }
}
```

## Rate Limiting

API endpoints are rate limited:

- **General endpoints**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 10 requests per minute per IP
- **Trading endpoints**: 50 requests per minute per authenticated user

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704067800
```

## Webhook Events

Subscribe to real-time events:

### Available Events
- `asset.created`: New RWA token created
- `trade.executed`: Trade completed
- `liquidity.added`: Liquidity added to pool
- `liquidity.removed`: Liquidity removed from pool
- `yield.distributed`: Yield distributed to token holders
- `yield.claimed`: User claimed yield

### Webhook Payload
```json
{
  "event": "trade.executed",
  "timestamp": "2025-01-01T12:00:00Z",
  "data": {
    "txHash": "0xabc123...",
    "user": "0x742d35...",
    "tokenIn": "0x123...",
    "tokenOut": "0x456...",
    "amountIn": "1000000000000000000",
    "amountOut": "100500000"
  }
}
```

## SDKs and Libraries

### JavaScript/TypeScript
```bash
npm install @rwa-dex/sdk
```

### Python
```bash
pip install rwa-dex-python
```

### Go
```bash
go get github.com/rwa-dex/go-sdk
```

## Support

- API Documentation: https://docs.rwa-dex.com
- Discord: https://discord.gg/rwa-dex
- Email: api-support@rwa-dex.com

## Changelog

See [API_CHANGELOG.md](./API_CHANGELOG.md) for version history and breaking changes.