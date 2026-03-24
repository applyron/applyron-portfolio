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

export function isAdminSetupEnabled(authConfigured = false): boolean {
  const configured = process.env.ADMIN_SETUP_ENABLED?.trim();
  if (!configured) {
    return process.env.NODE_ENV !== "production" || !authConfigured;
  }

  return /^(1|true|yes|on)$/i.test(configured);
}
