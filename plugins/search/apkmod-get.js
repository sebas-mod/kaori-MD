import axios from 'axios'
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'apkmod-get',
    alias: ['apkmodget', 'getapkmod', 'descargarapkmod'],
    category: 'search',
    description: 'Descargá un APK MOD específico de los resultados de búsqueda',
    usage: '.apkmod-get <número> <búsqueda>',
    example: '.apkmod-get 1 vpn',
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
    const args = m.args || []
    const no = parseInt(args[0])
    const query = args.slice(1).join(' ')

    if (!no || !query) {
        return m.reply(`❌ *FORMATO INCORRECTO*\n\n> Uso: \`${m.prefix}apkmod-get <número> <búsqueda>\`\n> Ejemplo: \`${m.prefix}apkmod-get 1 minecraft\``)
    }

    m.react('🕕')

    try {
        const { data } = await axios.get(`https://api.neoxr.eu/api/apkmod?q=${encodeURIComponent(query)}&no=${no}&apikey=${NEOXR_APIKEY}`, {
            timeout: 60000
        })

        if (!data?.status || !data?.data) {
            throw new Error('No se pudieron obtener los detalles del APK')
        }

        const app = data.data
        const file = data.file

        const saluranId = config.saluran?.id || '120363208449943317@newsletter'
        const saluranName = config.saluran?.name || config.bot?.name || '𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈Ɀ𝐀𝐖𝐀 𝐌𝐃'

        if (file?.url) {
            // Enviar el archivo APK MOD
            await sock.sendMessage(m.chat, {
                document: { url: file.url?.trim() },
                fileName: file.filename || `${app.name}.apk`,
                mimetype: 'application/vnd.android.package-archive',
                contextInfo: {
                    forwardingScore: 99,
                    isForwarded: true,
                    externalAdReply: {
                        title: '📥 Descargando Mod',
                        body: app.name,
                        mediaType: 1,
                        sourceUrl: app.url || ''
                    }
                }
            }, { quoted: m })

            m.react('✅')
        } else {
            let caption = `> ⚠️ El enlace de descarga no está disponible en este momento.`
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
                }
            }, { quoted: m })

            m.react('⚠️')
        }

    } catch (err) {
        console.error(err)
        m.react('☢')
        // Usar el manejador de errores configurado en el sistema
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
