const pluginConfig = {
    name: 'setdeskgc',
    alias: ['setdesc', 'setdescgc', 'setdescripcion', 'setdescrip'],
    category: 'group',
    description: 'Cambia la descripción del grupo',
    usage: '.setdeskgc <nueva descripción>',
    example: '.setdeskgc Grupo para programadores',
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
    const newDesc = m.text?.trim() || ''
    if (!m.text && m.args?.length === 0) {
        await m.reply(
            `⚠️ *ᴍᴏᴅᴏ ᴅᴇ ᴜsᴏ*\n\n` +
            `> \`${m.prefix}setdeskgc Nueva descripción\`\n` +
            `> \`${m.prefix}setdeskgc clear\` - Borrar descripción`
        )
        return
    }
    const descToSet = newDesc.toLowerCase() === 'clear' ? '' : newDesc
    
    if (descToSet.length > 2048) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀᴄɪᴏ́ɴ*\n\n` +
            `> La descripción no puede superar los 2048 caracteres.`
        )
        return
    }
    
    try {
        await sock.groupUpdateDescription(m.chat, descToSet)
        
        if (descToSet) {
            await m.reply(
                `✅ ¡La descripción del grupo ha sido actualizada con éxito!`
            )
        } else {
            await m.reply(
                `✅ ¡La descripción del grupo ha sido eliminada!`
            )
        }
    } catch (error) {
        await m.reply(
            `❌ *ꜰᴀʟʟᴏ*\n\n` +
            `> No se pudo cambiar la descripción del grupo.\n` +
            `> _Detalle: ${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }
