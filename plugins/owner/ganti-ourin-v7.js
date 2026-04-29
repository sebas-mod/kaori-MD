import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'cambiar-ourin-v7.jpg',
    alias: ['cambiarourinv7', 'setourinv7'],
    category: 'owner',
    description: 'Cambiar la imagen ourin-v7.jpg',
    usage: '.ganti-ourin-v7.jpg (responder/enviar imagen)',
    example: '.ganti-ourin-v7.jpg',
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
    if (!isImage) return m.reply(`🖼️ *ᴄᴀᴍʙɪᴀʀ OURIN-V7.JPG*\n\n> Envía o responde a una imagen para cambiarla\n> Archivo: assets/images/ourin-v7.jpg`)
    try {
        let buffer = m.quoted && m.quoted.isMedia ? await m.quoted.download() : await m.download()
        if (!buffer) return m.reply('❌ Error al descargar la imagen')
        const targetPath = path.join(process.cwd(), 'assets', 'images', 'ourin-v7.jpg')
        fs.writeFileSync(targetPath, buffer)
        m.reply(`✅ *ᴇ́xɪᴛᴏ*\n\n> La imagen ourin-v7.jpg ha sido reemplazada`)
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
