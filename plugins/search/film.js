import axios from 'axios'
import config from '../../config.js'
import path from 'path'
import fs from 'fs'
import te from '../../src/lib/ourin-error.js'

const NEOXR_APIKEY = config.APIkey?.neoxr || 'Milik-Bot-OurinMD'

const pluginConfig = {
    name: 'pelicula',
    alias: ['film', 'movie', 'nonton', 'lk21', 'cine', 'peli'],
    category: 'search',
    description: 'Buscá películas y obtené links para ver online',
    usage: '.pelicula <título>',
    example: '.pelicula civil war',
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

const filmSessions = new Map()

let thumbFilm = null
try {
    const p = path.join(process.cwd(), 'assets/images/ourin-film.jpg')
    if (fs.existsSync(p)) thumbFilm = fs.readFileSync(p)
} catch {}

function getContextInfo(title, body, thumbnail) {
    const saluranId = config.saluran?.id || '120363208449943317@newsletter'
    const saluranName = config.saluran?.name || config.bot?.name || '𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈Ɀ𝐀𝐖𝐀 𝐌𝐃'

    const ctx = {
        forwardingScore: 9999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: saluranId,
            newsletterName: saluranName,
            serverMessageId: 127
        }
    }

    const thumb = thumbnail || thumbFilm
    if (thumb) {
        ctx.externalAdReply = {
            title,
            body,
            thumbnail: thumb,
            mediaType: 1,
            renderLargerThumbnail: true,
            sourceUrl: config.saluran?.link || ''
        }
    }

    return ctx
}

async function handler(m, { sock }) {
    const args = m.args || []
    const query = args.join(' ').trim()

    if (!query) {
        return m.reply(
            `🎬 *𝐁𝐔́𝐒𝐐𝐔𝐄𝐃𝐀 𝐃𝐄 𝐏𝐄𝐋𝐈́𝐂𝐔𝐋𝐀𝐒*\n\n` +
            `> Buscá y mirá películas online\n\n` +
            `*Formato:*\n` +
            `> \`${m.prefix}pelicula <título>\`\n\n` +
            `*Ejemplo:*\n` +
            `> \`${m.prefix}pelicula joker\``
        )
    }

    m.react('🎬')

    try {
        const apiUrl = `https://api.neoxr.eu/api/film?q=${encodeURIComponent(query)}&apikey=${NEOXR_APIKEY}`
        const { data } = await axios.get(apiUrl, { timeout: 30000 })

        if (!data?.status || !data?.data?.length) {
            m.react('❌')
            return m.reply(`❌ *𝐒𝐈𝐍 𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎𝐒*\n\n> No encontré la película "${query}"`)
        }

        const films = data.data.slice(0, 10)

        filmSessions.set(m.sender, {
            films,
            timestamp: Date.now()
        })

        // Sesión de 5 minutos
        setTimeout(() => {
            filmSessions.delete(m.sender)
        }, 300000)

        let text = `🎬 *𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎𝐒 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎𝐒*\n\n`
        text += `> Encontré *${films.length}* coincidencias para "${query}"\n\n`

        films.forEach((f, i) => {
            text += `*${i + 1}. ${f.title}*\n`
            text += `> ⭐ ${f.rating} | 📺 ${f.quality} | 📅 ${f.release}\n\n`
        })

        text += `> _Seleccioná una película de la lista_`

        const listItems = films.map((f, i) => ({
            header: '',
            title: f.title,
            description: `⭐ ${f.rating} | ${f.quality} | ${f.release}`,
            id: `${m.prefix}
