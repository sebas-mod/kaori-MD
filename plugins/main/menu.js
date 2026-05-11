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
  alias: ["help", "bantuan", "commands", "m"],
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
    a: "ᴀ",
    b: "ʙ",
    c: "ᴄ",
    d: "ᴅ",
    e: "ᴇ",
    f: "ꜰ",
    g: "ɢ",
    h: "ʜ",
    i: "ɪ",
    j: "ᴊ",
    k: "ᴋ",
    l: "ʟ",
    m: "ᴍ",
    n: "ɴ",
    o: "ᴏ",
    p: "ᴘ",
    q: "ǫ",
    r: "ʀ",
    s: "s",
    t: "ᴛ",
    u: "ᴜ",
    v: "ᴠ",
    w: "ᴡ",
    x: "x",
    y: "ʏ",
    z: "ᴢ",
  };
  return text
    .toLowerCase()
    .split("")
    .map((c) => smallCaps[c] || c)
    .join("");
}
const toMonoUpperBold = (text) => {
  const chars = {
    A: "𝗔",
    B: "𝗕",
    C: "𝗖",
    D: "𝗗",
    E: "𝗘",
    F: "𝗙",
    G: "𝗚",
    H: "𝗛",
    I: "𝗜",
    J: "𝗝",
    K: "𝗞",
    L: "𝗟",
    M: "𝗠",
    N: "𝗡",
    O: "𝗢",
    P: "𝗣",
    Q: "𝗤",
    R: "𝗥",
    S: "𝗦",
    T: "𝗧",
    U: "𝗨",
    V: "𝗩",
    W: "𝗪",
    X: "𝗫",
    Y: "𝗬",
    Z: "𝗭",
  };
  return text
    .toUpperCase()
    .split("")
    .map((c) => chars[c] || c)
    .join("");
};
function getSortedCategories(m, botMode) {
  const categories = getCategories();
  const commandsByCategory = getCommandsByCategory();
  const categoryOrder = [
    "owner",
    "main",
    "utility",
    "tools",
    "fun",
    "game",
    "download",
    "search",
    "sticker",
    "media",
    "ai",
    "group",
    "religi",
    "info",
    "cek",
    "economy",
    "user",
    "canvas",
    "random",
    "premium",
    "ephoto",
    "jpm",
    "pushkontak",
    "panel",
    "store",
  ];
  let modeAllowedMap = {
    md: null,
    cpanel: ["main", "group", "sticker", "owner", "tools", "panel"],
    store: ["main", "group", "sticker", "owner", "store"],
    pushkontak: ["main", "group", "sticker", "owner", "pushkontak"],
  };
  let modeExcludeMap = {
    md: ["panel", "pushkontak", "store"],
    cpanel: null,
    store: null,
    pushkontak: null,
  };
  const allowedCats = modeAllowedMap[botMode];
  const excludeCats = modeExcludeMap[botMode] || [];
  const sortedCats = [...categories].sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });
  const result = [];
  let totalCmds = 0;
  for (const cat of sortedCats) {
    if (cat === "owner" && !m.isOwner) continue;
    if (allowedCats && !allowedCats.includes(cat.toLowerCase())) continue;
    if (excludeCats && excludeCats.includes(cat.toLowerCase())) continue;
    const cmds = commandsByCategory[cat] || [];
    if (cmds.length === 0) continue;
    const emoji = CATEGORY_EMOJIS[cat] || "📁";
    result.push({ cat, cmds, emoji });
  }
  for (const cat of categories) {
    totalCmds += (commandsByCategory[cat] || []).length;
  }
  return { sorted: result, totalCmds, commandsByCategory };
}
async function formatTime(date) {
  const timeHelper = await import("../../src/lib/ourin-time.js");
  return timeHelper.formatTime("HH:mm");
}
async function formatDateShort(date) {
  const timeHelper = await import("../../src/lib/ourin-time.js");
  return timeHelper.formatFull("dddd, DD MMMM YYYY");
}
async function buildMenuText(m, botConfig, db, uptime, botMode = "md") {
  const prefix = botConfig.command?.prefix || ".";
  const user = db.getUser(m.sender);
  const timeHelper = await import("../../src/lib/ourin-time.js");
  const timeStr = timeHelper.formatTime("HH:mm");
  const dateStr = timeHelper.formatFull("dddd, DD MMMM YYYY");
  const categories = getCategories();
  const commandsByCategory = getCommandsByCategory();
  let totalCommands = 0;
  for (const category of categories) {
    totalCommands += (commandsByCategory[category] || []).length;
  }
  const totalCases = getCaseCount();
  const casesByCategory = getCasesByCategory();
  const totalFeatures = totalCommands + totalCases;
  let userRole = "Usuario",
    roleEmoji = "👤";
  if (m.isOwner) {
    userRole = "Dueño";
    roleEmoji = "👑";
  } else if (m.isPremium) {
    userRole = "Premium";
    roleEmoji = "💎";
  }
  const greeting = getTimeGreeting();
  const uptimeFormatted = formatUptime(uptime);
  const totalUsers = db.getUserCount();
  const greetEmoji = greeting.includes("pagi")
    ? "🌅"
    : greeting.includes("siang")
      ? "☀️"
      : greeting.includes("sore")
        ? "🌇"
        : "🌙";
    let txt = `Hola *@${m.pushName || "Usuario"}* 🪸
Soy *KAORI MD*, un bot de WhatsApp listo para ayudarte.  
Puedes usarme para buscar información, obtener datos o realizar tareas sencillas directamente por WhatsApp — práctico y sin complicaciones.`;
  txt += `\n\n╭─〔 🤖 *ɪɴꜰᴏ ᴅᴇʟ ʙᴏᴛ* 〕\n`;
  txt += `*│* 🖐 ɴᴏᴍʙʀᴇ    : *KAORI MD*\n`;
  txt += `*│* 🔑 ᴠᴇʀsɪóɴ   : *v${botConfig.bot?.version || "1.2.0"}*\n`;
  txt += `*│* ⚙️ ᴍᴏᴅᴏ      : *${(botConfig.mode || "público").toUpperCase()}*\n`;
  txt += `*│* 🧶 ᴘʀᴇꜰɪᴊᴏ   : *[ ${prefix} ]*\n`;
  txt += `*│* ⏱ ᴀᴄᴛɪᴠᴏ     : *${uptimeFormatted}*\n`;
  txt += `*│* 👥 ᴛᴏᴛᴀʟ     : *${totalUsers} usuarios*\n`;
  txt += `*│* 🏷 ɢʀᴜᴘᴏ     : *${botMode.toUpperCase()}*\n`;
  txt += `*│* 👑 ᴅᴜᴇñᴏ     : *${botConfig.owner?.name || "KAORI MD"}*\n`;
  txt += `╰────────────────⬣\n\n`;
  txt += `╭─〔 👤 *ɪɴꜰᴏ ᴅᴇ ᴜsᴜᴀʀɪᴏ* 〕\n`;
  txt += `*│* 🙋 ɴᴏᴍʙʀᴇ    : *${m.pushName}*\n`;
  txt += `*│* 🎭 ʀᴏʟ       : *${roleEmoji} ${userRole}*\n`;
  txt += `*│* 🎟 ᴇɴᴇʀɢíᴀ   : *${m.isOwner || m.isPremium ? "∞ Ilimitada" : (user?.energi ?? 25)}*\n`;
  txt += `*│* ⚡ ɴɪᴠᴇʟ     : *${(Math.floor((user?.exp || 0) / 20000) + 1)}*\n`;
  txt += `*│* ✨ ᴇxᴘ       : *${(user?.exp ?? 0).toLocaleString()}*\n`;
  txt += `*│* 💰 ᴍᴏɴᴇᴅᴀs   : *${(user?.koin ?? 0).toLocaleString()}*\n`;
  
  const rpg = user?.rpg || {};
  if (rpg.health !== undefined) {
    txt += `*│* ❤️ sᴀʟᴜᴅ     : *${rpg.health}/${rpg.maxHealth || rpg.health}*\n`;
    txt += `*│* 🔮 ᴍᴀɴá      : *${rpg.mana}/${rpg.maxMana || rpg.mana}*\n`;
    txt += `*│* 🏃 ᴇsᴛᴀᴍɪɴᴀ  : *${rpg.stamina}/${rpg.maxStamina || rpg.stamina}*\n`;
  }
  
  const inv = user?.inventory || {};
  const invCount = Object.values(inv).reduce(
    (a, b) => a + (typeof b === "number" ? b : 0),
    0,
  );
  if (invCount > 0) txt += `*│* 🎒 ɪɴᴠᴇɴᴛᴀʀɪᴏ : *${invCount} objetos*\n`;
  txt += `*│* 🕒 ʜᴏʀᴀ      : *${timeStr}*\n`;
  txt += `*│* 📅 ꜰᴇᴄʜᴀ      : *${dateStr}*\n`;
  txt += `╰────────────────⬣\n\n`;
  const categoryOrder = [
    "owner",
    "main",
    "utility",
    "tools",
    "fun",
    "game",
    "download",
    "search",
    "sticker",
    "media",
    "ai",
    "group",
    "religi",
    "info",
    "cek",
    "economy",
    "user",
    "canvas",
    "random",
    "premium",
    "ephoto",
    "jpm",
    "pushkontak",
    "panel",
    "store",
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
    const botmodePlugin = await import("../group/botmode.js");
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
  txt += `📂 *ᴅᴀꜰᴛᴀʀ ᴍᴇɴᴜ*\n`;
  for (const category of sortedCategories) {
    if (category === "owner" && !m.isOwner) continue;
    if (
      allowedCategories &&
      !allowedCategories.includes(category.toLowerCase())
    )
      continue;
    if (excludeCategories && excludeCategories.includes(category.toLowerCase()))
      continue;
    const pluginCmds = commandsByCategory[category] || [];
    const caseCmds = casesByCategory[category] || [];
    const totalCmds = pluginCmds.length + caseCmds.length;
    if (totalCmds === 0) continue;
    const emoji = CATEGORY_EMOJIS[category] || "📁";
    const categoryName = toSmallCaps(category);
    txt += `- \`◦\` ${prefix}${toSmallCaps(`menucat ${category}`)} ${emoji}\n`;
  }
  return txt;
}
function getContextInfo(
  botConfig,
  m,
  thumbBuffer,
  renderLargerThumbnail = false,
) {
  const saluranId = botConfig.saluran?.id || "120363208449943317@newsletter";
  const saluranName =
    botConfig.saluran?.name || botConfig.bot?.name || "KAORI MD";
  const saluranLink = botConfig.saluran?.link || "";
  const ctx = {
    mentionedJid: [m.sender],
    forwardingScore: 9,
    isForwarded: true,
    externalAdReply: {
      title: botConfig.bot?.name || "KAORI MD",
      body: `BOT DE WHATSAPP MULTIDISPOSITIVO`,
      sourceUrl: saluranLink,
      previewType: "VIDEO",
      showAdAttribution: false,
      renderLargerThumbnail,
    },
  };
  if (thumbBuffer) ctx.externalAdReply.thumbnail = thumbBuffer;
  return ctx;
}
function getVerifiedQuoted(botConfig) {
  return {
    key: {
      participant: `0@s.whatsapp.net`,
      remoteJid: `status@broadcast`,
    },
    message: {
      contactMessage: {
        displayName: `🪸 ${botConfig.bot?.name}`,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;ttname,;;;\nFN:ttname\nitem1.TEL;waid=13135550002:+1 (313) 555-0002\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
        sendEphemeral: true,
      },
    },
  };
}
async function sendFallback(
  m,
  sock,
  text,
  imageBuffer,
  thumbBuffer,
  botConfig,
  errorName,
) {
  if (errorName) console.error(`[Menu Error] ${errorName}`);
  const fallbackMsg = {
    contextInfo: getContextInfo(botConfig, m, thumbBuffer),
  };
  let fallbackText = text;
  if (errorName === "V5") {
    const { sorted } = getSortedCategories(m, "md");
    let catText = `📋 *ᴄᴀᴛᴇɢᴏʀíᴀs ᴅᴇʟ ᴍᴇɴú*\n\n`;
    for (const { cat, cmds, emoji } of sorted)
      catText += `> ${emoji} \`${botConfig.command?.prefix || "."}menucat ${cat}\` - ${toMonoUpperBold(cat)} (${cmds.length})\n`;
    catText += `\n_Escribe el comando de la categoría para ver sus comandos_`;
    fallbackText = text + "\n\n" + catText;
  }
  if (imageBuffer) {
    fallbackMsg.image = imageBuffer;
    fallbackMsg.caption = fallbackText;
  } else {
    fallbackMsg.text = fallbackText;
  }
  await sock.sendMessage(m.chat, fallbackMsg, {
    quoted: getVerifiedQuoted(botConfig),
  });
}
async function handler(m, { sock, config: botConfig, db, uptime }) {
  const savedVariant = db.setting("menuVariant");
  const menuVariant = savedVariant || botConfig.ui?.menuVariant || 2;
  const groupData = m.isGroup ? db.getGroup(m.chat) || {} : {};
  const botMode = groupData.botMode || "md";
  const text = await buildMenuText(m, botConfig, db, uptime, botMode);
  const imagePath = path.join(process.cwd(), "assets", "images", "ourin.jpg");
  const thumbPath = path.join(process.cwd(), "assets", "images", "ourin2.jpg");
  const videoPath = path.join(process.cwd(), "assets", "video", "ourin.mp4");
  let imageBuffer = fs.existsSync(imagePath)
    ? fs.readFileSync(imagePath)
    : null;
  let thumbBuffer = fs.existsSync(thumbPath)
    ? fs.readFileSync(thumbPath)
    : null;
  let videoBuffer = fs.existsSync(videoPath)
    ? fs.readFileSync(videoPath)
    : null;
  const prefix = botConfig.command?.prefix || ".";
  const saluranId = botConfig.saluran?.id || "120363208449943317@newsletter";
  const saluranName =
    botConfig.saluran?.name || botConfig.bot?.name || "Ourin-AI";
  const saluranLink =
    botConfig.saluran?.link ||
    "https://whatsapp.com/channel/0029VbB37bgBfxoAmAlsgE0t";
  const {
    sorted: menuSorted,
    totalCmds,
    commandsByCategory,
  } = getSortedCategories(m, botMode);
  const greeting = getTimeGreeting();
  const uptimeFormatted = formatUptime(uptime);
  try {
    switch (menuVariant) {
      case 1:
        if (imageBuffer) {
          await sock.sendMessage(m.chat, { image: imageBuffer, caption: text });
        } else {
          await m.reply(text);
        }
        break;
      case 2:
        const msgV2 = {
          contextInfo: getContextInfo(botConfig, m, thumbBuffer),
        };
        if (imageBuffer) {
          msgV2.image = imageBuffer;
          msgV2.caption = text;
        } else {
          msgV2.text = text;
        }
        await sock.sendMessage(m.chat, msgV2, {
          quoted: getVerifiedQuoted(botConfig),
        });
        break;
      case 3:
        let resizedThumb = thumbBuffer;
        if (thumbBuffer) {
          try {
            resizedThumb = await (await getSharp())(thumbBuffer)
              .resize(300, 300, { fit: "cover" })
              .jpeg({ quality: 80 })
              .toBuffer();
          } catch (e) {
            resizedThumb = thumbBuffer;
          }
        }
        let contextThumb = thumbBuffer;
        try {
          const ourinPath = path.join(
            process.cwd(),
            "assets",
            "images",
            "ourin.jpg",
          );
          if (fs.existsSync(ourinPath)) {
            contextThumb = fs.readFileSync(ourinPath);
          }
        } catch (e) {}
        await sock.sendMessage(
          m.chat,
          {
            document: imageBuffer || Buffer.from(""),
            mimetype: "image/png",
            fileLength: 999999999999,
            fileSize: 999999999999,
            fileName: `ɴᴏ ᴘᴀɪɴ ɴᴏ ɢᴀɪɴ`,
            caption: text,
            jpegThumbnail: resizedThumb,
            contextInfo: getContextInfo(botConfig, m, contextThumb, true),
          },
          { quoted: getVerifiedQuoted(botConfig) },
        );
        break;
      case 4:
        if (videoBuffer) {
          await sock.sendMessage(
            m.chat,
            {
              video: videoBuffer,
              caption: text,
              gifPlayback: true,
              contextInfo: getContextInfo(botConfig, m, thumbBuffer),
            },
            { quoted: getVerifiedQuoted(botConfig) },
          );
        } else {
          const fallback = {
            contextInfo: getContextInfo(botConfig, m, thumbBuffer),
          };
          if (imageBuffer) {
            fallback.image = imageBuffer;
            fallback.caption = text;
          } else {
            fallback.text = text;
          }
          await sock.sendMessage(m.chat, fallback, {
            quoted: getVerifiedQuoted(botConfig),
          });
        }
        break;
      case 5: {
        // V5 — Lista nativa de WhatsApp (listMessage) — compatible y estable
        const categoryRows = menuSorted.map(({ cat, cmds, emoji }) => ({
          title: `${emoji} ${toMonoUpperBold(cat)}`,
          rowId: `${prefix}menucat ${cat}`,
          description: `${cmds.length} comandos disponibles`,
        }));

        let headerText = `*@${m.pushName || "Usuario"}* 🪸\nSoy *KAORI MD*, un bot de WhatsApp listo para ayudarte.\n\n`;
        headerText += `╭┈┈⬡「 🤖 *ɪɴꜰᴏ ᴅᴇʟ ʙᴏᴛ* 」\n`;
        headerText += `┃ \`◦\` ɴᴏᴍʙʀᴇ: *${botConfig.bot?.name || "KAORI MD"}*\n`;
        headerText += `┃ \`◦\` ᴠᴇʀsɪóɴ: *v${botConfig.bot?.version || "1.2.0"}*\n`;
        headerText += `┃ \`◦\` ᴍᴏᴅᴏ: *${(botConfig.mode || "público").toUpperCase()}*\n`;
        headerText += `┃ \`◦\` ᴀᴄᴛɪᴠᴏ: *${uptimeFormatted}*\n`;
        headerText += `┃ \`◦\` ᴛᴏᴛᴀʟ ᴄᴍᴅs: *${totalCmds}*\n`;
        headerText += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
        headerText += `📋 *Toca el botón de abajo para elegir una categoría*`;

        try {
          if (imageBuffer) {
            await sock.sendMessage(m.chat, {
              image: imageBuffer,
              caption: `🤖 *${botConfig.bot?.name || "KAORI MD"}*\n> Selecciona una categoría en el botón de abajo 👇`,
              contextInfo: getContextInfo(botConfig, m, thumbBuffer),
            }, { quoted: getVerifiedQuoted(botConfig) });
          }

          await sock.sendMessage(m.chat, {
            text: headerText,
            footer: `© ${botConfig.bot?.name || "KAORI MD"} | ${menuSorted.length} categorías`,
            title: `🤖 ${botConfig.bot?.name || "KAORI MD"}`,
            buttonText: "📁 Ver categorías del menú",
            sections: [
              {
                title: "📋 SELECCIONAR CATEGORÍA",
                rows: categoryRows,
              },
            ],
            contextInfo: getContextInfo(botConfig, m, thumbBuffer),
          }, { quoted: getVerifiedQuoted(botConfig) });

        } catch (btnError) {
          console.error("[Menu V5] listMessage error:", btnError.message);
          await sendFallback(
            m,
            sock,
            headerText,
            imageBuffer,
            thumbBuffer,
            botConfig,
            "V5",
          );
        }
        break;
      }
      case 6:
        const thumbPathV6 = path.join(
          process.cwd(),
          "assets",
          "images",
          "ourin3.jpg",
        );
        const saluranIdV6 =
          botConfig.saluran?.id || "120363208449943317@newsletter";
        const saluranNameV6 =
          botConfig.saluran?.name || botConfig.bot?.name || "Ourin-AI";
        const saluranLinkV6 =
          botConfig.saluran?.link ||
          "https://whatsapp.com/channel/0029VbB37bgBfxoAmAlsgE0t";
        let bannerThumbV6 = null;
        try {
          const sourceBuffer = fs.existsSync(thumbPathV6)
            ? fs.readFileSync(thumbPathV6)
            : thumbBuffer || imageBuffer;
          if (sourceBuffer) {
            bannerThumbV6 = await (await getSharp())(sourceBuffer)
              .resize(200, 200, { fit: "inside" })
              .jpeg({ quality: 90 })
              .toBuffer();
          }
        } catch (resizeErr) {
          console.error("[Menu V6] Resize error:", resizeErr.message);
          bannerThumbV6 = thumbBuffer;
        }
        const contextInfoV6 = {
          mentionedJid: [m.sender],
          forwardingScore: 9999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: saluranIdV6,
            newsletterName: saluranNameV6,
            serverMessageId: 127,
          },
          externalAdReply: {
            title: botConfig.bot?.name || "KAORI-MD",
            body: `v${botConfig.bot?.version || "1.0.1"} • Bot de respuesta rápida`,
            sourceUrl: saluranLinkV6,
            mediaType: 1,
            showAdAttribution: false,
            renderLargerThumbnail: true,
            thumbnail: thumbBuffer || imageBuffer,
          },
        };
        try {
          await sock.sendMessage(
            m.chat,
            {
              document: imageBuffer || Buffer.from("KAORI-MD MENU"),
              mimetype: "application/pdf",
              fileName: `ɴᴏ ᴘᴀɪɴ ɴᴏ ɢᴀɪɴ`,
              fileLength: 9999999999,
              caption: text,
              jpegThumbnail: bannerThumbV6,
              contextInfo: contextInfoV6,
            },
            { quoted: getVerifiedQuoted(botConfig) },
          );
        } catch (v6Error) {
          console.error("[Menu V6] Error:", v6Error.message);
          const fallbackV6 = {
            contextInfo: getContextInfo(botConfig, m, thumbBuffer),
          };
          if (imageBuffer) {
            fallbackV6.image = imageBuffer;
            fallbackV6.caption = text;
          } else {
            fallbackV6.text = text;
          }
          await sock.sendMessage(m.chat, fallbackV6, {
            quoted: getVerifiedQuoted(botConfig),
          });
        }
        break;
      case 7: {
        // V7 — Imagen + lista nativa con preview de comandos por categoría
        try {
          const v7Rows = menuSorted.map(({ cat, cmds, emoji }) => ({
            title: `${emoji} ${toMonoUpperBold(cat)}`,
            rowId: `${prefix}menucat ${cat}`,
            description: `${cmds.slice(0, 3).map(c => `${prefix}${c}`).join(", ")}${cmds.length > 3 ? ` +${cmds.length - 3} más` : ""}`,
          }));

          const v7Text = `${greeting} *${m.pushName}!* 🪸\n\n` +
            `╭─〔 🎴 *ᴄᴀᴛᴇɢᴏʀíᴀs* 〕\n` +
            menuSorted.map(({ cat, cmds, emoji }) =>
              `*│* ${emoji} *${toMonoUpperBold(cat)}* — ${cmds.length} cmds`
            ).join("\n") +
            `\n╰────────────────⬣\n\n` +
            `> Toca el botón para explorar cada categoría`;

          if (imageBuffer) {
            await sock.sendMessage(m.chat, {
              image: imageBuffer,
              caption: v7Text,
              contextInfo: getContextInfo(botConfig, m, thumbBuffer),
            }, { quoted: getVerifiedQuoted(botConfig) });
          }

          await sock.sendMessage(m.chat, {
            text: `🗂 *Elige una categoría para ver sus comandos:*`,
            footer: `${botConfig.bot?.name || "KAORI MD"} v${botConfig.bot?.version || "1.0"}`,
            title: `${botConfig.bot?.name || "KAORI MD"}`,
            buttonText: "🎴 Ver categorías",
            sections: [{ title: "📋 CATEGORÍAS", rows: v7Rows }],
            contextInfo: getContextInfo(botConfig, m, thumbBuffer),
          }, { quoted: getVerifiedQuoted(botConfig) });

        } catch (v7Error) {
          console.error("[Menu V7] Error:", v7Error.message);
          await sendFallback(m, sock, text, imageBuffer, thumbBuffer, botConfig, "V7");
        }
        break;
      }
      case 8: {
        const timeHelper = await import("../../src/lib/ourin-time.js");
        const time = timeHelper.formatTime("HH:mm");
        const date = timeHelper.formatFull("DD/MM/YYYY");
        const user = db.getUser(m.sender);
        let role = "𝙐𝙨𝙪𝙖𝙧𝙞𝙤",
          emojiRole = "◈";
        if (m.isOwner) {
          role = "𝘿𝙪𝙚ñ𝙤";
          emojiRole = "♚";
        } else if (m.isPremium) {
          role = "𝙋𝙧𝙚𝙢𝙞𝙪𝙢";
          emojiRole = "✦";
        }
        let menuText = ``;
        const sparkles = ["✦", "✧", "⋆", "˚", "✵", "⊹"];
        const randomSparkle = () =>
          sparkles[Math.floor(Math.random() * sparkles.length)];
        menuText += `${randomSparkle()}━━━━━━━━━━━━━━━━━━━━━${randomSparkle()}\n`;
        menuText += `*KAORI MD*\n`;
        menuText += `${randomSparkle()}━━━━━━━━━━━━━━━━━━━━━${randomSparkle()}\n\n`;
        menuText += `┏━━━〔 ${emojiRole} *𝗣𝗘𝗥𝗙𝗜𝗟* 〕━━━┓\n`;
        menuText += `┃ 👤 *${m.pushName}*\n`;
        menuText += `┃ 🏷️ ${role}\n`;
        menuText += `┃ 🎫 Energía ➤ ${m.isOwner || m.isPremium ? "∞ Ilimitada" : (user?.energi ?? 25)}\n`;
        menuText += `┃ ⚡ Nivel   ➤ ${(Math.floor((user?.exp || 0) / 20000) + 1)}\n`;
        menuText += `┃ ✨ Exp     ➤ ${(user?.exp ?? 0).toLocaleString()}\n`;
        menuText += `┃ 💰 Monedas ➤ ${(user?.koin ?? 0).toLocaleString()}\n`;
        const v8rpg = user?.rpg || {};
        if (v8rpg.health !== undefined) {
          menuText += `┃ ❤️ HP      ➤ ${v8rpg.health}/${v8rpg.maxHealth}\n`;
          menuText += `┃ 🔮 Maná    ➤ ${v8rpg.mana}/${v8rpg.maxMana}\n`;
          menuText += `┃ 🏃 Estamina ➤ ${v8rpg.stamina}/${v8rpg.maxStamina}\n`;
        }
        menuText += `┃ ⏰ ${time}\n`;
        menuText += `┃ 📅 ${date}\n`;
        menuText += `┗━━━━━━━━━━━━━━━┛\n\n`;
        menuText += `┏━━〔 ⚡ *𝗘𝗦𝗧𝗔𝗗Í𝗦𝗧𝗜𝗖𝗔𝗦* 〕━━┓\n`;
        menuText += `┃ ⏱️ Activo   ➤ ${uptimeFormatted}\n`;
        menuText += `┃ 🔧 Modo     ➤ ${botMode.toUpperCase()}\n`;
        menuText += `┃ 📊 Total    ➤ ${totalCmds} Comandos\n`;
        menuText += `┃ 👥 Usuarios ➤ ${db.getUserCount()} activos\n`;
        menuText += `┗━━━━━━━━━━━━━━━━━━━━━━┛\n\n`;
        menuText += `╭══════════════════════╮\n`;
        menuText += `║  📋 *𝗟𝗜𝗦𝗧𝗔 𝗗𝗘 𝗠𝗘𝗡Ú𝗦* ║\n`;
        menuText += `╰══════════════════════╯\n\n`;
        for (const { cat, cmds, emoji } of menuSorted) {
          menuText += `┌─────「 ${emoji} *${cat.toUpperCase()}* 」\n`;
          menuText += `│ ✦ Total: ${cmds.length} comandos\n`;
          menuText += `│\n`;
          for (const cmd of cmds) {
            menuText += `│ ├➤ ${prefix}${cmd}\n`;
          }
          menuText += `│\n`;
          menuText += `└───────────────────\n\n`;
        }
        menuText += `╭━━〔 💡 *𝗖𝗢𝗡𝗦𝗘𝗝𝗢* 〕━━╮\n`;
        menuText += `│ ❸ Sigue nuestro canal: ${saluranLink}\n`;
        menuText += `╰━━━━━━━━━━━━━━━━━━╯\n\n`;

        menuText += `> ${randomSparkle()} *${botConfig.bot?.name || "Ourin"}* v${botConfig.bot?.version || "1.7.1"} ${randomSparkle()}`;
        let thumbV8 = thumbBuffer;
        if (thumbBuffer) {
          try {
            thumbV8 = await (await getSharp())(thumbBuffer)
              .resize(300, 300, { fit: "cover" })
              .jpeg({ quality: 80 })
              .toBuffer();
          } catch (e) {
            thumbV8 = thumbBuffer;
          }
        }
        const ftroliQuoted = {
          key: {
            fromMe: false,
            participant: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
          },
          message: {
            orderMessage: {
              orderId: "1337",
              thumbnail: thumbV8 || null,
              itemCount: totalCmds,
              status: "INQUIRY",
              surface: "CATALOG",
              message: `${botConfig.bot?.name || "kaori-Md"} Menú`,
              orderTitle: `📋 ${totalCmds} comandos`,
              sellerJid: botConfig.botNumber
                ? `${botConfig.botNumber}@s.whatsapp.net`
                : m.sender,
              token: "ourin-menu-v8",
              totalAmount1000: 0,
              totalCurrencyCode: "IDR",
              contextInfo: {
                isForwarded: true,
                forwardingScore: 9999,
                forwardedNewsletterMessageInfo: {
                  newsletterJid: saluranId,
                  newsletterName: saluranName,
                  serverMessageId: 127,
                },
              },
            },
          },
        };
        await sock.sendMessage(
          m.chat,
          {
            image: fs.existsSync("assets/images/ourin-v8.jpg")
              ? fs.readFileSync("assets/images/ourin-v8.jpg")
              : imageBuffer || thumbBuffer,
            caption: menuText,
            contextInfo: getContextInfo(botConfig, m, imageBuffer, true),
          },
          { quoted: ftroliQuoted },
        );
        break;
      }
      case 9: {
        // V9 — Imagen v9 + lista nativa de categorías
        try {
          const v9Rows = menuSorted.map(({ cat, cmds, emoji }) => ({
            title: `${emoji} ${toMonoUpperBold(cat)}`,
            rowId: `${prefix}menucat ${cat}`,
            description: `${cmds.length} comandos`,
          }));

          const v9ImgPath = path.join(process.cwd(), "assets", "images", "ourin-v9.jpg");
          const v9Img = fs.existsSync(v9ImgPath) ? fs.readFileSync(v9ImgPath) : imageBuffer;

          if (v9Img) {
            await sock.sendMessage(m.chat, {
              image: v9Img,
              caption: text,
              contextInfo: getContextInfo(botConfig, m, thumbBuffer),
            }, { quoted: getVerifiedQuoted(botConfig) });
          }

          await sock.sendMessage(m.chat, {
            text: `🍀 *ᴇʟᴇɢɪʀ ᴄᴀᴛᴇɢᴏʀíᴀ*\n\n> Toca el botón para ver los comandos de cada sección`,
            footer: `© ${botConfig.bot?.name || "KAORI MD"} v${botConfig.bot?.version || "1.9.0"}`,
            title: `${botConfig.bot?.name || "KAORI MD"}`,
            buttonText: "🍀 ᴇʟᴇɢɪʀ ᴄᴀᴛᴇɢᴏʀíᴀ",
            sections: [{ title: "📋 SELECCIONAR CATEGORÍA", rows: v9Rows }],
            contextInfo: getContextInfo(botConfig, m, thumbBuffer),
          }, { quoted: getVerifiedQuoted(botConfig) });

        } catch (v9Error) {
          console.error("[Menu V9] Error:", v9Error.message);
          await sendFallback(m, sock, text, imageBuffer, thumbBuffer, botConfig, "V9");
        }
        break;
      }
      case 10: {
        // V10 — Imagen v9 + texto de info completo + lista de categorías
        try {
          const v10ImgPath = path.join(process.cwd(), "assets", "images", "ourin-v9.jpg");
          const v10Img = fs.existsSync(v10ImgPath) ? fs.readFileSync(v10ImgPath) : imageBuffer;

          const v10Text = `Hola *@${m.pushName || "Usuario"}* 🪸\n` +
            `Soy ${botConfig.bot?.name || "KAORI MD"}, un bot de WhatsApp listo para ayudarte.\n\n` +
            `─────────────────────────\n` +
            `Nombre    : ${botConfig.bot?.name || "KAORI MD"}\n` +
            `Versión   : v${botConfig.bot?.version || "1.9.0"}\n` +
            `Entorno   : Node.js ${process.version}\n` +
            `Activo    : ${uptimeFormatted}\n` +
            `Mi owner  : ${botConfig.owner?.name || "KAORI MD"}\n` +
            `─────────────────────────`;

          const v10Rows = menuSorted.map(({ cat, cmds, emoji }) => ({
            title: `${emoji} ${toMonoUpperBold(cat)}`,
            rowId: `${prefix}menucat ${cat}`,
            description: `${cmds.length} comandos`,
          }));

          if (v10Img) {
            await sock.sendMessage(m.chat, {
              image: v10Img,
              caption: v10Text,
              contextInfo: getContextInfo(botConfig, m, thumbBuffer),
            }, { quoted: getVerifiedQuoted(botConfig) });
          }

          await sock.sendMessage(m.chat, {
            text: `📋 *Haz clic en el botón para mostrar el menú por categorías*`,
            footer: `© ${botConfig.bot?.name || "KAORI MD"} 2026`,
            title: `${botConfig.bot?.name || "KAORI MD"}`,
            buttonText: `🌺 ${botConfig.bot?.name || "KAORI MD"}`,
            sections: [{ title: "📁 CATEGORÍAS DEL MENÚ", rows: v10Rows }],
            contextInfo: getContextInfo(botConfig, m, thumbBuffer),
          }, { quoted: getVerifiedQuoted(botConfig) });

        } catch (v10Error) {
          console.error("[Menu V10] Error:", v10Error.message);
          await sendFallback(m, sock, text, imageBuffer, thumbBuffer, botConfig, "V10");
        }
        break;
      }
      case 11: {
        // V11 — Documento con miniatura v11 + lista nativa de categorías
        try {
          const docuThumb =
            thumbBuffer ||
            imageBuffer ||
            fs.readFileSync(path.join(process.cwd(), "assets", "images", "ourin-allmenu.jpg"));

          const titleText =
            `Hola *@${m.pushName}*\n\nAntes que nada, gracias por usar nuestro bot\n\n` +
            `╭─ \`INFORMACIÓN DEL BOT\` 𝜗ৎ\n` +
            `┆ ᵎᵎ Nombre del bot : *${botConfig.bot?.name || "KAORI MD"}*\n` +
            `┆ ᵎᵎ Owner del bot : *${botConfig.owner?.name || "KAORI MD"}*\n` +
            `┆ ᵎᵎ Prefijo : *${prefix}*\n` +
            `┆ ᵎᵎ Total de comandos : *${totalCmds}*\n` +
            `┆ ᵎᵎ Tu rol : ${m.isOwner ? "Dueño" : m.isPremium ? "Premium" : "Usuario"}\n` +
            `╰─────\n\nPulsa el botón de abajo para elegir un menú`;

          const v11Rows = menuSorted.map(({ cat, cmds, emoji }) => ({
            title: `🍀 ${toMonoUpperBold(cat)}`,
            rowId: `${prefix}menucat ${cat}`,
            description: `Contiene ${cmds.length} comandos`,
          }));

          let resizedThumb = docuThumb;
          try {
            resizedThumb = await (await getSharp())(docuThumb).resize({ width: 300, height: 300 }).toBuffer();
          } catch (e) {}

          // Enviar documento con miniatura v11
          const v11ThumbPath = path.join(process.cwd(), "assets", "images", "ourin-v11.jpg");
          await sock.sendMessage(m.chat, {
            document: fs.readFileSync("./package.json"),
            mimetype: "image/png",
            fileName: greeting,
            caption: titleText,
            jpegThumbnail: resizedThumb,
            contextInfo: {
              mentionedJid: [m.sender],
              forwardingScore: 777,
              isForwarded: true,
              forwardedNewsletterMessageInfo: { newsletterJid: saluranId, newsletterName: saluranName, serverMessageId: 127 },
              externalAdReply: {
                title: botConfig.bot?.name || "KAORI MD",
                body: "Runtime: " + process.uptime().toFixed(0) + "s",
                mediaType: 1,
                thumbnail: fs.existsSync(v11ThumbPath) ? fs.readFileSync(v11ThumbPath) : thumbBuffer || imageBuffer,
                mediaUrl: saluranLink,
                sourceUrl: saluranLink,
                renderLargerThumbnail: true,
              },
            },
          }, { quoted: getVerifiedQuoted(botConfig) });

          // Lista nativa para seleccionar categoría
          await sock.sendMessage(m.chat, {
            text: `🍀 *Elige el menú que quieras*\n\n> Visita nuestro canal: ${saluranLink}`,
            footer: botConfig.settings?.footer || `© ${botConfig.bot?.name || "KAORI MD"} 2026`,
            title: `${botConfig.bot?.name || "KAORI MD"}`,
            buttonText: "🍀 Elegir menú aquí",
            sections: [
              {
                title: "🍀 Elige el menú que quieras",
                rows: [
                  ...v11Rows,
                  { title: "🌺 Ver todo el menú", rowId: `${prefix}allmenu`, description: "Mostrar todos los comandos" },
                  { title: "🖐 Nuestro owner", rowId: `${prefix}owner`, description: "Contactar al owner" },
                ],
              },
            ],
            contextInfo: getContextInfo(botConfig, m, thumbBuffer),
          }, { quoted: getVerifiedQuoted(botConfig) });

        } catch (v11Error) {
          console.error("[Menu V11] Error:", v11Error.message);
          await sendFallback(m, sock, text, imageBuffer, thumbBuffer, botConfig, "V11");
        }
        break;
      }
      case 12:
        try {
          const docuThumb =
            thumbBuffer ||
            imageBuffer ||
            fs.readFileSync(path.join(process.cwd(), "assets", "images", "ourin-allmenu.jpg"));

          function formatBytes(bytes, decimals = 2) {
            if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
            if (bytes === 0) return "0 B";
            const k = 1024;
            const units = ["B", "KB", "MB", "GB", "TB"];
            const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), units.length - 1);
            const value = bytes / Math.pow(k, i);
            return `${value.toFixed(decimals).replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1")} ${units[i]}`;
          }

          const obj = JSON.parse(fs.readFileSync("./database/main/users.json"));
          const bytes = Buffer.byteLength(JSON.stringify(obj), "utf8");

          let pp;
          try {
            pp = Buffer.from((await axios.get(await sock.profilePictureUrl(m.sender, "image"), { responseType: "arraybuffer" })).data);
          } catch (error) {
            pp = fs.readFileSync("./assets/images/pp-kosong.jpg");
          }

          const v12Rows = menuSorted.map(({ cat, cmds, emoji }) => ({
            title: `${emoji} ${toMonoUpperBold(cat)}`,
            rowId: `${prefix}menucat ${cat}`,
            description: `${cmds.length} comandos`,
          }));

          let resizedPP = pp;
          try { resizedPP = await (await getSharp())(pp).resize({ width: 300, height: 300 }).toBuffer(); } catch (e) {}

          const v11ThumbPath = path.join(process.cwd(), "assets", "images", "ourin-v11.jpg");

          // Documento con foto de perfil como miniatura
          await sock.sendMessage(m.chat, {
            document: fs.readFileSync("./package.json"),
            mimetype: "image/png",
            fileName: getTimeGreeting(),
            caption:
              `🌾 *𝘏𝘰𝘭𝘢! ${m.pushName}*\n\n` +
              `𝘎𝘳𝘢𝘤𝘪𝘢𝘴 𝘱𝘰𝘳 𝘦𝘴𝘤𝘳𝘪𝘣𝘪𝘳𝘯𝘰𝘴.\n\n` +
              `╭─「 *${m.pushName}* 」\n` +
              `│ • Versión del bot : *${botConfig.bot?.version || "2.1.0"}*\n` +
              `│ • Base de datos   : ${formatBytes(bytes)}\n` +
              `╰──`,
            jpegThumbnail: resizedPP,
            contextInfo: {
              mentionedJid: [m.sender],
              forwardingScore: 777,
              isForwarded: true,
              forwardedNewsletterMessageInfo: { newsletterJid: saluranId, newsletterName: saluranName, serverMessageId: 127 },
              externalAdReply: {
                title: botConfig.bot?.name || "KAORI MD",
                body: `🍃 OWNER DEL BOT: ${botConfig.owner?.name || "KAORI MD"}`,
                mediaType: 1,
                thumbnail: fs.existsSync(v11ThumbPath) ? fs.readFileSync(v11ThumbPath) : thumbBuffer || imageBuffer,
                mediaUrl: botConfig?.info?.website || saluranLink,
                sourceUrl: botConfig?.info?.website || saluranLink,
                renderLargerThumbnail: true,
              },
            },
          }, { quoted: getVerifiedQuoted(botConfig) });

          // Lista nativa para elegir categoría
          await sock.sendMessage(m.chat, {
            text: `🧾 *Elige la categoría que quieres ver*`,
            footer: botConfig.settings?.footer || `© ${botConfig.bot?.name || "KAORI MD"} 2026`,
            title: `${botConfig.bot?.name || "KAORI MD"}`,
            buttonText: "🧾 Toca aquí",
            sections: [
              {
                title: "📋 CATEGORÍAS DEL MENÚ",
                rows: [
                  { title: "🌺 Ver todo el menú", rowId: `${prefix}allmenu`, description: "Mostrar todos los comandos" },
                  ...v12Rows,
                ],
              },
            ],
            contextInfo: getContextInfo(botConfig, m, thumbBuffer),
          }, { quoted: getVerifiedQuoted(botConfig) });

        } catch (v12Error) {
          console.error("[Menu V12] Error:", v12Error.message);
          await sendFallback(m, sock, text, imageBuffer, thumbBuffer, botConfig, "V12");
        }
        break;
      case 13: {
        const thumbPathV13 = path.join(
          process.cwd(),
          "assets",
          "images",
          "ourin3.jpg",
        );
        const saluranIdV13 =
          botConfig.saluran?.id || "120363208449943317@newsletter";
        const saluranNameV13 =
          botConfig.saluran?.name || botConfig.bot?.name || "Ourin-AI";
        const saluranLinkV13 =
          botConfig.saluran?.link ||
          "https://whatsapp.com/channel/0029VbB37bgBfxoAmAlsgE0t";
        let totalCmdsV13 = totalCmds;
        let bannerThumbV13 = null;
        const user = db.getUser(m.sender);
        try {
          /**
           * Fungsi untuk membuat gambar profil menggunakan @napi-rs/canvas
           * @param {Object} data Data user
           * @returns {Promise<Buffer>} Buffer gambar PNG
           */
          async function createProfileCard(data) {
            // Ukuran kanvas
            const canvas = createCanvas(800, 250);
            const ctx = canvas.getContext("2d");
            // Tema Warna "Edgy Graphic Design"
            const accentColor = "#CCFF00"; // Volt Green (Hijau stabilo/kuning)
            const fgColor = "#FFFFFF";
            // 1. Background Image dengan Kontras Tinggi (Object-fit Cover)
            ctx.fillStyle = "#09090B"; // Mencegah background putih transparan WA
            ctx.fillRect(0, 0, 800, 250);
            try {
              const bgImage = await loadImage(data.backgroundUrl);
              const canvasRatio = 800 / 250;
              const imgRatio = bgImage.width / bgImage.height;
              let drawW, drawH, drawX, drawY;
              if (imgRatio > canvasRatio) {
                drawH = 250;
                drawW = bgImage.width * (250 / bgImage.height);
                drawX = (800 - drawW) / 2;
                drawY = 0;
              } else {
                drawW = 800;
                drawH = bgImage.height * (800 / bgImage.width);
                drawX = 0;
                drawY = (250 - drawH) / 2;
              }
              ctx.drawImage(bgImage, drawX, drawY, drawW, drawH);
            } catch (error) {
              ctx.fillStyle = "#09090B";
              ctx.fillRect(0, 0, 800, 250);
            }
            // Overlay gelap pekat agar terkesan misterius & solid
            ctx.fillStyle = "rgba(9, 9, 11, 0.85)";
            ctx.fillRect(0, 0, 800, 250);
            // 2. Bentuk Asimetris (Sentuhan "Human Design")
            // Alih-alih kotak rapi, kita buat bidang miring di latar belakang
            ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(400, 0);
            ctx.lineTo(320, 250);
            ctx.lineTo(0, 250);
            ctx.fill();
            // Garis miring aksen
            ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(410, 0);
            ctx.lineTo(330, 250);
            ctx.stroke();
            // 3. Tipografi "Watermark" Super Besar di Background
            ctx.fillStyle = "rgba(204, 255, 0, 0.05)";
            ctx.font = "900 150px sans-serif";
            ctx.fillText(`LV${data.level}`, 300, 220);
            // 4. Elemen Dekoratif Mikro (Khas Desain Grafis)
            // Teks sistem kecil di pojok kiri atas
            ctx.fillStyle = "#666666";
            ctx.font = "10px monospace";
            ctx.fillText("// SYS_ONLINE : USER_PROFILE", 30, 25);
            ctx.fillText(
              "ID_HASH: " +
                Math.random().toString(36).substring(2, 10).toUpperCase(),
              30,
              40,
            );
            // Garis "Barcode" di pojok kanan atas
            ctx.fillStyle = accentColor;
            ctx.fillRect(770, 20, 6, 40);
            ctx.fillRect(760, 20, 2, 40);
            ctx.fillRect(752, 20, 3, 40);
            // 5. Konfigurasi Avatar (Bentuk Lingkaran Rapi)
            const avatarSize = 130;
            const avatarX = 50;
            const avatarY = 60;
            const centerX = avatarX + avatarSize / 2;
            const centerY = avatarY + avatarSize / 2;
            const radius = avatarSize / 2;
            // Memotong area avatar menjadi lingkaran
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
            // Memuat gambar avatar
            try {
              const avatar = await loadImage(data.avatarUrl);
              ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
            } catch (error) {
              ctx.fillStyle = "#333333";
              ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);
            }
            ctx.restore();
            // Bingkai Lingkaran yang Rapi
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
            ctx.lineWidth = 4; // Ketebalan border
            ctx.strokeStyle = accentColor;
            ctx.stroke();
            // ==========================================
            // AREA TEKS DAN BADGE
            // ==========================================
            // 6. Nama Pengguna (Besar & Tegas, Jangan di toUpperCase() agar Emoji aman)
            ctx.fillStyle = fgColor;
            ctx.font = "900 42px sans-serif";
            let displayName = data.name || "User";
            if (displayName.length > 15)
              displayName = displayName.substring(0, 15) + "...";
            ctx.fillText(displayName, 230, 100);
            // 7. Badge Rank Miring (Slanted Badge)
            ctx.save();
            ctx.translate(230, 115);
            ctx.fillStyle = accentColor;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(120, 0); // Lebar atas
            ctx.lineTo(110, 24); // Miring ke kiri bawah
            ctx.lineTo(-10, 24); // Miring ke kiri bawah
            ctx.fill();
            ctx.fillStyle = "#000000"; // Teks hitam di dalam badge Volt Green
            ctx.font = "bold 14px sans-serif";
            ctx.fillText(data.rank.toUpperCase(), 10, 17);
            ctx.restore();
            // ==========================================
            // AREA PROGRESS BAR (Gaya Segmented/Terputus-putus)
            // ==========================================
            const barX = 230;
            const barY = 172; // Posisi bar disesuaikan agar panel teks di bawah lega
            const barWidth = 500;
            const segments = 25; // Dibagi 25 kotak kecil
            const gap = 3;
            const segmentWidth = (barWidth - gap * (segments - 1)) / segments;
            const xpRatio = Math.min(data.currentXp / data.requiredXp, 1);
            const activeSegments = Math.floor(xpRatio * segments);
            // Background Bar (Kotak-kotak kosong)
            ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
            for (let i = 0; i < segments; i++) {
              ctx.fillRect(
                barX + i * (segmentWidth + gap),
                barY,
                segmentWidth,
                8,
              );
            }
            // Foreground Bar (Kotak-kotak terisi)
            ctx.fillStyle = accentColor;
            for (let i = 0; i < activeSegments; i++) {
              ctx.fillRect(
                barX + i * (segmentWidth + gap),
                barY,
                segmentWidth,
                8,
              );
            }
            // ==========================================
            // AREA DETAIL EXP & LEVEL (HUD STYLE)
            // ==========================================
            const dataY = barY + 18; // Jarak turun dari progress bar
            // 1. PANEL EXP (Kiri)
            ctx.fillStyle = "rgba(255, 255, 255, 0.05)"; // Background transparan putih
            ctx.beginPath();
            ctx.moveTo(barX, dataY);
            ctx.lineTo(barX + 210, dataY); // Ujung atas kanan
            ctx.lineTo(barX + 198, dataY + 26); // Ujung bawah kanan (miring ke dalam)
            ctx.lineTo(barX, dataY + 26); // Ujung bawah kiri
            ctx.fill();
            // Aksen Garis Volt Green di kiri Panel EXP
            ctx.fillStyle = accentColor;
            ctx.fillRect(barX, dataY, 4, 26);
            // Teks Label "EXP"
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "bold 13px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText("EXP", barX + 15, dataY + 18);
            // Teks Angka EXP Current (Warna Volt Green agar menyala)
            ctx.fillStyle = accentColor;
            ctx.font = "bold 14px monospace";
            ctx.fillText(data.currentXp.toString(), barX + 50, dataY + 18);
            // Pemisah & Angka EXP Max (Warna Abu-abu netral)
            const currentXpWidth = ctx.measureText(
              data.currentXp.toString(),
            ).width;
            ctx.fillStyle = "#888888";
            ctx.font = "14px monospace";
            ctx.fillText(
              ` / ${data.requiredXp}`,
              barX + 50 + currentXpWidth,
              dataY + 18,
            );
            // 2. BADGE LEVEL (Kanan)
            const badgeW = 90;
            ctx.save();
            ctx.translate(barX + barWidth - badgeW, dataY);
            // Bentuk Badge: Kiri miring (konsisten), kanan lurus (sejajar ujung bar)
            ctx.fillStyle = accentColor;
            ctx.beginPath();
            ctx.moveTo(12, 0);
            ctx.lineTo(badgeW, 0);
            ctx.lineTo(badgeW, 26);
            ctx.lineTo(0, 26);
            ctx.fill();
            // Teks "LVL X" warna hitam pekat di dalam badge
            ctx.fillStyle = "#000000";
            ctx.font = "900 16px sans-serif";
            ctx.textAlign = "center";
            // Titik X diatur ke 48 agar teks berada tepat di tengah visual panel miring
            ctx.fillText(`LVL ${data.level}`, 48, 19);
            ctx.restore();
            return canvas.toBuffer("image/jpeg");
          }
          const levelHelper = await import("../../src/lib/ourin-level.js");
          const profileUser = db.getUser(m.sender) || {};
          const exp = profileUser.exp || 0;
          const level = levelHelper.calculateLevel(exp);
          const currentLevelExp = levelHelper.expForLevel(level);
          const nextLevelExp = levelHelper.expForLevel(level + 1);
          let resolvedAvatarUrl = "https://i.ibb.co/3Fh9Q6M/empty-profile.png";
          try {
            const ppUrl = await sock.profilePictureUrl(m.sender, "image");
            if (ppUrl) resolvedAvatarUrl = ppUrl;
          } catch (e) {}
          bannerThumbV13 = await createProfileCard({
            name: m.pushName || profileUser.name || "User",
            level: level,
            currentXp: exp - currentLevelExp,
            requiredXp: nextLevelExp - currentLevelExp,
            rank: levelHelper.getRole(level),
            avatarUrl: resolvedAvatarUrl,
            backgroundUrl: "https://i.ibb.co/4YZnk48/default-bg.jpg",
          });
        } catch (canvasErr) {
          console.error("[Menu V13] Canvas error:", canvasErr.message);
          bannerThumbV13 = thumbBuffer || imageBuffer;
        }
        const contextInfoV13 = {
          mentionedJid: [m.sender],
          forwardingScore: 99,
          isForwarded: true,
          externalAdReply: {
            title: botConfig.bot?.name || "Ourin-AI",
            body: `Bot de WhatsApp multidispositivo`,
            sourceUrl:
              botConfig.saluran?.link ||
              "https://whatsapp.com/channel/0029VbB37bgBfxoAmAlsgE0t",
            mediaType: 1,
            showAdAttribution: false,
            renderLargerThumbnail: true,
            thumbnail: fs.readFileSync("./assets/images/ourin.jpg"),
          },
        };
        try {
          const formatNumber = (number) => {
            if (number >= 1e9) {
              return (number / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
            }
            if (number >= 1e6) {
              return (number / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
            }
            if (number >= 1e3) {
              return (number / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
            }
            return number.toString();
          };
          await sock.sendMessage(
            m.chat,
            {
              image: bannerThumbV13,
              caption: `🎄 ʜᴏʟᴀ *${m.pushName}*
╭─ *✦* \`${toMonoUpperBold("datos del bot")}\` *✦*
│ ʙᴏᴛ : *${botConfig.bot?.name || "Ourin-AI"}*
│ ᴠᴇʀsɪóɴ : *${botConfig.bot?.version || "2.1.0"}*
╰───
╭─ *✦* \`${toMonoUpperBold(`lista de categorías`)}\` *✦*
${menuSorted.map(({ cat }) => `│ *${prefix}menucat ${cat}*`).join("\n")}
╰─────────────`,
              contextInfo: contextInfoV13,
              footer: `${botConfig.bot?.name || "Ourin-AI"}`,
            },
            { quoted: getVerifiedQuoted(botConfig) },
          );
        } catch (v13Error) {
          console.error("[Menu V13] Error:", v13Error.message);
          const fallbackV13 = {
            contextInfo: getContextInfo(botConfig, m, thumbBuffer),
          };
          if (imageBuffer) {
            fallbackV13.image = imageBuffer;
            fallbackV13.caption = text;
          } else {
            fallbackV13.text = text;
          }
          await sock.sendMessage(m.chat, fallbackV13, {
            quoted: getVerifiedQuoted(botConfig),
          });
        }
        break;
      }
      case 14:
        try {
          const docuThumbV14 = fs.existsSync(path.join(process.cwd(), "assets", "images", "ourin-v11.jpg"))
            ? fs.readFileSync(path.join(process.cwd(), "assets", "images", "ourin-v11.jpg"))
            : thumbBuffer || imageBuffer;

          let pp;
          try {
            pp = Buffer.from((await axios.get(await sock.profilePictureUrl(m.sender, "image"), { responseType: "arraybuffer" })).data);
          } catch (error) {
            pp = fs.readFileSync("./assets/images/pp-kosong.jpg");
          }

          const v14Rows = menuSorted.map(({ cat, cmds, emoji }) => ({
            title: `${emoji} ${toMonoUpperBold(cat)}`,
            rowId: `${prefix}menucat ${cat}`,
            description: `${cmds.length} comandos`,
          }));

          let resizedPP = pp;
          try { resizedPP = await (await getSharp())(pp).resize({ width: 300, height: 300 }).toBuffer(); } catch (e) {}

          const v14FooterText =
            `Hola *${m.pushName}* ≽^• ˕ • ྀི≼\n` +
            `*⌞ INFO DEL USUARIO ⌝*\n` +
            `‧ Número    : +${m.sender.split("@")[0]}\n` +
            `‧ Nombre    : ${m.pushName}\n\n` +
            `*⌞ INFO DEL BOT ⌝*\n` +
            `‧ Nombre    : ${botConfig.bot?.name || "Bot"}\n` +
            `‧ Versión   : ${botConfig.bot?.version || "v1.0.0"}\n` +
            `‧ Prefijo   : ${m.prefix || "Sin prefijo"}\n\n` +
            `*⌞ CÓMO USAR ⌝*\n` +
            `‧ Haz clic en el botón para ver el menú por categorías\n` +
            `‧ Haz clic en *VER TODO EL MENÚ* para ver todas las funciones`;

          // Documento con miniatura v11
          await sock.sendMessage(m.chat, {
            document: fs.readFileSync("./package.json"),
            mimetype: "image/png",
            fileName: getTimeGreeting(),
            caption: v14FooterText,
            jpegThumbnail: resizedPP,
            contextInfo: {
              mentionedJid: [m.sender],
              forwardingScore: 19,
              isForwarded: true,
              forwardedNewsletterMessageInfo: { newsletterJid: saluranId, newsletterName: saluranName, serverMessageId: 127 },
              externalAdReply: {
                title: botConfig?.bot?.name,
                body: `🌾 Desarrollado por ${botConfig?.bot?.developer || botConfig?.owner?.name || "KAORI MD"}`,
                thumbnail: fs.readFileSync("./assets/images/ourin.jpg"),
                sourceUrl: saluranLink,
                mediaUrl: saluranLink,
                mediaType: 1,
                renderLargerThumbnail: true,
              },
            },
          }, { quoted: getVerifiedQuoted(botConfig) });

          // Lista nativa
          await sock.sendMessage(m.chat, {
            text: `꫶ᥫ᭡꫶ *${m.pushName || "User"}*\n\n> Espero que tengas un bonito día :3`,
            footer: `${botConfig.bot?.name || "KAORI MD"}`,
            title: `${botConfig.bot?.name || "KAORI MD"}`,
            buttonText: "𖤍 Ver menú",
            sections: [
              {
                title: getTimeGreeting(),
                rows: [
                  { title: "🌺 Ver todo el menú", rowId: `${prefix}allmenu`, description: "Mostrar todos los comandos" },
                  ...v14Rows,
                ],
              },
            ],
            contextInfo: getContextInfo(botConfig, m, thumbBuffer),
          }, { quoted: m });

        } catch (v14Error) {
          console.error("[Menu V14] Error:", v14Error.message);
          await sendFallback(m, sock, text, imageBuffer, thumbBuffer, botConfig, "V14");
        }
        break;
      case 15:
        try {
          const v15Rows = menuSorted.map(({ cat, cmds, emoji }) => ({
            title: `[ ${emoji} ] - ${toMonoUpperBold(`${cat} MENU`)}`,
            rowId: `${prefix}menucat ${cat}`,
            description: `Haz clic para abrir ${cat}`,
          }));

          let pp;
          try {
            pp = Buffer.from((await axios.get(await sock.profilePictureUrl(m.sender, "image"), { responseType: "arraybuffer" })).data);
          } catch (error) {
            pp = fs.readFileSync("./assets/images/pp-kosong.jpg");
          }

          let resizedPP = pp;
          try { resizedPP = await (await getSharp())(pp).resize({ width: 300, height: 300 }).toBuffer(); } catch (e) {}

          // Intentar obtener clima, si falla usar texto genérico
          let titleWeather = `🌿 Hola *${m.pushName}* 👋`;
          try {
            const res = await axios.get("https://bmkg-restapi.vercel.app/v1/weather/33.26.16.2005", { timeout: 5000 });
            const weatherData = res.data?.data?.forecast?.[0]?.entries?.[0];
            if (weatherData) {
              const cuaca = weatherData.weather;
              const suhu = weatherData.temperature_c;
              const weatherEmoji = { Cerah: "☀️", "Cerah Berawan": "🌤️", Berawan: "☁️", "Berawan Tebal": "🌥️", Hujan: "🌧️", "Hujan Petir": "⛈️", Kabut: "🌫️" };
              titleWeather = `🌡️ ${suhu}°C | ${weatherEmoji[cuaca] || "🌤️"} ${cuaca}`;
            }
          } catch (e) {}

          const user = db.getUser(m.sender);
          const rpgData = user?.rpg || {};
          const v15Footer =
            `🌿 Hola *${m.pushName}* 👋\n` +
            `Bienvenido a *${botConfig.bot?.name}* ✨\n\n` +
            `☁︎ *ESTADÍSTICAS DEL BOT* ☁︎\n` +
            `→ *Nombre*: ${botConfig.bot?.name}\n` +
            `→ *Versión*: ${botConfig.bot?.version}\n` +
            `→ *Total de funciones*: ${totalCmds} funciones\n` +
            `→ *Propietario*: ${botConfig?.owner?.name}\n` +
            `→ *Prefijo*: ${m?.prefix}\n\n` +
            `☁︎ *TUS ESTADÍSTICAS* ☁︎\n` +
            `→ *Usuario*: ${m?.pushName}\n` +
            `→ *Rol*: ${m?.isOwner ? "Dueño" : m?.isPremium ? "Premium" : "Usuario"}\n` +
            `→ *Energía*: ${m?.isOwner || m?.isPremium ? "∞ Ilimitada" : (user?.energi ?? 25)}\n` +
            `→ *Nivel*: ${Math.floor((user?.exp || 0) / 20000) + 1}\n` +
            `→ *Exp*: ${(user?.exp ?? 0).toLocaleString()}\n` +
            `→ *Monedas*: ${(user?.koin ?? 0).toLocaleString()}` +
            (rpgData.health !== undefined ? `\n→ *HP*: ${rpgData.health}/${rpgData.maxHealth}\n→ *Maná*: ${rpgData.mana}/${rpgData.maxMana}\n→ *Estamina*: ${rpgData.stamina}/${rpgData.maxStamina}` : "") +
            `\n\nPulsa el botón de abajo para elegir una categoría`;

          // Documento con foto de perfil
          await sock.sendMessage(m.chat, {
            document: fs.readFileSync("./package.json"),
            mimetype: "image/png",
            fileName: greeting,
            caption: v15Footer,
            jpegThumbnail: resizedPP,
            contextInfo: {
              mentionedJid: [m.sender],
              forwardingScore: 7,
              isForwarded: true,
              externalAdReply: {
                title: titleWeather,
                body: `Hola ${m.pushName}! Usa este bot con responsabilidad`,
                previewType: "VIDEO",
                thumbnail: fs.readFileSync("./assets/images/ourin.jpg"),
                sourceUrl: config.info?.website || saluranLink,
                renderLargerThumbnail: true,
                showAdAttribution: false,
              },
            },
          }, { quoted: getVerifiedQuoted(botConfig) });

          // Lista nativa con categorías + opciones extra
          await sock.sendMessage(m.chat, {
            text: `🌥️ *Elige el menú que quieras*`,
            footer: `${botConfig.bot?.name || "KAORI MD"}`,
            title: `${botConfig.bot?.name || "KAORI MD"}`,
            buttonText: "🌥️ Más completo",
            sections: [
              {
                title: "📋 ELIGE UNA CATEGORÍA",
                rows: [
                  { title: "🎄 Ver todo el menú", rowId: `${prefix}allmenu`, description: "Mostrar todos los comandos" },
                  { title: "🌾 Owner de este bot", rowId: `${prefix}owner`, description: "Contactar al owner" },
                  ...v15Rows,
                ],
              },
            ],
            contextInfo: getContextInfo(botConfig, m, thumbBuffer),
          }, { quoted: getVerifiedQuoted(botConfig) });

        } catch (v15Error) {
          console.error("[Menu V15] Error:", v15Error.message);
          await sendFallback(m, sock, text, imageBuffer, thumbBuffer, botConfig, "V14");
        }
        break;
      case 16: {
        // V16 — Imagen info + Lista nativa separada (máxima compatibilidad WA)
        try {
          const catSections = menuSorted.map(({ cat, cmds, emoji }) => ({
            title: `${emoji} ${toMonoUpperBold(cat)}`,
            rowId: `${prefix}menucat ${cat}`,
            description: `${cmds.length} comandos disponibles`,
          }));

          // Paso 1: Enviar imagen con el texto completo del menú
          if (imageBuffer) {
            await sock.sendMessage(m.chat, {
              image: imageBuffer,
              caption: text,
              contextInfo: getContextInfo(botConfig, m, thumbBuffer),
            }, { quoted: getVerifiedQuoted(botConfig) });
          }

          // Paso 2: Lista nativa para elegir categoría
          await sock.sendMessage(m.chat, {
            text: `📋 *Elige una categoría para ver sus comandos*\n\n> Usa el botón de abajo para navegar el menú`,
            footer: `© ${botConfig.bot?.name || "KAORI MD"} v${botConfig.bot?.version || "1.0.0"}`,
            title: `🤖 ${botConfig.bot?.name || "KAORI MD"}`,
            buttonText: "📁 Ver categorías",
            sections: [
              {
                title: "📋 CATEGORÍAS DEL MENÚ",
                rows: catSections,
              },
            ],
            contextInfo: getContextInfo(botConfig, m, thumbBuffer),
          }, { quoted: getVerifiedQuoted(botConfig) });

        } catch (v16Error) {
          console.error("[Menu V16] Error:", v16Error.message);
          await sendFallback(m, sock, text, imageBuffer, thumbBuffer, botConfig, "V5");
        }
        break;
      }
      default:
        await m.reply(text);
    }
    const audioEnabled = db.setting("audioMenu") !== false;
    if (audioEnabled) {
      const audioPath = path.join(
        process.cwd(),
        "assets",
        "audio",
        "ourin.mp3",
      );
      if (fs.existsSync(audioPath)) {
        try {
          await sock.sendMessage(
            m.chat,
            {
              audio: fs.readFileSync(audioPath),
              mimetype: "audio/mpeg",
              contextInfo: getContextInfo(botConfig, m, thumbBuffer),
            },
            { quoted: getVerifiedQuoted(botConfig) },
          );
        } catch (ffmpegErr) {
          await sock.sendMessage(
            m.chat,
            {
              audio: fs.readFileSync(audioPath),
              mimetype: "audio/mpeg",
              contextInfo: getContextInfo(botConfig, m, thumbBuffer),
            },
            { quoted: getVerifiedQuoted(botConfig) },
          );
        }
      }
    }
  } catch (error) {
    console.error("[Menu] Error on command execution:", error.message);
  }
}
export default {
  config: pluginConfig,
  handler,
};
