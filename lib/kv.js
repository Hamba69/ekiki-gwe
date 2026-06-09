import { Redis } from '@upstash/redis';

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

let client = null;
try {
  if (url && token) {
    client = new Redis({ url, token });
  }
} catch (err) {
  console.error('Failed to initialize Redis client:', err.message);
}

// In-memory fallback store for development/testing without credentials
// Use global to persist across module reloads in dev mode
const globalStore = global._ekikiGweStore || (global._ekikiGweStore = new Map());

export async function kvGet(key) {
  if (!client || !url || !token) {
    // Use in-memory fallback
    const value = globalStore.get(key);
    return value ? JSON.parse(value) : null;
  }
  try {
    const val = await client.get(key);
    if (val == null) return null;
    try {
      return JSON.parse(val);
    } catch (e) {
      return val;
    }
  } catch (err) {
    console.error('Redis kvGet error:', err.message);
    // Fallback to in-memory on Redis error
    const value = globalStore.get(key);
    return value ? JSON.parse(value) : null;
  }
}

export async function kvSet(key, value, opts = {}) {
  if (!client || !url || !token) {
    // Use in-memory fallback for testing
    const s = typeof value === 'string' ? value : JSON.stringify(value);
    globalStore.set(key, s);
    // Simulate TTL with a timeout if ex is provided
    if (opts.ex) {
      setTimeout(() => globalStore.delete(key), opts.ex * 1000);
    }
    return;
  }
  try {
    const s = typeof value === 'string' ? value : JSON.stringify(value);
    if (opts.ex) {
      await client.set(key, s, { ex: opts.ex });
    } else {
      await client.set(key, s);
    }
  } catch (err) {
    console.error('Redis kvSet error:', err.message);
    // Fallback to in-memory on Redis error
    const s = typeof value === 'string' ? value : JSON.stringify(value);
    globalStore.set(key, s);
    if (opts.ex) {
      setTimeout(() => globalStore.delete(key), opts.ex * 1000);
    }
  }
}
