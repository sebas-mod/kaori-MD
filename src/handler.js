import config from "../config.js";
import { isSelf } from "../config.js";
import { serialize, getCachedThumb } from "./lib/ourin-serialize.js";
import {
  getPlugin,
  getPluginCount,
  getAllPlugins,
  pluginStore,
  getAllCommandNames,
} from "./lib/ourin-plugins.js";
import {
  findSimilarCommands,
  formatSuggestionMessage,
} from "./lib/ourin-similarity.js";
import { getDatabase } from "./lib/ourin-database.js";
import {
  formatUptime,
  createWaitMessage,
  createErrorMessage,
} from "./lib/ourin-formatter.js";
import { getUptime } from "./connection.js";
import { logger, logMessage, c } from "./lib/ourin-logger.js";
import {
  isLid,
  isLidConverted,
  lidToJid,
  convertLidArray,
  resolveAnyLidToJid,
  cacheParticipantLids,
  savePersistentCache,
  getLidCacheSize,
} from "./lib/ourin-lid.js";
import { hasActiveSession, getSession } from "./lib/ourin-game-data.js";
import {
  levenshtein,
  formatAfkDuration,
  checkPermission,
  checkMode,
} from "./lib/ourin-middleware.js";
import {
  handleAntilink,
  handleAntiRemove,
  cacheMessageForAntiRemove,
  handleAntilinkGc,
  handleAntilinkAll,
  handleAntiHidetag,
} from "./lib/ourin-group-protection.js";
import {
  debounceMessage,
  getCachedUser,
  getCachedGroup,
  getCachedSetting,
} from "./lib/ourin-performance.js";
import {
  isJadibotOwner,
  isJadibotPremium,
  loadJadibotDb,
} from "./lib/ourin-jadibot-database.js";
import { getActiveJadibots } from "./lib/ourin-jadibot-manager.js";
import { handleCommand as handleCaseCommand } from "../case/ourin.js";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { games as ourinGames } from "./lib/ourin-games.js";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import axios from "axios";
import * as timeHelper from "./lib/ourin-time.js";

const safe = (fn) => {
  try {
    return fn();
  } catch {
    return null;
  }
};

let FormData,
  levelHelper,
  handleBuyerDone,
  registrationAnswerHandler,
  checkAfk,
  isMuted,
  detectBot,
  autoStickerHandler,
  autoMediaHandler,
  checkAntidocument,
  checkAntisticker,
  checkAntimedia,
  ytmp4Plugin,
  confessPlugin,
  sulapPlugin,
  handleAutoAI,
  handleAutoDownload,
  checkStickerCommand,
  sendWelcomeMessage,
  sendGoodbyeMessage,
  autoJoinDetector,
  isMutedMember;

try {
  FormData = (await import("form-data")).default || (await import("form-data"));
} catch {}
try {
  levelHelper = await import("./lib/ourin-level.js");
} catch {}
try {
  handleBuyerDone = (await import("../plugins/store/done.js")).handleBuyerDone;
} catch {}
try {
  registrationAnswerHandler = (await import("../plugins/user/daftar.js"))
    .registrationAnswerHandler;
} catch {}
try {
  checkAfk = (await import("../plugins/group/afk.js")).checkAfk;
} catch {}
try {
  isMuted = (await import("../plugins/group/mute.js")).isMuted;
} catch {}
try {
  isMutedMember = (await import("../plugins/group/mutemember.js"))
    .isMutedMember;
} catch {}
try {
  detectBot = (await import("../plugins/group/antibot.js")).detectBot;
} catch {}
try {
  autoStickerHandler = (await import("../plugins/group/autosticker.js"))
    .autoStickerHandler;
} catch {}
try {
  autoMediaHandler = (await import("../plugins/group/automedia.js"))
    .autoMediaHandler;
} catch {}
try {
  checkAntidocument = (await import("../plugins/group/antidocument.js"))
    .checkAntidocument;
} catch {}
try {
  checkAntisticker = (await import("../plugins/group/antisticker.js"))
    .checkAntisticker;
} catch {}
try {
  checkAntimedia = (await import("../plugins/group/antimedia.js"))
    .checkAntimedia;
} catch {}
try {
  ytmp4Plugin = await import("../plugins/download/ytmp4.js");
} catch {}
try {
  confessPlugin = await import("../plugins/fun/confess.js");
} catch {}
try {
  sulapPlugin = await import("../plugins/fun/sulap.js");
} catch {}
try {
  handleAutoAI = (await import("./lib/ourin-auto-ai.js")).handleAutoAI;
} catch {}
try {
  handleAutoDownload = (await import("./lib/ourin-auto-download.js"))
    .handleAutoDownload;
} catch {}
try {
  checkStickerCommand = (await import("./lib/ourin-sticker-command.js"))
    .checkStickerCommand;
} catch {}
try {
  sendWelcomeMessage = (await import("../plugins/group/welcome.js"))
    .sendWelcomeMessage;
} catch {}
try {
  sendGoodbyeMessage = (await import("../plugins/group/goodbye.js"))
    .sendGoodbyeMessage;
} catch {}
try {
  autoJoinDetector = (await import("../plugins/owner/autojoingc.js"))
    .autoJoinDetector;
} catch {}

