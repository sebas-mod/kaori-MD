import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'setintro',
    alias: ['setperkenalan', 'introset', 'configurarintro'],
    category: 'group',
    description: 'Configura el mensaje de introducción del grupo (Solo Admins)',
    usage: '.setintro <mensaje>',
    example: '.setintro ¡Bienvenido @user a @group!',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: true
}

async function handler(m) {
    const db = getDatabase()
    const introText = m.fullArgs?.trim() || m.text?.trim()
    
    if (!introText) {
        return m.reply(
            `📝 *sᴇᴛ ɪɴᴛʀᴏ*\n\n` +
            `> ¡Ingresa el mensaje de introducción!\n\n` +
            `*Placeholders disponibles:*\n` +
            `> @user - Nombre del usuario\n` +
            `> @group - Nombre del grupo\n` +
            `> @count - Cantidad de miembros\n` +
            `> @date - Fecha de hoy\n` +
            `> @time - Hora actual\n` +
            `> @desc - Descripción del grupo\n` +
            `> @botname - Nombre del bot\n\n` +
            `*Ejemplo:*\n` +
            `> .setintro ¡Bienvenido @user al grupo @group! 👋`
        )
    }
    
    const groupData = db.getGroup(m.chat) || db.setGroup(m.chat)
    groupData.intro = introText
    db.setGroup(m.chat, groupData)
    db.save()
    
    await m.reply(
        `✅ *ɪɴᴛʀᴏ ɢᴜᴀʀᴅᴀᴅᴀ*\n\n` +
        `> El mensaje de introducción se ha actualizado con éxito.\n\n` +
        `Escribe *${m.prefix}intro* para ver el resultado.\n\n` +
        `*𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃 — Ajustes*`
    )
}

export { pluginConfig as config, handler }
