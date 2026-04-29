import util from 'util'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'q',
    alias: ['quoted', 'inspeccionar', 'vermensaje'],
    category: 'tools',
    description: 'Obtén el JSON del mensaje que has respondido',
    usage: '.q (responde a un mensaje)',
    isOwner: true,
    cooldown: 3,
    isEnabled: true
}

async function handler(m) {
    if (!m.quoted) {
        return m.reply('❌ *Responde al mensaje que deseas inspeccionar*')
    }

    try {
        const quoted = m.quoted || {}

        // Se envía el JSON formateado del mensaje citado
        await m.reply(JSON.stringify(quoted, null, 2))
    } catch (err) {
        // En caso de error, utiliza la función de error personalizada
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
