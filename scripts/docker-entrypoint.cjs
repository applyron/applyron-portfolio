const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const DATA_DIR = process.env.APP_DATA_DIR?.trim() || path.join(process.cwd(), "data");
const UPLOADS_DIR = process.env.APP_UPLOADS_DIR?.trim() || path.join(process.cwd(), "public", "uploads");
const SEED_DIR = path.join(process.cwd(), "seed-data");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function seedRuntimeData() {
  if (!fs.existsSync(SEED_DIR)) return;

  const entries = fs.readdirSync(SEED_DIR, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) continue;

    const sourcePath = path.join(SEED_DIR, entry.name);
    const targetPath = path.join(DATA_DIR, entry.name);

    if (!fs.existsSync(targetPath)) {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

function startServer() {
  const child = spawn(process.execPath, ["server.js"], {
    cwd: process.cwd(),
    stdio: "inherit",
    env: process.env,
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });
}

ensureDir(DATA_DIR);
ensureDir(UPLOADS_DIR);
seedRuntimeData();
startServer();
