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

try { FormData = (await import("form-data")).default || (await import("form-data")); } catch {}
try { levelHelper = await import("./lib/ourin-level.js"); } catch {}
try { handleBuyerDone = (await import("../plugins/store/done.js")).handleBuyerDone; } catch {}
try { registrationAnswerHandler = (await import("../plugins/user/daftar.js")).registrationAnswerHandler; } catch {}
try { checkAfk = (await import("../plugins/group/afk.js")).checkAfk; } catch {}
try { isMuted = (await import("../plugins/group/mute.js")).isMuted; } catch {}
try { isMutedMember = (await import("../plugins/group/mutemember.js")).isMutedMember; } catch {}
try { detectBot = (await import("../plugins/group/antibot.js")).detectBot; } catch {}
try { autoStickerHandler = (await import("../plugins/group/autosticker.js")).autoStickerHandler; } catch {}
try { autoMediaHandler = (await import("../plugins/group/automedia.js")).autoMediaHandler; } catch {}
try { checkAntidocument = (await import("../plugins/group/antidocument.js")).checkAntidocument; } catch {}
try { checkAntisticker = (await import("../plugins/group/antisticker.js")).checkAntisticker; } catch {}
try { checkAntimedia = (await import("../plugins/group/antimedia.js")).checkAntimedia; } catch {}
try { ytmp4Plugin = await import("../plugins/download/ytmp4.js"); } catch {}
try { confessPlugin = await import("../plugins/fun/confess.js"); } catch {}
try { sulapPlugin = await import("../plugins/fun/sulap.js"); } catch {}
try { handleAutoAI = (await import("./lib/ourin-auto-ai.js")).handleAutoAI; } catch {}
try { handleAutoDownload = (await import("./lib/ourin-auto-download.js")).handleAutoDownload; } catch {}
try { checkStickerCommand = (await import("./lib/ourin-sticker-command.js")).checkStickerCommand; } catch {}
try { sendWelcomeMessage = (await import("../plugins/group/welcome.js")).sendWelcomeMessage; } catch {}
try { sendGoodbyeMessage = (await import("../plugins/group/goodbye.js")).sendGoodbyeMessage; } catch {}
try { autoJoinDetector = (await import("../plugins/owner/autojoingc.js")).autoJoinDetector; } catch {}

const spamDelayTracker = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of spamDelayTracker) {
    if (now - v > 15000) spamDelayTracker.delete(k);
  }
}, 30000);

const globalRateLimiter = new RateLimiterMemory({
  points: 8,
  duration: 3,
  blockDuration: 2,
});

async function handleSmartTriggers(m, sock, db) {
  if (!m.body) return false;
  const text = m.body.trim().toLowerCase();
  
  try {
    const botName = "KAORI MD";
    const globalSmartTriggers = db.setting("smartTriggers") ?? config.features?.smartTriggers ?? false;
    let isAutoreplyEnabled = m.isGroup ? (db.getGroup(m.chat)?.autoreply ?? globalSmartTriggers) : (db.setting("autoreplyPrivate") ?? globalSmartTriggers);

    if (!isAutoreplyEnabled) return false;

    const botJid = sock.user?.id;
    const isMentioned = m.mentionedJid?.some((jid) => jid === botJid || jid?.includes(sock.user?.id?.split(":")[0]));

    if (isMentioned) {
      await m.reply(`¿Alguien llamó a ${botName}?\n\n¿Qué necesitas @${m.sender.split("@")[0]}?`, { mentions: [m.sender] });
      return true;
    }
    if (text === "p") {
      await m.reply(`Hola @${m.sender.split("@")[0]}, por favor saluda primero.`, { mentions: [m.sender] });
      return true;
    }
    if (text === "bot") {
      await m.reply(`Hola @${m.sender.split("@")[0]}, ${botName} está activa y lista para ayudar ✅`, { mentions: [m.sender] });
      return true;
    }
    if (text.includes("assalam") || text.includes("hola")) {
      await m.reply(`¡Hola! @${m.sender.split("@")[0]}, espero que tengas un gran día.`, { mentions: [m.sender] });
      return true;
    }
  } catch (e) {
    console.error("[SmartTriggers] Error:", e.message);
  }
  return false;
}

