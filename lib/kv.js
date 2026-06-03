import { Redis } from '@upstash/redis';

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  // Do not throw here — allow server to start; API handlers will report missing creds.
}

const client = new Redis({ url, token });

export async function kvGet(key) {
  if (!url || !token) return null;
  const val = await client.get(key);
  if (val == null) return null;
  try {
    return JSON.parse(val);
  } catch (e) {
    return val;
  }
}

export async function kvSet(key, value, opts = {}) {
  if (!url || !token) throw new Error('Missing KV_REST_API_URL or KV_REST_API_TOKEN');
  const s = typeof value === 'string' ? value : JSON.stringify(value);
  if (opts.ex) {
    await client.set(key, s, { ex: opts.ex });
  } else {
    await client.set(key, s);
  }
}
