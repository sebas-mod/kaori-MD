import { getParticipantJids } from '../../src/lib/ourin-lid.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'htpremium',
    alias: ['htprem', 'hidetagpremium', 'hprem'],
    category: 'group',
    description: 'Hidetag Premium con soporte para etiquetas personalizadas y media',
    usage: '.htprem [etiqueta] | [mensaje] o respondiendo a un mensaje',
    example: '.htprem Todos | ¡Hola! o responde a un mensaje y usa .htprem',
    isOwner: false,
    isPremium: true,
    isGroup: true,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: false
}

async function handler(m, { sock }) {
    try {
        const groupMeta = m.groupMetadata
        const participants = groupMeta.participants || []
        const mentions = getParticipantJids(participants)
        const quoted = m.quoted
        
        // Separamos el argumento por "|" para manejar etiqueta personalizada y mensaje
        const args = m.fullArgs?.split('|')
        const customTag = args[0]?.trim()
        const text = args[1]?.trim()

        if (quoted) {
            const qMsg = quoted.message || {}
            const type = Object.keys(qMsg)[0]
            const captionText = text || customTag || '' // Prioriza mensaje tras el "|" si existe

            // ===== IMAGEN =====
            if (type === 'imageMessage') {
                const media = await quoted.download()
                return sock.sendMessage(m.chat, {
                    image: media,
                    caption: qMsg.imageMessage?.caption || captionText,
                    mentions
                })
            }

            // ===== VIDEO =====
            if (type === 'videoMessage') {
                const media = await quoted.download()
                return sock.sendMessage(m.chat, {
                    video: media,
                    caption: qMsg.videoMessage?.caption || captionText,
                    mentions
                })
            }

            // ===== STICKER =====
            if (type === 'stickerMessage') {
                const media = await quoted.download()
                await sock.sendMessage(m.chat, {
                    sticker: media,
                    mentions
                })
                if (captionText) {
                    await sock.sendMessage(m.chat, { text: captionText, mentions })
                }
                return
            }

            // ===== AUDIO =====
            if (type === 'audioMessage') {
                const media = await quoted.download()
                const audioMsg = qMsg.audioMessage || {}
                await sock.sendMessage(m.chat, {
                    audio: media,
                    mimetype: audioMsg.mimetype,
                    ptt: audioMsg.ptt || false,
                    mentions
                })
                if (captionText) {
                    await sock.sendMessage(m.chat, { text: captionText, mentions })
                }
                return
            }

            // ===== DOCUMENTO =====
            if (type === 'documentMessage') {
                const media = await quoted.download()
                const docMsg = qMsg.documentMessage || {}
                await sock.sendMessage(m.chat, {
                    document: media,
                    mimetype: docMsg.mimetype,
                    fileName: docMsg.fileName || 'archivo',
                    mentions
                })
                if (captionText) {
                    await sock.sendMessage(m.chat, { text: captionText, mentions })
                }
                return
            }

            const quotedText = quoted.text || qMsg.conversation || qMsg.extendedTextMessage?.text || ''
            const finalText = captionText || quotedText

            if (!finalText) return m.reply('❌ *El mensaje está vacío*')

            return sock.sendMessage(m.chat, { text: finalText, mentions })
        }

        // ===== MODO TEXTO PREMIUM (Etiqueta personalizada) =====
        if (!customTag) {
            return m.reply(
                `📢 *ʜɪᴅᴇᴛᴀɢ ᴘʀᴇᴍɪᴜᴍ*\n\n` +
                `• Responde a un mensaje y usa \`${m.prefix}htprem\`\n` +
                `• O usa: \`${m.prefix}htprem <etiqueta> | <mensaje>\`\n\n` +
                `*Ejemplo:* \`${m.prefix}htprem Todos | aviso importante\`\n\n` +
                `> Soporta: texto, imágenes, videos, stickers, audios y documentos.`
            )
        }

        // Si no hay "|", usamos el texto completo como mensaje y el chat como etiqueta
        const displayTag = text ? customTag : 'Notificación'
        const displayMsg = text ? text : customTag

        await sock.sendMessage(m.chat, {
            text: `@${m.chat} ${displayMsg}`,
            contextInfo: {
                groupMentions: [{
                    groupJid: m.chat,
                    groupSubject: displayTag
                }],
                mentionedJid: mentions
            }
        }, { quoted: m })

    } catch (err) {
        console.error(err)
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
