import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "setwelcome",
  alias: ["customwelcome", "configurarbienvenida"],
  category: "group",
  description: "Configura un mensaje de bienvenida personalizado",
  usage: ".setwelcome <mensaje>",
  example: ".setwelcome ¡Hola {user}, bienvenido a {group}!",
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
  const text = m.fullArgs?.trim() || m.args.join(" ");

  if (!text) {
    return m.reply(
      `📝 *sᴇᴛ ᴡᴇʟᴄᴏᴍᴇ*\n\n` +
        `╭┈┈⬡「 📋 *ᴘʟᴀᴄᴇʜᴏʟᴅᴇʀs* 」\n` +
        `┃ ◦ \`{user}\` - Nombre del miembro\n` +
        `┃ ◦ \`{number}\` - Número del miembro\n` +
        `┃ ◦ \`{group}\` - Nombre del grupo\n` +
        `┃ ◦ \`{desc}\` - Descripción del grupo\n` +
        `┃ ◦ \`{count}\` - Cantidad de miembros\n` +
        `┃ ◦ \`{owner}\` - Creador del grupo\n` +
        `┃ ◦ \`{date}\` - Fecha (DD/MM/YYYY)\n` +
        `┃ ◦ \`{time}\` - Hora (HH:mm)\n` +
        `┃ ◦ \`{day}\` - Día (Lunes, Martes, etc)\n` +
        `┃ ◦ \`{bot}\` - Nombre del bot\n` +
        `┃ ◦ \`{prefix}\` - Prefix del bot\n` +
        `╰┈┈⬡\n\n` +
        `*Ejemplo:*\n` +
        `> \`${m.prefix}setwelcome ¡Hola {user}! 👋\`\n` +
        `> \`Bienvenido a {group} este {day}, {date}\``,
    );
  }

  db.setGroup(m.chat, { welcomeMsg: text, welcome: true });
  db.save();

  m.react("✅");

  await m.reply(
    `✅ La bienvenida se ha configurado como:\n\n> *${text}*\n\n¿Quieres restablecerla? Usa: *${m.prefix}resetwelcome*\n\n*KAORI MD — Ajustes*`,
  );
}

export { pluginConfig as config, handler };
