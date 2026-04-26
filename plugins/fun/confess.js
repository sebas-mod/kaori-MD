import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'confess',
    alias: ['confesion', 'anonimo', 'menfess'],
    category: 'fun',
    description: 'Envía un mensaje anónimo a alguien',
    usage: '.confess numero|mensaje',
    example: '.confess 5491123456789|Hola, me gustas!',
    isOwner: false,
    isPremium: true,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 1,
    isEnabled: true
}

if (!global.confessData) global.confessData = new Map()

async function handler(m, { sock }) {
    const input = m.fullArgs?.trim() || m.text?.trim()

    if (!input || !input.includes('|')) {
        return m.reply(
            `💌 *ᴀɴᴏɴʏᴍᴏᴜs ᴄᴏɴꜰᴇss*\n\n` +
            `> ¡Envía un mensaje anónimo a alguien!\n\n` +
            `╭┈┈⬡「 📋 *MODO DE USO* 」\n` +
            `┃ Formato:\n` +
            `┃ \`${m.prefix}confess numero|mensaje\`\n` +
            `┃\n` +
            `┃ Ejemplo:\n` +
            `┃ \`${m.prefix}confess 5491123456789|¡Hola, bombón!\`\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `> ⚠️ ¡Tu identidad se mantendrá en secreto!`
        )
    }

    const [rawNumber, ...messageParts] = input.split('|')
    const message = messageParts.join('|').trim()

    if (!rawNumber || !message) {
        return m.reply(`❌ ¡Formato incorrecto!\n\n> Usá: \`${m.prefix}confess numero|mensaje\``)
    }

    let targetNumber = rawNumber.trim().replace(/[^0-9]/g, '')

    // Adaptación para prefijos locales (Argentina/General)
    if (targetNumber.startsWith('0')) {
        targetNumber = '54' + targetNumber.slice(1)
    }

    if (targetNumber.length < 10 || targetNumber.length > 15) {
        return m.reply(`❌ ¡El número no parece válido!`)
    }

    const targetJid = targetNumber + '@s.whatsapp.net'
    const senderNumber = m.sender.split('@')[0]

    if (targetNumber === senderNumber) {
        return m.reply(`❌ ¡No podés enviarte una confesión a vos mismo!`)
    }

    try {
        const [onWa] = await sock.onWhatsApp(targetNumber)
        if (!onWa?.exists) {
            return m.reply(`❌ El número \`${targetNumber}\` no está registrado en WhatsApp.`)
        }
    } catch (e) {}

    if (message.length < 5) {
        return m.reply(`❌ ¡Mensaje muy corto! Mínimo 5 caracteres.`)
    }

    if (message.length > 1000) {
        return m.reply(`❌ ¡Mensaje muy largo! Máximo 1000 caracteres.`)
    }

    const confessText = 
        `💌 *ᴛɪᴇɴᴇs ᴜɴ ᴍᴇɴsᴀᴊᴇ ᴀɴᴏ́ɴɪᴍᴏ*\n\n` +
        `「 📨 *ᴅᴇ: ᴀʟɢᴜɪᴇɴ ϙᴜᴇ ᴛᴇ ᴀᴘʀᴇᴄɪᴀ* 」\n` +
        ` 💕 *ᴍᴇɴsᴀᴊᴇ:*\n` +
        `\`\`\`${message}\`\`\`\n` +
        `> 🔒 _La identidad del remitente es secreta._\n` +
        `> 💬 _¡Respondé a este mensaje para contestar!_`

    try {
        const sentMsg = await sock.sendMessage(targetJid, {
            text: confessText,
            contextInfo: {
                forwardingScore: 99,
                isForwarded: true,
            }
        })

        global.confessData.set(sentMsg.key.id, {
            senderJid: m.sender,
            senderChat: m.chat,
            targetJid: targetJid,
            createdAt: Date.now()
        })

        // El mensaje expira en 24 horas
        setTimeout(() => {
            global.confessData.delete(sentMsg.key.id)
        }, 24 * 60 * 60 * 1000)

        await m.reply(
            `✅ *¡ᴄᴏɴꜰᴇsɪᴏ́ɴ ᴇɴᴠɪᴀᴅᴀ!*\n\n` +
            `> Mensaje enviado a: \`${targetNumber}\`\n` +
            `> ¡Tu identidad está a salvo! 🔒\n\n` +
            `> 💬 Si te responde, te avisaré por acá.`
        )

    } catch (error) {
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

async function replyHandler(m, { sock }) {
    if (!m.quoted) return false

    const quotedId = m.quoted?.id || m.quoted?.key?.id
    if (!quotedId) return false

    const confessInfo = global.confessData.get(quotedId)
    if (!confessInfo) return false

    // Solo el receptor puede responder
    if (m.sender !== confessInfo.targetJid) return false

    const replyMessage = m.body?.trim()
    if (!replyMessage) return false

    const saluranId = config.saluran?.id || '120363208449943317@newsletter'
    const saluranName = config.saluran?.name || config.bot?.name || 'Ourin-AI'

    const replyText = 
        `💌 *¡ᴛɪᴇɴᴇs ᴜɴᴀ ʀᴇsᴘᴜᴇsᴛᴀ ᴀ ᴛᴜ ᴄᴏɴꜰᴇsɪᴏ́ɴ!*\n\n` +
        `「 📨 *ʀᴇsᴘᴜᴇsᴛᴀ* 」\n` +
        ` 💕 *ᴅɪᴊᴏ:*\n` +
        `\`\`\`${replyMessage}\`\`\`\n` +
        `> 🔒 _Tu identidad sigue siendo secreta._`

    try {
        await sock.sendMessage(confessInfo.senderChat, {
            text: replyText,
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

        await sock.sendMessage(m.chat, {
            text: `✅ ¡Tu respuesta fue enviada de forma anónima!`
        })

        global.confessData.delete(quotedId)
        return true
    } catch (error) {
        return false
    }
}

export { pluginConfig as config, handler, replyHandler }
