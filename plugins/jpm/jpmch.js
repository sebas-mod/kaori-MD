import { getDatabase } from '../../src/lib/ourin-database.js'
import { getGroupMode } from '../group/botmode.js'
import config from '../../config.js'
import { getBinaryNodeChild } from 'ourin'
import fs from 'fs'
import te from '../../src/lib/ourin-error.js'

let cachedThumb = null
try {
    if (fs.existsSync('./assets/images/ourin.jpg')) {
        cachedThumb = fs.readFileSync('./assets/images/ourin.jpg')
    }
} catch (e) {}

const pluginConfig = {
    name: 'jpmch',
    alias: ['jpmcanal', 'jpmchannel', 'difusioncanal'],
    category: 'admin',
    description: 'Enviar un mensaje a todos los canales de WhatsApp suscritos',
    usage: '.jpmch <mensaje>',
    example: '.jpmch ¡Hola a todos!',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true
}

/**
 * Fetch todos los canales suscritos
 * @param {Object} sock - Socket Baileys
 * @returns {Promise<Object>} Lista de canales
 */
async function fetchAllSubscribedChannels(sock) {
    const data = {}
    const encoder = new TextEncoder()
    const queryIds = ['6388546374527196']
    
    for (const queryId of queryIds) {
        try {
            const result = await sock.query({
                tag: 'iq',
                attrs: {
                    id: sock.generateMessageTag(),
                    type: 'get',
                    xmlns: 'w:mex',
                    to: '@s.whatsapp.net',
                },
                content: [
                    {
                        tag: 'query',
                        attrs: { 'query_id': queryId },
                        content: encoder.encode(JSON.stringify({
                            variables: {}
                        }))
                    }
                ]
            })
            const child = getBinaryNodeChild(result, 'result')
            if (!child?.content) continue
            const parsed = JSON.parse(child.content.toString())
            const newsletters = parsed?.data?.['xwa2_newsletter_subscribed'] 
                || parsed?.data?.['newsletter_subscribed']
                || parsed?.data?.['subscribed']
                || []
            
            if (newsletters.length > 0) {
                for (const ch of newsletters) {
                    if (ch.id) {
                        data[ch.id] = {
                            id: ch.id,
                            name: ch.thread_metadata?.name?.text || ch.name || 'Desconocido',
                            subscribers: ch.thread_metadata?.subscribers_count || 0
                        }
                    }
                }
                break
            }
        } catch (e) {
            continue
        }
    }
    return data
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
            `📢 *JPM CANALES (MENSAJE MASIVO)*\n\n` +
            `Sistema de difusión automática a todos los canales de WhatsApp suscritos al bot.\n\n` +
            `*MODO DE USO:*\n` +
            `• *${m.prefix}jpmch <mensaje>* — Envía texto a los canales.\n` +
            `• *${m.prefix}jpmch (responder a foto/video)* — Envía multimedia a los canales.\n\n` +
            `*EJEMPLO:*\n` +
            `> \`${m.prefix}jpmch ¡Hola a todos, sigan nuestras actualizaciones!\``
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
        
        let channels = {}
        try {
            channels = await fetchAllSubscribedChannels(sock)
        } catch (e) {
            m.react('☢')
            return m.reply(te(m.prefix, m.command, m.pushName))
        }
        
        const channelIds = Object.keys(channels)
        
        if (channelIds.length === 0) {
            m.react('❌')
            return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> No se encontraron canales o el bot no está suscrito a ninguno.`)
        }

        const jedaJpm = db.setting('jedaJpm') || 5000
        
        await m.reply(
            `📢 *ᴊᴘᴍ ᴄᴀɴᴀʟᴇs*\n\n` +
            `╭┈┈⬡「 📋 *ᴅᴇᴛᴀʟʟᴇs* 」\n` +
            `┃ 📝 ᴍᴇɴsᴀᴊᴇ: \`${text.substring(0, 50)}${text.length > 50 ? '...' : ''}\`\n` +
            `┃ 📷 ᴍᴜʟᴛɪᴍᴇᴅɪᴀ: \`${mediaBuffer ? mediaType : 'No'}\`\n` +
            `┃ 📺 ᴛᴀʀɢᴇᴛ: \`${channelIds.length}\` canales\n` +
            `┃ ⏱️ ᴘᴀᴜsᴀ: \`${jedaJpm}ms\`\n` +
            `╰┈┈⬡\n\n` +
            `> Iniciando envío masivo a canales...`
        )
        
        global.statusjpm = true
        let successCount = 0
        let failedCount = 0
        
        for (const chId of channelIds) {
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

            let contextInfo = {
                isForwarded: true,
                forwardingScore: 99,
                forwardedNewsletterMessageInfo: {
                    newsletterName: config.bot?.name || 'KAORI MD',
                    newsletterJid: config.saluran?.id || '',
                }
            }
            
            if (cachedThumb) {
                contextInfo.externalAdReply = {
                    title: '📢 JPM CANAL',
                    body: 'Difusión Oficial',
                    thumbnail: cachedThumb,
                    mediaType: 1,
                    sourceUrl: config.saluran?.link || '',
                    renderLargerThumbnail: true,
                }
            }
            
            try {
                if (mediaBuffer) {
                    await sock.sendMessage(chId, {
                        [mediaType]: mediaBuffer,
                        caption: text,
                        contextInfo
                    })
                } else {
                    await sock.sendMessage(chId, { text: text, contextInfo })
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
            `✅ *ᴊᴘᴍ ꜰɪɴᴀʟɪᴢᴀᴅᴏ*\n\n` +
            `╭┈┈⬡「 📊 *ʀᴇsᴜʟᴛᴀᴅᴏs* 」\n` +
            `┃ ✅ ᴇxɪᴛᴏsᴏs: \`${successCount}\`\n` +
            `┃ ❌ ꜰᴀʟʟɪᴅᴏs: \`${failedCount}\`\n` +
            `┃ 📊 ᴛᴏᴛᴀʟ: \`${channelIds.length}\`\n` +
            `╰┈┈⬡`
        )
        
    } catch (error) {
        delete global.statusjpm
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
