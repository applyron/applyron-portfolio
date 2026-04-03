import { getRedisClient } from "@/lib/redis";
import { isProductionRuntime } from "@/lib/runtime-config";

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const WINDOW_SECONDS = Math.ceil(WINDOW_MS / 1000);
const UNKNOWN_IP = "unknown";

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
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (isProductionRuntime()) {
    return realIp || UNKNOWN_IP;
  }

  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const forwardedIp = forwardedFor.split(",")[0]?.trim();
    if (forwardedIp) return forwardedIp;
  }

  if (realIp) return realIp;

  return UNKNOWN_IP;
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

function getRedisKey(ip: string): string {
  return `admin:auth:failures:${ip}`;
}

function toStateFromRedis(
  ip: string,
  failures: number,
  oldestScore: number | null,
): AdminRateLimitState {
  const limited = failures >= MAX_FAILURES;
  const retryAfterMs =
    limited && oldestScore !== null
      ? Math.max(WINDOW_MS - (Date.now() - oldestScore), 1000)
      : 0;

  return {
    ip,
    limited,
    retryAfterSeconds: limited ? Math.ceil(retryAfterMs / 1000) : 0,
    failures,
  };
}

async function getRedisState(
  ip: string,
  mode: "check" | "record" | "clear",
): Promise<AdminRateLimitState> {
  const client = await getRedisClient();
  if (!client) {
    if (mode === "record") {
      return recordFailureInMemory(ip);
    }
    if (mode === "clear") {
      attempts.delete(ip);
      return toState(ip, []);
    }
    return toState(ip, getBucket(ip));
  }

  const key = getRedisKey(ip);
  const cutoff = Date.now() - WINDOW_MS;

  await client.zRemRangeByScore(key, 0, cutoff);

  if (mode === "record") {
    await client.zAdd(key, [
      {
        score: Date.now(),
        value: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      },
    ]);
    await client.expire(key, WINDOW_SECONDS);
  }

  if (mode === "clear") {
    await client.del(key);
    return toStateFromRedis(ip, 0, null);
  }

  const [failures, oldestEntry] = await Promise.all([
    client.zCard(key),
    client.zRangeWithScores(key, 0, 0),
  ]);

  return toStateFromRedis(ip, failures, oldestEntry[0]?.score ?? null);
}

function recordFailureInMemory(ip: string): AdminRateLimitState {
  const bucket = getBucket(ip);
  bucket.push(Date.now());
  attempts.set(ip, bucket);
  return toState(ip, bucket);
}

export async function inspectAdminAuthRateLimit(
  req: Request,
): Promise<AdminRateLimitState> {
  const ip = getClientIp(req);
  const state = await getRedisState(ip, "check");
  if (state.limited) {
    logBlock("check", state);
  }
  return state;
}

export async function recordAdminAuthFailure(
  req: Request,
): Promise<AdminRateLimitState> {
  const ip = getClientIp(req);
  const state = await getRedisState(ip, "record");
  if (state.limited) {
    logBlock("record", state);
  }
  return state;
}

export async function clearAdminAuthFailures(req: Request): Promise<void> {
  await getRedisState(getClientIp(req), "clear");
}
