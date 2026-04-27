import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'

const pluginConfig = {
    name: ['desactivarenergia', 'activarenergia'],
    alias: ['offenergia', 'onenergia', 'disableenergi', 'enableenergi'],
    category: 'owner',
    description: 'Activa o desactiva el sistema de energía global',
    usage: '.desactivarenergia o .activarenergia',
    example: '.desactivarenergia',
    isOwner: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const db = getDatabase()
    const cmd = m.command.toLowerCase()
    
    // Detectamos si el comando ejecutado es para activar
    const isEnable = ['activarenergia', 'onenergia', 'enableenergi'].includes(cmd)

    db.setting('energi', isEnable)
    db.save()

    await m.react(isEnable ? '⚡' : '🔌')
    
    return m.reply(
        isEnable
            ? '⚡ *SISTEMA DE ENERGÍA ACTIVADO*\n\n> Ahora cada comando consumirá energía de los usuarios.'
            : '🔌 *SISTEMA DE ENERGÍA DESACTIVADO*\n\n> Los comandos ya no requieren energía para ser utilizados.'
    )
}

export { pluginConfig as config, handler }
