import { kvGet } from '../lib/kv.js';

(async () => {
  try {
    const room = await kvGet('room:LPPBAN');
    console.log('ROOM:', JSON.stringify(room, null, 2));
  } catch (err) {
    console.error('ERROR:', err);
  }
})();