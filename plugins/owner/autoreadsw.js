import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'autoreadsw',
    alias: ['autoreadstory', 'readstory', 'bacasw'],
    category: 'owner',
    description: 'Leer automáticamente todos los estados/historias de WA',
    usage: '.autoreadsw on/off',
    example: '.autoreadsw on',
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
    const action = (m.args?.[0] || '').toLowerCase()
    const current = db.setting('autoReadSW') || { enabled: false }

    if (!action) {
        return m.reply(
            `👁️ *ᴀᴜᴛᴏ ʟᴇᴇʀ ʜɪsᴛᴏʀɪᴀs*\n\n` +
            `> Estado: *${current.enabled ? '✅ ACTIVADO' : '❌ DESACTIVADO'}*\n\n` +
            `*ᴍᴏᴅᴏ ᴅᴇ ᴜsᴏ:*\n` +
            `> \`${m.prefix}autoreadsw on\` — Activar\n` +
            `> \`${m.prefix}autoreadsw off\` — Desactivar`
        )
    }

    if (action === 'on') {
        db.setting('autoReadSW', { enabled: true })
        db.save()
        await m.react('✅')
        return m.reply(
            `✅ *ᴀᴜᴛᴏ ʟᴇᴇʀ ʜɪsᴛᴏʀɪᴀs ᴀᴄᴛɪᴠᴀᴅᴏ*\n\n` +
            `> El bot leerá automáticamente todos los estados de WA`
        )
    }

    if (action === 'off') {
        db.setting('autoReadSW', { enabled: false })
        db.save()
        await m.react('✅')
        return m.reply(`❌ *ᴀᴜᴛᴏ ʟᴇᴇʀ ʜɪsᴛᴏʀɪᴀs ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ*`)
    }

    return m.reply(`❌ Usa \`on\` o \`off\``)
}

export { pluginConfig as config, handler }
