import { f } from '../../src/lib/ourin-http.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'nglspam',
    alias: ['spamngl', 'ngl'],
    category: 'tools',
    description: 'Envía múltiples mensajes anónimos a un perfil de NGL',
    usage: '.nglspam <username>|<mensaje>|<cantidad>',
    example: '.nglspam zann|Hola|10',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const args = m.text.split('|')
    const username = args[0]?.trim()
    const pesan = args[1]?.trim()
    const jumlah = args[2]?.trim()

    if (!username || !pesan || !jumlah) {
        return m.reply(
            `⚠️ *ᴍᴏᴅᴏ ᴅᴇ ᴜsᴏ*\n\n` +
            `> \`${m.prefix}nglspam <usuario>|<mensaje>|<cantidad>\`\n\n` +
            `> Ejemplo: \`${m.prefix}nglspam zann|Hola crack|10\``
        )
    }

    await m.react('🕕')

    try {
        // La API requiere la URL completa de NGL
        const nglUrl = `https://ngl.link/${username}`
        const apiUrl = `https://api.nexray.web.id/tools/spamngl?url=${encodeURIComponent(nglUrl)}&pesan=${encodeURIComponent(pesan)}&jumlah=${encodeURIComponent(jumlah)}`
        
        const data = await f(apiUrl)
        
        if (data.status) {
            await m.reply(`✅ ¡Spam enviado con éxito a *${username}*!\nTotal: ${jumlah} mensajes.`)
            await m.react('✅')
        } else {
            await m.reply('❌ No se pudo realizar el spam. Revisa si el usuario es correcto.')
            await m.react('❌')
        }

    } catch (err) {
        await m.react('☢')
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
