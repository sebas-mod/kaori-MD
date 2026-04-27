import { downloadContentFromMessage } from 'ourin'

const pluginConfig = {
    name: 'rvo',
    alias: ['veruna-vez', 'openvo', 'antiviewonce'],
    category: 'group',
    description: 'Muestra el contenido de un mensaje de "ver una vez" que hayas respondido',
    usage: '.rvo (respondiendo a un mensaje de ver una vez)',
    example: '.rvo',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const quoted = m.quoted

    if (!quoted) {
        await m.reply(
            `❌ *ꜰᴀʟʟᴏ*\n\n` +
            `> ¡Responde a un mensaje de "ver una vez" con este comando!\n` +
            `> Uso: \`${m.prefix}rvo\` (reply al mensaje 1x)`
        )
        return
    }

    const quotedMsg = quoted.message
    if (!quotedMsg) {
        await m.reply(
            `❌ *ᴍᴇɴsᴀᴊᴇ ɴᴏ ᴇɴᴄᴏɴᴛʀᴀᴅᴏ*\n\n` +
            `> No se pudo leer el contenido del mensaje respondido.`
        )
        return
    }

    const type = Object.keys(quotedMsg)[0]
    const content = quotedMsg[type]

    if (!content) {
        await m.reply(
            `❌ *sɪɴ ᴄᴏɴᴛᴇɴɪᴅᴏ*\n\n` +
            `> El contenido del mensaje está vacío o es ilegible.`
        )
        return
    }

    // Verificamos si realmente es un mensaje de ViewOnce
    if (!content.viewOnce) {
        await m.reply(
            `❌ *ɴᴏ ᴇs ᴠɪᴇᴡᴏɴᴄᴇ*\n\n` +
            `> El mensaje respondido no es de "ver una vez".\n` +
            `> Responde a un mensaje con el icono (👁️).`
        )
        return
    }

    await m.react('🕕')

    try {
        let mediaType = null
        if (type.includes('image')) {
            mediaType = 'image'
        } else if (type.includes('video')) {
            mediaType = 'video'
        } else if (type.includes('audio')) {
            mediaType = 'audio'
        }

        if (!mediaType) {
            await m.reply(
                `❌ *ᴛɪᴘᴏ ɴᴏ sᴏᴘᴏʀᴛᴀᴅᴏ*\n\n> Solo puedo recuperar imágenes, videos y audios.`
            )
            return
        }

        const stream = await downloadContentFromMessage(content, mediaType)
        
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        if (!buffer || buffer.length < 100) {
            await m.reply(
                `❌ *ᴇʀʀᴏʀ ᴅᴇ ᴅᴇsᴄᴀʀɢᴀ*\n\n` +
                `> No se pudo descargar el archivo.\n` +
                `> Es posible que el mensaje haya expirado o ya no esté en el servidor.`
            )
            return
        }

        const targetQuoted = m.quoted ? m.quoted : m

        if (mediaType === 'image') {
            await sock.sendMedia(m.chat, buffer, null, targetQuoted, {
                type: 'image'
            })
        } else if (mediaType === 'video') {
            await sock.sendMedia(m.chat, buffer, null, targetQuoted, {
                type: 'video'
            })
        } else if (mediaType === 'audio') {
            await sock.sendMedia(m.chat, buffer, null, targetQuoted, {
                type: 'audio',
                mimetype: 'audio/mpeg',
                ptt: true
            })
        }

        await m.react('✅')

    } catch (error) {
        await m.reply(
            `❌ *ᴇʀʀᴏʀ ɪɴᴛᴇʀɴᴏ*\n\n` +
            `> Hubo un problema al procesar el mensaje.\n` +
            `> _Detalle: ${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }
