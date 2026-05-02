import axios from 'axios'
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'android1-get',
    alias: ['an1get', 'an1dl', 'descargarapk'],
    category: 'search',
    description: 'Descargá APKs directamente desde Android1',
    usage: '.android1-get <url>',
    example: '.android1-get https://an1.com/xxx',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 15,
    energi: 1,
    isEnabled: true
}

const NEOXR_APIKEY = config.APIkey?.neoxr || 'Milik-Bot-OurinMD'

async function handler(m, { sock }) {
    const url = m.text?.trim()

    if (!url || !url.includes('an1.com')) {
        return m.reply(`❌ ¡URL no válida! Pasame un link directo de an1.com`)
    }

    m.react('🕕')

    try {
        const { data } = await axios.get(`https://api.neoxr.eu/api/an1-get?url=${encodeURIComponent(url)}&apikey=${NEOXR_APIKEY}`, {
            timeout: 60000
        })

        if (!data?.status || !data?.data) {
            throw new Error('Error al obtener los detalles del APK')
        }

        const app = data.data
        const saluranId = config.saluran?.id || '120363208449943317@newsletter'
        const saluranName = config.saluran?.name || config.bot?.name || '𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈Ɀ𝐀𝐖𝐀 𝐌𝐃'

        if (app.url) {
            // Enviar el archivo APK
            await sock.sendMessage(m.chat, {
                document: { url: app.url },
                fileName: app.name,
                mimetype: 'application/vnd.android.package-archive',
                contextInfo: {
                    forwardingScore: 99,
                    isForwarded: true,
                    externalAdReply: {
                        title: '📥 Descarga de APK',
                        body: app.name,
                        mediaType: 1,
                        sourceUrl: url
                    }
                }
            }, { quoted: m })

            m.react('✅')
        } else {
            let caption = `> ⚠️ No se pudo generar el link de descarga directa.`

            await sock.sendMessage(m.chat, {
                text: caption,
                contextInfo: {
                    forwardingScore: 9999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: saluranId,
                        newsletterName: saluranName,
                        serverMessageId: 127
                    }
                },
                interactiveButtons: [{
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🌐 Abrir en el Navegador',
                        url: url
                    })
                }]
            }, { quoted: m })

            m.react('⚠️')
        }

    } catch (err) {
        console.error(err)
        m.react('☢')
        // Usar el manejador de errores personalizado del bot
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
