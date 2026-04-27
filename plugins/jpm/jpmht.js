import { getDatabase } from '../../src/lib/ourin-database.js'
import { getGroupMode } from '../group/botmode.js'
import { fetchGroupsSafe } from '../../src/lib/ourin-jpm-helper.js'
import fs from 'fs'
import { config } from '../../config.js'
import te from '../../src/lib/ourin-error.js'

let cachedThumb = null
try {
    if (fs.existsSync('./assets/images/ourin.jpg')) {
        cachedThumb = fs.readFileSync('./assets/images/ourin.jpg')
    }
} catch (e) {}

const pluginConfig = {
    name: 'jpmht',
    alias: ['jpmhidetag', 'difusionht'],
    category: 'admin',
    description: 'Enviar mensaje a todos los grupos con hidetag',
    usage: '.jpmht <mensaje>',
    example: '.jpmht ¡Hola a todos!',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true
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
            `📢 *JPM HIDETAG (DIFUSIÓN MASIVA)*\n\n` +
            `Envía un mensaje a todos los grupos registrados mencionando a todos los miembros.\n\n` +
            `*MODO DE USO:*\n` +
            `• *${m.prefix}jpmht <mensaje>* — Envía texto masivo con hidetag.\n` +
            `• *${m.prefix}jpmht (responder a foto/video)* — Envía multimedia con hidetag.\n\n` +
            `*EJEMPLO:*\n` +
            `> \`${m.prefix}jpmht ¡Hola a todos! No olviden revisar nuestro canal.\``
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
        
        await m.reply(
            `📢 *ᴊᴘᴍ ʜɪᴅᴇᴛᴀɢ*\n\n` +
            `╭┈┈⬡「 📋 *ᴅᴇᴛᴀʟʟᴇs* 」\n` +
            `┃ 📝 ᴍᴇɴsᴀᴊᴇ: \`${text.substring(0, 50)}${text.length > 50 ? '...' : ''}\`\n` +
            `┃ 📷 ᴍᴜʟᴛɪᴍᴇᴅɪᴀ: \`${mediaBuffer ? mediaType : 'No'}\`\n` +
            `┃ 👥 ᴅᴇsᴛɪɴᴏs: \`${groupIds.length}\` grupos\n` +
            `┃ ⏱️ ᴘᴀᴜsᴀ: \`${jedaJpm}ms\`\n` +
            `╰┈┈⬡\n\n` +
            `> Iniciando difusión masiva con menciones...`
        )
        
        global.statusjpm = true
        let successCount = 0
        let failedCount = 0
        
        for (const groupId of groupIds) {
            if (global.stopjpm) {
                delete global.stopjpm
                delete global.statusjpm
                
                await m.reply(
                    `⏹️ *ᴊᴘᴍ ᴅᴇᴛᴇɴɪᴅᴏ*\n\n` +
                    `> ✅ Exitosos: \`${successCount}\`\n` +
                    `> ❌ Fallidos: \`${failedCount}\``
                )
                return
            }
            
            try {
                const groupData = allGroups[groupId]
                const mentions = groupData.participants.map(p => p.id || p.jid).filter(Boolean)
                const contextInfo = {
                    mentionedJid: mentions,
                    forwardingScore: 9999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: config.saluran?.id,
                        newsletterName: config.saluran?.name || 'KAORI MD',
                        serverMessageId: 127
                    },
                    externalAdReply: cachedThumb ? {
                                title: '📢 JPM HIDETAG',
                                body: 'Difusión Masiva Activa',
                                thumbnail: cachedThumb,
                                sourceUrl: config.saluran?.link || '',
                                mediaType: 1,
                                renderLargerThumbnail: true
                            } : undefined
                }

                if (mediaBuffer) {
                    await sock.sendMessage(groupId, {
                        [mediaType]: mediaBuffer,
                        caption: text,
                        mentions: mentions,
                        contextInfo: contextInfo
                    })
                } else {
                    await sock.sendMessage(groupId, { 
                        text: text,
                        mentions: mentions,
                        contextInfo: contextInfo
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
        await m.reply(
            `✅ *ᴊᴘᴍ ʜɪᴅᴇᴛᴀɢ ꜰɪɴᴀʟɪᴢᴀᴅᴏ*\n\n` +
            `╭┈┈⬡「 📊 *ʀᴇsᴜʟᴛᴀᴅᴏs* 」\n` +
            `┃ ✅ ᴇxɪᴛᴏsᴏs: \`${successCount}\`\n` +
            `┃ ❌ ꜰᴀʟʟɪᴅᴏs: \`${failedCount}\`\n` +
            `┃ 📊 ᴛᴏᴛᴀʟ: \`${groupIds.length}\`\n` +
            `╰┈┈⬡`
        )
        
    } catch (error) {
        delete global.statusjpm
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
