const pluginConfig = {
    name: 'setnamegc',
    alias: ['setnamegrup', 'setgcname', 'setnamegroup', 'setnombregc', 'setnombre'],
    category: 'group',
    description: 'Cambia el nombre del grupo',
    usage: '.setnamegc <nuevo nombre>',
    example: '.setnamegc Grupo Oficial',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const newName = m.text?.trim()
    
    if (!newName) {
        await m.reply(
            `⚠️ *ᴍᴏᴅᴏ ᴅᴇ ᴜsᴏ*\n\n` +
            `> \`${m.prefix}setnamegc Nuevo Nombre del Grupo\``
        )
        return
    }
    
    if (newName.length < 1 || newName.length > 100) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀᴄɪᴏ́ɴ*\n\n` +
            `> El nombre del grupo debe tener entre 1 y 100 caracteres.`
        )
        return
    }
    
    try {
        await sock.groupUpdateSubject(m.chat, newName)
        
        await m.reply(
            `✅ ¡Se ha cambiado el nombre del grupo a: *${newName}*!`
        )
    } catch (error) {
        await m.reply(
            `❌ *ꜰᴀʟʟᴏ*\n\n` +
            `> No se pudo cambiar el nombre del grupo.\n` +
            `> _Detalle: ${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }
