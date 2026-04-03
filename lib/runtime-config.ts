import path from "path";

function resolveConfiguredDir(
  envName: "APP_DATA_DIR" | "APP_UPLOADS_DIR",
  fallbackSegments: string[],
): string {
  const configured = process.env[envName]?.trim();
  if (!configured) {
    return path.join(/* turbopackIgnore: true */ process.cwd(), ...fallbackSegments);
  }

  return path.isAbsolute(configured)
    ? configured
    : path.resolve(/* turbopackIgnore: true */ process.cwd(), configured);
}

export function getDataDir(): string {
  return resolveConfiguredDir("APP_DATA_DIR", ["data"]);
}

export function getUploadsDir(): string {
  return resolveConfiguredDir("APP_UPLOADS_DIR", ["public", "uploads"]);
}

export function getDataFilePath(filename: string): string {
  return path.join(getDataDir(), filename);
}

export function getUploadFilePath(filename: string): string {
  return path.join(getUploadsDir(), path.basename(filename));
}

function resolveOptionalConfiguredPath(
  envName: "ADMIN_JWT_SECRET_FILE",
): string | undefined {
  const configured = process.env[envName]?.trim();
  if (!configured) {
    return undefined;
  }

  return path.isAbsolute(configured)
    ? configured
    : path.resolve(/* turbopackIgnore: true */ process.cwd(), configured);
}

export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

export function getRedisUrl(): string | undefined {
  const configured = process.env.REDIS_URL?.trim();
  return configured ? configured : undefined;
}

export function getAdminJwtSecretFilePath(): string | undefined {
  return resolveOptionalConfiguredPath("ADMIN_JWT_SECRET_FILE");
}

export function isAdminSetupEnabled(authConfigured = false): boolean {
  const configured = process.env.ADMIN_SETUP_ENABLED?.trim();
  if (!configured) {
    return !isProductionRuntime() || !authConfigured;
  }

  return /^(1|true|yes|on)$/i.test(configured);
}
