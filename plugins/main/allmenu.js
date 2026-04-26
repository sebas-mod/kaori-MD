import * as botmodePlugin from '../group/botmode.js'
import { generateWAMessageFromContent, proto } from 'ourin'
import _sharp from 'sharp'
import config from "../../config.js";
import {
  formatUptime,
  getTimeGreeting,
} from "../../src/lib/ourin-formatter.js";
import {
  getCommandsByCategory,
  getCategories,
  getPluginCount,
  getPlugin,
  getPluginsByCategory,
} from "../../src/lib/ourin-plugins.js";
import { getDatabase } from "../../src/lib/ourin-database.js";
import { getCasesByCategory, getCaseCount } from "../../case/ourin.js";
import fs from "fs";
import path from "path";

function getSharp() {
  return _sharp;
}

const pluginConfig = {
  name: "allmenu",
  alias: ["fullmenu", "am", "allcommand", "semua"],
  category: "main",
  description: "Mostrar todos los comandos completos por categoría",
  usage: ".allmenu",
  example: ".allmenu",
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
  store: "🏪",
  premium: "💎",
  convert: "🔄",
  economy: "💰",
  cek: "📋",
  ephoto: "🎨",
  jpm: "📢",
  pushkontak: "📱",
};

function toSmallCaps(text) {
  return text.toUpperCase()
}

function getContextInfo(botConfig, m, thumbBuffer) {
  const saluranId = botConfig.saluran?.id || "120363208449943317@newsletter";
  const saluranName =
    botConfig.saluran?.name || botConfig.bot?.name || "ᴋᴀᴏʀɪ ᴍᴅ";
  return {
    mentionedJid: [m.sender],
    forwardingScore: 9999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: saluranId,
      newsletterName: saluranName,
      serverMessageId: 127,
    },
  };
}

async function handler(m, { sock, config: botConfig, db, uptime }) {
  const prefix = botConfig.command?.prefix || ".";
  const user = db.getUser(m.sender);
  const groupData = m.isGroup ? db.getGroup(m.chat) || {} : {};
  const botMode = groupData.botMode || "md";

  const categories = getCategories();
  const commandsByCategory = getCommandsByCategory();
  const casesByCategory = getCasesByCategory();

  let totalCommands = 0;
  for (const category of categories) {
    totalCommands += (commandsByCategory[category] || []).length;
  }

  const totalCases = getCaseCount();
  const totalFeatures = totalCommands + totalCases;

  let userRole = "Usuario",
    roleEmoji = "👤";

  if (m.isOwner) {
    userRole = "Owner";
    roleEmoji = "👑";
  } else if (m.isPremium) {
    userRole = "Premium";
    roleEmoji = "💎";
  }

  const greeting = getTimeGreeting();

  let txt = `Hola *@${m.pushName || "Usuario"}* 🪸
Soy ${botConfig.bot?.name || "ᴋᴀᴏʀɪ ᴍᴅ"}, un bot de WhatsApp listo para ayudarte.  
Puedes usarme para buscar información, obtener datos o ayudarte con tareas simples directamente desde WhatsApp — práctico y sin complicaciones.
`;

  const categoryOrder = [
    "owner","main","utility","tools","fun","game","download","search","sticker",
    "media","ai","group","religi","info","cek","economy","user","canvas",
    "random","premium",
  ];

  const sortedCategories = [...categories].sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  let modeAllowedMap = {
    md: null,
    store: ["main", "group", "sticker", "owner", "store"],
    pushkontak: ["main", "group", "sticker", "owner", "pushkontak"],
  };

  let modeExcludeMap = {
    md: ["panel", "pushkontak", "store"],
    store: null,
    pushkontak: null,
  };

  try {
    if (botmodePlugin && botmodePlugin.MODES) {
      const modes = botmodePlugin.MODES;
      modeAllowedMap = {};
      modeExcludeMap = {};
      for (const [key, val] of Object.entries(modes)) {
        modeAllowedMap[key] = val.allowedCategories;
        modeExcludeMap[key] = val.excludeCategories;
      }
    }
  } catch (e) {}

  const allowedCategories = modeAllowedMap[botMode];
  const excludeCategories = modeExcludeMap[botMode] || [];

  for (const category of sortedCategories) {
    if (category === "owner" && !m.isOwner) continue;
    if (allowedCategories && !allowedCategories.includes(category.toLowerCase())) continue;
    if (excludeCategories && excludeCategories.includes(category.toLowerCase())) continue;

    const pluginCmds = commandsByCategory[category] || [];
    const caseCmds = casesByCategory[category] || [];
    const allCmds = [...pluginCmds, ...caseCmds];
    if (allCmds.length === 0) continue;

    const emoji = CATEGORY_EMOJIS[category] || "📋";
    const categoryName = toSmallCaps(category);

    txt += `╭─〔 ${emoji} *${categoryName}* 〕───⬣\n`;
    for (const cmd of allCmds) {
      txt += ` │ ◦ *${prefix}${cmd}*\n`;
    }
    txt += `╰───────⬣\n\n`;
  }

  txt += `_© ${botConfig.bot?.name || "ᴋᴀᴏʀɪ ᴍᴅ"} | ${new Date().getFullYear()}_\n`;
  txt += `_ᴅᴇsᴀʀʀᴏʟʟᴀᴅᴏʀ: sebas MD_`;

  const imagePath = path.join(process.cwd(), "assets", "images", "ourin.jpg");
  const thumbPath = path.join(process.cwd(), "assets", "images", "ourin2.jpg");

  let imageBuffer = fs.existsSync(imagePath) ? fs.readFileSync(imagePath) : null;
  let thumbBuffer = fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : null;

  const savedVariant = db.setting("allmenuVariant");
  const allmenuVariant = savedVariant || botConfig.ui?.allmenuVariant || 2;

  const fullContextInfo = {
    mentionedJid: [m.sender],
    forwardingScore: 9999,
    isForwarded: true,
    externalAdReply: {
      title: botConfig.bot?.name || "ᴋᴀᴏʀɪ ᴍᴅ",
      body: `Owner: sebas MD`,
      mediaType: 1,
      thumbnail: imageBuffer,
      renderLargerThumbnail: true,
    },
  };

  try {
    if (imageBuffer) {
      await sock.sendMessage(
        m.chat,
        {
          image: imageBuffer,
          caption: txt,
          contextInfo: fullContextInfo,
        },
        { quoted: m }
      );
    } else {
      await m.reply(txt);
    }
  } catch (error) {
    console.error("[AllMenu] Error:", error.message);
    await m.reply(txt);
  }
}

export { pluginConfig as config, handler };
