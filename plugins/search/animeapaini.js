import axios from 'axios'
import config from '../../config.js'
import { downloadContentFromMessage } from 'ourin'
import FormData from 'form-data'
import te from '../../src/lib/ourin-error.js'

const NEOXR_APIKEY = config.APIkey?.neoxr || 'Milik-Bot-OurinMD'

const pluginConfig = {
    name: 'queanimees',
    alias: ['whatanime', 'animesearch', 'sauceanime', 'searchanime', 'queanime'],
    category: 'search',
    description: 'Identificá un anime a partir de una imagen o screenshot',
    usage: '.queanimees (responder a una imagen)',
    example: '.queanimees',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 15,
    energi: 1,
    isEnabled: true
}

// Función para subir la imagen y obtener una URL temporal para la API
async function uploadToTempfiles(buffer) {
    const form = new FormData()
    form.append('file', buffer, { filename: 'image.jpg', contentType: 'image/jpeg' })

    const response = await axios.post('https://c.termai.cc/api/upload?key=AIzaBj7z2z3xBjsk', form, {
        headers: form.getHeaders(),
        timeout: 30000
    })

    if (response.data?.files?.[0]?.url) {
        return response.data.files[0].url
    }
    throw new Error('Error al subir la imagen al servidor temporal')
}

async function handler(m, { sock }) {
    let imageBuffer = null
    let imageMsg = null

    // Detectar si es una imagen directa o un reply
    if (m.isImage && m.message?.imageMessage) {
        imageMsg = m.message.imageMessage
    } else if (m.quoted?.isImage && m.quoted?.message?.imageMessage) {
        imageMsg = m.quoted.message.imageMessage
    } else if (m.quoted?.isImage) {
        try {
            imageBuffer = await m.quoted.download()
        } catch (e) {}
    }

    // Bloqueo de videos (la API suele pedir imágenes fijas)
    if (m.isVideo || m.quoted?.isVideo) {
        return m.reply(`❌ *𝐅𝐎𝐑𝐌𝐀𝐓𝐎 𝐍𝐎 𝐒𝐎𝐏𝐎𝐑𝐓𝐀𝐃𝐎*\n\n> Solo puedo procesar imágenes o capturas de pantalla.\n\n\`Mencioná una imagen con el comando ${m.prefix}queanimees\``)
    }

    if (!imageMsg && !imageBuffer) {
        return m.reply(
            `🔍 *¿𝐐𝐔𝐄́ 𝐀𝐍𝐈𝐌𝐄 𝐄𝐒 𝐄𝐒𝐓𝐄?*\n\n` +
            `> Mandá una imagen con el texto:\n` +
            `> \`${m.prefix}queanimees\`\n\n` +
            `> O respondé a una imagen ya enviada con:\n` +
            `> \`${m.prefix}queanimees\`\n\n` +
            `⚠️ *Nota:* Intentá que la captura sea clara y sin subtítulos grandes.`
        )
    }

    m.react('🔍')

    try {
        if (!imageBuffer && imageMsg) {
            const stream = await downloadContentFromMessage(imageMsg, 'image')
            let chunks = []
            for await (const chunk of stream) {
                chunks.push(chunk)
            }
            imageBuffer = Buffer.concat(chunks)
        }

        if (!imageBuffer || imageBuffer.length < 100) {
            m.react('❌')
            return m.reply(`❌ No pude procesar la imagen. Por favor, intentá enviarla de nuevo.`)
        }

        await m.react('🕕')

        const imageUrl = await uploadToTempfiles(imageBuffer)

        const res = await axios.get(`https://api.neoxr.eu/api/whatanime?url=${encodeURIComponent(imageUrl)}&apikey=${NEOXR_APIKEY}`, {
            timeout: 60000
        })

        if (!res.data?.status || !res.data?.data) {
            m.react('❌')
            return m.reply(`❌ No encontré ningún anime que coincida. Intentá con otra captura más nítida.`)
        }

        const d = res.data.data
        const similarity = ((d.similarity || 0) * 100).toFixed(2)

        const formatTime = (seconds) => {
            if (!seconds) return '00:00'
            const mins = Math.floor(seconds / 60)
            const secs = Math.floor(seconds % 60)
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        }

        // Limpiar el nombre del archivo para que se vea estético
        const filename = d.filename || 'Desconocido'
        const animeName = filename.replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '').replace(/\.mp4|\.mkv|\.avi/gi, '').trim() || 'Anime Desconocido'

        const caption = `🔍 *¡𝐀𝐍𝐈𝐌𝐄 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎!*\n\n` +
            `🎬 *Título:* ${animeName}\n` +
            `📺 *Episodio:* ${d.episode || 'Película/OVA'}\n` +
            `🆔 *AniList ID:* ${d.anilist || '-'}\n\n` +
            `⏱️ *Momento exacto:*\n` +
            `  ◦ Desde: \`${formatTime(d.from)}\`\n` +
            `  ◦ Hasta: \`${formatTime(d.to)}\`\n\n` +
            `📊 *Precisión:* ${similarity}%\n\n` +
            `🔗 Ver más: https://anilist.co/anime/${d.anilist || ''}\n\n` +
            `> Identificado por **𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈Ɀ𝐀𝐖𝐀 𝐌𝐃**`

        m.react('✅')

        if (d.image) {
            await sock.sendMedia(m.chat, d.image, caption, m, {
                type: 'image'
            })
        } else {
            await m.reply(caption)
        }

    } catch (error) {
        console.error(error)
        m.react('☢')
        // Usar el manejador de errores del bot
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
