import axios from 'axios'
import fs from 'fs'
import path from 'path'

const pluginConfig = {
    name: 'ukhty',
    alias: ['ukht', 'hijabvideo'],
    category: 'asupan',
    description: 'Envía un video aleatorio de la categoría ukhty',
    usage: '.ukhty',
    example: '.ukhty',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

function loadJsonData(filename) {
    try {
        const filePath = path.join(process.cwd(), 'src', 'tiktok', filename)
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
        }
    } catch {}
    return []
}

async function handler(m, { sock }) {
    m.react('🕕')
    
    try {
        const data = loadJsonData('ukhty.json')
        
        if (data.length === 0) {
            m.react('❌')
            return m.reply(`❌ Los datos no están disponibles`)
        }
        
        const item = data[Math.floor(Math.random() * data.length)]
        
        await sock.sendMedia(m.chat, item.url, null, m, {
            type: 'video'
        })
        m.react('✅')
        
    } catch (error) {
        m.react('❌')
        m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> No se pudo encontrar el video`)
    }
}

export { pluginConfig as config, handler }