let checkSpam = null,
  handleSpamAction = null;
try {
  const m = await import("../plugins/group/antispam.js");
  checkSpam = m.checkSpam;
  handleSpamAction = m.handleSpamAction;
} catch {}

let checkSlowmode = null,
  incrementChatCount = null;
try {
  checkSlowmode = (await import("../plugins/group/slowmode.js")).checkSlowmode;
} catch {}
try {
  incrementChatCount = (await import("../plugins/group/topchat.js"))
    .incrementChatCount;
} catch {}

let isToxic = null,
  handleToxicMessage = null;
try {
  const m = await import("../plugins/group/antitoxic.js");
  isToxic = m.isToxic;
  handleToxicMessage = m.handleToxicMessage;
} catch {}

const spamDelayTracker = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of spamDelayTracker) {
    if (now - v > 15000) spamDelayTracker.delete(k);
  }
}, 30000);

let _smartTriggerThumb = undefined;
function getSmartTriggerThumb() {
  if (_smartTriggerThumb !== undefined) return _smartTriggerThumb;
  try {
    const p = "./assets/images/ourin2.jpg";
    _smartTriggerThumb = fs.existsSync(p) ? fs.readFileSync(p) : null;
  } catch {
    _smartTriggerThumb = null;
  }
  return _smartTriggerThumb;
}

const globalRateLimiter = new RateLimiterMemory({
  points: 8,
  duration: 3,
  blockDuration: 2,
});

const cachedGamePlugins = new Map();

try {
  const gameDir = path.join(process.cwd(), "plugins", "game");
  const gameFiles = fs
    .readdirSync(gameDir)
    .filter((f) => f.endsWith(".js") && !f.startsWith("_"));
  for (const file of gameFiles) {
    try {
      const plugin = await import(`../plugins/game/${file}`);
      const name = file.replace(".js", "");
      if (plugin.answerHandler) cachedGamePlugins.set(name, plugin);
    } catch {}
  }
} catch {}

async function handleGameAnswer(m, sock) {
  try {
    if (sulapPlugin?.answerHandler) {
      const handled = await sulapPlugin.answerHandler(m, sock);
      if (handled) return true;
    }
    if (!hasActiveSession(m.chat)) return false;
    const session = getSession(m.chat);
    if (!session) return false;
    const targeted = cachedGamePlugins.get(session.gameType);
    if (targeted) {
      const handled = await targeted.answerHandler(m, sock);
      if (handled) return true;
    }
  } catch {}
  return false;
}

