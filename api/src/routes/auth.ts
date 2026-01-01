import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';
import crypto from 'crypto';
import { RedisService } from '../services/redis';
import { createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

/**
 * Get nonce for wallet signature
 */
router.get('/nonce/:address', async (req, res: Response, next) => {
  try {
    const { address } = req.params;

    if (!ethers.isAddress(address)) {
      throw createError.badRequest('Invalid Ethereum address');
    }

    const nonce = crypto.randomBytes(32).toString('hex');
    await RedisService.setNonce(address.toLowerCase(), nonce);

    res.json({
      success: true,
      data: {
        nonce,
        message: `Please sign this message to authenticate with RWA DEX.\n\nNonce: ${nonce}\nTimestamp: ${new Date().toISOString()}`
      },
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Verify wallet signature and create session
 */
router.post('/connect', async (req, res: Response, next) => {
  try {
    const { address, signature, message } = req.body;

    if (!address || !signature || !message) {
      throw createError.badRequest('Missing required fields: address, signature, message');
    }

    if (!ethers.isAddress(address)) {
      throw createError.badRequest('Invalid Ethereum address');
    }

    // Extract nonce from message
    const nonceMatch = message.match(/Nonce: ([a-f0-9]+)/);
    if (!nonceMatch) {
      throw createError.badRequest('Invalid message format');
    }

    const nonce = nonceMatch[1];
    const storedNonce = await RedisService.getNonce(address.toLowerCase());

    if (!storedNonce || storedNonce !== nonce) {
      throw createError.unauthorized('Invalid or expired nonce');
    }

    // Verify signature
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      
      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        throw createError.invalidSignature('Signature verification failed');
      }
    } catch (error) {
      throw createError.invalidSignature('Invalid signature');
    }

    // Delete used nonce
    await RedisService.deleteNonce(address.toLowerCase());

    // Create JWT token
    const token = jwt.sign(
      { 
        address: address.toLowerCase(),
        nonce,
        type: 'wallet_auth'
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        address: address.toLowerCase(),
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      },
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Verify token validity
 */
router.get('/verify', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError.unauthorized('No token provided');
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      res.json({
        success: true,
        data: {
          valid: true,
          address: decoded.address,
          expiresAt: new Date(decoded.exp * 1000).toISOString()
        },
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw createError.unauthorized('Invalid token');
      } else if (error instanceof jwt.TokenExpiredError) {
        throw createError.unauthorized('Token expired');
      } else {
        throw error;
      }
    }
  } catch (error) {
    next(error);
  }
});

/**
 * Disconnect/logout
 */
router.post('/disconnect', async (req: AuthenticatedRequest, res: Response) => {
  // For JWT tokens, we can't really invalidate them server-side without a blacklist
  // In a production system, you might want to implement a token blacklist in Redis
  
  res.json({
    success: true,
    data: {
      message: 'Successfully disconnected'
    },
    error: null,
    timestamp: new Date().toISOString()
  });
});

export default router;