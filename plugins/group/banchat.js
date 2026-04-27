import { getDatabase } from '../../src/lib/ourin-database.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'banchat',
    alias: ['bangroup', 'bangrup', 'unbanchat', 'unbangroup', 'banearchat', 'desbanearchat'],
    category: 'group',
    description: 'Banea el grupo para que no se pueda usar el bot (Solo Owner)',
    usage: '.banchat',
    example: '.banchat',
    isOwner: true,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const cmd = m.command.toLowerCase()
    const isUnban = ['unbanchat', 'unbangroup', 'desbanearchat'].includes(cmd)
    
    try {
        const groupMeta = m.groupMetadata
        const groupName = groupMeta.subject || 'Desconocido'
        const groupData = db.getGroup(m.chat) || {}
        
        if (isUnban) {
            if (!groupData.isBanned) {
                return m.reply(
                    `⚠️ *ᴇʟ ᴄʜᴀᴛ ɴᴏ ᴇsᴛá ʙᴀɴᴇᴀᴅᴏ*\n\n` +
                    `> Este grupo no tiene restricciones actuales.\n` +
                    `> Todos los usuarios pueden usar el bot.`
                )
            }
            
            db.setGroup(m.chat, { ...groupData, isBanned: false })
            
            return sock.sendMessage(m.chat, {
                text: `✅ *ᴄʜᴀᴛ ᴅᴇsʙᴀɴᴇᴀᴅᴏ*\n\n` +
                    `╭┈┈⬡「 📋 *ᴅᴇᴛᴀʟʟᴇs* 」\n` +
                    `┃ 📛 ɢʀᴜᴘᴏ: *${groupName}*\n` +
                    `┃ 📊 ᴇsᴛᴀᴅᴏ: *✅ ACTIVO*\n` +
                    `┃ 👤 ᴀᴄᴄɪóɴ ᴘᴏʀ: @${m.sender.split('@')[0]}\n` +
                    `╰┈┈⬡\n\n` +
                    `> El acceso a **ᴋᴀᴏʀɪ ᴍᴅ** ha sido restaurado para todos.`,
                mentions: [m.sender]
            }, { quoted: m })
        }
        
        if (groupData.isBanned) {
            return m.reply(
                `⚠️ *ᴇʟ ᴄʜᴀᴛ ʏᴀ ᴇsᴛá ʙᴀɴᴇᴀᴅᴏ*\n\n` +
                `> Este grupo ya se encuentra en la lista negra.\n` +
                `> Usa \`.unbanchat\` para habilitarlo de nuevo.`
            )
        }
        
        db.setGroup(m.chat, { ...groupData, isBanned: true })
        
        await m.reply(`🚫 *ᴄʜᴀᴛ ʙᴀɴᴇᴀᴅᴏ*\n\n` +
                `╭┈┈⬡「 📋 *ᴅᴇᴛᴀʟʟᴇs* 」\n` +
                `┃ 📛 ɢʀᴜᴘᴏ: *${groupName}*\n` +
                `┃ 📊 ᴇsᴛᴀᴅᴏ: *🔴 BANEADO*\n` +
                `┃ 👤 ᴀᴄᴄɪóɴ ᴘᴏʀ: @${m.sender.split('@')[0]}\n` +
                `╰┈┈⬡\n\n` +
                `> Los miembros ya no pueden usar comandos aquí.\n` +
                `> Solo el Owner tiene acceso permitido.`, { mentions: [m.sender] })
        
    } catch (error) {
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
