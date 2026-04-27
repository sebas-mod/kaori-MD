const pluginConfig = {
    name: 'notifcierre',
    alias: ['notifclosegroup', 'notifclose', 'avisocierre'],
    category: 'group',
    description: 'Activa o desactiva la notificación cuando el grupo se cierra',
    usage: '.notifcierre on/off',
    example: '.notifcierre on',
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
        const status = group.notifCloseGroup === true ? '✅ Activado' : '❌ Desactivado'
        return m.reply(
            `🔒 *ɴᴏᴛɪꜰɪᴄᴀᴄɪᴏ́ɴ ᴅᴇ ᴄɪᴇʀʀᴇ*\n\n` +
            `> Estado actual: ${status}\n\n` +
            `*Uso:*\n` +
            `\`${m.prefix}notifcierre on\` - Para activar\n` +
            `\`${m.prefix}notifcierre off\` - Para desactivar\n\n` +
            `*𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃 — Ajustes*`
        )
    }
    
    if (args === 'on' || args === 'activar') {
        group.notifCloseGroup = true
        db.setGroup(m.chat, group)
        return m.reply(`✅ *ɴᴏᴛɪꜰɪᴄᴀᴄɪᴏ́ɴ ᴅᴇ ᴄɪᴇʀʀᴇ ᴀᴄᴛɪᴠᴀᴅᴀ*\n\n> El bot avisará a los miembros cuando el grupo sea cerrado.`)
    }
    
    if (args === 'off' || args === 'desactivar') {
        group.notifCloseGroup = false
        db.setGroup(m.chat, group)
        return m.reply(`❌ *ɴᴏᴛɪꜰɪᴄᴀᴄɪᴏ́ɴ ᴅᴇ ᴄɪᴇʀʀᴇ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴀ*\n\n> El bot ya no enviará avisos al cerrar el grupo.`)
    }
}

export { pluginConfig as config, handler }
