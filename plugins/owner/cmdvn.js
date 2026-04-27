import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'cmdvn',
    alias: ['voicecommand', 'vncmd', 'comandovoz'],
    category: 'owner',
    description: 'Activa o desactiva la ejecución de comandos mediante notas de voz (Voice Note)',
    usage: '.cmdvn <on/off>',
    example: '.cmdvn on',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const db = getDatabase()
    const args = m.args || []
    const subCmd = args[0]?.toLowerCase()

    const current = db.setting('cmdVn') || false

    if (!subCmd || subCmd === 'status') {
        const status = current ? '✅ ACTIVADO' : '❌ DESACTIVADO'
        return m.reply(
            `🎤 *COMANDO POR VOZ (VN)*\n\n` +
            `> Estado actual: *${status}*\n\n` +
            `> \`${m.prefix}cmdvn on\` — Activar comandos vía VN\n` +
            `> \`${m.prefix}cmdvn off\` — Solo comandos vía texto (predeterminado)\n\n` +
            `> Cuando esté ON, envía una nota de voz con el nombre del comando\n` +
            `> Ejemplo: Audio diciendo "menu" → activará .menu`
        )
    }

    if (subCmd === 'on') {
        db.setting('cmdVn', true)
        return m.reply(
            `✅ *COMANDO POR VOZ ACTIVADO*\n\n` +
            `> Envía una nota de voz con el nombre del comando.\n` +
            `> El bot transcribirá y ejecutará la orden automáticamente.\n` +
            `> Ejemplo: Audio diciendo "menu" → activará .menu`
        )
    }

    if (subCmd === 'off') {
        db.setting('cmdVn', false)
        return m.reply(`❌ *COMANDO POR VOZ DESACTIVADO*. Ahora solo responderé a comandos de texto normales.`)
    }

    return m.reply(`❌ Uso incorrecto. Utiliza \`${m.prefix}cmdvn on\` o \`${m.prefix}cmdvn off\``)
}

export { pluginConfig as config, handler }
