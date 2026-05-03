import axios from 'axios'
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'stikerwa',
    alias: ['stickerwa', 'wasearch', 'wassticker', 'stkrwa', 'buscarstiker'],
    category: 'search',
    description: 'Buscar paquetes de stickers para WhatsApp',
    usage: '.stikerwa <búsqueda>',
    example: '.stikerwa anime',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const query = m.text?.trim()

    if (!query) {
        return m.reply(
            `🖼️ *ʙᴜ́sǫᴜᴇᴅᴀ ᴅᴇ sᴛɪᴋᴇʀs*\n\n` +
            `> Ingresá una palabra clave para buscar\n\n` +
            `> Ejemplo: \`${m.prefix}stikerwa anime\``
        )
    }

    m.react('🔍')

    try {
        const apiKey = config.APIkey?.lolhuman

        if (!apiKey) {
            throw new Error('API Key no encontrada en la configuración')
        }

        const res = await axios.get(`https://api.lolhuman.xyz/api/stickerwa?apikey=${apiKey}&query=${encodeURIComponent(query)}`, {
            timeout: 30000
        })

        if (res.data?.status !== 200 || !res.data?.result?.length) {
            throw new Error('Stickers no encontrados')
        }

        const packs = res.data.result.slice(0, 3)

        let txt = `🖼️ *ʙᴜ́sǫᴜᴇᴅᴀ ᴅᴇ sᴛɪᴋᴇʀs*\n\n`
        txt += `> Búsqueda: *${query}*\n`
        txt += `> Encontrados: *${res.data.result.length}* paquetes\n`
        txt += `━━━━━━━━━━━━━━━\n\n`

        for (const pack of packs) {
            txt += `╭─「 📦 *${pack.title}* 」\n`
            txt += `┃ 👤 Autor: *${pack.author || '-'}*\n`
            txt += `┃ 🔗 ${pack.url}\n`
            txt += `╰━━━━━━━━━━━━━━\n\n`
        }

        await m.reply(txt.trim())

        const selectedPack = packs[0]
        if (selectedPack.stickers && selectedPack.stickers.length > 0) {
            await m.reply(`🕕 Enviando ${Math.min(5, selectedPack.stickers.length)} stickers del primer paquete...`)

            const stickersToSend = selectedPack.stickers.slice(0, 2)

            for (const stickerUrl of stickersToSend) {
                try {
                    const stickerRes = await axios.get(stickerUrl, {
                        responseType: 'arraybuffer',
                        timeout: 30000
                    })

                    await sock.sendImageAsSticker(m.chat, Buffer.from(stickerRes.data), m, {
                        packname: selectedPack.title || 'KEI KARUIZAWA MD',
                        author: selectedPack.author || 'Bot'
                    })

                    await new Promise(r => setTimeout(r, 500))
                } catch {
                    continue
                }
            }
        }

        m.react('✅')

    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
