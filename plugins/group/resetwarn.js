import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'resetwarn',
    alias: ['clearwarn', 'quitarwarn', 'delwarn', 'borrarwarn'],
    category: 'group',
    description: 'Restablece las advertencias de un miembro',
    usage: '.resetwarn @user',
    example: '.resetwarn @user',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    
    let targetUser = null
    if (m.quoted) {
        targetUser = m.quoted.sender
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        targetUser = m.mentionedJid[0]
    }
    
    if (!targetUser) {
        await m.reply(
            `⚠️ *ᴍᴏᴅᴏ ᴅᴇ ᴜsᴏ*\n\n` +
            `> Responde al mensaje del usuario + \`${m.prefix}resetwarn\`\n` +
            `> O usa: \`${m.prefix}resetwarn @user\``
        )
        return
    }
    
    let groupData = db.getGroup(m.chat) || {}
    let warnings = groupData.warnings || {}
    const maxWarns = groupData.maxWarnings || 3
    
    const targetName = targetUser.split('@')[0]
    
    if (!warnings[targetUser] || warnings[targetUser].length === 0) {
        await m.reply(`✅ @${targetName} no tiene advertencias acumuladas.`, { mentions: [targetUser] })
        return
    }
    
    const prevCount = warnings[targetUser].length
    delete warnings[targetUser]
    db.setGroup(m.chat, { ...groupData, warnings: warnings })
    
    await m.reply(
        `✅ *ᴡᴀʀɴɪɴɢs ʀᴇsᴛᴀʙʟᴇᴄɪᴅᴀs*\n\n` +
        `> ¡Las advertencias de @${targetName} han sido eliminadas!\n` +
        `> Anteriormente: *${prevCount}/${maxWarns}*\n` +
        `> Actualmente: *0/${maxWarns}*\n\n` +
        `*KAORI MD — Moderación*`,
        { mentions: [targetUser] }
    )
}

export { pluginConfig as config, handler }
