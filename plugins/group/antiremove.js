const pluginConfig = {
    name: 'antiremove',
    alias: ['antidelete', 'antieliminar', 'ar'],
    category: 'group',
    description: 'Activa o desactiva la función anti-eliminación de mensajes en el grupo',
    usage: '.antiremove <on/off>',
    example: '.antiremove on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: false
}

async function handler(m, { sock, db }) {
    const action = (m.args || [])[0]?.toLowerCase()
    const group = db.getGroup(m.chat) || {}

    if (!action) {
        const status = group.antiremove || 'off'
        await m.reply(
            `🗑️ *ᴀɴᴛɪ-ᴇʟɪᴍɪɴᴀʀ | ᴋᴀᴏʀɪ ᴍᴅ*\n\n` +
            `> Estado: *${status === 'on' ? '✅ Activo' : '❌ Desactivado'}*\n\n` +
            `> Usa: \`.antiremove on/off\``
        )
        return
    }

    if (action === 'on') {
        db.setGroup(m.chat, { ...group, antiremove: 'on' })
        m.react('✅')
        await m.reply(`✅ *AntiRemove activado*\n> Los mensajes que sean eliminados serán reenviados por ᴋᴀᴏʀɪ ᴍᴅ.`)
        return
    }

    if (action === 'off') {
        db.setGroup(m.chat, { ...group, antiremove: 'off' })
        m.react('❌')
        await m.reply(`❌ *AntiRemove desactivado*`)
        return
    }

    await m.reply(`❌ Opción no válida. Usa \`.antiremove on\` o \`.antiremove off\``)
}

export { pluginConfig as config, handler }
