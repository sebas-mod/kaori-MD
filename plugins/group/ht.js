import { getParticipantJids } from '../../src/lib/ourin-lid.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'hidetag',
    alias: ['ht', 'notificar', 'tag'],
    category: 'group',
    description: 'Notifica a todos los miembros (soporta responder a mensajes/media)',
    usage: '.ht [mensaje] o respondiendo a un mensaje',
    example: '.ht ¡Hola a todos! o responde a una imagen y usa .ht',
    isOwner: false,
    isPremium: false,
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
        const text = m.fullArgs?.trim()

        // ===== MODO RESPUESTA (REPLY) =====
        if (quoted) {
            const qMsg = quoted.message || {}
            const type = Object.keys(qMsg)[0]

            // ===== IMAGEN =====
            if (type === 'imageMessage') {
                const media = await quoted.download()
                const caption = qMsg.imageMessage?.caption || text || ''

                return sock.sendMessage(m.chat, {
                    image: media,
                    caption,
                    mentions
                })
            }

            // ===== VIDEO =====
            if (type === 'videoMessage') {
                const media = await quoted.download()
                const caption = qMsg.videoMessage?.caption || text || ''

                return sock.sendMessage(m.chat, {
                    video: media,
                    caption,
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

                if (text) {
                    await sock.sendMessage(m.chat, {
                        text,
                        mentions
                    })
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

                if (text) {
                    await sock.sendMessage(m.chat, {
                        text,
                        mentions
                    })
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

                if (text) {
                    await sock.sendMessage(m.chat, {
                        text,
                        mentions
                    })
                }
                return
            }

            // ===== TEXTO / OTROS =====
            const quotedText =
                quoted.text ||
                qMsg.conversation ||
                qMsg.extendedTextMessage?.text ||
                ''

            const finalText = text || quotedText

            if (!finalText) {
                return m.reply('❌ *El mensaje está vacío*')
            }

            return sock.sendMessage(m.chat, {
                text: finalText,
                mentions
            })
        }

        // ===== MODO TEXTO DIRECTO =====
        if (!text) {
            return m.reply(
                `📢 *ʜɪᴅᴇᴛᴀɢ*\n\n` +
                `• Responde a un mensaje y usa \`${m.prefix}ht\`\n` +
                `• O escribe \`${m.prefix}ht <mensaje>\`\n\n` +
                `Soporta: texto, imágenes, videos, stickers, audios y documentos.`
            )
        }

        await sock.sendMessage(m.chat, {
            text,
            mentions
        }, { quoted: m })

    } catch (err) {
        console.error(err)
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
