import { spawn, spawnSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoMemoryServer } from "mongodb-memory-server";
import dotenv from "dotenv";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(root, ".env.local"), quiet: true });
const env = { ...process.env };
let mongo;
let app;
let stopping = false;

async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  if (app && !app.killed) app.kill("SIGTERM");
  if (mongo) await mongo.stop();
  process.exit(code);
}

try {
  if (!env.DATABASE_URL) {
    const dataPath = path.join(root, ".local-mongo-data-7b");
    await mkdir(dataPath, { recursive: true });
    console.log("Starting private local MongoDB for development…");
    mongo = await MongoMemoryServer.create({ binary: { version: "7.0.14" }, instance: { dbPath: dataPath, storageEngine: "wiredTiger" } });
    env.DATABASE_URL = mongo.getUri("affiliate-discovery");
  }

  env.JWT_SECRET ||= "local-development-only-secret-change-before-production";
  env.NEXT_PUBLIC_SITE_URL ||= "http://localhost:3000";
  env.ADMIN_EMAIL ||= "editor@example.com";
  env.ADMIN_PASSWORD ||= "FoundFine-Local-2026!";

  console.log("Loading demo merchants, categories, products and admin login…");
  const seed = spawnSync(process.execPath, ["node_modules/tsx/dist/cli.mjs", "scripts/seed.ts"], { cwd: root, env, stdio: "inherit" });
  if (seed.status !== 0) throw new Error(`Demo data setup failed (exit ${seed.status ?? seed.signal}).`);

  console.log("Starting Found & Fine at http://localhost:3000");
  console.log(`Admin login: ${env.ADMIN_EMAIL} / ${env.ADMIN_PASSWORD}`);
  app = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--webpack", "--hostname", "0.0.0.0"], { cwd: root, env, stdio: "inherit" });
  app.once("error", error => { console.error(error); void stop(1); });
  app.once("exit", code => { void stop(code ?? 1); });
  process.once("SIGINT", () => { app?.kill("SIGINT"); });
  process.once("SIGTERM", () => { app?.kill("SIGTERM"); });
} catch (error) {
  console.error("Local startup failed:", error);
  await stop(1);
}
