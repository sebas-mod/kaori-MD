import config from '../../config.js'
import { getParticipantJids } from '../../src/lib/ourin-lid.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'notify',
    alias: ['n', 'h2', 'ht2', 'notificar2'],
    category: 'group',
    description: 'Notifica a todos los miembros con un estilo de cita falso',
    usage: '.n <texto> o respondiendo a un mensaje',
    example: '.n ¡Atención a todos!',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

async function handler(m, { sock }) {
    const text = m.fullArgs?.trim()

    if (!text && !m.quoted) {
        return m.reply(
            `📢 *ɴᴏᴛɪꜰʏ*\n\n` +
            `• \`${m.prefix}n <texto>\`\n` +
            `• Responde a un mensaje + \`${m.prefix}n\``
        )
    }

    try {
        m.react('📢')
        const groupMeta = m.groupMetadata
        const users = getParticipantJids(groupMeta.participants || [])

        // Configuración de la cita falsa con el nombre del bot
        const fakeQuoted = {
            key: {
                fromMe: false,
                participant: '0@s.whatsapp.net',
                remoteJid: 'status@broadcast'
            },
            message: {
                conversation: '𝐊𝐀𝐎𝐑𝐈 𝐌𝐃 🌸'
            }
        }

        if (m.quoted) {
            const q = m.quoted
            const qMsg = q.message || {}
            const type = Object.keys(qMsg)[0]

            if (type === 'imageMessage') {
                const media = await q.download()
                return sock.sendMessage(
                    m.chat,
                    {
                        image: media,
                        caption: qMsg.imageMessage?.caption || '',
                        mentions: users
                    },
                    { quoted: fakeQuoted }
                )
            }

            if (type === 'videoMessage') {
                const media = await q.download()
                return sock.sendMessage(
                    m.chat,
                    {
                        video: media,
                        caption: qMsg.videoMessage?.caption || '',
                        mentions: users
                    },
                    { quoted: fakeQuoted }
                )
            }

            if (type === 'stickerMessage') {
                const media = await q.download()
                return sock.sendMessage(
                    m.chat,
                    { sticker: media, mentions: users },
                    { quoted: fakeQuoted }
                )
            }

            if (type === 'audioMessage') {
                const media = await q.download()
                return sock.sendMessage(
                    m.chat,
                    {
                        audio: media,
                        mimetype: qMsg.audioMessage?.mimetype,
                        ptt: qMsg.audioMessage?.ptt || false,
                        mentions: users
                    },
                    { quoted: fakeQuoted }
                )
            }

            if (type === 'documentMessage') {
                const media = await q.download()
                return sock.sendMessage(
                    m.chat,
                    {
                        document: media,
                        fileName: qMsg.documentMessage?.fileName || 'archivo',
                        mimetype: qMsg.documentMessage?.mimetype,
                        mentions: users
                    },
                    { quoted: fakeQuoted }
                )
            }

            const quotedText =
                q.text ||
                qMsg.conversation ||
                qMsg.extendedTextMessage?.text ||
                ''

            return sock.sendMessage(
                m.chat,
                { text: quotedText, mentions: users },
                { quoted: fakeQuoted }
            )
        }

        // ===== MODO TEXTO =====
        await sock.sendMessage(
            m.chat,
            {
                text: text,
                mentions: users
            },
            { quoted: fakeQuoted }
        )

        m.react('✅')

    } catch (err) {
        console.error(err)
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
