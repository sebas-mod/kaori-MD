const pluginConfig = {
    name: 'antitagsw',
    alias: ['antitag', 'antistatustag'],
    category: 'group',
    description: 'Activa o desactiva la función anti-tag de estados en el grupo',
    usage: '.antitagsw <on/off>',
    example: '.antitagsw on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

async function handler(m, { sock, db }) {
    const args = m.args || []
    const action = args[0]?.toLowerCase()
    const groupId = m.chat
    const group = db.getGroup(groupId) || {}

    if (!action) {
        const status = group.antitagsw || 'off'

        await m.reply(
            `📢 *ᴀɴᴛɪᴛᴀɢsᴡ | ᴋᴀᴏʀɪ ᴍᴅ*\n\n` +
            `> Estado: *${status === 'on' ? '✅ Activo' : '❌ Desactivado'}*\n\n` +
            `> Esta función elimina los mensajes que taguean estados\n` +
            `> (groupStatusMentionMessage)\n\n` +
            `\`\`\`━━━ OPCIONES ━━━\`\`\`\n` +
            `> \`${m.prefix}antitagsw on\` → Activar\n` +
            `> \`${m.prefix}antitagsw off\` → Desactivar`
        )
        return
    }

    if (action === 'on') {
        db.setGroup(groupId, { ...group, antitagsw: 'on' })
        await m.reply(
            `✅ *ᴀɴᴛɪᴛᴀɢsᴡ ᴀᴄᴛɪᴠᴏ*\n\n` +
            `> ¡El anti-tag de estados se activó correctamente!\n` +
            `> Los mensajes de este tipo serán eliminados automáticamente.`
        )
        return
    }

    if (action === 'off') {
        db.setGroup(groupId, { ...group, antitagsw: 'off' })
        await m.reply(
            `❌ *ᴀɴᴛɪᴛᴀɢsᴡ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ*\n\n` +
            `> El anti-tag de estados ha sido desactivado.`
        )
        return
    }

    await m.reply(
        `❌ *ᴏᴘᴄɪóɴ ɴᴏ ᴠáʟɪᴅᴀ*\n\n` +
        `> Usa: on o off`
    )
}

export { pluginConfig as config, handler }
