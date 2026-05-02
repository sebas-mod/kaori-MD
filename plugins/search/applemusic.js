import axios from 'axios'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'applemusic',
    alias: ['amusic', 'am', 'apple'],
    category: 'search',
    description: 'Buscá canciones y álbumes en Apple Music',
    usage: '.applemusic <nombre>',
    example: '.applemusic Best Friend',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const query = m.text?.trim()

    if (!query) {
        return m.reply(
            `⚠️ *𝐂𝐎́𝐌𝐎 𝐔𝐒𝐀𝐑*\n\n` +
            `> \`${m.prefix}applemusic <nombre de la canción>\`\n\n` +
            `> Ejemplo:\n` +
            `> \`${m.prefix}applemusic Best Friend\``
        )
    }

    try {
        const res = await axios.get(`https://api.nexray.web.id/search/applemusic?q=${encodeURIComponent(query)}`)

        if (!res.data?.result?.length) {
            return m.reply(`❌ No encontré resultados para: *${query}*`)
        }

        const tracks = res.data.result.slice(0, 5)

        let txt = `🍎 *𝐁𝐔́𝐒𝐐𝐔𝐄𝐃𝐀 𝐄𝐍 𝐀𝐏𝐏𝐋𝐄 𝐌𝐔𝐒𝐈𝐂*\n\n`
        txt += `> Resultado de: *${query}*\n\n`                                                                                    

        tracks.forEach((t, i) => {
            txt += `*${i + 1}.* \`\`\`${t.title}\`\`\`\n`
            txt += `   ├ 📀 *Artista:* \`${t.subtitle || 'Desconocido'}\`\n`
            txt += `   └ 🔗 *Link:* \`${t.link}\`\n\n`
        })

        txt += `> Buscá y disfrutá con **𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈Ɀ𝐀𝐖𝐀 𝐌𝐃**`

        return m.reply(txt.trim())

    } catch (err) {
        console.error(err)
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }