import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'kei-large',
    alias: ['setkeilarge', 'cambiarkeilarge', 'bundle-kei'],
    category: 'owner',
    description: 'Preset: Cambia la imagen principal y las versiones v7 a v11 de un solo golpe',
    usage: '.kei-large (responder/enviar imagen)',
    example: '.kei-large',
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
    
    if (!isImage) {
        return m.reply(
            `🖼️ *KEI LARGE PRESET*\n\n` +
            `> Envía o responde a una imagen para reemplazar el paquete de fotos de **𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃** (ourin.jpg y versiones v7 a v11) simultáneamente.\n` +
            `> Asegúrate de que la relación de aspecto sea la adecuada.`
        )
    }
    
    await m.react('🕕')
    
    try {
        let buffer
        if (m.quoted && m.quoted.isMedia) {
            buffer = await m.quoted.download()
        } else if (m.isMedia) {
            buffer = await m.download()
        }
        
        if (!buffer) {
            await m.react('❌')
            return m.reply(`❌ No se pudo descargar la imagen.`)
        }
        
        const targetImages = [
            'ourin.jpg',
            'ourin-v7.jpg',
            'ourin-v8.jpg',
            'ourin-v9.jpg',
            'ourin-v10.jpg',
            'ourin-v11.jpg'
        ]
        
        const assetsDir = path.join(process.cwd(), 'assets', 'images')
        if (!fs.existsSync(assetsDir)) {
            fs.mkdirSync(assetsDir, { recursive: true })
        }
        
        for (const imgName of targetImages) {
            const targetPath = path.join(assetsDir, imgName)
            fs.writeFileSync(targetPath, buffer)
        }
        
        await m.react('✅')
        m.reply(
            `✅ *ÉXITO*\n\n` +
            `> El paquete de imágenes *kei-large* de **𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃** se ha actualizado de forma masiva.\n` +
            `> Archivos modificados: ${targetImages.join(', ')}\n` +
            `> Reinicia el bot si los cambios no se reflejan de inmediato.`
        )
        
    } catch (error) {
        await m.react('☢')
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
