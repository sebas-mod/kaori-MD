import { getDatabase } from '../../src/lib/ourin-database.js'
import { getGroupMode } from '../group/botmode.js'
import { fetchGroupsSafe } from '../../src/lib/ourin-jpm-helper.js'
import config from '../../config.js'
import fs from 'fs'
import te from '../../src/lib/ourin-error.js'

let cachedThumb = null
try {
    // Intenta cargar la miniatura personalizada si existe
    if (fs.existsSync('./assets/images/ourin.jpg')) {
        cachedThumb = fs.readFileSync('./assets/images/ourin.jpg')
    }
} catch (e) {}

const pluginConfig = {
    name: 'jpm',
    alias: ['broadcast', 'anunciar', 'difusion'],
    category: 'admin',
    description: 'Enviar un mensaje a todos los grupos (JPM)',
    usage: '.jpm <mensaje>',
    example: '.jpm ¡Hola a todos!',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true
}

function getContextInfo(title = '📢 ᴊᴘᴍ', body = 'Difusión Masiva') {
    const saluranId = config.saluran?.id || '120363208449943317@newsletter'
    const saluranName = config.saluran?.name || config.bot?.name || '𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃'
    
    const contextInfo = {
        forwardingScore: 9999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: saluranId,
            newsletterName: saluranName,
            serverMessageId: 127
        }
    }
    
    if (cachedThumb) {
        contextInfo.externalAdReply = {
            title: title,
            body: body,
            thumbnail: cachedThumb,
            sourceUrl: config.saluran?.link || '',
            mediaType: 1,
            renderLargerThumbnail: true
        }
    }
    
    return contextInfo
}

async function handler(m, { sock }) {
    const db = getDatabase()
    
    if (m.isGroup) {
        const groupMode = getGroupMode(m.chat, db)
        if (groupMode !== 'md' && groupMode !== 'all') {
            return m.reply(`❌ *ᴍᴏᴅᴏ ɴᴏ ᴄᴏᴍᴘᴀᴛɪʙʟᴇ*\n\n> JPM solo está disponible en modo MD.\n\nActívalo con: \`${m.prefix}botmode md\``)
        }
    }
    
    const text = m.fullArgs?.trim() || m.text?.trim()
    if (!text) {
        return m.reply(
            `📢 *JPM (MENSAJE MASIVO)*\n\n` +
            `Sistema de difusión automática a todos los grupos donde el bot está presente.\n\n` +
            `*MODO DE USO:*\n` +
            `• *${m.prefix}jpm <mensaje>* — Envía un mensaje de texto masivo.\n` +
            `• *${m.prefix}jpm (responder a foto/video)* — Envía JPM con multimedia.\n\n` +
            `*OTROS COMANDOS:*\n` +
            `• *${m.prefix}jpmht* — JPM con Hidetag (menciona a todos).\n` +
            `• *${m.prefix}autojpm* — Programar JPM por intervalos.\n` +
            `• *${m.prefix}setdelayjpm* — Ajustar la pausa entre grupos.\n` +
            `• *${m.prefix}stopjpm* — Detener el proceso de JPM actual.\n\n` +
            `*EJEMPLO:*\n` +
            `> \`${m.prefix}jpm ¡Hola a todos! Este es un mensaje oficial.\``
        )
    }
    
    if (global.statusjpm) {
        return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> Ya hay un proceso de JPM en curso. Escribe \`${m.prefix}stopjpm\` para detenerlo.`)
    }
    
    m.react('📢')
    
    try {
        let mediaBuffer = null
        let mediaType = null
        const qmsg = m.quoted || m
        
        if (qmsg.isImage) {
            try {
                mediaBuffer = await qmsg.download()
                mediaType = 'image'
            } catch (e) {}
        } else if (qmsg.isVideo) {
            try {
                mediaBuffer = await qmsg.download()
                mediaType = 'video'
            } catch (e) {}
        }
        
        const allGroups = await fetchGroupsSafe(sock)
        let groupIds = Object.keys(allGroups)
        
        const blacklist = db.setting('jpmBlacklist') || []
        const blacklistedCount = groupIds.filter(id => blacklist.includes(id)).length
        groupIds = groupIds.filter(id => !blacklist.includes(id))
        
        if (groupIds.length === 0) {
            m.react('❌')
            return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> No se encontraron grupos disponibles${blacklistedCount > 0 ? ` (${blacklistedCount} en lista negra)` : ''}`)
        }
        
        const jedaJpm = db.setting('jedaJpm') || 5000
        
        await sock.sendMessage(m.chat, {
            text: `📢 *ɪɴɪᴄɪᴀɴᴅᴏ ᴊᴘᴍ*\n\n` +
                `╭┈┈⬡「 📋 *ᴅᴇᴛᴀʟʟᴇs* 」\n` +
                `┃ 📝 ᴍᴇɴsᴀᴊᴇ: \`${text.substring(0, 50)}${text.length > 50 ? '...' : ''}\`\n` +
                `┃ 📷 ᴍᴜʟᴛɪᴍᴇᴅɪᴀ: \`${mediaBuffer ? mediaType : 'No'}\`\n` +
                `┃ 👥 ᴅᴇsᴛɪɴᴏs: \`${groupIds.length}\` grupos\n` +
                `┃ ⏱️ ᴘᴀᴜsᴀ: \`${jedaJpm}ms\`\n` +
                `┃ 📊 ᴇsᴛɪᴍᴀᴅᴏ: \`${Math.ceil((groupIds.length * jedaJpm) / 60000)} minutos\`\n` +
                `╰┈┈⬡\n\n` +
                `> Procesando envío masivo...`,
            contextInfo: getContextInfo('📢 ᴊᴘᴍ', 'Enviando...')
        }, { quoted: m })
        
        global.statusjpm = true
        let successCount = 0
        let failedCount = 0
        
        for (const groupId of groupIds) {
            if (global.stopjpm) {
                delete global.stopjpm
                delete global.statusjpm
                
                await sock.sendMessage(m.chat, {
                    text: `⏹️ *ᴊᴘᴍ ᴅᴇᴛᴇɴɪᴅᴏ*\n\n` +
                        `╭┈┈⬡「 📊 *ᴇsᴛᴀᴅísᴛɪᴄᴀs* 」\n` +
                        `┃ ✅ ᴇxɪᴛᴏsᴏs: \`${successCount}\`\n` +
                        `┃ ❌ ꜰᴀʟʟɪᴅᴏs: \`${failedCount}\`\n` +
                        `┃ ⏸️ ᴘᴇɴᴅɪᴇɴᴛᴇs: \`${groupIds.length - successCount - failedCount}\`\n` +
                        `╰┈┈⬡`,
                    contextInfo: getContextInfo('⏹️ ᴅᴇᴛᴇɴɪᴅᴏ')
                }, { quoted: m })
                return
            }
            
            try {
                if (mediaBuffer) {
                    await sock.sendMedia(groupId, mediaBuffer, text, null, {
                        type: mediaType,
                        contextInfo: {
                            forwardingScore: 99,
                            isForwarded: true
                        }
                    })
                } else {
                    await sock.sendText(groupId, text, null, {
                        contextInfo: {
                            forwardingScore: 99,
                            isForwarded: true
                        }
                    })
                }
                successCount++
            } catch (err) {
                failedCount++
            }
            
            await new Promise(resolve => setTimeout(resolve, jedaJpm))
        }
        
        delete global.statusjpm
        
        m.react('✅')
        await sock.sendMessage(m.chat, {
            text: `✅ *ᴊᴘᴍ ꜰɪɴᴀʟɪᴢᴀᴅᴏ*\n\n` +
                `╭┈┈⬡「 📊 *ʀᴇsᴜʟᴛᴀᴅᴏs* 」\n` +
                `┃ ✅ ᴇxɪᴛᴏsᴏs: \`${successCount}\`\n` +
                `┃ ❌ ꜰᴀʟʟɪᴅᴏs: \`${failedCount}\`\n` +
                `┃ 📊 ᴛᴏᴛᴀʟ: \`${groupIds.length}\`\n` +
                `╰┈┈⬡`,
            contextInfo: getContextInfo('✅ ᴄᴏᴍᴘʟᴇᴛᴀᴅᴏ', `${successCount}/${groupIds.length}`)
        }, { quoted: m })
        
    } catch (error) {
        delete global.statusjpm
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
