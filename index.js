import path from "path";
import fs from "fs";
import config from "./config.js";
import { startConnection } from "./src/connection.js";
import {
  messageHandler,
  groupHandler,
  messageUpdateHandler,
  groupSettingsHandler,
} from "./src/handler.js";
import { loadPlugins, pluginStore } from "./src/lib/ourin-plugins.js";
import { initDatabase, getDatabase } from "./src/lib/ourin-database.js";
import {
  initScheduler,
  loadScheduledMessages,
  startGroupScheduleChecker,
  startSewaChecker,
} from "./src/lib/ourin-scheduler.js";
import { startAutoBackup } from "./src/lib/ourin-backup.js";
import { handleAntiTagSW } from "./src/lib/ourin-group-protection.js";
import { initSholatScheduler } from "./src/lib/ourin-sholat-scheduler.js";
import { initNotifScheduler } from "./src/lib/ourin-notif-scheduler.js";
import { initAutoJpmScheduler } from "./src/lib/ourin-auto-jpm.js";
import { startMemoryMonitor } from "./src/lib/ourin-memory-monitor.js";
import { startTempCleaner } from "./src/lib/ourin-temp-cleaner.js";
import { startDailyPruner } from "./src/lib/ourin-data-pruner.js";
import {
  logger,
  c,
  printBanner,
  printStartup,
  logConnection,
  logErrorBox,
  logPlugin,
  divider,
} from "./src/lib/ourin-logger.js";

await import("./src/lib/ourin-agent.js")
  .then((m) => m.initializeAgent())
  .catch(() => {});

let startOrderPoller;
try {
  const _mod = await import("./src/lib/ourin-order-poller.js");
  startOrderPoller = _mod.startOrderPoller;
} catch {}
let startOtpPoller;
try {
  const _mod = await import("./src/lib/ourin-otp-poller.js");
  startOtpPoller = _mod.startOtpPoller;
} catch {}

const LOG_NOISE = new Set([
  "Closing",
  "prekey",
  "_chains",
  "registrationId",
  "chainKey",
  "ephemeralKeyPair",
  "rootKey",
  "indexInfo",
  "pendingPreKey",
  "currentRatchet",
  "baseKey",
  "privKey",
]);
const _log = console.log;
console.log = (...args) => {
  const first = typeof args[0] === "string" ? args[0] : "";
  for (const noise of LOG_NOISE) {
    if (first.includes(noise)) return;
  }
  _log.apply(console, args);
};

const startTime = Date.now();

let pluginWatcher = null;
const reloadDebounce = new Map();
const fileStatCache = new Map();

function startDevWatcher(pluginsPath) {
  if (pluginWatcher) pluginWatcher.close();

  logger.system("dev", "recarga en caliente de plugins activa");

  pluginWatcher = fs.watch(
    pluginsPath,
    { recursive: true },
    (eventType, filename) => {
      if (!filename || !filename.endsWith(".js")) return;

      const existingTimeout = reloadDebounce.get(filename);
      if (existingTimeout) clearTimeout(existingTimeout);

      const timeout = setTimeout(async () => {
        reloadDebounce.delete(filename);
        const fullPath = path.join(pluginsPath, filename);

        if (!fs.existsSync(fullPath)) {
          fileStatCache.delete(fullPath);
          const pluginName = path.basename(filename, ".js");
          const { unloadPlugin } = await import("./src/lib/ourin-plugins.js");
          const result = unloadPlugin(pluginName);
          if (result.success) logger.warn("plugin", `eliminado ${filename}`);
          return;
        }

        try {
          const stats = fs.statSync(fullPath);
          const cached = fileStatCache.get(fullPath);
          const changed =
            !cached ||
            cached.mtimeMs !== stats.mtimeMs ||
            cached.size !== stats.size;
          if (!changed) return;

          fileStatCache.set(fullPath, {
            mtimeMs: stats.mtimeMs,
            size: stats.size,
          });

          const { hotReloadPlugin } =
            await import("./src/lib/ourin-plugins.js");
          const result = await hotReloadPlugin(fullPath);
          if (!result.success) {
            logger.error(
              "plugin",
              `falló recarga: ${filename}: ${result.error}`,
            );
          }
        } catch (error) {
          logger.error(
            "plugin",
            `falló recarga: ${filename}: ${error.message}`,
          );
        }
      }, 500);

      reloadDebounce.set(filename, timeout);
    },
  );

  logger.debug("dev", `observando ${pluginsPath}`);
}

let srcWatcher = null;

function startSrcWatcher(srcPath) {
  if (srcWatcher) srcWatcher.close();

  logger.system("dev", "recarga en caliente de src activa");

  srcWatcher = fs.watch(srcPath, { recursive: true }, (eventType, filename) => {
    if (!filename || !filename.endsWith(".js")) return;

    const existingTimeout = reloadDebounce.get("src_" + filename);
    if (existingTimeout) clearTimeout(existingTimeout);

    const timeout = setTimeout(() => {
      reloadDebounce.delete("src_" + filename);
      const fullPath = path.join(srcPath, filename);
      if (!fs.existsSync(fullPath)) {
        logger.warn("dev", `archivo src eliminado: ${filename}`);
        return;
      }
      logger.success("dev", `src cambiado: ${filename}`);
    }, 500);

    reloadDebounce.set("src_" + filename, timeout);
  });

  logger.debug("dev", `observando ${srcPath}`);
}

function setupAntiCrash() {
  process.on("uncaughtException", (error, origin) => {
    const ignoredErrors = [
      "write EOF",
      "ECONNRESET",
      "EPIPE",
      "ETIMEDOUT",
      "ENOTFOUND",
      "ECONNREFUSED",
      "read ECONNRESET",
    ];
    const isIgnored = ignoredErrors.some(
      (msg) => error.message?.includes(msg) || error.code === msg,
    );
    if (isIgnored) return;

    logErrorBox("error no capturado", error.message);
    console.error(c.gray(error.stack));
    logger.system("sistema", "el bot sigue funcionando");
  });

  process.on("unhandledRejection", (reason, promise) => {
    logErrorBox("promesa no manejada", String(reason));
    console.error(c.gray("Promesa:"), promise);
    logger.system("sistema", "el bot sigue funcionando");
  });

  process.on("warning", (warning) => {
    logger.warn("system", `${warning.name}: ${warning.message}`);
  });

  process.on("SIGINT", async () => {
    console.log("");
    logger.system("sistema", "señal de detención recibida");
    logger.info("database", "guardando datos...");
    try {
      const db = getDatabase();
      db.save();
      logger.success("database", "datos guardados");
    } catch (error) {
      logger.warn("database", `falló guardado: ${error.message}`);
    }
    logger.info("sistema", "bot detenido");
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("");
    logger.system("sistema", "señal de terminación recibida");
    process.exit(0);
  });

  logger.success("sistema", "anti-crash activo");
}
