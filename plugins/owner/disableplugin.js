import fs from "fs";
import path from "path";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "disableplugin",
  alias: ["dplugin", "desactivarplugin", "offplugin"],
  category: "owner",
  description: "Desactiva un plugin específico cambiando su configuración",
  usage: ".disableplugin <nombre_plugin>",
  example: ".disableplugin sticker",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function findPluginFile(pluginName) {
  const pluginsDir = path.join(process.cwd(), "plugins");
  const categories = fs.readdirSync(pluginsDir).filter((f) => {
    return fs.statSync(path.join(pluginsDir, f)).isDirectory();
  });

  for (const category of categories) {
    const categoryPath = path.join(pluginsDir, category);
    const files = fs.readdirSync(categoryPath).filter((f) => f.endsWith(".js"));

    for (const file of files) {
      try {
        const filePath = path.join(categoryPath, file);
        const plugin = await import(`file://${filePath.replace(/\\/g, "/")}`);

        if (!plugin.config) continue;

        const name = Array.isArray(plugin.config.name)
          ? plugin.config.name[0]
          : plugin.config.name;

        const aliases = plugin.config.alias || [];

        if (name === pluginName || aliases.includes(pluginName)) {
          return { filePath, plugin, category, file };
        }
      } catch {}
    }
  }

  return null;
}

async function handler(m, { sock }) {
  const args = m.args || [];
  const pluginName = args[0]?.toLowerCase();

  if (!pluginName) {
    return m.reply(
      `🔌 *DESACTIVAR PLUGIN*\n\n` +
        `> Ingresa el nombre del plugin que deseas desactivar\n\n` +
        `*Ejemplo:*\n` +
        `> \`${m.prefix}disableplugin sticker\`\n` +
        `> \`${m.prefix}disableplugin tiktok\``,
    );
  }

  const found = await findPluginFile(pluginName);

  if (!found) {
    return m.reply(`❌ ¡El plugin *${pluginName}* no fue encontrado!`);
  }

  const { filePath, plugin, category, file } = found;

  if (plugin.config.isEnabled === false) {
    return m.reply(`⚠️ ¡El plugin *${pluginName}* ya se encuentra desactivado!`);
  }

  try {
    let content = fs.readFileSync(filePath, "utf-8");

    // Reemplaza isEnabled: true por isEnabled: false en el archivo físico
    content = content.replace(/isEnabled:\s*true/i, "isEnabled: false");

    fs.writeFileSync(filePath, content);

    await m.reply(
      `✅ *PLUGIN DESACTIVADO*\n\n` +
        `╭┈┈⬡「 📋 *DETALLES* 」\n` +
        `┃ 📦 Plugin: *${plugin.config.name}*\n` +
        `┃ 📁 Categoría: *${category}*\n` +
        `┃ 📄 Archivo: *${file}*\n` +
        `┃ 🔴 Estado: *Desactivado*\n` +
        `╰┈┈⬡\n\n` +
        `> Reinicia el bot o usa hot reload para aplicar los cambios.`,
    );
  } catch (error) {
    await m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
