import { getDatabase } from '../../src/lib/ourin-database.js'
import * as timeHelper from '../../src/lib/ourin-time.js'
import { fetchGroupsSafe } from '../../src/lib/ourin-jpm-helper.js'
import config from '../../config.js'
import fs from 'fs'
import te from '../../src/lib/ourin-error.js'

let cachedThumb = null;
try {
  if (fs.existsSync("./assets/images/ourin.jpg")) {
    cachedThumb = fs.readFileSync("./assets/images/ourin.jpg");
  }
} catch (e) {}

const pluginConfig = {
  name: "jpmupdate",
  alias: ["updatejpm", "difundirupdate", "compartirupdate"],
  category: "admin",
  description: "Enviar actualización/changelog a todos los grupos",
  usage: ".jpmupdate <versión> | <changelog>",
  example: ".jpmupdate v2.0 | Nuevas funciones:\\n- Batalla de Quiz\\n- Confesiones",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 60,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();

  if (global.statusjpm) {
    return m.reply(
      `❌ *ᴇʀʀᴏʀ*\n\n> Ya hay un proceso de JPM en curso. Escribe \`${m.prefix}stopjpm\` para detenerlo.`,
    );
  }

  let input = m.text?.trim();

  if (!input) {
    return m.reply(
      `📢 *JPM UPDATE (ANUNCIOS)*\n\n` +
        `¡Envía información de actualizaciones o cambios a todos los grupos!\n\n` +
        `*FORMATO DE USO:*\n` +
        `• \`.jpmupdate <versión> | <contenido del cambio>\`\n\n` +
        `*EJEMPLO:*\n` +
        `> \`.jpmupdate v3.0 | ✨ Nuevas Funciones:\\n- JPM Hidetag\\n- Nuevo sistema AFK\\n- Corrección de errores\`\n\n` +
        `_(Nota: Usa \\n para crear una nueva línea o salto de línea)_`
    );
  }

  let version = config.bot?.version || "v1.0";
  let changelog = input;

  if (input.includes("|")) {
    const parts = input.split("|");
    version = parts[0].trim();
    changelog = parts.slice(1).join("|").trim();
  }

  if (!changelog) {
    return m.reply(`❌ ¡El registro de cambios no puede estar vacío!`);
  }

  await m.react("🕕");

  try {
    const allGroups = await fetchGroupsSafe(sock);
    let groupIds = Object.keys(allGroups);

    const blacklist = db.setting("jpmBlacklist") || [];
    const blacklistedCount = groupIds.filter((id) =>
      blacklist.includes(id),
    ).length;
    groupIds = groupIds.filter((id) => !blacklist.includes(id));

    if (groupIds.length === 0) {
      await m.react("❌");
      return m.reply(
        `❌ *ᴇʀʀᴏʀ*\n\n> No se encontraron grupos${blacklistedCount > 0 ? ` (${blacklistedCount} en lista negra)` : ""}`,
      );
    }

    const jedaJpm = db.setting("jedaJpm") || 5000;
    const botName = config.bot?.name || "KAORI MD";
    const saluranId = config.saluran?.id || "120363208449943317@newsletter";
    const saluranName = config.saluran?.name || botName;

    const dateStr = timeHelper.formatDate("DD [de] MMMM [de] YYYY");

    const updateMessage =
      `🚀 *¡NUEVA ACTUALIZACIÓN! | ${version}*\n\n` +
      `📅 *Fecha:* ${dateStr}\n\n` +
      `*CAMBIOS Y MEJORAS:*\n` +
      `${changelog}\n\n` +
      `*NOTAS:* \n` +
      `> 💡 Escribe *${m.prefix}menu* para explorar estas novedades.\n` +
      `> 📢 _Gracias por preferir a ${botName}_`;

    await m.reply(
      `📢 *ᴊᴘᴍ ᴜᴘᴅᴀᴛᴇ*\n\n` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀʟʟᴇs* 」\n` +
        `┃ 🏷️ ᴠᴇʀsɪóɴ: \`${version}\`\n` +
        `┃ 👥 ᴅᴇsᴛɪɴᴏs: \`${groupIds.length}\` grupos\n` +
        `┃ ⏱️ ᴘᴀᴜsᴀ: \`${jedaJpm}ms\`\n` +
        `┃ 📊 ᴇsᴛɪᴍᴀᴅᴏ: \`${Math.ceil((groupIds.length * jedaJpm) / 60000)} minutos\`\n` +
        `╰┈┈⬡\n\n` +
        `> Iniciando difusión de actualización...`,
    );

    global.statusjpm = true;
    let successCount = 0;
    let failedCount = 0;

    for (const groupId of groupIds) {
      if (global.stopjpm) {
        delete global.stopjpm;
        delete global.statusjpm;

        await m.reply(
          `⏹️ *ᴊᴘᴍ ᴜᴘᴅᴀᴛᴇ ᴅᴇᴛᴇɴɪᴅᴏ*\n\n` +
            `> ✅ Exitosos: \`${successCount}\`\n` +
            `> ❌ Fallidos: \`${failedCount}\`\n` +
            `> ⏸️ Pendientes: \`${groupIds.length - successCount - failedCount}\``,
        );
        return;
      }

      try {
        await sock.sendMessage(groupId, {
          text: updateMessage,
          contextInfo: {
            forwardingScore: 9999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: saluranId,
              newsletterName: saluranName,
              serverMessageId: 127,
            },
            externalAdReply: cachedThumb
              ? {
                  title: `📢 ANUNCIO DE ACTUALIZACIÓN`,
                  body: `Versión del Sistema: ${version}`,
                  thumbnail: cachedThumb,
                  sourceUrl: config.saluran?.link || "",
                  mediaType: 1,
                  renderLargerThumbnail: true,
                }
              : undefined,
          },
        });
        successCount++;
      } catch {
        failedCount++;
      }

      await new Promise((resolve) => setTimeout(resolve, jedaJpm));
    }

    global.statusjpm = false;
    global.stopjpm = false;

    await m.react("✅");
    await m.reply(
      `✅ *ᴊᴘᴍ ᴜᴘᴅᴀᴛᴇ ꜰɪɴᴀʟɪᴢᴀᴅᴏ!*\n\n` +
        `╭┈┈⬡「 📊 *ʀᴇsᴜʟᴛᴀᴅᴏ* 」\n` +
        `┃ ✅ Éxito: ${successCount}\n` +
        `┃ ❌ Falla: ${failedCount}\n` +
        `┃ 📊 Total: ${groupIds.length}\n` +
        `╰┈┈┈┈┈┈┈┈⬡`,
    );
  } catch (error) {
    global.statusjpm = false;
    global.stopjpm = false;
    await m.react('☢');
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler }
