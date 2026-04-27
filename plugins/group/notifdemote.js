const pluginConfig = {
    name: 'notifdemote',
    alias: ['avisodemote', 'notifquitaradmin'],
    category: 'group',
    description: 'Activa o desactiva la notificación cuando alguien deja de ser administrador',
    usage: '.notifdemote on/off',
    example: '.notifdemote on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m, { sock, db }) {
    if (!m.isAdmin && !m.isOwner) {
        return m.reply(`❌ Solo los administradores del grupo pueden usar esta función.`)
    }
    
    const args = m.args[0]?.toLowerCase()
    const group = db.getGroup(m.chat) || {}
    
    if (!['on', 'off', 'activar', 'desactivar'].includes(args)) {
        const status = group.notifDemote === true ? '✅ Activado' : '❌ Desactivado'
        return m.reply(
            `👤 *ɴᴏᴛɪꜰɪᴄᴀᴄɪᴏ́ɴ ᴅᴇ ᴅᴇᴍᴏᴛᴇ*\n\n` +
            `> Estado actual: ${status}\n\n` +
            `*Uso:*\n` +
            `\`${m.prefix}notifdemote on\` - Para activar\n` +
            `\`${m.prefix}notifdemote off\` - Para desactivar\n\n` +
            `*𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃 — Ajustes*`
        )
    }
    
    if (args === 'on' || args === 'activar') {
        group.notifDemote = true
        db.setGroup(m.chat, group)
        return m.reply(`✅ *ɴᴏᴛɪꜰɪᴄᴀᴄɪᴏ́ɴ ᴅᴇ ᴅᴇᴍᴏᴛᴇ ᴀᴄᴛɪᴠᴀᴅᴀ*\n\n> El bot avisará cuando un administrador sea degradado a usuario común.`)
    }
    
    if (args === 'off' || args === 'desactivar') {
        group.notifDemote = false
        db.setGroup(m.chat, group)
        return m.reply(`❌ *ɴᴏᴛɪꜰɪᴄᴀᴄɪᴏ́ɴ ᴅᴇ ᴅᴇᴍᴏᴛᴇ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴀ*\n\n> El bot ya no enviará avisos cuando alguien deje de ser admin.`)
    }
}

export { pluginConfig as config, handler }
