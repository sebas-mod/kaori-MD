```javascript
import axios from 'axios'
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'apkmod',
    alias: ['modapk2', 'apkpremium'],
    category: 'search',
    description: 'Buscar y descargar APK MOD Premium',
    usage: '.apkmod <búsqueda>',
    example: '.apkmod vpn',
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
    const text = m.text?.trim()

    if (!text) {
        return m.reply(
            `📱 *ʙᴜ́sǫᴜᴇᴅᴀ ᴅᴇ ᴀᴘᴋ ᴍᴏᴅ*\n\n` +
            `> Buscar APK MOD Premium\n\n` +
            `> Ejemplo:\n` +
            `\`${m.prefix}apkmod vpn\``
        )
    }

    m.react('🕕')

    try {
        const { data } = await axios.get(`https://api.neoxr.eu/api/apkmod?q=${encodeURIComponent(text)}&apikey=${NEOXR_APIKEY}`, {
            timeout: 30000
        })

        if (!data?.status || !data?.data?.length) {
            m.react('❌')
            return m.reply(`❌ No se encontraron resultados para: \`${text}\``)
        }

        const apps = data.data.slice(0, 15)

        const saluranId = config.saluran?.id || '120363208449943317@newsletter'
        const saluranName = config.saluran?.name || config.bot?.name || 'Ourin-AI'

        let caption = `📱 *Resultados de búsqueda para ${text}*\n\n`

        apps.forEach((app, i) => {
            caption += `*${i + 1}.* ${app.name}\n`
            caption += `   ├ 🏷️ ${app.version}\n`
            caption += `   └ 🔓 ${app.mod}\n\n`
        })

        const buttons = apps.slice(0, 10).map((app, i) => ({
            title: `${i + 1}. ${app.name.substring(0, 24)}`,
            description: `${app.version} • ${app.mod}`,
            id: `${m.prefix}apkmod-get ${i + 1} ${text}`
        }))

        global.apkmodSession = global.apkmodSession || {}
        global.apkmodSession[m.sender] = {
            results: apps,
            query: text,
            timestamp: Date.now()
        }

        m.react('✅')

        await sock.sendButton(m.chat, await import('fs').readFileSync('./assets/images/ourin.jpg'), caption, m, {
            buttons: [{
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                    title: '📱 Seleccionar APK MOD',
                    sections: [{
                        title: `Resultados para "${text}"`,
                        rows: buttons
                    }]
                })
            }],
            footer: 'Selecciona una opción'
        })

    } catch (err) {
        m.react('☢')
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }

```
