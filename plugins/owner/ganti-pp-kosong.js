import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'cambiar-pp-kosong.jpg',
    alias: ['cambiarppkosong', 'setppkosong'],
    category: 'owner',
    description: 'Cambiar la imagen pp-kosong.jpg',
    usage: '.cambiar-pp-kosong.jpg (responder/enviar imagen)',
    example: '.cambiar-pp-kosong.jpg',
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
    if (!isImage) return m.reply(`🖼️ *ᴄᴀᴍʙɪᴀʀ PP-KOSONG.JPG*\n\n> Envía o responde a una imagen para cambiarla\n> Archivo: assets/images/pp-kosong.jpg`)
    try {
        let buffer = m.quoted && m.quoted.isMedia ? await m.quoted.download() : await m.download()
        if (!buffer) return m.reply('❌ Error al descargar la imagen')
        const targetPath = path.join(process.cwd(), 'assets', 'images', 'pp-kosong.jpg')
        fs.writeFileSync(targetPath, buffer)
        m.reply(`✅ *ᴇ́xɪᴛᴏ*\n\n> La imagen pp-kosong.jpg ha sido reemplazada`)
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
