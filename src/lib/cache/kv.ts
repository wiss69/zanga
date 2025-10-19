import LRUCache from 'lru-cache';
import Redis from 'ioredis';

type CacheValue = string;

export interface CacheSetOptions {
  ttl: number;
}

export interface KeyValueCache {
  get(key: string): Promise<string | null>;
  set(key: string, value: CacheValue, options: CacheSetOptions): Promise<void>;
  del(key: string): Promise<void>;
}

class MemoryCache implements KeyValueCache {
  private store: LRUCache<string, string>;

  constructor() {
    this.store = new LRUCache({ max: 500, ttl: 1000 * 60 * 60 });
  }

  async get(key: string) {
    return this.store.get(key) ?? null;
  }

  async set(key: string, value: string, { ttl }: CacheSetOptions) {
    this.store.set(key, value, { ttl });
  }

  async del(key: string) {
    this.store.delete(key);
  }
}

class RedisCache implements KeyValueCache {
  constructor(private client: Redis) {}

  async get(key: string) {
    return this.client.get(key);
  }

  async set(key: string, value: string, { ttl }: CacheSetOptions) {
    if (ttl > 0) {
      await this.client.set(key, value, 'PX', ttl);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string) {
    await this.client.del(key);
  }
}

let cacheInstance: KeyValueCache | null = null;

export function getCache(): KeyValueCache {
  if (cacheInstance) {
    return cacheInstance;
  }

  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    const client = new Redis(redisUrl, {
      lazyConnect: true,
      connectTimeout: 5_000,
      maxRetriesPerRequest: 1
    });
    cacheInstance = new RedisCache(client);
  } else {
    cacheInstance = new MemoryCache();
  }

  return cacheInstance;
}
