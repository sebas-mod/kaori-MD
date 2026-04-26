import { getDatabase } from '../../src/lib/ourin-database.js'
import * as timeHelper from '../../src/lib/ourin-time.js'
import config from '../../config.js'
import path from 'path'
import fs from 'fs'

const pluginConfig = {
  name: "aceptar",
  alias: ["accept", "yes", "si", "terima"],
  category: "fun",
  description: "Acepta la propuesta de alguien para ser pareja",
  usage: ".aceptar @tag",
  example: ".aceptar @user",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

let thumbFun = null;
try {
  const thumbPath = path.join(
    process.cwd(),
    "assets",
    "images",
    "ourin-games.jpg",
  );
  if (fs.existsSync(thumbPath)) thumbFun = fs.readFileSync(thumbPath);
} catch (e) {}

const celebrationQuotes = [
  "¡Ojalá duren hasta el altar! 💍",
  "¡De amigos a amantes, qué hermoso! 💕",
  "¡El amor está en el aire! 💖",
  "¡Pareja del año detectada! 💑",
  "¡No se olviden de invitar al casamiento! 💒",
  "¡Felicidades por su nueva vida de a dos! 🥰",
  "¡Tienen muchísima química! 🔥",
  "¡Una pareja hecha en el cielo! ✨",
];

function getContextInfo(title = "💕 *ᴀᴄᴇᴘᴛᴀʀ*", body = "¡Amor aceptado!") {
  const saluranId = config.saluran?.id || "120363208449943317@newsletter";
  const saluranName = config.saluran?.name || config.bot?.name || "Ourin-AI";

  const contextInfo = {
    forwardingScore: 9999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: saluranId,
      newsletterName: saluranName,
      serverMessageId: 127,
    },
  };

  if (thumbFun) {
    contextInfo.externalAdReply = {
      title: title,
      body: body,
      thumbnail: thumbFun,
      mediaType: 1,
      renderLargerThumbnail: true,
      sourceUrl: config.saluran?.link || "",
    };
  }

  return contextInfo;
}

async function handler(m, { sock }) {
  const db = getDatabase();

  let shooterJid = null;

  if (m.quoted) {
    shooterJid = m.quoted.sender;
  } else if (m.mentionedJid?.[0]) {
    shooterJid = m.mentionedJid[0];
  }

  if (!shooterJid) {
    const sessions = global.tembakSessions || {};
    const mySession = Object.entries(sessions).find(
      ([key, val]) => val.target === m.sender && val.chat === m.chat,
    );

    if (mySession) {
      shooterJid = mySession[1].shooter;
    }
  }

  if (!shooterJid) {
    return m.reply(
      `⚠️ *ᴍᴏᴅᴏ ᴅᴇ ᴜsᴏ*\n\n` +
        `> Respondé al mensaje de la propuesta con \`${m.prefix}aceptar\`\n` +
        `> O usá \`${m.prefix}aceptar @tag\``,
    );
  }

  if (shooterJid === m.sender) {
    return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> ¡No podés aceptarte a vos mismo!`);
  }

  if (shooterJid === m.botNumber) {
    return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> ¡El bot no puede tener pareja!`);
  }

  let shooterData = db.getUser(shooterJid) || {};
  let myData = db.getUser(m.sender) || {};

  if (!shooterData.fun) shooterData.fun = {};
  if (!myData.fun) myData.fun = {};

  if (shooterData.fun.pasangan !== m.sender && shooterData.fun.tembakTarget !== m.sender) {
    return m.reply(
      `❌ *sɪɴ ᴘʀᴏᴘᴜᴇsᴛᴀ*\n\n` +
        `> @${shooterJid.split("@")[0]} no se te declaró recientemente.`,
      { mentions: [shooterJid] },
    );
  }

  // Actualizar datos de pareja
  shooterData.fun.pasangan = m.sender;
  shooterData.fun.jadiPacar = Date.now();
  delete shooterData.fun.tembakTarget;
  
  myData.fun.pasangan = shooterJid;
  myData.fun.jadiPacar = Date.now();

  if (!shooterData.fun.terimaCount) shooterData.fun.terimaCount = 0;
  shooterData.fun.terimaCount++;

  db.setUser(shooterJid, shooterData);
  db.setUser(m.sender, myData);

  // Limpiar sesión
  const sessionKey = `${m.chat}_${m.sender}`;
  if (global.tembakSessions?.[sessionKey]) {
    delete global.tembakSessions[sessionKey];
  }

  const quote = celebrationQuotes[Math.floor(Math.random() * celebrationQuotes.length)];
  
  await m.react("💕");
  
  await m.reply(`💕 *¡WIDIII, DIJO QUE SÍ!* @${shooterJid.split('@')[0]}\n\n` +
                `@${m.sender.split('@')[0]} y @${shooterJid.split('@')[0]} son oficialmente pareja.\n\n` +
                `_"${quote}"_\n\n` +
                `¡Que vivan los novios y sean muy felices! 💍`, { mentions: [m.sender, shooterJid] })
}

export { pluginConfig as config, handler }
