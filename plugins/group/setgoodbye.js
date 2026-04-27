import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "setgoodbye",
  alias: ["customgoodbye", "configurardespedida"],
  category: "group",
  description: "Configura un mensaje de despedida personalizado",
  usage: ".setgoodbye <mensaje>",
  example: ".setgoodbye ¡Adiós {user}, nos vemos pronto!",
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
  const text = m.text || m.args.join(" ");

  if (!text) {
    return m.reply(
      `📝 *sᴇᴛ ɢᴏᴏᴅʙʏᴇ*\n\n` +
        `╭┈┈⬡「 📋 *ᴘʟᴀᴄᴇʜᴏʟᴅᴇʀs* 」\n` +
        `┃ ◦ \`{user}\` - Nombre del miembro\n` +
        `┃ ◦ \`{number}\` - Número del miembro\n` +
        `┃ ◦ \`{group}\` - Nombre del grupo\n` +
        `┃ ◦ \`{desc}\` - Descripción del grupo\n` +
        `┃ ◦ \`{count}\` - Miembros restantes\n` +
        `┃ ◦ \`{owner}\` - Creador del grupo\n` +
        `┃ ◦ \`{date}\` - Fecha (DD/MM/YYYY)\n` +
        `┃ ◦ \`{time}\` - Hora (HH:mm)\n` +
        `┃ ◦ \`{day}\` - Día (Lunes, Martes, etc)\n` +
        `┃ ◦ \`{bot}\` - Nombre del bot\n` +
        `┃ ◦ \`{prefix}\` - Prefix del bot\n` +
        `╰┈┈⬡\n\n` +
        `*Ejemplo:*\n` +
        `> \`${m.prefix}setgoodbye ¡Adiós {user}! 👋\`\n` +
        `> \`Nos vemos pronto el {day}, {date}\``,
    );
  }

  db.setGroup(m.chat, { goodbyeMsg: text, goodbye: true, leave: true });
  db.save();

  m.react("✅");

  await m.reply(
    `✅ La despedida se ha configurado como:\n\n> *${text}*\n\n¿Quieres restablecerla? Usa: *${m.prefix}resetgoodbye*\n\n*KAORI MD — Ajustes*`,
  );
}

export { pluginConfig as config, handler };
