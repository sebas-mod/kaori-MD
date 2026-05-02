import axios from 'axios'
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'bingimage',
    alias: ['imagesearch', 'buscargambar', 'bingimg', 'imagen', 'img'],
    category: 'search',
    description: 'Buscá imágenes en la web mediante Google/Bing',
    usage: '.imagen <búsqueda>',
    example: '.imagen rem anime',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 2,
    isEnabled: true
}

async function handler(m, { sock }) {
    try {
        const query = m.text?.trim()

        if (!query) {
            return m.reply(`❌ *¡Falta la palabra clave!*\n\n> Ejemplo: ${m.prefix}imagen rem anime`)
        }

        await m.react('🔍')

        const apikey = config.APIkey?.neoxr || 'Milik-Bot-OurinMD'
        const url = `https://api-faa.my.id/faa/google-image?query=${encodeURIComponent(query)}&apikey=${apikey}`

        const response = await axios.get(url, { timeout: 30000 })
        const data = response.data

        if (!data.status || !data.result || data.result.length === 0) {
            await m.react('❌')
            return m.reply(`❌ *No encontré resultados para:* ${query}`)
        }

        const results = data.result.slice(0, 5) // Limitamos a 5 para no saturar
        
        const album = await Promise.all(
            results.map(async (url) => {
                const res = await axios.get(url, { responseType: "arraybuffer" })
                return {
                    image: Buffer.from(res.data)
                }
            })
        )

        await m.react('✅')
        
        // Enviando el set de imágenes como álbum
        await sock.sendMessage(m.chat, {
            albumMessage: album,
            caption: `🖼️ *𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎𝐒 𝐃𝐄 𝐈𝐌𝐀𝐆𝐄𝐍*\n> Búsqueda: ${query}\n\n> Por **𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈Ɀ𝐀𝐖𝐀 𝐌𝐃**`
        }, { quoted: m })

    } catch (error) {
        console.error(error)
        await m.react('☢')
        // Manejador de errores estándar del bot
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }