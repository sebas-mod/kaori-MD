import { cacheParticipantLids,
      getCachedJid,
      isLid,
      isLidConverted,
      lidToJid, } from '../../src/lib/ourin-lid.js'
import moment from 'moment-timezone'
import config from "../../config.js";
import { getDatabase } from "../../src/lib/ourin-database.js";
import { createGoodbyeCard } from "../../src/lib/ourin-welcome-card.js";
import { resolveAnyLidToJid } from "../../src/lib/ourin-lid.js";
import path from "path";
import fs from "fs";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "goodbye",
  alias: ["bye", "leave", "despedida"],
  category: "group",
  description: "Configurar el mensaje de despedida para el grupo",
  usage: ".goodbye <on/off>",
  example: ".goodbye on",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function buildGoodbyeMessage(
  participant,
  groupName,
  groupDesc,
  memberCount,
  customMsg = null,
  groupOwner = "",
  prefix = ".",
) {
  const farewells = [
    `Adiós`,
    `Hasta luego`,
    `Bye bye`,
    `Nos vemos`,
    `Cuídate`,
    `Sayonara`,
  ];
  const quotes = [
    `Espero que tus próximos pasos sean de mucho éxito.`,
    `Gracias por haber sido parte de este grupo.`,
    `Ojalá volvamos a coincidir en otro momento.`,
    `Las puertas están abiertas si decides volver.`,
    `Cuídate mucho, amigo/a.`,
    `Los recuerdos aquí permanecerán.`,
  ];
  const emojis = ["🌙", "👋", "🥀", "💫", "😢", "🤍"];
  const headers = [
    `🌙 Buenas noches...
Hoy un amigo se despide de nosotros.
Deseamos que su nuevo camino esté lleno de cosas buenas.`,
    `🥀 Amigos...
Hoy tenemos una pequeña despedida.
Gracias por haber caminado junto a nosotros.`,
    `💫 Adiós...
No es un final, solo un hasta luego.
Que tus días sean siempre cálidos.`,
    `🌌 Atención...
Una estrella cambia de cielo esta noche.
Deseémosle lo mejor.`,
  ];

  const farewell = farewells[Math.floor(Math.random() * farewells.length)];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  const header = headers[Math.floor(Math.random() * headers.length)];
  const username = participant?.split("@")[0] || "Usuario";
  
  // Ajuste de zona horaria para Argentina (Bernal Oeste)
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
  const dayId = dayNames[now.format("dddd")] || now.format("dddd");

  if (customMsg) {
    return customMsg
      .replace(/{user}/gi, `@${username}`)
      .replace(/{number}/gi, username)
      .replace(/{group}/gi, groupName || "Grupo")
      .replace(/{desc}/gi, groupDesc || "")
      .replace(/{count}/gi, memberCount?.toString() || "0")
      .replace(/{owner}/gi, groupOwner || "Admin")
      .replace(/{date}/gi, now.format("DD/MM/YYYY"))
      .replace(/{time}/gi, now.format("HH:mm"))
      .replace(/{day}/gi, dayId)
      .replace(/{bot}/gi, "𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃")
      .replace(/{prefix}/gi, prefix);
  }

  return `
${header}
${emoji} ${farewell}, *@${username}* 🤍

╭─〔 📌 *ɪɴꜰᴏ ɢʀᴜᴘᴏ* 〕─✧
│ 🏠 *Nombre* : \`${groupName}\`
│ 👥 *Miembros* : ${memberCount}
│ 📅 *Fecha* : ${now.format("DD/MM/YYYY")}
╰──────────────────────✦

💌 *Mensaje*
「 ${quote} 」

🌸 _¡Hasta la próxima!_ 🤍
`;
}

