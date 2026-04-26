import { nightActionHandler } from './werewolf.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'wwkill',
    alias: ['wolfkill', 'wk', 'matar'],
    category: 'game',
    description: 'Acción nocturna del Hombre Lobo - Matar objetivo',
    usage: '.wwkill <número>',
    example: '.wwkill 2',
    isOwner: false,
    isPremium: false,
    isGroup: false, // Importante: Solo en privado para no revelar el rol
    isPrivate: true,
    cooldown: 0,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    try {
        // Ejecuta la lógica centralizada en werewolf.js
        return await nightActionHandler(m, { sock })
    } catch (error) {
        console.error('[WWKILL ERROR]', error)
        // Respuesta de error personalizada del sistema OurinAI
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
