import config from '../../config.js'
import axios from 'axios'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
  name: 'buildml',
  alias: ['mlbuild', 'build'],
  category: 'info',
  description: 'Muestra la mejor build para un héroe de Mobile Legends',
  usage: '.buildml <héroe>',
  example: '.buildml gusion',
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 1,
  isEnabled: true
}

async function handler(m, { sock }) {
  let text = m.args?.join(" ")
  if (!text) {
    return m.reply(
      `📚 *ᴍᴏʙɪʟᴇ ʟᴇɢᴇɴᴅs ʙᴜɪʟᴅs*\n\n> Por favor, ingresa el nombre de un héroe.\n\n*Ejemplo:* ${m.prefix}buildml gusion`
    )
  }

  m.react("🕕")

  try {
    const { data } = await axios.get(
      `https://api.apocalypse.web.id/search/buildml?hero=${encodeURIComponent(text)}`
    )

    const heroes = data.builds
    if (!heroes || !heroes.length) {
      return m.reply("❌ No se encontró ninguna build para este héroe. Verifica que el nombre esté bien escrito.")
    }

    // Selecciona una build aleatoria de las disponibles en la API
    const pickRandom = heroes[Math.floor(Math.random() * heroes.length)]
    const title = pickRandom.title

    const itemnya = pickRandom.items?.map(v => {
      return `*DETALLES DEL ÍTEM*
🌿 \`Nombre\`: ${v.name}
🔮 \`Tipo\`: ${v.type}
💵 \`Precio\`: ${v.price}

*ESTADÍSTICAS*
🚧 \`Poder Mágico\`: ${v.stats?.magic_power || "-"}
👻 \`Velocidad Mov.\`: ${v.stats?.movement_speed || "-"}
🎗️ \`Penetración Mág.\`: ${v.stats?.magic_penetration || "-"}

*PASIVA*
${v.passive_description || "-"}`
    }).join("\n\n")

    m.reply(`⚔️ *BUILD PARA ${text.toUpperCase()}*

🍯 *Título de la Build:*
${title}

${itemnya}

*KAORI MD — Guía de Héroes*`)

  } catch (error) {
    console.error('BuildML Error:', error)
    m.reply(te(m.prefix, m.command, m.pushName))
  }
}

export { pluginConfig as config, handler }
