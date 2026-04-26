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
  return text
    .toLowerCase()
    .split("")
    .map((c) => smallCaps[c] || c)
    .join("");
}
const toMonoUpperBold = (text) => {
  const chars = {
    A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜",
    J: "𝗝", K: "𝗞", L: "𝗟", M: "𝗠", N: "𝗡", O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥",
    S: "𝗦", T: "𝗧", U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫", Y: "𝗬", Z: "𝗭",
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
    "owner", "main", "utility", "tools", "fun", "game", "download",
    "search", "sticker", "media", "ai", "group", "religi", "info",
    "cek", "economy", "user", "canvas", "random", "premium", "ephoto",
    "jpm", "pushkontak", "panel", "store",
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
  return timeHelper.formatFull("dddd, DD [de] MMMM [de] YYYY");
}
async function buildMenuText(m, botConfig, db, uptime, botMode = "md") {
  const prefix = botConfig.command?.prefix || ".";
  const user = db.getUser(m.sender);
  const timeHelper = await import("../../src/lib/ourin-time.js");
  const timeStr = timeHelper.formatTime("HH:mm");
  const dateStr = timeHelper.formatFull("dddd, DD [de] MMMM [de] YYYY");
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
    userRole = "Creador";
    roleEmoji = "👑";
  } else if (m.isPremium) {
    userRole = "Premium";
    roleEmoji = "💎";
  }
  const greeting = getTimeGreeting();
  const uptimeFormatted = formatUptime(uptime);
  const totalUsers = db.getUserCount();
  
  let txt = `Hola *@${m.pushName || "Usuario"}* 🪸
Soy ᴋᴀᴏʀɪ ᴍᴅ, un bot de WhatsApp listo para ayudarte.  
Puedes usarme para buscar info, descargar datos o realizar tareas sencillas directamente desde WhatsApp — práctico y sin complicaciones.`;

  txt += `\n\n╭─〔 🤖 *ɪɴꜰᴏ ᴅᴇʟ ʙᴏᴛ* 〕\n`;
  txt += `*│* 🖐 ɴᴏᴍʙʀᴇ     : *ᴋᴀᴏʀɪ ᴍᴅ*\n`;
  txt += `*│* 🔑 ᴠᴇʀsɪóɴ    : *v${botConfig.bot?.version || "1.2.0"}*\n`;
  txt += `*│* ⚙️ ᴍᴏᴅᴏ       : *${(botConfig.mode || "público").toUpperCase()}*\n`;
  txt += `*│* 🧶 ᴘʀᴇꜰɪᴊᴏ    : *[ ${prefix} ]*\n`;
  txt += `*│* ⏱ ᴀᴄᴛɪᴠᴏ     : *${uptimeFormatted}*\n`;
  txt += `*│* 👥 ᴛᴏᴛᴀʟ      : *${totalUsers} Usuarios*\n`;
  txt += `*│* 🏷 ɢʀᴜᴘᴏ      : *${botMode.toUpperCase()}*\n`;
  txt += `*│* 👑 ᴅᴜᴇñᴏ      : *${botConfig.owner?.name || "ᴋᴀᴏʀɪ ᴍᴅ"}*\n`;
  txt += `╰────────────────⬣\n\n`;

  txt += `╭─〔 👤 *ɪɴꜰᴏ ᴅᴇ ᴜsᴜᴀʀɪᴏ* 〕\n`;
  txt += `*│* 🙋 ɴᴏᴍʙʀᴇ     : *${m.pushName}*\n`;
  txt += `*│* 🎭 ʀᴏʟ        : *${roleEmoji} ${userRole}*\n`;
  txt += `*│* 🎟 ᴇɴᴇʀɢíᴀ    : *${m.isOwner || m.isPremium ? "∞ Ilimitada" : (user?.energi ?? 25)}*\n`;
  txt += `*│* ⚡ ɴɪᴠᴇʟ      : *${(Math.floor((user?.exp || 0) / 20000) + 1)}*\n`;
  txt += `*│* ✨ ᴇxᴘ        : *${(user?.exp ?? 0).toLocaleString()}*\n`;
  txt += `*│* 💰 ᴍᴏɴᴇᴅᴀs    : *${(user?.koin ?? 0).toLocaleString()}*\n`;
  
  const rpg = user?.rpg || {};
  if (rpg.health !== undefined) {
    txt += `*│* ❤️ ᴠɪᴅᴀ       : *${rpg.health}/${rpg.maxHealth || rpg.health}*\n`;
    txt += `*│* 🔮 ᴍᴀɴá       : *${rpg.mana}/${rpg.maxMana || rpg.mana}*\n`;
    txt += `*│* 🏃 ᴇsᴛᴀᴍɪɴᴀ   : *${rpg.stamina}/${rpg.maxStamina || rpg.stamina}*\n`;
  }
  
  const inv = user?.inventory || {};
  const invCount = Object.values(inv).reduce(
    (a, b) => a + (typeof b === "number" ? b : 0),
    0,
  );
  if (invCount > 0) txt += `*│* 🎒 ɪɴᴠᴇɴᴛᴀʀɪᴏ : *${invCount} objetos*\n`;
  txt += `*│* 🕒 ʜᴏʀᴀ       : *${timeStr}*\n`;
  txt += `*│* 📅 ꜰᴇᴄʜᴀ       : *${dateStr}*\n`;
  txt += `╰────────────────⬣\n\n`;

  const categoryOrder = [
    "owner", "main", "utility", "tools", "fun", "game", "download",
    "search", "sticker", "media", "ai", "group", "religi", "info",
    "cek", "economy", "user", "canvas", "random", "premium", "ephoto",
    "jpm", "pushkontak", "panel", "store",
  ];
  const sortedCategories = [...categories].sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  txt += `📂 *ʟɪsᴛᴀ ᴅᴇ ᴍᴇɴús*\n`;
  for (const category of sortedCategories) {
    if (category === "owner" && !m.isOwner) continue;
    const pluginCmds = commandsByCategory[category] || [];
    const caseCmds = casesByCategory[category] || [];
    const totalCmds = pluginCmds.length + caseCmds.length;
    if (totalCmds === 0) continue;
    const emoji = CATEGORY_EMOJIS[category] || "📁";
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
  const saluranName = botConfig.saluran?.name || "ᴋᴀᴏʀɪ ᴍᴅ";
  const saluranLink = botConfig.saluran?.link || "";
  const ctx = {
    mentionedJid: [m.sender],
    forwardingScore: 9,
    isForwarded: true,
    externalAdReply: {
      title: "ᴋᴀᴏʀɪ ᴍᴅ",
      body: `BOT WHATSAPP MULTI DEVICE`,
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
        displayName: `🪸 ᴋᴀᴏʀɪ ᴍᴅ`,
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
  if (errorName) console.error(`[Error de Menú] ${errorName}`);
  const fallbackMsg = {
    contextInfo: getContextInfo(botConfig, m, thumbBuffer),
  };
  let fallbackText = text;
  if (errorName === "V5") {
    const { sorted } = getSortedCategories(m, "md");
    let catText = `📋 *ᴄᴀᴛᴇɢᴏʀíᴀs ᴅᴇʟ ᴍᴇɴú*\n\n`;
    for (const { cat, cmds, emoji } of sorted)
      catText += `> ${emoji} \`${botConfig.command?.prefix || "."}menucat ${cat}\` - ${toMonoUpperBold(cat)} (${cmds.length})\n`;
    catText += `\n_Escribe el comando de la categoría para ver las funciones_`;
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
  let imageBuffer = fs.existsSync(imagePath) ? fs.readFileSync(imagePath) : null;
  let thumbBuffer = fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : null;
  let videoBuffer = fs.existsSync(videoPath) ? fs.readFileSync(videoPath) : null;
  const prefix = botConfig.command?.prefix || ".";
  const saluranId = botConfig.saluran?.id || "120363208449943317@newsletter";
  const saluranName = botConfig.saluran?.name || "ᴋᴀᴏʀɪ ᴍᴅ";
  const saluranLink = botConfig.saluran?.link || "https://whatsapp.com/channel/0029VbB37bgBfxoAmAlsgE0t";
  const { sorted: menuSorted, totalCmds, commandsByCategory } = getSortedCategories(m, botMode);
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
          const ourinPath = path.join(process.cwd(), "assets", "images", "ourin.jpg");
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
        const categoryRows = menuSorted.map(({ cat, cmds, emoji }) => ({
          title: `${emoji} ${toMonoUpperBold(cat)}`,
          id: `${prefix}menucat ${cat}`,
          description: `${cmds.length} comandos`,
        }));
        let headerText = `*@${m.pushName || "Usuario"}* 🪸
Soy ᴋᴀᴏʀɪ ᴍᴅ, un bot de WhatsApp listo para ayudarte.  
Puedes usarme para buscar info, descargar datos o realizar tareas sencillas directamente desde WhatsApp — práctico y sin complicaciones.\n\n`;
        headerText += `╭┈┈⬡「 🤖 *ɪɴꜰᴏ ᴅᴇʟ ʙᴏᴛ* 」\n`;
        headerText += `┃ \`◦\` ɴᴏᴍʙʀᴇ: *ᴋᴀᴏʀɪ ᴍᴅ*\n`;
        headerText += `┃ \`◦\` ᴠᴇʀsɪóɴ: *v${botConfig.bot?.version || "1.2.0"}*\n`;
        headerText += `┃ \`◦\` ᴍᴏᴅᴏ: *${(botConfig.mode || "público").toUpperCase()}*\n`;
        headerText += `┃ \`◦\` ᴀᴄᴛɪᴠᴏ: *${uptimeFormatted}*\n`;
        headerText += `┃ \`◦\` ᴛᴏᴛᴀʟ ᴄᴍᴅ: *${totalCmds}*\n`;
        headerText += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
        headerText += `📋 *Selecciona una categoría abajo para ver la lista de comandos*`;
        try {
          const buttons = [
            {
              name: "single_select",
              buttonParamsJson: JSON.stringify({
                title: "📁 sᴇʟᴇᴄᴄɪᴏɴᴀʀ ᴍᴇɴú",
                sections: [
                  {
                    title: "📋 ELIGE UNA CATEGORÍA",
                    rows: categoryRows,
                  },
                ],
              }),
            },
            {
              name: "quick_reply",
              buttonParamsJson: JSON.stringify({
                display_text: "📊 TOTAL DE FUNCIONES",
                id: `${prefix}totalfitur`,
              }),
            },
            {
              name: "quick_reply",
              buttonParamsJson: JSON.stringify({
                display_text: "📊 TODO EL MENÚ",
                id: `${prefix}allmenu`,
              }),
            },
          ];
          let headerMedia = null;
          if (imageBuffer) {
            try {
              headerMedia = await prepareWAMessageMedia(
                { image: imageBuffer },
                { upload: sock.waUploadToServer },
              );
            } catch (e) {}
          }
          const msg = generateWAMessageFromContent(
            m.chat,
            {
              viewOnceMessage: {
                message: {
                  messageContextInfo: {
                    deviceListMetadata: {},
                    deviceListMetadataVersion: 2,
                  },
                  interactiveMessage:
                    proto.Message.InteractiveMessage.fromObject({
                      body: proto.Message.InteractiveMessage.Body.fromObject({
                        text: headerText,
                      }),
                      footer:
                        proto.Message.InteractiveMessage.Footer.fromObject({
                          text: `© ᴋᴀᴏʀɪ ᴍᴅ | ${menuSorted.length} Categorías`,
                        }),
                      header:
                        proto.Message.InteractiveMessage.Header.fromObject({
                          title: `ᴋᴀᴏʀɪ ᴍᴅ`,
                          hasMediaAttachment: !!headerMedia,
                          ...(headerMedia || {}),
                        }),
                      nativeFlowMessage:
                        proto.Message.InteractiveMessage.NativeFlowMessage.fromObject(
                          { buttons: buttons },
                        ),
                      contextInfo: {
                        mentionedJid: [m.sender],
                        forwardingScore: 9999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                          newsletterJid: saluranId,
                          newsletterName: saluranName,
                          serverMessageId: 127,
                        },
                      },
                    }),
                },
              },
            },
            { userJid: m.sender, quoted: getVerifiedQuoted(botConfig) },
          );
          await sock.relayMessage(m.chat, msg.message, {
            messageId: msg.key.id,
          });
        } catch (btnError) {
          await sendFallback(m, sock, headerText, imageBuffer, thumbBuffer, botConfig, "V5");
        }
        break;
      }
      case 6:
        const thumbPathV6 = path.join(process.cwd(), "assets", "images", "ourin3.jpg");
        const contextInfoV6 = {
          mentionedJid: [m.sender],
          forwardingScore: 9999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: saluranId,
            newsletterName: saluranName,
            serverMessageId: 127,
          },
          externalAdReply: {
            title: "ᴋᴀᴏʀɪ ᴍᴅ",
            body: `v${botConfig.bot?.version || "1.0.1"} • Bot de Respuesta Rápida`,
            sourceUrl: saluranLink,
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
              document: imageBuffer || Buffer.from("ᴋᴀᴏʀɪ ᴍᴅ Menu"),
              mimetype: "application/pdf",
              fileName: `ɴᴏ ᴘᴀɪɴ ɴᴏ ɢᴀɪɴ`,
              fileLength: 9999999999,
              caption: text,
              jpegThumbnail: thumbBuffer,
              contextInfo: contextInfoV6,
            },
            { quoted: getVerifiedQuoted(botConfig) },
          );
        } catch (v6Error) {
          await sendFallback(m, sock, text, imageBuffer, thumbBuffer, botConfig, "V6");
        }
        break;
      case 7: {
        try {
          const carouselCards = [];
          for (const { cat, cmds, emoji } of menuSorted) {
            const categoryName = toSmallCaps(cat);
            let cardBody = `━━━━━━━━━━━━━━━\n`;
            for (const cmd of cmds.slice(0, 15)) {
              cardBody += `◦ \`${prefix}${toSmallCaps(cmd)}\`\n`;
            }
            if (cmds.length > 15) {
              cardBody += `\n_...y otros ${cmds.length - 15} comandos_`;
            }
            cardBody += `\n\n> Total: ${cmds.length} comandos`;
            let cardMedia = null;
            try {
              const catThumbPath = path.join(process.cwd(), "assets", "images", `cat-${cat}.jpg`);
              let sourceImage = thumbBuffer;
              if (fs.existsSync(catThumbPath)) {
                sourceImage = fs.readFileSync(catThumbPath);
              }
              if (sourceImage) {
                const resizedImage = await (await getSharp())(sourceImage)
                  .resize(300, 300, { fit: "cover" })
                  .jpeg({ quality: 80 })
                  .toBuffer();
                cardMedia = await prepareWAMessageMedia({ image: resizedImage }, { upload: sock.waUploadToServer });
              }
            } catch (e) {}
            const cardMessage = {
              header: proto.Message.InteractiveMessage.Header.fromObject({
                title: `${emoji} ${categoryName.toUpperCase()}`,
                hasMediaAttachment: !!cardMedia,
                ...(cardMedia || {}),
              }),
              body: proto.Message.InteractiveMessage.Body.fromObject({ text: cardBody }),
              footer: proto.Message.InteractiveMessage.Footer.create({ text: `ᴋᴀᴏʀɪ ᴍᴅ • ${cat}` }),
              nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                buttons: [{
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({
                    display_text: `📋 Ver ${categoryName}`,
                    id: `${prefix}menucat ${cat}`,
                  }),
                }],
              }),
            };
            carouselCards.push(cardMessage);
          }
          const msg = await generateWAMessageFromContent(
            m.chat,
            {
              viewOnceMessage: {
                message: {
                  messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                  interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                    body: proto.Message.InteractiveMessage.Body.fromObject({
                      text: `${greeting} *${m.pushName}!*\n\n> Desliza para ver las categorías\n> Toca el botón para ver detalles`,
                    }),
                    footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: `ᴋᴀᴏʀɪ ᴍᴅ v${botConfig.bot?.version || "1.0"}` }),
                    carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards: carouselCards }),
                  }),
                },
              },
            },
            { userJid: m.sender, quoted: getVerifiedQuoted(botConfig) },
          );
          await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
        } catch (carouselError) {
          await sendFallback(m, sock, text, imageBuffer, thumbBuffer, botConfig, "V7");
        }
        break;
      }
      case 8: {
        const timeHelper = await import("../../src/lib/ourin-time.js");
        const time = timeHelper.formatTime("HH:mm");
        const date = timeHelper.formatFull("DD/MM/YYYY");
        const user = db.getUser(m.sender);
        let role = "𝙐𝙨𝙚𝙧", emojiRole = "◈";
        if (m.isOwner) { role = "𝘾𝙧𝙚𝙖𝙙𝙤𝙧"; emojiRole = "♚"; }
        else if (m.isPremium) { role = "𝙋𝙧𝙚𝙢𝙞𝙪𝙢"; emojiRole = "✦"; }
        let menuText = ``;
        const randomSparkle = () => ["✦", "✧", "⋆", "˚", "✵", "⊹"][Math.floor(Math.random() * 6)];
        menuText += `${randomSparkle()}━━━━━━━━━━━━━━━━━━━━━${randomSparkle()}\n`;
        menuText += `*ᴋᴀᴏʀɪ ᴍᴅ*\n`;
        menuText += `${randomSparkle()}━━━━━━━━━━━━━━━━━━━━━${randomSparkle()}\n\n`;
        menuText += `┏━━━〔 ${emojiRole} *ᴘᴇʀꜰɪʟ* 〕━━━┓\n`;
        menuText += `┃ 👤 *${m.pushName}*\n`;
        menuText += `┃ 🏷️ ${role}\n`;
        menuText += `┃ 🎫 Energía  ➤ ${m.isOwner || m.isPremium ? "∞ Ilimitada" : (user?.energi ?? 25)}\n`;
        menuText += `┃ ⚡ Nivel    ➤ ${(Math.floor((user?.exp || 0) / 20000) + 1)}\n`;
        menuText += `┃ ✨ Exp      ➤ ${(user?.exp ?? 0).toLocaleString()}\n`;
        menuText += `┃ 💰 Monedas  ➤ ${(user?.koin ?? 0).toLocaleString()}\n`;
        menuText += `┃ ⏰ ${time}\n`;
        menuText += `┃ 📅 ${date}\n`;
        menuText += `┗━━━━━━━━━━━━━━━┛\n\n`;
        for (const { cat, cmds, emoji } of menuSorted) {
          menuText += `┌─────「 ${emoji} *${cat.toUpperCase()}* 」\n`;
          menuText += `│ ✦ Total: ${cmds.length} comandos\n`;
          menuText += `│\n`;
          for (const cmd of cmds) { menuText += `│ ├➤ ${prefix}${cmd}\n`; }
          menuText += `│\n└───────────────────\n\n`;
        }
        await sock.sendMessage(m.chat, { text: menuText }, { quoted: getVerifiedQuoted(botConfig) });
        break;
      }
    }
  } catch (e) {
    console.error(e);
  }
}
