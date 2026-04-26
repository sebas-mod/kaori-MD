import FormData from 'form-data'
import axios from 'axios'
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'filtrobrooklyn',
    alias: ['brooklyn', 'filterbrooklyn', 'f-brooklyn'],
    category: 'canvas',
    description: 'Aplica el filtro Brooklyn a una imagen',
    usage: '.filtrobrooklyn (responde a una imagen)',
    example: '.filtrobrooklyn',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function uploadTo0x0(buffer) {
    const formData = new FormData()
    formData.append('file', buffer, { filename: 'image.jpg' })
    const res = await axios.post('https://c.termai.cc/api/upload?key=AIzaBj7z2z3xBjsk', formData, {
        headers: formData.getHeaders(),
        timeout: 60000
    })
    if (res.data?.status && res.data?.path) {
        return res.data.path
    }
    throw new Error('Fallo al subir la imagen')
}

async function handler(m, { sock }) {
    const isImage = m.isImage || (m.quoted && m.quoted.type === 'imageMessage')
    
    if (!isImage) {
        return m.reply(
            `🌁 *ꜰɪʟᴛʀᴏ ʙʀᴏᴏᴋʟʏɴ*\n\n` +
            `╭┈┈⬡「 📋 *MODO DE USO* 」\n` +
            `┃ ◦ Responde a una imagen con \`${m.prefix}tobrooklyn\`\n` +
            `┃ ◦ Envía una imagen con el texto \`${m.prefix}tobrooklyn\`\n` +
            `╰┈┈⬡`
        )
    }
    
    m.react('🌁')
    
    try {
        let buffer
        if (m.quoted && m.quoted.isMedia) {
            buffer = await m.quoted.download()
        } else if (m.isMedia) {
            buffer = await m.download()
        }
        
        if (!buffer || buffer.length === 0) {
            throw new Error('No se pudo descargar la imagen')
        }
        
        const imageUrl = await uploadTo0x0(buffer)
        const apiKey = config.APIkey?.lolhuman
        
        if (!apiKey) {
            throw new Error('API Key no encontrada en la configuración')
        }
        
        const apiUrl = `https://api.lolhuman.xyz/api/filter/brooklyn?apikey=${apiKey}&img=${encodeURIComponent(imageUrl)}`
        
        await sock.sendMedia(m.chat, apiUrl, null, m, {
            type: 'image',
        })
        
        m.react('✅')
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