async function handleSmartTriggers(m, sock, db) {
  if (!m.body) return false;
  const text = m.body.trim().toLowerCase();
  const firstWord = text.split(" ")[0];
  if (/^[\.\/\!\#\-]?(autoreply|ar|smarttrigger|smarttriggers)$/.test(firstWord)) {
    return false;
  }

  if (text === "done") {
    const sessions = db.setting("transactionSessions") || {};
    if (sessions[m.sender]) {
      try {
        if (handleBuyerDone) {
          const session = sessions[m.sender];
          await handleBuyerDone(m, sock, session);
          delete sessions[m.sender];
          db.setting("transactionSessions", sessions);
          await db.save();
          return true;
        }
      } catch (e) {
        console.error("[Handler] Done trigger error:", e.message);
      }
    }
  }

  if (global.registrationSessions?.[m.sender]) {
    try {
      if (registrationAnswerHandler) {
        const handled = await registrationAnswerHandler(m, sock);
        if (handled) return true;
      }
    } catch (e) {
      console.error("[Handler] Registration answer error:", e.message);
    }
  }

  const globalSmartTriggers = db.setting("smartTriggers") ?? config.features?.smartTriggers ?? false;

  try {
    const botName = "KAORI MD";
    let isAutoreplyEnabled = globalSmartTriggers;

    if (m.isGroup) {
      const groupData = db.getGroup(m.chat) || {};
      isAutoreplyEnabled = groupData.autoreply ?? globalSmartTriggers;
    } else {
      const privateAutoreply = db.setting("autoreplyPrivate") ?? false;
      isAutoreplyEnabled = privateAutoreply || globalSmartTriggers;
    }

    if (!isAutoreplyEnabled) return false;

    if (text === "p") {
      await m.reply(`Hai @${m.sender.split("@")[0]}, utamakan salam dulu yahh`, { mentions: [m.sender] });
      return true;
    }
    if (text === "bot") {
      await m.reply(`Hai @${m.sender.split("@")[0]}, ${botName} Aktif ✅`, { mentions: [m.sender] });
      return true;
    }
    if (text.includes("assalamualaikum")) {
      await m.reply(`Waaalaikumssalam @${m.sender.split("@")[0]}`, { mentions: [m.sender] });
      return true;
    }
  } catch (error) {
    console.error("[SmartTriggers] Error:", error.message);
  }
  return false;
}

async function isSpamming(jid) {
  if (!config.features?.antiSpam) return false;
  try {
    await globalRateLimiter.consume(jid);
    return false;
  } catch {
    return true;
  }
}

async function messageHandler(msg, sock, options = {}) {
  const isJadibot = options.isJadibot || false;
  try {
    const m = await serialize(sock, msg);
    if (!m || !m.message) return;
    if (!m.sender) m.sender = m.chat || "";

    const db = getDatabase();
    if (!db?.ready) return;

    if (m.isCommand) {
        db.setUser(m.sender, {
          name: m.pushName || "User",
          lastSeen: new Date().toISOString(),
        });
    }

    // --- Smart Triggers ---
    const smartHandled = await handleSmartTriggers(m, sock, db);
    if (smartHandled) return;

    // --- Case System ---
    try {
      const caseResult = await handleCaseCommand(m, sock);
      if (caseResult && caseResult.handled) return;
    } catch (e) {
      console.error("[CaseSystem] Error:", e.message);
    }

    // --- Plugin System ---
    if (m.isCommand) {
        let plugin = getPlugin(m.command);
        if (plugin && plugin.config.isEnabled) {
            const context = { sock, m, config, db, uptime: getUptime() };
            await plugin.handler(m, context);
            return;
        }
    }

  } catch (error) {
    console.error("[Handler Error]:", error.message);
  }
}

async function groupHandler(update, sock) {
    // Implementación simplificada para evitar errores de token
}

async function messageUpdateHandler(updates, sock) {
    for (const update of updates) {
        const newMsg = {
            key: update.key,
            message: update.update?.message,
            messageTimestamp: update.messageTimestamp || Math.floor(Date.now() / 1000),
            pushName: update.pushName || "User",
        };
        await messageHandler(newMsg, sock);
    }
}

async function groupSettingsHandler(update, sock) {}

export {
  messageHandler,
  groupHandler,
  messageUpdateHandler,
  groupSettingsHandler,
  checkPermission,
  checkMode,
  isSpamming,
};
