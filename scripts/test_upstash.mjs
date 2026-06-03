(async () => {
  try {
    const kvModule = await import('../lib/kv.js');
    const { kvSet, kvGet } = kvModule;
    const key = 'room:test-ci';
    const payload = { tester: 'assistant', ts: Date.now() };
    await kvSet(key, payload, { ex: 60 });
    const v = await kvGet(key);
    console.log('UPSTASH_OK', JSON.stringify(v));
    process.exit(0);
  } catch (e) {
    console.error('UPSTASH_ERR', e && e.message ? e.message : e);
    process.exit(1);
  }
})();
