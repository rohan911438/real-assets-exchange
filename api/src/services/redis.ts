import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

class RedisServiceClass {
  private client: RedisClientType | null = null;

  async connect() {
    try {
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });

      this.client.on('error', (err) => {
        logger.error('Redis client error:', err);
      });

      this.client.on('connect', () => {
        logger.info('Redis client connected');
      });

      await this.client.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) throw new Error('Redis client not connected');
    return await this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.client) throw new Error('Redis client not connected');
    
    if (ttl) {
      await this.client.setEx(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client) throw new Error('Redis client not connected');
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    if (!this.client) throw new Error('Redis client not connected');
    const result = await this.client.exists(key);
    return result === 1;
  }

  async getJson<T>(key: string): Promise<T | null> {
    const data = await this.get(key);
    return data ? JSON.parse(data) : null;
  }

  async setJson<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttl);
  }

  // Cache helper methods
  async cachePrice(tokenAddress: string, price: string): Promise<void> {
    const ttl = parseInt(process.env.CACHE_TTL_PRICES || '30');
    await this.set(`price:${tokenAddress}`, price, ttl);
  }

  async getCachedPrice(tokenAddress: string): Promise<string | null> {
    return await this.get(`price:${tokenAddress}`);
  }

  async cachePortfolio(address: string, portfolio: any): Promise<void> {
    const ttl = parseInt(process.env.CACHE_TTL_PORTFOLIO || '60');
    await this.setJson(`portfolio:${address}`, portfolio, ttl);
  }

  async getCachedPortfolio(address: string): Promise<any | null> {
    return await this.getJson(`portfolio:${address}`);
  }

  async cacheAssets(assets: any[]): Promise<void> {
    const ttl = parseInt(process.env.CACHE_TTL_ASSETS || '3600');
    await this.setJson('assets:all', assets, ttl);
  }

  async getCachedAssets(): Promise<any[] | null> {
    return await this.getJson('assets:all');
  }

  // Nonce management for authentication
  async setNonce(address: string, nonce: string): Promise<void> {
    await this.set(`nonce:${address}`, nonce, 300); // 5 minutes TTL
  }

  async getNonce(address: string): Promise<string | null> {
    return await this.get(`nonce:${address}`);
  }

  async deleteNonce(address: string): Promise<void> {
    await this.del(`nonce:${address}`);
  }

  // Rate limiting helpers
  async checkRateLimit(key: string, limit: number, window: number): Promise<{ allowed: boolean; remaining: number }> {
    if (!this.client) throw new Error('Redis client not connected');
    
    const current = await this.client.incr(key);
    
    if (current === 1) {
      await this.client.expire(key, window);
    }
    
    const remaining = Math.max(0, limit - current);
    
    return {
      allowed: current <= limit,
      remaining
    };
  }
}

export const RedisService = new RedisServiceClass();