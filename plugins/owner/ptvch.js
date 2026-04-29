import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'ptvch',
    alias: ['ptvcanal', 'ptvstory'],
    category: 'owner',
    description: 'Enviar video como PTV (nota de video) al canal',
    usage: '.ptvch (responde a un video)',
    example: '.ptvch',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    let video = null
    
    if (m.quoted && m.quoted.isVideo) {
        try {
            video = await m.quoted.download()
        } catch (e) {
            return m.reply(`❌ Error al descargar el video respondido.`)
        }
    } else if (m.isVideo) {
        try {
            video = await m.download()
        } catch (e) {
            return m.reply(`❌ Error al descargar el video.`)
        }
    }
    
    if (!video) {
        return m.reply(
            `⚠️ *ᴍᴏᴅᴏ ᴅᴇ ᴜsᴏ*\n\n` +
            `> Envía un *video* o *responde a uno* y escribe:\n` +
            `> \`${m.prefix}ptvch\``
        )
    }
    
    const channelId = config.saluran?.id || '120363404849776664@newsletter'
    
    await m.reply(`🕕 *ᴇɴᴠɪᴀɴᴅᴏ ᴘᴛᴠ ᴀʟ ᴄᴀɴᴀʟ...*`)
    
    try {
        await sock.sendMessage(channelId, {
            video: video,
            mimetype: 'video/mp4',
            gifPlayback: true,
            ptv: true
        })
        
        await m.react('✅')
        return m.reply(`✅ *ᴇ́xɪᴛᴏ*\n\n> El video fue enviado correctamente al canal como PTV.`)
        
    } catch (err) {
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
