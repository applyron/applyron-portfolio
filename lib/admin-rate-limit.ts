const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

type AttemptStore = Map<string, number[]>;

const globalAttemptStore = globalThis as typeof globalThis & {
  __applyronAdminRateLimitStore?: AttemptStore;
};

const attempts =
  globalAttemptStore.__applyronAdminRateLimitStore ??
  (globalAttemptStore.__applyronAdminRateLimitStore = new Map<string, number[]>());

export type AdminRateLimitState = {
  ip: string;
  limited: boolean;
  retryAfterSeconds: number;
  failures: number;
};

function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const forwardedIp = forwardedFor.split(",")[0]?.trim();
    if (forwardedIp) return forwardedIp;
  }

  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return "unknown";
}

function getBucket(ip: string): number[] {
  const now = Date.now();
  const nextBucket = (attempts.get(ip) ?? []).filter(
    (timestamp) => now - timestamp < WINDOW_MS,
  );

  if (nextBucket.length > 0) {
    attempts.set(ip, nextBucket);
  } else {
    attempts.delete(ip);
  }

  return nextBucket;
}

function toState(ip: string, bucket: number[]): AdminRateLimitState {
  const limited = bucket.length >= MAX_FAILURES;
  const retryAfterMs = limited
    ? Math.max(WINDOW_MS - (Date.now() - bucket[0]), 1000)
    : 0;

  return {
    ip,
    limited,
    retryAfterSeconds: limited ? Math.ceil(retryAfterMs / 1000) : 0,
    failures: bucket.length,
  };
}

function logBlock(reason: "check" | "record", state: AdminRateLimitState) {
  console.warn(
    `[admin-auth-rate-limit] ${reason} blocked ip=${state.ip} failures=${state.failures} retry_after=${state.retryAfterSeconds}s`,
  );
}

export function inspectAdminAuthRateLimit(req: Request): AdminRateLimitState {
  const ip = getClientIp(req);
  const state = toState(ip, getBucket(ip));
  if (state.limited) {
    logBlock("check", state);
  }
  return state;
}

export function recordAdminAuthFailure(req: Request): AdminRateLimitState {
  const ip = getClientIp(req);
  const bucket = getBucket(ip);
  bucket.push(Date.now());
  attempts.set(ip, bucket);

  const state = toState(ip, bucket);
  if (state.limited) {
    logBlock("record", state);
  }
  return state;
}

export function clearAdminAuthFailures(req: Request): void {
  attempts.delete(getClientIp(req));
}
