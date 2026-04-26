import { nightActionHandler } from './werewolf.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'wwprotect',
    alias: ['protect', 'guardar', 'proteger', 'wpr'],
    category: 'game',
    description: 'Acción nocturna del Guardián - Proteger objetivo',
    usage: '.wwprotect <número>',
    example: '.wwprotect 3',
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
        // Ejecuta la lógica compartida para acciones nocturnas
        return await nightActionHandler(m, { sock })
    } catch (error) {
        console.error('[WWPROTECT ERROR]', error)
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
