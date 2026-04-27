import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'autoreactsw',
    alias: ['autoreaccion', 'reactsw', 'autoreactstory'],
    category: 'owner',
    description: 'Reacciona automáticamente a todos los estados/stories de WA',
    usage: '.autoreactsw on/off [emoji]',
    example: '.autoreactsw on 🔥',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const db = getDatabase()
    const args = m.args || []
    const action = (args[0] || '').toLowerCase()
    const emoji = args[1] || '🔥'

    const current = db.setting('autoReactSW') || { enabled: false, emoji: '🔥' }

    if (!action) {
        return m.reply(
            `👁️ *REACCIÓN AUTOMÁTICA DE ESTADOS*\n\n` +
            `> Estado: *${current.enabled ? '✅ ACTIVADO' : '❌ DESACTIVADO'}*\n` +
            `> Emoji: *${current.emoji}*\n\n` +
            `*MODO DE USO:*\n` +
            `> \`${m.prefix}autoreactsw on\` — Activar (emoji por defecto 🔥)\n` +
            `> \`${m.prefix}autoreactsw on 😍\` — Activar con un emoji específico\n` +
            `> \`${m.prefix}autoreactsw off\` — Desactivar`
        )
    }

    if (action === 'on') {
        db.setting('autoReactSW', { enabled: true, emoji })
        db.save()
        await m.react('✅')
        return m.reply(
            `✅ *REACCIÓN AUTO DE ESTADOS ACTIVADA*\n\n` +
            `> Emoji: *${emoji}*\n` +
            `> El bot reaccionará automáticamente a todos los estados de WA.`
        )
    }

    if (action === 'off') {
        db.setting('autoReactSW', { enabled: false, emoji: current.emoji })
        db.save()
        await m.react('✅')
        return m.reply(`❌ *REACCIÓN AUTO DE ESTADOS DESACTIVADA*`)
    }

    return m.reply(`❌ ¡Usa \`on\` u \`off\`!`)
}

export { pluginConfig as config, handler }
