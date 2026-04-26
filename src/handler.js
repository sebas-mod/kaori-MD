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
  if (
    /^[\.\/\!\#\-]?(autoreply|ar|smarttrigger|smarttriggers)$/.test(firstWord)
  ) {
    return false;
  }

  if (text === "listo" || text === "done") {
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
        console.error("[Handler] Error en trigger 'listo':", e.message);
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
      console.error("[Handler] Error en respuesta de registro:", e.message);
    }
  }

  const globalSmartTriggers =
    db.setting("smartTriggers") ?? config.features?.smartTriggers ?? false;

  try {
    const saluranId = config.saluran?.id || "120363208449943317@newsletter";
    const saluranName = config.saluran?.name || "KAORI MD";
    const botName = "KAORI MD";

    let isAutoreplyEnabled = globalSmartTriggers;

    const processCustomReply = async (replyItem) => {
      let replyText = (replyItem.reply || "")
        .replace(/{name}/g, m.pushName || "Usuario")
        .replace(/{tag}/g, `@${m.sender.split("@")[0]}`)
        .replace(/{sender}/g, m.sender.split("@")[0])
        .replace(/{botname}/g, botName)
        .replace(/{time}/g, timeHelper.formatTime("HH:mm:ss"))
        .replace(/{date}/g, timeHelper.formatDate("DD MMMM YYYY"));

      const mentions = replyText.includes(`@${m.sender.split("@")[0]}`)
        ? [m.sender]
        : [];

      if (replyItem.image && fs.existsSync(replyItem.image)) {
        const imageBuffer = fs.readFileSync(replyItem.image);
        await sock.sendMedia(m.chat, imageBuffer, replyText, m, {
          mentions: mentions,
          type: "image",
        });
      } else {
        await m.reply(replyText, { mentions: mentions });
      }
      return true;
    };

    if (m.isGroup) {
      const groupData = db.getGroup(m.chat) || {};
      isAutoreplyEnabled = groupData.autoreply ?? globalSmartTriggers;

      if (isAutoreplyEnabled) {
        let customReplies = groupData.customReplies || [];
        if (!Array.isArray(customReplies)) {
          customReplies = [];
          db.setGroup(m.chat, { customReplies });
        }
        for (const replyItem of customReplies) {
          if (!replyItem?.trigger) continue;
          if (text === replyItem.trigger || text.includes(replyItem.trigger)) {
            return await processCustomReply(replyItem);
          }
        }

        const globalCustomReplies = db.setting("globalCustomReplies") || [];
        for (const replyItem of globalCustomReplies) {
          if (!replyItem?.trigger) continue;
          if (text === replyItem.trigger || text.includes(replyItem.trigger)) {
            return await processCustomReply(replyItem);
          }
        }
      }
    } else {
      const privateAutoreply = db.setting("autoreplyPrivate") ?? false;
      if (!privateAutoreply && !globalSmartTriggers) return false;
      isAutoreplyEnabled = privateAutoreply || globalSmartTriggers;

      if (isAutoreplyEnabled) {
        const globalCustomReplies = db.setting("globalCustomReplies") || [];
        for (const replyItem of globalCustomReplies) {
          if (!replyItem?.trigger) continue;
          if (text === replyItem.trigger || text.includes(replyItem.trigger)) {
            return await processCustomReply(replyItem);
          }
        }
      }
    }

    if (!isAutoreplyEnabled) return false;

    const botJid = sock.user?.id;
    const isMentioned = m.mentionedJid?.some(
      (jid) => jid === botJid || jid?.includes(sock.user?.id?.split(":")[0]),
    );

    const thumbBuffer = getSmartTriggerThumb();

    if (isMentioned) {
      await m.reply(
        `¿Llamaste a ${botName}?
        
¿En qué puedo ayudarte @${m.sender.split("@")[0]}?`,
        { mentions: [m.sender] },
      );
      return true;
    }

    if (text?.toLowerCase() === "p") {
      await m.reply(
        `Hola @${m.sender.split("@")[0]}, por favor di hola o saluda primero.`,
        { mentions: [m.sender] },
      );
      return true;
    }

    if (text?.toLowerCase() === "bot") {
      await m.reply(`Hola @${m.sender.split("@")[0]}, ${botName} está en línea ✅`, {
        mentions: [m.sender],
      });
      return true;
    }

    if (text?.toLowerCase()?.includes("hola")) {
      await m.reply(`Hola @${m.sender.split("@")[0]}, ¿cómo estás?`, {
        mentions: [m.sender],
      });
      return true;
    }
    
    if (text?.toLowerCase()?.includes("assalamualaikum")) {
      await m.reply(`Waalaikumussalam @${m.sender.split("@")[0]}`, {
        mentions: [m.sender],
      });
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

    if (!m) return;
    if (!m.message) return;
    if (!m.sender) m.sender = m.chat || "";

    if (m.message?.stickerPackMessage && sock.saveStickerPack) {
      try {
        const packMsg = m.message.stickerPackMessage;
        const packId = packMsg.stickerPackId || m.id;
        const packName = packMsg.name || "Pack Desconocido";
        sock.saveStickerPack(packId, { stickerPackMessage: packMsg }, packName);
      } catch (e) {}
    }

    const db = getDatabase();
    if (!db?.ready) {
      return;
    }

    const jadibotId = options.jadibotId || null;
    if (isJadibot && jadibotId) {
      const botJid = sock.user?.id?.split(":")[0] + "@s.whatsapp.net";
      const senderNum = m.sender?.replace(/[^0-9]/g, "") || "";
      const botNum = botJid.replace(/[^0-9]/g, "");
      m.isOwner = isJadibotOwner(jadibotId, m.sender) || senderNum === botNum;
      m.isPremium = isJadibotPremium(jadibotId, m.sender) || m.isOwner;
    }

    if (config.features?.logMessage) {
      let groupName = "PRIVADO";
      if (m.isGroup) {
        const groupData = db.getGroup(m.chat);
        groupName = groupData?.name || "Grupo Desconocido";
        if (groupName === "Grupo Desconocido" || groupName === "Unknown") {
          sock
            .groupMetadata(m.chat)
            .then((meta) => {
              if (meta?.subject) db.setGroup(m.chat, { name: meta.subject });
            })
            .catch(() => {});
        }
      }

      if (!isJadibot) {
        const deviceHint =
          m.key?.id?.length > 22
            ? "Android"
            : m.key?.id?.startsWith("3EB0")
              ? "iPhone"
              : m.key?.id?.startsWith("BAE5")
                ? "Web"
                : null;
        logMessage({
          chatType: m.isNewsletter
            ? "newsletter"
            : m.isGroup
              ? "group"
              : "private",
          groupName: m.isNewsletter ? "Canal" : groupName,
          pushName: m.pushName,
          sender: m.sender,
          message: m.body,
          messageType: m.type,
          isForwarded: m.message?.[m.type]?.contextInfo?.isForwarded || false,
          isNewsletter:
            m.isNewsletter ||
            !!m.message?.[m.type]?.contextInfo?.forwardedNewsletterMessageInfo,
          isOwner: m.isOwner,
          isPremium: m.isPremium,
          isPartner: m.isPartner,
          isAdmin: m.isAdmin,
          device: deviceHint,
        });
      }
    }

    if (checkAfk) {
      checkAfk(m, sock).catch(() => {});
    }

    if (m.isGroup && !m.isNewsletter) {
      cacheMessageForAntiRemove(m, sock, db);
      const antilinkTriggered = await handleAntilink(m, sock, db);
      if (antilinkTriggered) return;

      const antilinkGcTriggered = await handleAntilinkGc(m, sock, db);
      if (antilinkGcTriggered) return;

      const antilinkAllTriggered = await handleAntilinkAll(m, sock, db);
      if (antilinkAllTriggered) return;

      const antiHidetagTriggered = await handleAntiHidetag(m, sock, db);
      if (antiHidetagTriggered) return;

      if (checkAntidocument) {
        const isAntidocument = await checkAntidocument(m, sock, db);
        if (isAntidocument) return;
      }

      if (detectBot && !m.isOwner && !m.isAdmin) {
        try {
          const botDetected = await detectBot(m, sock);
          if (botDetected) return;
        } catch (e) {}
      }

      if (isMuted && !m.isAdmin && !m.isOwner) {
        try {
          if (isMuted(m.chat, db)) {
            if (m.isBotAdmin) await sock.sendMessage(m.chat, { delete: m.key });
            return;
          }
        } catch (e) {}
      }

      if (isMutedMember && !m.isAdmin && !m.isOwner) {
        try {
          if (isMutedMember(m.chat, m.sender, db)) {
            if (m.isBotAdmin) await sock.sendMessage(m.chat, { delete: m.key });
            return;
          }
        } catch (e) {}
      }

      if (checkSpam && handleSpamAction && !m.isAdmin) {
        try {
          const isSpam = await checkSpam(m, sock, db);
          if (isSpam) {
            const delayKey = `${m.chat}_${m.sender}`;
            spamDelayTracker.set(delayKey, Date.now());
            await handleSpamAction(m, sock, db);
          }
        } catch (e) {}
      }

      if (checkSlowmode && !m.isAdmin && !m.isOwner) {
        try {
          const slowResult = checkSlowmode(m, sock, db);
          if (slowResult) {
            if (slowResult.mode === "onlycommand") {
              if (m.isCommand) return;
            } else {
              await sock.sendMessage(m.chat, { delete: m.key });
              return;
            }
          }
        } catch (e) {}
      }

      if (isToxic && handleToxicMessage) {
        try {
          const groupData = db.getGroup(m.chat) || {};
          if (groupData.antitoxic && !m.isAdmin && !m.isOwner) {
            const toxicWords = groupData.toxicWords || [];
            const result = isToxic(m.body, toxicWords);
            if (result.toxic) {
              await handleToxicMessage(m, sock, db, result.word);
              return;
            }
          }
        } catch (e) {}
      }
    }

    const modeCheck = checkMode(m, getActiveJadibots);
    if (!modeCheck.allowed) {
      if (modeCheck.isAfk && m.isCommand) {
        await m.reply(modeCheck.afkMessage);
      } else if (modeCheck.hasJadibots && m.isCommand && !isJadibot) {
        await sock.sendMessage(
          m.chat,
          {
            text: modeCheck.jadibotMessage,
            contextInfo: {
              mentionedJid: modeCheck.jadibotMentions,
              externalAdReply: {
                title: `A C C E S O  D E N E G A D O`,
                body: "KAORI MD - Sistema de Seguridad",
                thumbnailUrl:
                  "https://cdn.gimita.id/download/unnamed%20(8)_1769331052275_d19c28da.jpg",
                sourceUrl: null,
                mediaType: 1,
                renderLargerThumbnail: true,
              },
            },
          },
          { quoted: m },
        );
      }
      return;
    }

    if (m.isBanned) {
      if (m.isCommand) {
        await m
          .reply(
            config.messages?.banned ||
              "🚫 *Has sido baneado del uso de este bot.*",
          )
          .catch(() => {});
      }
      logger.warn("Usuario baneado", m.sender);
      return;
    }

    if (m.isGroup && m.isCommand && !m.isOwner) {
      const groupData = db.getGroup(m.chat) || {};
      if (groupData.isBanned) {
        return;
      }
    }

    const botId = sock.user?.id?.split(":")[0] || "unknown";
    const msgKey = `${botId}_${m.chat}_${m.sender}_${m.id}`;
    if (debounceMessage(msgKey)) {
      return;
    }

    if (config.features?.autoRead) {
      sock.readMessages([m.key]).catch(() => {});
    }
    if (!m.pushName || m.pushName === "Unknown" || m.pushName.trim() === "") {
      if (!m.isCommand && !m.isBot && !m.fromMe && !m.isNewsletter) {
        return;
      }
      m.pushName = m.isNewsletter
        ? "Canal"
        : m.sender?.split("@")[0] || "Usuario";
    }

    if (m.isCommand) {
      db.setUser(m.sender, {
        name: m.pushName,
        lastSeen: new Date().toISOString(),
      });
    }

    if (m.isGroup && incrementChatCount) {
      try {
        incrementChatCount(m.chat, m.sender, db);
      } catch (e) {}
    }

    const cmdVnEnabled = db.setting("cmdVn") || false;
    if (
      cmdVnEnabled &&
      m.type === "audioMessage" &&
      !m.isCommand &&
      config.APIkey?.groq
    ) {
      try {
        const audioMsg = m.message?.audioMessage;
        const maxSize = 500 * 1024;
        if (
          audioMsg &&
          (!audioMsg.fileLength || audioMsg.fileLength <= maxSize)
        ) {
          const buffer = await m.download();
          if (buffer && buffer.length > 1000) {
            const tmpDir = path.join(process.cwd(), "tmp");
            if (!fs.existsSync(tmpDir))
              fs.mkdirSync(tmpDir, { recursive: true });

            const inputFile = path.join(tmpDir, `vncmd_${Date.now()}.ogg`);
            const wavFile = path.join(tmpDir, `vncmd_${Date.now()}.wav`);

            fs.writeFileSync(inputFile, buffer);

            await new Promise((resolve, reject) => {
              exec(
                `ffmpeg -y -i "${inputFile}" -ar 16000 -ac 1 -f wav "${wavFile}"`,
                { timeout: 15000 },
                (err) => (err ? reject(err) : resolve()),
              );
            });

            const wavBuffer = fs.readFileSync(wavFile);
            const form = new FormData();
            form.append("file", wavBuffer, {
              filename: "audio.wav",
              contentType: "audio/wav",
            });
            form.append("model", "whisper-large-v3");
            form.append("language", "es");
            form.append("response_format", "json");

            const { data } = await axios.post(
              "https://api.groq.com/openai/v1/audio/transcriptions",
              form,
              {
                headers: {
                  ...form.getHeaders(),
                  Authorization: `Bearer ${config.APIkey.groq}`,
                },
                timeout: 30000,
                maxContentLength: Infinity,
              },
            );

            [inputFile, wavFile].forEach((f) => {
              try {
                fs.unlinkSync(f);
              } catch {}
            });

            const transcript = (data.text || "")
              .trim()
              .toLowerCase()
              .replace(/[.,!?;:'"]/g, "")
              .trim();

            if (transcript) {
              const words = transcript.split(/\s+/);
              const rawWord = words[0];
              const prefix = config.command?.prefix || ".";

              const allPlugins = getAllPlugins();
              const allNames = [];
              for (const p of allPlugins) {
                if (p.config?.name && typeof p.config.name === "string")
                  allNames.push(p.config.name.toLowerCase());
                if (Array.isArray(p.config?.alias)) {
                  for (const a of p.config.alias) {
                    if (a && typeof a === "string")
                      allNames.push(a.toLowerCase());
                  }
                }
              }

              let bestMatch = null;
              let bestScore = Infinity;

              for (const cmd of allNames) {
                if (cmd === rawWord) {
                  bestMatch = cmd;
                  bestScore = 0;
                  break;
                }
                if (rawWord.startsWith(cmd) && cmd.length >= 3) {
                  const score = rawWord.length - cmd.length;
                  if (score < bestScore) {
                    bestScore = score;
                    bestMatch = cmd;
                  }
                }
                const dist = levenshtein(rawWord, cmd);
                if (dist <= 3 && dist < bestScore) {
                  bestScore = dist;
                  bestMatch = cmd;
                }
              }

              if (bestMatch) {
                const commandArgs = words.slice(1).join(" ");
                m.body = `${prefix}${bestMatch}${commandArgs ? " " + commandArgs : ""}`;
                const { parseCommand } =
                  await import("./lib/ourin-serialize.js");
                const parsed = parseCommand(m.body, prefix);
                m.isCommand = parsed.isCommand;
                m.command = parsed.command;
                m.args = parsed.args;
                m.prefix = parsed.prefix;
                m.isVnCommand = true;
              }
            }
          }
        }
      } catch (e) {
        console.error("[CMD VN] Error:", e.message);
      }
    }

    if (m.body) {
      try {
        const userObj = db.getUser(m.sender) || db.setUser(m.sender);

        if (levelHelper && levelHelper.addExpWithLevelCheck) {
          await levelHelper.addExpWithLevelCheck(sock, m, db, userObj, 5);
        }
      } catch (e) {
        console.error("[Sistema de Nivel] Error:", e.message);
      }
    }

    if (handleAutoAI && m.isGroup) {
      try {
        const aiHandled = await handleAutoAI(m, sock);
        if (aiHandled) return;
      } catch (e) {}
    }

    if (handleAutoDownload && m.body) {
      try {
        handleAutoDownload(m, sock, m.body);
      } catch (e) {}
    }

    if (autoJoinDetector && m.body) {
      try {
        const joined = await autoJoinDetector(m, sock);
        if (joined) return;
      } catch (e) {}
    }

    if (m.body?.startsWith(">>") && m.isOwner) {
      const code = m.body.slice(2).trim();
      if (!code) return;

      try {
        const AsyncFunction = Object.getPrototypeOf(
          async function () {},
        ).constructor;

        const execCode = new AsyncFunction(
          "m",
          "sock",
          "db",
          "config",
          "getDatabase",
          "console",
          `
          const { default: axios } = await import('axios')
          const { default: fs } = await import('fs')
          const { default: path } = await import('path')
          const { default: os } = await import('os')
          const { promisify } = await import('util')
          const { generateWAMessage, getBuffer, generateWAMessageFromContent, proto, generateMessageID } = await import('ourin')
          const { exec: childExec } = await import('child_process')
          const exec = promisify(childExec)
          
          ${code}
          `,
        );

        const result = await execCode(
          m,
          sock,
          db,
          config,
          getDatabase,
          console,
        );

        if (result !== undefined && result !== null) {
          const output =
            typeof result === "object"
              ? JSON.stringify(result, null, 2)
              : String(result);

          if (output.length > 0) {
            await m.reply(
              `✅ *ʀᴇsᴜʟᴛᴀᴅᴏ ᴅᴇ ᴇxᴇᴄ*\n\n\`\`\`\n${output.substring(0, 4000)}\n\`\`\``,
            );
          }
        }
      } catch (execError) {
        await m.reply(
          `❌ *ᴇʀʀᴏʀ ᴅᴇ ᴇxᴇᴄ*\n\n\`\`\`\n${execError.message}\n\nStack:\n${execError.stack?.substring(0, 1000) || "N/A"}\n\`\`\``,
        );
      }
      return;
    }

    const hasSuitGame =
      global.suitGames &&
      Object.values(global.suitGames).some(
        (r) =>
          (r.chat === m.chat || !m.isGroup) && [r.p, r.p2].includes(m.sender),
      );

    const hasTTTGame =
      global.tictactoeGames &&
      Object.values(global.tictactoeGames).some(
        (r) =>
          r.state === "PLAYING" &&
          r.chat === m.chat &&
          [r.game.playerX, r.game.playerO].filter(Boolean).includes(m.sender),
      );

    const hasUTGame = global.ulartanggaGames?.[m.chat]?.status === "PLAYING";

    let gameEvaluated = false;
    if (
      (hasActiveSession(m.chat) && m.quoted) ||
      hasSuitGame ||
      hasTTTGame ||
      hasUTGame
    ) {
      gameEvaluated = true;
      const gameHandled = await handleGameAnswer(m, sock);
      if (gameHandled) return;
    }

    if (!m.isCommand) {
      if (checkStickerCommand && m.message?.stickerMessage) {
        try {
          const stickerCmd = checkStickerCommand(m);
          if (stickerCmd) {
            m.isCommand = true;
            m.command = stickerCmd;
            m.prefix = ".";
            m.text = stickerCmd;
            m.args = [];
          }
        } catch (e) {}
      }

      if (!m.isCommand) {
        if (hasActiveSession(m.chat) && !gameEvaluated) {
          gameEvaluated = true;
          const gameHandled = await handleGameAnswer(m, sock);
          if (gameHandled) return;
        }

        const smartHandled = await handleSmartTriggers(m, sock, db);
        if (smartHandled) return;

        if (m.quoted?.id) {
          try {
            if (
              global.ytdlSessions?.has(m.quoted.id) &&
              ytmp4Plugin?.handleReply
            ) {
              const handled = await ytmp4Plugin.handleReply(m, { sock });
              if (handled) return;
            }
            if (
              global.confessData?.has(m.quoted.id) &&
              confessPlugin?.replyHandler
            ) {
              const handled = await confessPlugin.replyHandler(m, { sock });
              if (handled) return;
            }
            if (
              global.sulapSessions?.has(m.quoted.id) &&
              sulapPlugin?.replyHandler
            ) {
              const handled = await sulapPlugin.replyHandler(m, sock);
              if (handled) return;
            }
          } catch {}
        }

        if (autoStickerHandler && m.isGroup) {
          autoStickerHandler(m, sock).catch(() => {});
        }

        if (autoMediaHandler && m.isGroup) {
          autoMediaHandler(m, sock).catch(() => {});
        }

        if (checkAntisticker && m.isGroup) {
          const stickerHandled = await checkAntisticker(m, sock, db);
          if (stickerHandled) return;
        }

        if (checkAntimedia && m.isGroup) {
          const mediaHandled = await checkAntimedia(m, sock, db);
          if (mediaHandled) return;
        }

        return;
      }
    }

    const delayKey = `${m.chat}_${m.sender}`;
    if (!m.isOwner && !m.isPremium) {
      const lastSpamDetect = spamDelayTracker.get(delayKey);
      if (lastSpamDetect) {
        const elapsed = Date.now() - lastSpamDetect;
        if (elapsed < 10000) {
          await new Promise((r) => setTimeout(r, 500));
        } else {
          spamDelayTracker.delete(delayKey);
        }
      }
    }

    const spamKey = `${botId}_${m.sender}`;
    if (!m.isOwner && !m.isPremium && (await isSpamming(spamKey))) {
      return;
    }

    const storeData = db.setting("storeList") || {};
    const storeCommand = storeData[m.command.toLowerCase()];

    if (m.isGroup) {
      const groupData = db.getGroup(m.chat) || {};
      const botMode = groupData.botMode || "md";

      if (botMode === "store" && storeCommand) {
        storeData[m.command.toLowerCase()].views =
          (storeCommand.views || 0) + 1;
        db.setting("storeList", storeData);

        const caption =
          `📦 *${m.command.toUpperCase()}*\n\n` +
          `${storeCommand.content}\n\n` +
          `───────────────\n` +
          `> 👁️ Vistas: ${storeData[m.command.toLowerCase()].views}\n` +
          `> 💳 Escribe \`${m.prefix}payment\` para pagar`;

        if (storeCommand.hasImage && storeCommand.imagePath) {
          await sock.sendMessage(m.chat, { image: { url: storeCommand.imagePath }, caption }, { quoted: m });
        } else {
          await m.reply(caption);
        }
        return;
      }
    }

    const plugin = getPlugin(m.command);
    if (plugin) {
        try {
            const context = {
                sock,
                m,
                db,
                config,
                getDatabase,
                isOwner: m.isOwner,
                isPremium: m.isPremium,
                isAdmin: m.isAdmin,
                isBotAdmin: m.isBotAdmin,
            };
            
            const permission = checkPermission(m, plugin);
            if (!permission.allowed) {
                if (permission.message) await m.reply(permission.message);
                return;
            }

            await plugin.run(context);
        } catch (pluginError) {
            console.error(`[Error de Plugin: ${m.command}]`, pluginError);
            await m.reply(createErrorMessage(pluginError));
        }
    } else {
        await handleCaseCommand(m, sock, db);
    }

  } catch (error) {
    console.error("[KAORI MD Handler] Error Crítico:", error);
  } finally {
      const db = getDatabase();
      if (db?.ready) {
          await db.save().catch(() => {});
      }
  }
}

export { messageHandler };
