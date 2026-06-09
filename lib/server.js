import Pusher from "pusher";

export function getRoomKey(code) {
  return `room:${String(code || "").toUpperCase()}`;
}

export function getBaseUrl(req) {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const proto = Array.isArray(forwardedProto)
    ? forwardedProto[0]
    : forwardedProto || "https";
  const forwardedHost = req.headers["x-forwarded-host"];
  const host = Array.isArray(forwardedHost)
    ? forwardedHost[0]
    : forwardedHost || req.headers.host;
  return `${proto}://${host}`;
}

export function createPusher() {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER;
  
  // Return a mock Pusher if credentials are missing
  if (!appId || !key || !secret || !cluster) {
    return {
      trigger: async () => {
        // Mock trigger - no-op when credentials missing
        return Promise.resolve();
      },
    };
  }
  
  return new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  });
}