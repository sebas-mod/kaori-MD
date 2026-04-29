import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'cambiar-zann.jpg',
    alias: ['cambiarzann', 'setzann'],
    category: 'owner',
    description: 'Cambiar la imagen zann.jpg',
    usage: '.cambiar-zann.jpg (responder/enviar imagen)',
    example: '.cambiar-zann.jpg',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const isImage = m.isImage || (m.quoted && m.quoted.type === 'imageMessage')
    if (!isImage) return m.reply(`🖼️ *ᴄᴀᴍʙɪᴀʀ ZANN.JPG*\n\n> Envía o responde a una imagen para cambiarla\n> Archivo: assets/images/zann.jpg`)
    try {
        let buffer = m.quoted && m.quoted.isMedia ? await m.quoted.download() : await m.download()
        if (!buffer) return m.reply('❌ Error al descargar la imagen')
        const targetPath = path.join(process.cwd(), 'assets', 'images', 'zann.jpg')
        fs.writeFileSync(targetPath, buffer)
        m.reply(`✅ *ᴇ́xɪᴛᴏ*\n\n> La imagen zann.jpg ha sido reemplazada`)
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
