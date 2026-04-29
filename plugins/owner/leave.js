import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'salir',
    alias: ['salirgrupo', 'leavegroup', 'leave', 'bye', 'chau'],
    category: 'owner',
    description: 'El bot sale del grupo',
    usage: '.salir [enlace]',
    example: '.salir',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

function extractInviteCode(text) {
    const patterns = [
        /chat\.whatsapp\.com\/([a-zA-Z0-9]{20,})/i,
        /wa\.me\/([a-zA-Z0-9]{20,})/i
    ]
    
    for (const pattern of patterns) {
        const match = text.match(pattern)
        if (match) return match[1]
    }
    
    return null
}

async function handler(m, { sock }) {
    const input = m.args.join(' ').trim()
    
    let targetGroupJid = null
    let groupName = ''
    
    if (!input && m.isGroup) {
        targetGroupJid = m.chat
        try {
            const meta = m.groupMetadata
            groupName = meta.subject || 'este grupo'
        } catch {
            groupName = 'este grupo'
        }
    } else if (input) {
        const inviteCode = await extractInviteCode(input)
        
        if (!inviteCode) {
            return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> El enlace de invitación no es válido`)
        }
        
        try {
            const groupInfo = await sock.groupGetInviteInfo(inviteCode)
            targetGroupJid = groupInfo.id
            groupName = groupInfo.subject || 'Desconocido'
        } catch (error) {
            return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> No se pudo obtener la información del grupo desde el enlace`)
        }
    } else {
        return m.reply(
            `🚪 *sᴀʟɪʀ ᴅᴇʟ ɢʀᴜᴘᴏ*\n\n` +
            `╭┈┈⬡「 📋 *ᴍᴏᴅᴏ ᴅᴇ ᴜsᴏ* 」\n` +
            `┃ ◦ En un grupo: \`.salir\`\n` +
            `┃ ◦ Vía enlace: \`.salir <enlace>\`\n` +
            `╰┈┈⬡\n\n` +
            `\`Ejemplo: ${m.prefix}salir https://chat.whatsapp.com/xxx\``
        )
    }
    
    if (!targetGroupJid) {
        return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> Grupo no encontrado`)
    }
    
    await m.react('🕕')
    
    try {
        global.sewaLeaving = true
        
        const saluranId = config.saluran?.id || '120363208449943317@newsletter'
        const saluranName = config.saluran?.name || config.bot?.name || 'Ourin-AI'
        
        if (m.isGroup && targetGroupJid === m.chat) {
            await sock.sendMessage(m.chat, {
                text: `👋 *ᴀᴅɪᴏ́s*\n\n` +
                    `> El bot saldrá de este grupo.\n` +
                    `> ¡Gracias por usar el servicio!`,
                contextInfo: {
                    forwardingScore: 9999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: saluranId,
                        newsletterName: saluranName,
                        serverMessageId: 127
                    }
                }
            })
        }
        
        await sock.groupLeave(targetGroupJid)
        
        global.sewaLeaving = false
        
        if (!m.isGroup || targetGroupJid !== m.chat) {
            await m.react('✅')
            await m.reply(
                `✅ *sᴀʟɪᴅᴀ ᴇxɪᴛᴏsᴀ*\n\n` +
                `> El bot ha salido de: *${groupName}*`
            )
        }
        
    } catch (error) {
        global.sewaLeaving = false
        await m.react('☢')
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