async function sendGoodbyeMessage(sock, groupJid, participant, groupMeta) {
  try {
    const db = getDatabase();
    const groupData = db.getGroup(groupJid);
    if (groupData?.goodbye !== true && groupData?.leave !== true) return false;

    const goodbyeType = db.setting("goodbyeType") || 1;
    if (groupMeta?.participants) {
      cacheParticipantLids(groupMeta.participants);
    }

    let realParticipant = participant;
    const cachedJid = getCachedJid(participant);
    if (cachedJid && !isLidConverted(cachedJid)) {
      realParticipant = cachedJid;
    } else if (isLid(participant)) {
      const lidFormat = participant;
      const cachedFromLid = getCachedJid(lidFormat);
      if (cachedFromLid && !isLidConverted(cachedFromLid)) {
        realParticipant = cachedFromLid;
      } else {
        realParticipant = lidToJid(participant);
      }
    }

    const memberCount = groupMeta?.participants?.length || 0;
    const groupName = groupMeta?.subject || "Grupo";
    let userName = realParticipant?.split("@")[0] || "Usuario";
    let ppUrl = "https://cdn.gimita.id/download/pp%20kosong%20wa%20default%20(1)_1769506608569_52b57f5b.jpg";

    try {
      ppUrl = (await sock.profilePictureUrl(realParticipant, "image")) || ppUrl;
    } catch {}

    const text = await buildGoodbyeMessage(
      realParticipant,
      groupMeta?.subject,
      groupMeta?.descOwner,
      memberCount,
      groupData?.goodbyeMsg,
      groupMeta?.owner?.split("@")[0] || "",
      config.command?.prefix || ".",
    );

    const saluranId = config.saluran?.id || "120363208449943317@newsletter";
    const saluranName = "𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃";

    if (goodbyeType === 2) {
      await sock.sendMessage(groupJid, {
        text: "¡Hasta pronto!",
        title: `Adiós ${userName}`,
        subtitle: groupName,
        footer: `Quedan ${memberCount} Miembros`,
        cards: [
          {
            image: { url: ppUrl },
            title: `¡Adiós ${userName}!`,
            body: `Gracias por haber estado en ${groupName}`,
            footer: "Te deseamos lo mejor",
            buttons: [
              {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                  display_text: "👋 Adiós",
                  id: "bye",
                }),
              },
            ],
          },
        ],
      });
    } else {
      // Por defecto enviamos el mensaje con la imagen del usuario
      await sock.sendMessage(groupJid, {
        image: { url: ppUrl },
        caption: text,
        mentions: [realParticipant],
        contextInfo: {
          mentionedJid: [realParticipant],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: saluranId,
            newsletterName: saluranName,
            serverMessageId: 127,
          },
          externalAdReply: {
            sourceUrl: config.info?.website || "",
            mediaType: 1,
            thumbnailUrl: ppUrl,
            title: `Adiós ${userName}`,
            body: `KAORI MD - Sistema de Despedidas`,
            renderLargerThumbnail: true,
          },
        },
      });
    }
    return true;
  } catch (error) {
    console.error("Error en Despedida:", error);
    return false;
  }
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.args || [];
  const sub = args[0]?.toLowerCase();
  const sub2 = args[1]?.toLowerCase();
  const groupData = db.getGroup(m.chat) || {};
  const currentStatus = groupData.goodbye === true;

  if (sub === "on" && sub2 === "all") {
    if (!m.isOwner) return m.reply(`❌ ¡Solo el propietario puede usar esto!`);
    m.react("🕕");
    try {
      const groups = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groups);
      let count = 0;
      for (const groupId of groupIds) {
        db.setGroup(groupId, { goodbye: true, leave: true });
        count++;
      }
      m.react("✅");
      return m.reply(`✅ *ᴅᴇsᴘᴇᴅɪᴅᴀ ɢʟᴏʙᴀʟ ᴏɴ*\n\n> ¡Activado en *${count}* grupos!`);
    } catch (err) {
      m.react("☢");
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  }

  if (sub === "off" && sub2 === "all") {
    if (!m.isOwner) return m.reply(`❌ ¡Solo el propietario puede usar esto!`);
    m.react("🕕");
    try {
      const groups = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groups);
      let count = 0;
      for (const groupId of groupIds) {
        db.setGroup(groupId, { goodbye: false, leave: false });
        count++;
      }
      m.react("✅");
      return m.reply(`❌ *ᴅᴇsᴘᴇᴅɪᴅᴀ ɢʟᴏʙᴀʟ ᴏꜰꜰ*\n\n> ¡Desactivado en *${count}* grupos!`);
    } catch (err) {
      m.react("☢");
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  }

  if (sub === "on") {
    if (currentStatus) return m.reply(`⚠️ *ʟᴀ ᴅᴇsᴘᴇᴅɪᴅᴀ ʏᴀ ᴇsᴛᴀ́ ᴀᴄᴛɪᴠᴀ*\n\n> Status: *✅ ON*`);
    db.setGroup(m.chat, { goodbye: true, leave: true });
    return m.reply(`✅ *ᴅᴇsᴘᴇᴅɪᴅᴀ ᴀᴄᴛɪᴠᴀᴅᴀ*\n\n> Se enviará un mensaje cuando alguien salga.\n\n_Usa \`${m.prefix}setgoodbye\` para personalizar._`);
  }

  if (sub === "off") {
    if (!currentStatus) return m.reply(`⚠️ *ʟᴀ ᴅᴇsᴘᴇᴅɪᴅᴀ ʏᴀ ᴇsᴛᴀ́ ɪɴᴀᴄᴛɪᴠᴀ*\n\n> Status: *❌ OFF*`);
    db.setGroup(m.chat, { goodbye: false, leave: false });
    return m.reply(`❌ *ᴅᴇsᴘᴇᴅɪᴅᴀ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴀ*\n\n> Ya no se enviarán mensajes al salir miembros.`);
  }

  m.reply(
    `👋 *ᴄᴏɴꜰɪɢᴜʀᴀᴄɪᴏ́ɴ ᴅᴇ ᴅᴇsᴘᴇᴅɪᴅᴀ*\n\n` +
      `> Estado actual: *${currentStatus ? "✅ ON" : "❌ OFF"}*\n\n` +
      `\`\`\`━━━ OPCIONES ━━━\`\`\`\n` +
      `> \`${m.prefix}goodbye on\` → Activar\n` +
      `> \`${m.prefix}goodbye off\` → Desactivar\n` +
      `> \`${m.prefix}goodbye on all\` → Global ON (Owner)\n` +
      `> \`${m.prefix}goodbye off all\` → Global OFF (Owner)\n` +
      `> \`${m.prefix}setgoodbye\` → Personalizar mensaje\n` +
      `> \`${m.prefix}resetgoodbye\` → Restablecer original\n\n` +
      `Powered by *KAORI MD*`
  );
}

export { pluginConfig as config, handler, sendGoodbyeMessage };
