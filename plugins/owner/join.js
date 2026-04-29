import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'unirse',
    alias: ['unirsegrupo', 'join', 'entrar'],
    category: 'owner',
    description: 'El bot se une a un grupo mediante un enlace de invitación',
    usage: '.unirse <enlace>',
    example: '.unirse https://chat.whatsapp.com/xxx',
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
        /wa\.me\/([a-zA-Z0-9]{20,})/i,
        /^([a-zA-Z0-9]{20,})$/
    ]
    
    for (const pattern of patterns) {
        const match = text?.match(pattern)
        if (match) return match[1]
    }
    
    return null
}

async function handler(m, { sock }) {
    const input = m.args.join(' ').trim()
    
    if (!input) {
        return m.reply(
            `🔗 *ᴜɴɪʀsᴇ ᴀʟ ɢʀᴜᴘᴏ*\n\n` +
            `╭┈┈⬡「 📋 *ᴍᴏᴅᴏ ᴅᴇ ᴜsᴏ* 」\n` +
            `┃ ◦ Envía el enlace de invitación\n` +
            `┃ ◦ El bot se unirá automáticamente\n` +
            `╰┈┈⬡\n\n` +
            `\`Ejemplo: ${m.prefix}unirse https://chat.whatsapp.com/xxx\``
        )
    }
    
    const inviteCode = extractInviteCode(input)
    
    if (!inviteCode) {
        return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> El enlace de invitación no es válido`)
    }
    
    await m.react('🕕')
    
    try {
        const groupInfo = await sock.groupGetInviteInfo(inviteCode)
        
        if (!groupInfo) {
            await m.react('❌')
            return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> No se pudo obtener la información del grupo`)
        }
        
        const botJid = sock.user?.id?.replace(/:.*@/, '@') || ''
        const isMember = groupInfo.participants?.some(p => 
            p.id === botJid || p.id?.includes(sock.user?.id?.split(':')[0])
        )
        
        if (isMember) {
            await m.react('❌')
            return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> El bot ya es miembro de este grupo`)
        }
        
        await sock.groupAcceptInvite(inviteCode)
        
        await m.react('✅')
        
        const saluranId = config.saluran?.id || '120363208449943317@newsletter'
        const saluranName = config.saluran?.name || config.bot?.name || 'Ourin-AI'
        
        await m.reply({
            text: `✅ *ᴜɴɪᴅᴏ ᴄᴏɴ ᴇ́xɪᴛᴏ*\n\n` +
                `╭┈┈⬡「 📋 *ɪɴғᴏ ᴅᴇʟ ɢʀᴜᴘᴏ* 」\n` +
                `┃ 🏠 ɴᴏᴍʙʀᴇ: *${groupInfo.subject || 'Desconocido'}*\n` +
                `┃ 👥 ᴍɪᴇᴍʙʀᴏs: *${groupInfo.size || groupInfo.participants?.length || 0}*\n` +
                `┃ 👤 ᴄʀᴇᴀᴅᴏʀ: *${groupInfo.owner?.split('@')[0] || 'Desconocido'}*\n` +
                `╰┈┈⬡`,
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
        
    } catch (error) {
        await m.react('❌')
        
        let errorMsg = error.message
        if (errorMsg.includes('not-authorized')) {
            errorMsg = 'El enlace ya no es válido o ha expirado'
        } else if (errorMsg.includes('gone')) {
            errorMsg = 'El grupo ya no existe'
        } else if (errorMsg.includes('conflict')) {
            errorMsg = 'El bot ya es miembro'
        }
        
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
