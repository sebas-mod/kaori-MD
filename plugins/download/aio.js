import axios from 'axios'
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'aio',
    alias: ['allinone', 'download', 'dl'],
    category: 'downloader',
    description: 'Descargador todo en uno (IG, TikTok, FB, Twitter, etc.)',
    usage: '.aio <url>',
    example: '.aio https://instagram.com/p/xxx',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const url = m.text?.trim()

    if (!url) {
        return m.reply(
            `📥 *ᴀʟʟ ɪɴ ᴏɴᴇ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n` +
            `> ¡Descarga desde varias plataformas!\n\n` +
            `╭┈┈⬡「 🌐 *ᴘʟᴀᴛᴀꜰᴏʀᴍᴀꜱ* 」\n` +
            `┃ • Instagram\n` +
            `┃ • TikTok\n` +
            `┃ • Facebook\n` +
            `┃ • Twitter/X\n` +
            `┃ • YouTube\n` +
            `┃ • Y más...\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `> *Ejemplo:* ${m.prefix}aio https://instagram.com/p/xxx`
        )
    }

    if (!url.startsWith('http')) {
        return m.reply(`❌ ¡URL no válida! Debe comenzar con http/https`)
    }

    await m.react('🕕')

    try {
        const apikey = config.APIkey?.neoxr
        if (!apikey) {
            await m.react('❌')
            return m.reply('❌ ¡La API Key de neoxr no ha sido configurada en config.js!')
        }

        const apiUrl = `https://api.neoxr.eu/api/aio?url=${encodeURIComponent(url)}&apikey=${apikey}`
        const { data: response } = await axios.get(apiUrl)

        if (!response.status) {
            await m.react('❌')
            return m.reply(`❌ ${response.msg || 'Error al obtener datos de la API'}`)
        }

        const resultData = response.data
        if (!resultData || resultData.length === 0) {
            await m.react('❌')
            return m.reply(`❌ *ꜰᴀʟʟᴏ*\n\n> No se pudo extraer contenido multimedia de esa URL`)
        }

        for (const link of resultData.slice(0, 5)) {
            try {
                const mediaUrl = link.url
                const type = link.type?.toLowerCase() || ''
                const isVideo = ['mp4', 'mov', 'webm', 'video'].some(t => type.includes(t))
                const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'image'].some(t => type.includes(t))

                const contextInfo = {
                    forwardingScore: 99,
                    isForwarded: true,
                }

                if (isVideo) {
                    await sock.sendMedia(m.chat, mediaUrl, null, m, {
                        type: 'video',
                        contextInfo
                    })
                } else if (isImage) {
                    await sock.sendMedia(m.chat, mediaUrl, null, m, {
                        type: 'image',
                        contextInfo
                    })
                } else {
                    await sock.sendMedia(m.chat, mediaUrl, null, m, {
                        type: 'document',
                        contextInfo
                    })
                }

                await new Promise(resolve => setTimeout(resolve, 2000))

            } catch (err) {
                console.error('Error al enviar media:', err.message)
            }
        }

        await m.react('✅')

    } catch (error) {
        await m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
