import { pinterest } from 'btch-downloader'
import { generateWAMessage, generateWAMessageFromContent, jidNormalizedUser } from 'ourin'
import axios from 'axios'
import crypto from 'crypto'
import te from '../../src/lib/ourin-error.js'
import { f } from '../../src/lib/ourin-http.js'

const pluginConfig = {
    name: 'pins',
    alias: ['pinsearch', 'pinterestsearch', 'pin'],
    category: 'search',
    description: 'Buscar imágenes en Pinterest (álbum)',
    usage: '.pins <búsqueda>',
    example: '.pins Zhao Lusi',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock, config: botConfig }) {
    const query = m.text?.trim()
    if (!query) {
        return m.reply(
            `🔍 *ʙᴜ́sǫᴜᴇᴅᴀ ᴅᴇ ᴘɪɴᴛᴇʀᴇsᴛ*\n\n` +
            `> Ejemplo:\n` +
            `\`${m.prefix}pins Zhao Lusi\``
        )
    }
    m.react('🕕')

    try {
        const data = await f(`https://api.siputzx.my.id/api/s/pinterest?query=${query}`)

        const results = data?.data?.slice(0, 10)
        if (!results || results.length === 0) {
            m.react('❌')
            return m.reply(`❌ No se encontraron resultados para: ${query}`)
        }

        const mediaPromises = results.map((item, i) => {
            const imageUrl =
                item.image_url

            if (!imageUrl) return null

            try {
                return {
                    image: { url: imageUrl },
                }
            } catch (e) {
                console.log('[Pins] Error de imagen:', e.message)
                return null
            }
        })

        const mediaList = (await Promise.all(mediaPromises)).filter(m => m !== null)

        if (mediaList.length === 0) {
            m.react('❌')
            return m.reply('❌ Error al cargar las imágenes')
        }


        try {

            await sock.sendMessage(m.chat, {
                albumMessage: mediaList
            }, { quoted: m })
            m.react('✅')

        } catch (err) {
            console.log('[Pins] Álbum fallido, enviando una por una:', err.message)

            for (const content of mediaList) {
                await sock.sendMessage(
                    m.chat,
                    content,
                    { quoted: m }
                )
            }

            m.react('✅')
        }

    } catch (err) {
        console.error('[Pins] Error:', err.message)
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
