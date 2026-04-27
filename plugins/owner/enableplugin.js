import fs from "fs";
import path from "path";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "enableplugin",
  alias: ["eplugin", "activarplugin", "onplugin"],
  category: "owner",
  description: "Vuelve a activar un plugin que fue desactivado previamente",
  usage: ".enableplugin <nombre_plugin>",
  example: ".enableplugin sticker",
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
      `🔌 *ACTIVAR PLUGIN*\n\n` +
        `> Ingresa el nombre del plugin que deseas activar\n\n` +
        `*Ejemplo:*\n` +
        `> \`${m.prefix}enableplugin sticker\`\n` +
        `> \`${m.prefix}enableplugin tiktok\``,
    );
  }

  const found = await findPluginFile(pluginName);

  if (!found) {
    return m.reply(`❌ ¡El plugin *${pluginName}* no fue encontrado!`);
  }

  const { filePath, plugin, category, file } = found;

  if (plugin.config.isEnabled !== false) {
    return m.reply(`⚠️ ¡El plugin *${pluginName}* ya se encuentra activo!`);
  }

  try {
    let content = fs.readFileSync(filePath, "utf-8");

    // Cambia isEnabled: false por isEnabled: true en el archivo fuente
    content = content.replace(/isEnabled:\s*false/i, "isEnabled: true");

    fs.writeFileSync(filePath, content);

    await m.reply(
      `✅ *PLUGIN ACTIVADO*\n\n` +
        `╭┈┈⬡「 📋 *DETALLES* 」\n` +
        `┃ 📦 Plugin: *${plugin.config.name}*\n` +
        `┃ 📁 Categoría: *${category}*\n` +
        `┃ 📄 Archivo: *${file}*\n` +
        `┃ 🟢 Estado: *Activado*\n` +
        `╰┈┈⬡\n\n` +
        `> Reinicia el bot o usa hot reload para aplicar los cambios.`,
    );
  } catch (error) {
    await m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
