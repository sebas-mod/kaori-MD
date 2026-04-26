import { getCaseCount, getCasesByCategory } from '../../case/ourin.js'
import { prepareWAMessageMedia, generateWAMessageFromContent, proto } from 'ourin'
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas'
import _sharp from 'sharp'
import config from "../../config.js";
import {
  formatUptime,
  getTimeGreeting,
} from "../../src/lib/ourin-formatter.js";
import {
  getCommandsByCategory,
  getCategories,
} from "../../src/lib/ourin-plugins.js";
import { getDatabase } from "../../src/lib/ourin-database.js";
import fs from "fs";
import path from "path";

function getSharp() {
  return _sharp;
}
import axios from "axios";

const pluginConfig = {
  name: "menu",
  alias: ["help", "ayuda", "comandos", "m"],
  category: "main",
  description: "Muestra el menú principal del bot",
  usage: ".menu",
  example: ".menu",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const CATEGORY_EMOJIS = {
  owner: "👑",
  main: "🏠",
  utility: "🔧",
  fun: "🎮",
  group: "👥",
  download: "📥",
  search: "🔍",
  tools: "🛠️",
  sticker: "🖼️",
  ai: "🤖",
  game: "🎯",
  media: "🎬",
  info: "ℹ️",
  religi: "☪️",
  panel: "🖥️",
  user: "📊",
  linode: "☁️",
  random: "🎲",
  canvas: "🎨",
  vps: "🌊",
};

function toSmallCaps(text) {
  const smallCaps = {
    a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ꜰ", g: "ɢ", h: "ʜ", i: "ɪ",
    j: "ᴊ", k: "ᴋ", l: "ʟ", m: "ᴍ", n: "ɴ", o: "ᴏ", p: "ᴘ", q: "ǫ", r: "ʀ",
    s: "s", t: "ᴛ", u: "ᴜ", v: "ᴠ", w: "ᴡ", x: "x", y: "ʏ", z: "ᴢ",
  };
  return text.toLowerCase().split("").map((c) => smallCaps[c] || c).join("");
}

const toMonoUpperBold = (text) => {
  const chars = {
    A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜",
    J: "𝗝", K: "𝗞", L: "𝗟", M: "𝗠", N: "𝗡", O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥",
    S: "𝗦", T: "𝗧", U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫", Y: "𝗬", Z: "𝗭",
  };
  return text.toUpperCase().split("").map((c) => chars[c] || c).join("");
};

function getSortedCategories(m, botMode) {
  const categories = getCategories();
  const commandsByCategory = getCommandsByCategory();
  const categoryOrder = ["owner", "main", "utility", "tools", "fun", "game", "download", "search", "sticker", "media", "ai", "group", "religi", "info", "cek", "economy", "user", "canvas", "random", "premium", "ephoto", "jpm", "pushkontak", "panel", "store"];
  
  let modeAllowedMap = {
    md: null,
    cpanel: ["main", "group", "sticker", "owner", "tools", "panel"],
    store: ["main", "group", "sticker", "owner", "store"],
    pushkontak: ["main", "group", "sticker", "owner", "pushkontak"],
  };

  const allowedCats = modeAllowedMap[botMode];
  const sortedCats = [...categories].sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  const result = [];
  for (const cat of sortedCats) {
    if (cat === "owner" && !m.isOwner) continue;
    if (allowedCats && !allowedCats.includes(cat.toLowerCase())) continue;
    const cmds = commandsByCategory[cat] || [];
    if (cmds.length === 0) continue;
    const emoji = CATEGORY_EMOJIS[cat] || "📁";
    result.push({ cat, cmds, emoji });
  }
  return { sorted: result, commandsByCategory };
}

async function buildMenuText(m, botConfig, db, uptime, botMode = "md") {
  const prefix = botConfig.command?.prefix || ".";
  const user = db.getUser(m.sender);
  const timeHelper = await import("../../src/lib/ourin-time.js");
  const timeStr = timeHelper.formatTime("HH:mm");
  const dateStr = timeHelper.formatFull("dddd, DD MMMM YYYY");
  
  const uptimeFormatted = formatUptime(uptime);
  const totalUsers = db.getUserCount();
  
  let userRole = m.isOwner ? "Dueño" : m.isPremium ? "Premium" : "Usuario";
  let roleEmoji = m.isOwner ? "👑" : m.isPremium ? "💎" : "👤";

  let txt = `Hola *@${m.pushName || "Usuario"}* 🪸\n`;
  txt += `Soy *KAORI MD*, un bot de WhatsApp listo para ayudarte con múltiples funciones de entretenimiento y herramientas.\n\n`;
  
  txt += `╭─〔 🤖 *ɪɴꜰᴏ ᴅᴇʟ ʙᴏᴛ* 〕\n`;
  txt += `*│* 🖐 ɴᴏᴍʙʀᴇ    : *KAORI MD*\n`;
  txt += `*│* ⚙️ ᴍᴏᴅᴏ     : *${(botConfig.mode || "público").toUpperCase()}*\n`;
  txt += `*│* ⏱ ᴀᴄᴛɪᴠᴏ    : *${uptimeFormatted}*\n`;
  txt += `*│* 👥 ᴛᴏᴛᴀʟ    : *${totalUsers} Usuarios*\n`;
  txt += `╰────────────────⬣\n\n`;

  txt += `╭─〔 👤 *ɪɴꜰᴏ ᴅᴇ ᴜsᴜᴀʀɪᴏ* 〕\n`;
  txt += `*│* 🎭 ʀᴏʟ      : *${roleEmoji} ${userRole}*\n`;
  txt += `*│* 🎟 ᴇɴᴇʀɢíᴀ   : *${m.isOwner || m.isPremium ? "∞ Ilimitada" : (user?.energi ?? 25)}*\n`;
  txt += `*│* 🕒 ʜᴏʀᴀ      : *${timeStr}*\n`;
  txt += `╰────────────────⬣\n\n`;

  const { sorted } = getSortedCategories(m, botMode);
  txt += `📂 *ʟɪsᴛᴀ ᴅᴇ ᴍᴇɴús*\n`;
  for (const { cat, emoji } of sorted) {
    txt += `- \`◦\` ${prefix}${toSmallCaps(`menucat ${cat}`)} ${emoji}\n`;
  }
  return txt;
}

function getContextInfo(botConfig, m, thumbBuffer, renderLargerThumbnail = false) {
  return {
    mentionedJid: [m.sender],
    forwardingScore: 9,
    isForwarded: true,
    externalAdReply: {
      title: "KAORI MD",
      body: `BOT DE WHATSAPP MULTI-DEVICE`,
      sourceUrl: botConfig.saluran?.link || "",
      mediaType: 1,
      renderLargerThumbnail,
      thumbnail: thumbBuffer,
    },
  };
}

function getVerifiedQuoted(botConfig) {
  return {
    key: { participant: `0@s.whatsapp.net`, remoteJid: `status@broadcast` },
    message: {
      contactMessage: {
        displayName: `🪸 KAORI MD`,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;Kaori;;;\nFN:Kaori\nEND:VCARD`,
      },
    },
  };
}

async function sendFallback(m, sock, text, imageBuffer, thumbBuffer, botConfig) {
  const msg = imageBuffer 
    ? { image: imageBuffer, caption: text, contextInfo: getContextInfo(botConfig, m, thumbBuffer) }
    : { text: text, contextInfo: getContextInfo(botConfig, m, thumbBuffer) };
  
  await sock.sendMessage(m.chat, msg, { quoted: getVerifiedQuoted(botConfig) });
}

async function handler(m, { sock, config: botConfig, db, uptime }) {
  const prefix = botConfig.command?.prefix || ".";
  const savedVariant = db.setting("menuVariant");
  const menuVariant = savedVariant || botConfig.ui?.menuVariant || 2;
  const groupData = m.isGroup ? db.getGroup(m.chat) || {} : {};
  const botMode = groupData.botMode || "md";

  const text = await buildMenuText(m, botConfig, db, uptime, botMode);
  const imageBuffer = fs.existsSync("./assets/images/ourin.jpg") ? fs.readFileSync("./assets/images/ourin.jpg") : null;
  const thumbBuffer = fs.existsSync("./assets/images/ourin2.jpg") ? fs.readFileSync("./assets/images/ourin2.jpg") : null;

  try {
    switch (parseInt(menuVariant)) {
      case 8: {
        const { sorted } = getSortedCategories(m, botMode);
        let menuText = `*KAORI MD*\n`;
        menuText += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
        menuText += `┏━━━〔 👤 *𝗣𝗘𝗥𝗙𝗜𝗟* 〕━━━┓\n`;
        menuText += `┃ 👤 *${m.pushName}*\n`;
        menuText += `┃ 🎫 Energía ➤ ${m.isOwner || m.isPremium ? "∞ Ilimitada" : (db.getUser(m.sender)?.energi ?? 25)}\n`;
        menuText += `┗━━━━━━━━━━━━━━━┛\n\n`;

        for (const { cat, cmds, emoji } of sorted) {
          menuText += `┌─────「 ${emoji} *${cat.toUpperCase()}* 」\n`;
          for (const cmd of cmds) {
            menuText += `│ ├➤ ${prefix}${cmd}\n`;
          }
          menuText += `└───────────────────\n\n`;
        }

        await sock.sendMessage(m.chat, {
          image: imageBuffer || thumbBuffer,
          caption: menuText,
          contextInfo: getContextInfo(botConfig, m, thumbBuffer, true)
        }, { quoted: getVerifiedQuoted(botConfig) });
        break;
      }

      default:
        await sendFallback(m, sock, text, imageBuffer, thumbBuffer, botConfig);
    }
  } catch (error) {
    console.error("[Menu Error]:", error);
    await m.reply("Hubo un error al generar el menú. Por favor, revisa la consola.");
  }
}

export default {
  config: pluginConfig,
  handler,
};
