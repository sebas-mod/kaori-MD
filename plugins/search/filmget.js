import axios from 'axios'
import config from '../../config.js'
import path from 'path'
import fs from 'fs'
import te from '../../src/lib/ourin-error.js'

const NEOXR_APIKEY = config.APIkey?.neoxr || 'Milik-Bot-OurinMD'

const pluginConfig = {
    name: 'peliculainfo',
    alias: ['filmget', 'getfilm', 'filmdetail', 'filminfo', 'peliinfo'],
    category: 'search',
    description: 'Obtené los detalles, links de streaming y descarga de una película',
    usage: '.peliculainfo <url>',
    example: '.peliculainfo https://tv.neoxr.eu/film/civil-war-2024',
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

let thumbFilm = null
try {
    const p = path.join(process.cwd(), 'assets/images/ourin-film.jpg')
    if (fs.existsSync(p)) thumbFilm = fs.readFileSync(p)
} catch {}

async function handler(m, { sock }) {
    const args = m.args || []
    const url = args[0]?.trim()

    if (!url || !url.includes('neoxr.eu')) {
        return m.reply(
            `🎬 *𝐃𝐄𝐓𝐀𝐋𝐋𝐄 𝐃𝐄 𝐏𝐄𝐋𝐈́𝐂𝐔𝐋𝐀*\n\n` +
            `> Obtené la información completa desde la URL.\n\n` +
            `*Uso:*\n` +
            `> \`${m.prefix}peliculainfo <url>\`\n\n` +
            `> Primero buscá con \`${m.prefix}pelicula <título>\``
        )
    }

    m.react('🎬')

    try {
        const apiUrl = `https://api.neoxr.eu/api/film-get?url=${encodeURIComponent(url)}&apikey=${NEOXR_APIKEY}`
        const { data } = await axios.get(apiUrl, { timeout: 30000 })

        if (!data?.status || !data?.data) {
            m.react('❌')
            return m.reply('❌ *𝐄𝐑𝐑𝐎𝐑*\n\n> No se pudo encontrar la información de esta película.')
        }

        const film = data.data
        const streams = data.stream || []
        const downloads = data.download || []

        let thumbBuffer = null
        if (film.thumbnail) {
            try {
                const thumbRes = await axios.get(film.thumbnail, { responseType: 'arraybuffer', timeout: 10000 })
                thumbBuffer = Buffer.from(thumbRes.data)
            } catch {}
        }

        let text = `🎬 *${film.title || 'Pelicula'}*\n\n`
        text += `╭┈┈⬡「 📋 *𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐂𝐈𝐎́𝐍* 」\n`
        text += `┃ ⭐ Rating: ${film.rating || '-'}\n`
        text += `┃ 📺 Calidad: ${film.quality || '-'}\n`
        text += `┃ ⏱️ Duración: ${film.duration || '-'}\n`
        text += `┃ 📅 Estreno: ${film.release || '-'}\n`
        text += `┃ 🎭 Género: ${film.tags || '-'}\n`
        text += `┃ 🎬 Director: ${film.director || '-'}\n`
        text += `┃ 👥 Actores: ${film.actors || '-'}\n`
        text += `╰┈┈┈┈┈┈┈┈⬡\n\n`

        text += `📝 *Sinopsis:*\n`
        text += `> ${film.synopsis || '-'}\n\n`

        if (streams.length > 0) {
            text += `▶️ *Streaming Disponible:*\n`
            streams.forEach((s, i) => {
                text += `> ${i + 1}. Servidor: ${s.server}\n`
            })
            text += `\n`
        }

        if (downloads.length > 0) {
            text += `📥 *Opciones de Descarga:*\n`
            downloads.forEach((d, i) => {
                text += `> ${i + 1}. ${d.provider}\n`
            })
        }

        const buttons = []

        if (streams.length > 0) {
            buttons.push({
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({
                    display_text: `▶️ Mirar en ${streams[0].server}`,
                    url: streams[0].url
                })
            })
        }

        // Mostrar hasta 2 opciones de descarga en botones rápidos
        downloads.slice(0, 2).forEach(d => {
            buttons.push({
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({
                    display_text: `📥 Bajar vía ${d.provider}`,
                    url: d.url
                })
            })
        })

        const saluranId = config.saluran?.id || '120363208449943317@newsletter'
        const saluranName = config.saluran?.name || config.bot?.name || '𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈Ɀ𝐀𝐖𝐀 𝐌𝐃'

        const msgContent = {
            text,
            footer: `🎬 Mirá pelis con **𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈Ɀ𝐀𝐖𝐀 𝐌𝐃**`,
            contextInfo: {
                forwardingScore: 9999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: saluranId,
                    newsletterName: saluranName,
                    serverMessageId: 127
                }
            }
        }

        if (thumbBuffer) {
            msgContent.contextInfo.externalAdReply = {
                title: film.title || 'Pelicula',
                body: `⭐ ${film.rating} | ${film.quality}`,
                thumbnail: thumbBuffer,
                mediaType: 1,
                renderLargerThumbnail: true,
                sourceUrl: url
            }
        }

        if (buttons.length > 0) {
            msgContent.interactiveButtons = buttons
        }

        await sock.sendMessage(m.chat, msgContent, { quoted: m })

        m.react('✅')

    } catch (error) {
        console.error(error)
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
