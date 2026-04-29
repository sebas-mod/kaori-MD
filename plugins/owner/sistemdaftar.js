import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'

const pluginConfig = {
    name: 'sistemdaftar',
    alias: ['modoregistro', 'registrowajib', 'togglereg', 'sistemaregistro'],
    category: 'owner',
    description: 'Activa o desactiva el sistema de registro obligatorio',
    usage: '.sistemdaftar <on/off>',
    example: '.sistemdaftar on',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.text?.trim().toLowerCase()
    
    const currentStatus = db.setting('registrationRequired') ?? config.registration?.enabled ?? false
    
    const saluranId = config.saluran?.id || '120363208449943317@newsletter'
    const saluranName = config.saluran?.name || config.bot?.name || 'Ourin-AI'
    
    if (!args) {
        return m.reply(
            `⚙️ *sɪsᴛᴇᴍᴀ ᴅᴇ ʀᴇɢɪsᴛʀᴏ*\n\n` +
            `Estado: ${currentStatus ? '✅ ON (Registro Obligatorio)' : '❌ OFF'}\n\n` +
            `*Uso:*\n` +
            `> \`${m.prefix}sistemdaftar on\` - Activar obligación de registro\n` +
            `> \`${m.prefix}sistemdaftar off\` - Desactivar obligación de registro\n\n` +
            `> Si está en ON, el usuario debe usar \`${m.prefix}registrar\` antes de usar comandos.`
        )
    }
    
    if (args === 'on' || args === '1' || args === 'true') {
        db.setting('registrationRequired', true)
        await db.save()
        
        await sock.sendMessage(m.chat, {
            text: `✅ *¡sɪsᴛᴇᴍᴀ ᴅᴇ ʀᴇɢɪsᴛʀᴏ ᴀᴄᴛɪᴠᴀᴅᴏ!*\n\n` +
                `¡Los usuarios ahora deben registrarse antes de usar los comandos!\n\n` +
                `> Comando: \`${m.prefix}registrar <nombre>\``,
            contextInfo: {
                forwardingScore: 9999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: saluranId,
                    newsletterName: saluranName,
                    serverMessageId: 127
                }
            }
        }, { quoted: m })
        
        await m.react('✅')
        return
    }
    
    if (args === 'off' || args === '0' || args === 'false') {
        db.setting('registrationRequired', false)
        await db.save()
        
        await sock.sendMessage(m.chat, {
            text: `❌ *¡sɪsᴛᴇᴍᴀ ᴅᴇ ʀᴇɢɪsᴛʀᴏ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ!*\n\n` +
                `Los usuarios no necesitan registrarse para usar los comandos.`,
            contextInfo: {
                forwardingScore: 9999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: saluranId,
                    newsletterName: saluranName,
                    serverMessageId: 127
                }
            }
        }, { quoted: m })
        
        await m.react('❌')
        return
    }
    
    return m.reply(`❌ ¡Opción no válida!\n\n> Usa: \`on\` u \`off\``)
}

export { pluginConfig as config, handler }
