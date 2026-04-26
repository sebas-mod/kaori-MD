import { nightActionHandler } from './werewolf.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'wwsorcerer',
    alias: ['sorcerer', 'hechicero', 'wws'],
    category: 'game',
    description: 'Acción nocturna del Hechicero - Detectar si el objetivo es la Vidente',
    usage: '.wwsorcerer <número>',
    example: '.wwsorcerer 3',
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
        // Ejecuta la lógica centralizada para detectar a la vidente
        return await nightActionHandler(m, { sock })
    } catch (error) {
        console.error('[WWSORCERER ERROR]', error)
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
