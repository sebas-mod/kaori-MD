import axios from 'axios'
import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'android1',
    alias: ['an1', 'buscarapk', 'modapk'],
    category: 'search',
    description: 'Buscá y descargá APKs MOD desde Android1',
    usage: '.android1 <búsqueda>',
    example: '.android1 Subway Surfers',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

const NEOXR_APIKEY = config.APIkey?.neoxr || 'Milik-Bot-OurinMD'

async function handler(m, { sock }) {
    const db = getDatabase()
    const text = m.text?.trim()

    if (!text) {
        return m.reply(
            `📱 *𝐁𝐔́𝐒𝐐𝐔𝐄𝐃𝐀 𝐄𝐍 𝐀𝐍𝐃𝐑𝐎𝐈𝐃1*\n\n` +
            `╭┈┈⬡「 📋 *𝐂𝐎́𝐌𝐎 𝐔𝐒𝐀𝐑* 」\n` +
            `┃ 🔍 \`${m.prefix}android1 <nombre>\`\n` +
            `╰┈┈⬡\n\n` +
            `> Ejemplo:\n` +
            `\`${m.prefix}android1 Subway Surfers\``
        )
    }

    m.react('🔍')

    try {
        const { data } = await axios.get(`https://api.neoxr.eu/api/an1?q=${encodeURIComponent(text)}&apikey=${NEOXR_APIKEY}`, {
            timeout: 30000
        })

        if (!data?.status || !data?.data?.length) {
            m.react('❌')
            return m.reply(`❌ No encontré resultados para: \`${text}\``)
        }

        const apps = data.data.slice(0, 10)

        // Manejo de sesión para persistencia si fuera necesario
        if (!db.db.data.sessions) db.db.data.sessions = {}
        const sessionKey = `an1_${m.sender}`
        db.db.data.sessions[sessionKey] = {
            results: apps,
            query: text,
            timestamp: Date.now()
        }
        db.save()

        const saluranId = config.saluran?.id || '120363208449943317@newsletter'
        const saluranName = config.saluran?.name || config.bot?.name || '𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈Ɀ𝐀𝐖𝐀 𝐌𝐃'

        let caption = `📱 *Resultados para:* _${text}_\n`
        caption += `Se encontraron *${apps.length}* aplicaciones disponibles.\n\n`

        apps.forEach((app, i) => {
            caption += `*${i + 1}.* ${app.name}\n`
            caption += `   ├ 👤 ${app.developer}\n`
            caption += `   └ ⭐ ${app.rating}/5\n\n`
        })

        caption += `> Seleccioná una opción para descargar el archivo.`

        const buttons = apps.map((app, i) => ({
            title: `${app.name.substring(0, 20)}`,
            description: `Desarrollador: ${app.developer} • ⭐${app.rating}`,
            id: `${m.prefix}android1-get ${app.url}`
        }))

        m.react('✅')

        // Usando el método sendButton configurado para tu bot
        await sock.sendButton(m.chat, await import('fs').readFileSync('./assets/images/ourin.jpg'), caption, m, {
            buttons: [{
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                    title: 'Ver aplicaciones',
                    sections: [{
                        title: 'Resultados de Android1',
                        rows: buttons
                    }]
                })
            }],
            footer: '📱 𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈Ɀ𝐀𝐖𝐀 𝐌𝐃 • Android1 Search'
        })

    } catch (err) {
        console.error(err)
        m.react('☢')
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