async function messageHandler(msg, sock, options = {}) {
  const isJadibot = options.isJadibot || false;
  try {
    const m = await serialize(sock, msg);
    if (!m || !m.message) return;
    if (!m.sender) m.sender = m.chat || "";

    const db = getDatabase();
    if (!db?.ready) return;

    if (m.isBanned) {
      if (m.isCommand) await m.reply("🚫 *Lo siento, estás baneado de KAORI MD y no puedes usar mis comandos.*");
      return;
    }

    if (m.isCommand) {
      db.setUser(m.sender, { name: m.pushName || "Usuario", lastSeen: new Date().toISOString() });
    }

    if (m.body && levelHelper?.addExpWithLevelCheck) {
      const userObj = db.getUser(m.sender) || db.setUser(m.sender);
      await levelHelper.addExpWithLevelCheck(sock, m, db, userObj, 5);
    }

    // Auto-Respuestas
    const smartHandled = await handleSmartTriggers(m, sock, db);
    if (smartHandled) return;

    // Comandos de Case
    try {
      const caseResult = await handleCaseCommand(m, sock);
      if (caseResult && caseResult.handled) return;
    } catch (e) {}

    // Sistema de Plugins
    let plugin = getPlugin(m.command);
    if (plugin && plugin.config.isEnabled) {
      const permission = checkPermission(m, plugin.config);
      if (!permission.allowed) {
        let reason = permission.reason;
        if (reason.includes("Owner")) reason = "❌ *Función exclusiva para mi Creador.*";
        if (reason.includes("Admin")) reason = "❌ *Necesitas ser Administrador del grupo para usar esto.*";
        if (reason.includes("Group")) reason = "❌ *Este comando solo puede usarse en Grupos.*";
        if (reason.includes("Premium")) reason = "⭐ *Este comando es solo para usuarios Premium.*";
        await m.reply(reason);
        return;
      }
      
      const context = { sock, m, config, db, uptime: getUptime(), isJadibot, botName: "KAORI MD" };
      await plugin.handler(m, context);
      
      db.incrementStat("commandsExecuted");
      db.incrementStat(`command_${m.command}`);
    }

  } catch (error) {
    console.error("[Handler Error]:", error.message);
  }
}

async function groupHandler(update, sock) {
  try {
    const { id: groupJid, participants, action } = update;
    const db = getDatabase();
    let groupMeta = await sock.groupMetadata(groupJid).catch(() => null);
    
    for (let participant of participants) {
      if (action === "add" && sendWelcomeMessage) await sendWelcomeMessage(sock, groupJid, participant, groupMeta);
      if (action === "remove" && sendGoodbyeMessage) await sendGoodbyeMessage(sock, groupJid, participant, groupMeta);
      
      if (action === "promote") {
        await sock.sendMessage(groupJid, { text: `✨ @${participant.split("@")[0]} ¡Felicidades! Ahora eres Administrador de este grupo.`, mentions: [participant] });
      }
      if (action === "demote") {
        await sock.sendMessage(groupJid, { text: `📉 @${participant.split("@")[0]} Ya no eres Administrador.`, mentions: [participant] });
      }
    }
  } catch (e) {}
}

async function messageUpdateHandler(updates, sock) {
  const db = getDatabase();
  for (const update of updates) {
    await handleAntiRemove(update, sock, db).catch(() => {});
    const newMsg = {
      key: update.key,
      message: update.update?.message,
      messageTimestamp: update.messageTimestamp || Math.floor(Date.now() / 1000),
      pushName: update.pushName || "Usuario",
    };
    await messageHandler(newMsg, sock);
  }
}

async function groupSettingsHandler(update, sock) {
  const { id: groupId, announce, restrict } = update;
  const zannContext = {
    contextInfo: {
      externalAdReply: {
        title: "NOTIFICACIÓN DE GRUPO",
        body: "KAORI MD",
        mediaType: 1,
        sourceUrl: "",
      },
    },
  };

  if (announce !== undefined) {
    const text = announce ? "🔒 *El grupo ha sido cerrado.* Solo los administradores pueden escribir." : "🔓 *El grupo ha sido abierto.* Todos pueden escribir ahora.";
    await sock.sendMessage(groupId, { text }, zannContext);
  }
}

export {
  messageHandler,
  groupHandler,
  messageUpdateHandler,
  groupSettingsHandler,
  checkPermission,
  checkMode,
};
