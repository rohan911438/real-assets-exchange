import { Router, Response } from 'express';
import { BlockchainService } from '../services/blockchain';
import { RedisService } from '../services/redis';
import { createError } from '../middleware/errorHandler';
import { AuthenticatedRequest, optionalAuthMiddleware } from '../middleware/auth';

const router = Router();

/**
 * Get all available RWA tokens with optional filters
 */
router.get('/', optionalAuthMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { 
      type, 
      minAPY, 
      maxAPY, 
      minPrice, 
      maxPrice, 
      jurisdiction, 
      page = '1', 
      limit = '20',
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Check cache first
    const cacheKey = `assets:filtered:${JSON.stringify(req.query)}`;
    const cachedAssets = await RedisService.getJson(cacheKey);
    
    if (cachedAssets) {
      return res.json({
        success: true,
        data: cachedAssets,
        error: null,
        timestamp: new Date().toISOString()
      });
    }

    // Get all tokens from factory contract
    if (!BlockchainService.factory) {
      throw createError.blockchain('Factory contract not available');
    }

    const totalTokens = await BlockchainService.factory.totalTokens();
    const allTokenAddresses: string[] = [];
    
    // Get all token addresses
    for (let i = 0; i < totalTokens; i++) {
      const tokenAddress = await BlockchainService.factory.allTokens(i);
      allTokenAddresses.push(tokenAddress);
    }

    // Fetch detailed info for each token
    const assetsPromises = allTokenAddresses.map(async (address) => {
      try {
        const assetInfo = await BlockchainService.getAssetInfo(address);
        const poolInfo = await BlockchainService.getPoolInfo(address);
        const priceInfo = await BlockchainService.getPrice(address);

        return {
          ...assetInfo,
          currentPrice: priceInfo.price,
          priceTimestamp: priceInfo.timestamp,
          liquidity: {
            reserve0: poolInfo.reserve0,
            reserve1: poolInfo.reserve1,
            totalLiquidity: poolInfo.totalLiquidity,
            lastPrice: poolInfo.lastPrice
          },
          tvl: poolInfo.reserve1, // USDC reserve as TVL approximation
          apy: parseFloat(assetInfo.yieldRate) / 100 // Convert basis points to percentage
        };
      } catch (error) {
        console.error(`Error fetching info for token ${address}:`, error);
        return null;
      }
    });

    let assets = (await Promise.all(assetsPromises)).filter(asset => asset !== null);

    // Apply filters
    if (type) {
      assets = assets.filter(asset => asset.assetType.toLowerCase() === type.toString().toLowerCase());
    }

    if (minAPY) {
      assets = assets.filter(asset => asset.apy >= parseFloat(minAPY.toString()));
    }

    if (maxAPY) {
      assets = assets.filter(asset => asset.apy <= parseFloat(maxAPY.toString()));
    }

    if (minPrice) {
      assets = assets.filter(asset => parseFloat(asset.currentPrice) >= parseFloat(minPrice.toString()));
    }

    if (maxPrice) {
      assets = assets.filter(asset => parseFloat(asset.currentPrice) <= parseFloat(maxPrice.toString()));
    }

    if (jurisdiction) {
      assets = assets.filter(asset => asset.jurisdiction.toLowerCase() === jurisdiction.toString().toLowerCase());
    }

    // Sort assets
    assets.sort((a, b) => {
      let aValue = a[sortBy as keyof typeof a];
      let bValue = b[sortBy as keyof typeof b];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });

    // Pagination
    const pageNum = parseInt(page.toString());
    const limitNum = parseInt(limit.toString());
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedAssets = assets.slice(startIndex, startIndex + limitNum);

    const result = {
      assets: paginatedAssets,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(assets.length / limitNum),
        totalItems: assets.length,
        itemsPerPage: limitNum
      }
    };

    // Cache results for 10 minutes
    await RedisService.setJson(cacheKey, result, 600);

    res.json({
      success: true,
      data: result,
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get detailed information for a specific asset
 */
router.get('/:tokenAddress', optionalAuthMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { tokenAddress } = req.params;

    if (!BlockchainService.provider) {
      throw createError.blockchain('Blockchain service not available');
    }

    // Check if address is valid
    const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(tokenAddress);
    if (!isValidAddress) {
      throw createError.badRequest('Invalid token address');
    }

    // Check cache first
    const cacheKey = `asset:${tokenAddress}`;
    const cachedAsset = await RedisService.getJson(cacheKey);
    
    if (cachedAsset) {
      return res.json({
        success: true,
        data: cachedAsset,
        error: null,
        timestamp: new Date().toISOString()
      });
    }

    // Fetch asset information
    const [assetInfo, poolInfo, priceInfo] = await Promise.all([
      BlockchainService.getAssetInfo(tokenAddress),
      BlockchainService.getPoolInfo(tokenAddress),
      BlockchainService.getPrice(tokenAddress)
    ]);

    // Check compliance if user is authenticated
    let userCanTrade = true;
    if (req.user) {
      userCanTrade = await BlockchainService.checkCompliance(req.user.address, tokenAddress);
    }

    const assetData = {
      ...assetInfo,
      currentPrice: priceInfo.price,
      priceTimestamp: priceInfo.timestamp,
      liquidity: {
        reserve0: poolInfo.reserve0,
        reserve1: poolInfo.reserve1,
        totalLiquidity: poolInfo.totalLiquidity,
        lastPrice: poolInfo.lastPrice,
        lastUpdateTime: poolInfo.lastUpdateTime
      },
      tvl: poolInfo.reserve1,
      apy: parseFloat(assetInfo.yieldRate) / 100,
      userCanTrade,
      compliance: {
        required: true, // Assume compliance is required for all assets
        userVerified: userCanTrade
      }
    };

    // Cache for 5 minutes
    await RedisService.setJson(cacheKey, assetData, 300);

    res.json({
      success: true,
      data: assetData,
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get price history for a specific asset
 */
router.get('/:tokenAddress/history', async (req, res: Response, next) => {
  try {
    const { tokenAddress } = req.params;
    const { period = '24h', interval = '1h' } = req.query;

    // This would typically come from a time-series database
    // For now, we'll return mock data
    const mockHistory = Array.from({ length: 24 }, (_, i) => {
      const timestamp = new Date(Date.now() - (23 - i) * 60 * 60 * 1000);
      const basePrice = 100;
      const variance = Math.sin(i / 4) * 5 + Math.random() * 2;
      
      return {
        timestamp: timestamp.toISOString(),
        price: (basePrice + variance).toFixed(4),
        volume: Math.floor(Math.random() * 10000),
        trades: Math.floor(Math.random() * 100)
      };
    });

    res.json({
      success: true,
      data: {
        tokenAddress,
        period,
        interval,
        history: mockHistory
      },
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get featured/trending assets
 */
router.get('/featured', async (req, res: Response, next) => {
  try {
    const cacheKey = 'assets:featured';
    const cached = await RedisService.getJson(cacheKey);
    
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        error: null,
        timestamp: new Date().toISOString()
      });
    }

    // This would typically be based on trading volume, TVL, etc.
    // For now, we'll return the first few assets
    const allAssets = await RedisService.getCachedAssets();
    const featured = allAssets ? allAssets.slice(0, 5) : [];

    await RedisService.setJson(cacheKey, featured, 1800); // Cache for 30 minutes

    res.json({
      success: true,
      data: featured,
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Create new RWA token (for authorized issuers only)
 */
router.post('/create', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    if (!req.user) {
      throw createError.unauthorized('Authentication required');
    }

    const {
      name,
      symbol,
      totalSupply,
      assetType,
      totalAssetValue,
      yieldRate,
      maturityDate,
      jurisdiction,
      complianceRequired = true
    } = req.body;

    // Validate required fields
    const requiredFields = ['name', 'symbol', 'totalSupply', 'assetType', 'totalAssetValue', 'yieldRate', 'jurisdiction'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        throw createError.badRequest(`Missing required field: ${field}`);
      }
    }

    // Check if user is authorized issuer
    if (!BlockchainService.factory) {
      throw createError.blockchain('Factory contract not available');
    }

    const isAuthorized = await BlockchainService.factory.authorizedIssuers(req.user.address);
    if (!isAuthorized) {
      throw createError.forbidden('Not authorized to create tokens');
    }

    // This would typically trigger a transaction
    // For demo purposes, we'll return a mock response
    const mockTokenAddress = '0x' + Math.random().toString(16).substr(2, 40);

    res.json({
      success: true,
      data: {
        tokenAddress: mockTokenAddress,
        name,
        symbol,
        message: 'Token creation initiated. Transaction pending confirmation.',
        estimatedConfirmationTime: '2-5 minutes'
      },
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

export default router;