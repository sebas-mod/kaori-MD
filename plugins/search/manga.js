import axios from 'axios'
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'manga',
    alias: ['mangasearch', 'carimanga', 'searchmanga', 'buscarmanga'],
    category: 'search',
    description: 'Buscar información de manga desde AniList',
    usage: '.manga <título>',
    example: '.manga one piece',
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
        const query = m.args?.join(' ')?.trim()

        if (!query) {
            return m.reply(`❌ *¡Ingresá el título del manga!*\n\n> Ejemplo: .manga one piece`)
        }

        await m.react('Automático')

        const apikey = config.APIkey?.lolhuman || 'APIKey-Milik-Bot-OurinMD(Zann,HyuuSATANN,Keisya,Danzz)'
        const url = `https://api.lolhuman.xyz/api/manga?apikey=${apikey}&query=${encodeURIComponent(query)}`

        const response = await axios.get(url, { timeout: 30000 })
        const data = response.data

        if (data.status !== 200 || !data.result) {
            await m.react('❌')
            return m.reply(`❌ *Manga no encontrado:* ${query}`)
        }

        const manga = data.result
        const saluranId = config.saluran?.id || '120363208449943317@newsletter'
        const saluranName = config.saluran?.name || config.bot?.name || 'Ourin-AI'

        const title = manga.title?.romaji || manga.title?.english || manga.title?.native || 'Desconocido'
        const titleEn = manga.title?.english || '-'
        const titleJp = manga.title?.native || '-'

        const startDate = manga.startDate 
            ? `${manga.startDate.day || '??'}/${manga.startDate.month || '??'}/${manga.startDate.year || '????'}`
            : '-'
        const endDate = manga.endDate 
            ? `${manga.endDate.day || '??'}/${manga.endDate.month || '??'}/${manga.endDate.year || '????'}`
            : '-'

        let description = manga.description || ''
        description = description.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '').trim()
        if (description.length > 500) {
            description = description.substring(0, 500) + '...'
        }

        const genres = manga.genres?.join(', ') || '-'
        const characters = manga.characters?.nodes?.slice(0, 8).map(c => c.name?.full).join(', ') || '-'

        let caption = `📚 *ɪɴꜰᴏ ᴅᴇ ᴍᴀɴɢᴀ*\n\n`
        caption += `📖 *ᴛɪ́ᴛᴜʟᴏ:* ${title}\n`
        caption += `🇬🇧 *ɪɴɢʟᴇ́s:* ${titleEn}\n`
        caption += `🇯🇵 *ɴᴀᴛɪᴠᴏ:* ${titleJp}\n\n`
        caption += `📊 *ᴇsᴛᴀᴅᴏ:* ${manga.status || '-'}\n`
        caption += `📕 *ꜰᴏʀᴍᴀᴛᴏ:* ${manga.format || '-'}\n`
        caption += `📄 *ᴄᴀᴘɪ́ᴛᴜʟᴏs:* ${manga.chapters || '-'}\n`
        caption += `📚 *ᴠᴏʟᴜ́ᴍᴇɴᴇs:* ${manga.volumes || '-'}\n`
        caption += `⭐ *ᴘᴜɴᴛᴜᴀᴄɪᴏ́ɴ:* ${manga.averageScore || '-'}/100\n\n`
        caption += `📅 *ɪɴɪᴄɪᴏ:* ${startDate}\n`
        caption += `📅 *ꜰɪɴ:* ${endDate}\n`
        caption += `🎭 *ɢᴇ́ɴᴇʀᴏs:* ${genres}\n\n`
        caption += `👥 *ᴘᴇʀsᴏɴᴀᴊᴇs:*\n${characters}\n\n`
        caption += `📝 *sɪɴᴏᴘsɪs:*\n${description}\n\n`
        caption += `> 📚 Fuente: AniList`

        await m.react('📖')

        const coverImage = manga.coverImage?.large || manga.coverImage?.medium

        if (coverImage) {
            await sock.sendMedia(m.chat, coverImage, caption, m, {
                type: 'image'
            })
        } else {
            m.reply(caption)
        }

    } catch (error) {
        await m.react('☢')
        if (error.response?.status === 403) {
            return m.reply(`❌ *API Key no válida o límite alcanzado*`)
        }
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
