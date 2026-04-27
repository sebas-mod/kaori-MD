import moment from 'moment-timezone'
import config from "../../config.js";
import { getDatabase } from "../../src/lib/ourin-database.js";
import { createWideDiscordCard } from "../../src/lib/ourin-welcome-card.js";
import { resolveAnyLidToJid } from "../../src/lib/ourin-lid.js";
import path from "path";
import fs from "fs";
import axios from "axios";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "welcome",
  alias: ["wc", "bienvenida"],
  category: "group",
  description: "Activa o desactiva el mensaje de bienvenida en el grupo",
  usage: ".welcome <on/off>",
  example: ".welcome on",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function buildWelcomeMessage(
  participant,
  groupName,
  groupDesc,
  memberCount,
  customMsg = null,
  groupOwner = "",
  prefix = ".",
) {
  const greetings = [
    `¡Al fin llegaste!`,
    `Bienvenido/a`,
    `Welcome`,
    `Hola`,
    `Qué onda`,
    `¡Qué bueno verte por aquí!`,
  ];
  const quotes = [
    `¡No seas un lector fantasma!`,
    `¡Relájate, siéntete como en casa!`,
    `¡Anímate a charlar!`,
    `¡Prepárate para la diversión!`,
    `¡No tengas vergüenza, todos somos amigos!`,
    `Si no sabes cómo empezar, un "Hola" basta 😄`,
  ];
  const emojis = ["🎐", "🌸", "✨", "💫", "🪸", "🔥", "💖"];
  const headers = [
    `🎐 ¡Hola a todos! 
Hoy tenemos un nuevo integrante 🌱
¡Démosle una cálida bienvenida!`,
    `🌸 ¡Atención grupo!
Alguien nuevo se ha unido ✨
Espero que te diviertas y hagas muchos amigos~`,
    `✨ ¡Bienvenido/a!
Un nuevo compañero llega con buenas vibras 💫
¡Pásala genial con nosotros!`,
    `🪸 ¡Hola, hola!
Nuestra familia crece un poco más hoy 🤍
¡Vamos a pasar un tiempo increíble juntos!`,
  ];

  const greeting = greetings[Math.floor(Math.random() * greetings.length)];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  const header = headers[Math.floor(Math.random() * headers.length)];
  const username = participant?.split("@")[0] || "Usuario";
  
  const now = moment().tz("America/Argentina/Buenos_Aires");
  const dayNames = {
    Sunday: "Domingo",
    Monday: "Lunes",
    Tuesday: "Martes",
    Wednesday: "Miércoles",
    Thursday: "Jueves",
    Friday: "Viernes",
    Saturday: "Sábado",
  };
  const dayEs = dayNames[now.format("dddd")] || now.format("dddd");

  if (customMsg) {
    return customMsg
      .replace(/{user}/gi, `@${username}`)
      .replace(/{number}/gi, username)
      .replace(/{group}/gi, groupName || "el grupo")
      .replace(/{desc}/gi, groupDesc || "")
      .replace(/{count}/gi, memberCount?.toString() || "0")
      .replace(/{owner}/gi, groupOwner || "Admin")
      .replace(/{date}/gi, now.format("DD/MM/YYYY"))
      .replace(/{time}/gi, now.format("HH:mm"))
      .replace(/{day}/gi, dayEs)
      .replace(/{bot}/gi, config.bot?.name || "KAORI MD")
      .replace(/{prefix}/gi, prefix);
  }

  let msg = `
${header}
${emoji} ${greeting}, *@${username}* 💫

╭─〔 📌 *ɪɴꜰᴏ ɢʀᴜᴘᴏ* 〕─✧
│ 🏠 *Nombre* : \`${groupName}\`
│ 👥 *Miembro* : #${memberCount}
│ 📅 *Fecha* : ${now.format("DD/MM/YYYY")}
╰──────────────────────✦
`;

  if (groupDesc) {
    msg += `
📝 *Descripción*
❝ ${groupDesc.slice(0, 120)}${groupDesc.length > 120 ? "..." : ""} ❞
`;
  }

  msg += `
✨ *Tip del día*
「 ${quote} 」

🌸 _¡Esperamos que te quedes con nosotros!_ 🤍
`;
  return msg;
}

async function sendWelcomeMessage(sock, groupJid, participant, groupMeta) {
  try {
    const db = getDatabase();
    const groupData = db.getGroup(groupJid);
    if (groupData?.welcome !== true) return false;

    const welcomeType = db.setting("welcomeType") || 1;
    const realParticipant = resolveAnyLidToJid(participant, groupMeta?.participants || []);
    const memberCount = groupMeta?.participants?.length || 0;
    const groupName = groupMeta?.subject || "Grupo";
    let userName = realParticipant?.split("@")[0] || "User";
    
    let ppUrl = "https://cdn.gimita.id/download/pp%20kosong%20wa%20default%20(1)_1769506608569_52b57f5b.jpg";
    try {
      ppUrl = await sock.profilePictureUrl(realParticipant, "image");
    } catch {}

    const text = await buildWelcomeMessage(
      realParticipant,
      groupMeta?.subject,
      groupMeta?.desc,
      memberCount,
      groupData?.welcomeMsg,
      groupMeta?.owner?.split("@")[0] || "",
      config.command?.prefix || ".",
    );

    // Lógica de envío según welcomeType (simplificada para KAORI MD)
    if (welcomeType === 3) {
      await sock.sendMessage(groupJid, {
        image: { url: ppUrl },
        caption: text,
        contextInfo: {
          mentionedJid: [realParticipant],
          externalAdReply: {
            title: `BIENVENIDO/A ${userName}`,
            body: `Eres el miembro #${memberCount}`,
            thumbnailUrl: ppUrl,
            sourceUrl: config.saluran?.link || "",
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      });
    } else {
      await sock.sendMessage(groupJid, {
        text: text,
        mentions: [realParticipant],
      });
    }
    return true;
  } catch (error) {
    console.error("Welcome Error:", error);
    return false;
  }
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.args || [];
  const sub = args[0]?.toLowerCase();
  const sub2 = args[1]?.toLowerCase();
  const groupData = db.getGroup(m.chat) || {};
  const currentStatus = groupData.welcome === true;

  if (sub === "on" && sub2 === "all") {
    if (!m.isOwner) return m.reply(config.messages.ownerOnly);
    m.react("🕕");
    try {
      const groups = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groups);
      for (const groupId of groupIds) {
        db.setGroup(groupId, { welcome: true });
      }
      m.react("✅");
      return m.reply(`✅ *ʙɪᴇɴᴠᴇɴɪᴅᴀ ɢʟᴏʙᴀʟ ᴏɴ*\n\n> ¡Bienvenida activada en todos los grupos!`);
    } catch (err) {
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  }

  if (sub === "off" && sub2 === "all") {
    if (!m.isOwner) return m.reply(config.messages.ownerOnly);
    m.react("🕕");
    try {
      const groups = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groups);
      for (const groupId of groupIds) {
        db.setGroup(groupId, { welcome: false });
      }
      m.react("✅");
      return m.reply(`❌ *ʙɪᴇɴᴠᴇɴɪᴅᴀ ɢʟᴏʙᴀʟ ᴏꜰꜰ*\n\n> ¡Bienvenida desactivada en todos los grupos!`);
    } catch (err) {
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  }

  if (sub === "on") {
    if (currentStatus) return m.reply(`⚠️ La bienvenida ya está *activada* en este grupo.`);
    db.setGroup(m.chat, { welcome: true });
    return m.reply(`✅ *ʙɪᴇɴᴠᴇɴɪᴅᴀ ᴀᴄᴛɪᴠᴀ*\n\n> Los nuevos miembros serán saludados automáticamente.`);
  }

  if (sub === "off") {
    if (!currentStatus) return m.reply(`⚠️ La bienvenida ya está *desactivada* en este grupo.`);
    db.setGroup(m.chat, { welcome: false });
    return m.reply(`❌ *ʙɪᴇɴᴠᴇɴɪᴅᴀ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴀ*\n\n> Ya no se enviarán saludos automáticos.`);
  }

  m.reply(
    `👋 *ᴀᴊᴜsᴛᴇs ᴅᴇ ʙɪᴇɴᴠᴇɴɪᴅᴀ*\n\n` +
      `Estado actual: *${currentStatus ? "✅ ACTIVADO" : "❌ DESACTIVADO"}*\n\n` +
      `*Comandos:* \n` +
      `> \`${m.prefix}welcome on\` → Activar\n` +
      `> \`${m.prefix}welcome off\` → Desactivar\n` +
      `> \`${m.prefix}setwelcome\` → Personalizar mensaje\n` +
      `> \`${m.prefix}resetwelcome\` → Resetear mensaje\n\n` +
      `*KAORI MD — Sistema de Ingreso*`
  );
}

export { pluginConfig as config, handler, sendWelcomeMessage };
