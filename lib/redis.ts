import { createClient } from "redis";

import { getRedisUrl, isProductionRuntime } from "@/lib/runtime-config";

export type HealthCheckResult = {
  ok: boolean;
  error?: string;
  detail?: string;
};

export class RedisUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RedisUnavailableError";
  }
}

type ApplyronRedisClient = ReturnType<typeof createClient>;

let redisClient: ApplyronRedisClient | null = null;
let redisClientPromise: Promise<ApplyronRedisClient> | null = null;

function toRedisErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Redis access failed";
}

async function connectRedisClient(url: string): Promise<ApplyronRedisClient> {
  const client = createClient({ url });
  client.on("error", (error) => {
    console.error(`[redis] ${toRedisErrorMessage(error)}`);
  });

  await client.connect();
  return client;
}

export async function getRedisClient(): Promise<ApplyronRedisClient | null> {
  const redisUrl = getRedisUrl();
  if (!redisUrl) {
    if (isProductionRuntime()) {
      throw new RedisUnavailableError("REDIS_URL is required in production");
    }
    return null;
  }

  if (redisClient?.isOpen) {
    return redisClient;
  }

  if (!redisClientPromise) {
    redisClientPromise = connectRedisClient(redisUrl)
      .then((client) => {
        redisClient = client;
        return client;
      })
      .catch((error) => {
        redisClient = null;
        redisClientPromise = null;
        throw new RedisUnavailableError(toRedisErrorMessage(error));
      });
  }

  try {
    return await redisClientPromise;
  } catch (error) {
    if (error instanceof RedisUnavailableError) {
      throw error;
    }
    throw new RedisUnavailableError(toRedisErrorMessage(error));
  }
}

export async function checkRedisHealth(): Promise<HealthCheckResult> {
  const redisUrl = getRedisUrl();
  if (!redisUrl) {
    return isProductionRuntime()
      ? {
          ok: false,
          error: "REDIS_URL is required in production",
        }
      : {
          ok: true,
          detail: "REDIS_URL is not configured; using in-memory rate limiting",
        };
  }

  try {
    const client = await getRedisClient();
    if (!client) {
      throw new RedisUnavailableError("Redis client is unavailable");
    }

    const response = await client.ping();
    if (response !== "PONG") {
      throw new RedisUnavailableError(`Unexpected Redis ping response: ${response}`);
    }

    return {
      ok: true,
    };
  } catch (error) {
    return {
      ok: false,
      error: toRedisErrorMessage(error),
    };
  }
}
