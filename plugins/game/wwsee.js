import { nightActionHandler } from './werewolf.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'wwsee',
    alias: ['seer', 'vision', 'ver', 'vidente', 'wse'],
    category: 'game',
    description: 'Acción nocturna de la Vidente - Ver rol de un jugador',
    usage: '.wwsee <número>',
    example: '.wwsee 1',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: true,
    cooldown: 0,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    try {
        // La lógica en werewolf.js se encarga de mostrar el rol del objetivo
        return await nightActionHandler(m, { sock })
    } catch (error) {
        console.error('[WWSEE ERROR]', error)
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
