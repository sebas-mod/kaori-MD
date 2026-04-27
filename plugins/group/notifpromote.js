const pluginConfig = {
    name: 'notifpromote',
    alias: ['avisopromote', 'notifdaradmin', 'notifascenso'],
    category: 'group',
    description: 'Activa o desactiva la notificación cuando alguien es ascendido a administrador',
    usage: '.notifpromote on/off',
    example: '.notifpromote on',
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
        const status = group.notifPromote === true ? '✅ Activado' : '❌ Desactivado'
        return m.reply(
            `👑 *ɴᴏᴛɪꜰɪᴄᴀᴄɪᴏ́ɴ ᴅᴇ ᴘʀᴏᴍᴏᴛᴇ*\n\n` +
            `> Estado actual: ${status}\n\n` +
            `*Uso:*\n` +
            `\`${m.prefix}notifpromote on\` - Para activar\n` +
            `\`${m.prefix}notifpromote off\` - Para desactivar\n\n` +
            `*𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃 — Ajustes*`
        )
    }
    
    if (args === 'on' || args === 'activar') {
        group.notifPromote = true
        db.setGroup(m.chat, group)
        return m.reply(`✅ *ɴᴏᴛɪꜰɪᴄᴀᴄɪᴏ́ɴ ᴅᴇ ᴘʀᴏᴍᴏᴛᴇ ᴀᴄᴛɪᴠᴀᴅᴀ*\n\n> El bot avisará cuando un miembro sea ascendido a administrador.`)
    }
    
    if (args === 'off' || args === 'desactivar') {
        group.notifPromote = false
        db.setGroup(m.chat, group)
        return m.reply(`❌ *ɴᴏᴛɪꜰɪᴄᴀᴄɪᴏ́ɴ ᴅᴇ ᴘʀᴏᴍᴏᴛᴇ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴀ*\n\n> El bot ya no enviará avisos cuando alguien sea nombrado admin.`)
    }
}

export { pluginConfig as config, handler }
