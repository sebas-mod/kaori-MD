import { getDatabase } from '../../src/lib/ourin-database.js'
import * as timeHelper from '../../src/lib/ourin-time.js'

const pluginConfig = {
  name: "listwarn",
  alias: ["warnings", "advertencias", "verwarns", "warnlist"],
  category: "group",
  description: "Muestra la lista de advertencias de los miembros",
  usage: ".listwarn o .listwarn @user",
  example: ".listwarn @user",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  let groupData = db.getGroup(m.chat) || {};
  let warnings = groupData.warnings || {};
  const maxWarns = groupData.maxWarnings || 3;

  let targetUser = null;
  if (m.quoted) {
    targetUser = m.quoted.sender;
  } else if (m.mentionedJid && m.mentionedJid.length > 0) {
    targetUser = m.mentionedJid[0];
  }

  if (targetUser) {
    const userWarnings = warnings[targetUser] || [];
    const targetName = targetUser.split("@")[0];

    if (userWarnings.length === 0) {
      await m.reply(`✅ @${targetName} no tiene ninguna advertencia.`, {
        mentions: [targetUser],
      });
      return;
    }

    let txt = `⚠️ *ᴀᴅᴠᴇʀᴛᴇɴᴄɪᴀs ᴅᴇ @${targetName}*\n\n`;
    txt += `> Total: *${userWarnings.length}/${maxWarns}*\n\n`;

    userWarnings.forEach((w, i) => {
      const date = timeHelper.fromTimestamp(w.time, "DD/MM/YYYY");
      txt += `*${i + 1}.* Motivo: ${w.reason}\n`;
      txt += `    └ _Fecha: ${date}_\n`;
    });

    await m.reply(txt, { mentions: [targetUser] });
  } else {
    // Mostrar todos los usuarios con advertencias
    const usersWithWarnings = Object.keys(warnings).filter(
      (u) => warnings[u].length > 0,
    );

    if (usersWithWarnings.length === 0) {
      await m.reply(`✅ No hay miembros con advertencias en este grupo.`);
      return;
    }

    let txt = `⚠️ *ʟɪsᴛᴀ ᴅᴇ ᴀᴅᴠᴇʀᴛᴇɴᴄɪᴀs*\n\n`;

    usersWithWarnings.forEach((user, i) => {
      const count = warnings[user].length;
      const name = user.split("@")[0];
      txt += `*${i + 1}.* @${name} — *${count}/${maxWarns}* warns\n`;
    });

    txt += `\n> Usa \`${m.prefix}listwarn @user\` para ver el detalle.`;
    txt += `\n\n*KAORI MD — Sistema de Control*`;

    await m.reply(txt, { mentions: usersWithWarnings });
  }
}

export { pluginConfig as config, handler }
