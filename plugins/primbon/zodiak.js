import axios from 'axios'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'zodiaco',
    alias: ['horoscopo', 'prediccion'],
    category: 'diversion',
    description: 'Consulta la predicción de tu signo del zodiaco',
    usage: '.zodiaco <nombre del signo>',
    example: '.zodiaco aries',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const validZodiacs = ['aries', 'tauro', 'geminis', 'cancer', 'leo', 'virgo', 'libra', 'escorpio', 'sagitario', 'capricornio', 'acuario', 'piscis']

// Mapeo para la API (ya que la API espera los nombres en inglés/indonesio)
const zodiacMap = {
    'aries': 'aries',
    'tauro': 'taurus',
    'geminis': 'gemini',
    'cancer': 'cancer',
    'leo': 'leo',
    'virgo': 'virgo',
    'libra': 'libra',
    'escorpio': 'scorpio',
    'sagitario': 'sagitarius',
    'capricornio': 'capricorn',
    'acuario': 'aquarius',
    'piscis': 'pisces'
}

async function handler(m, { sock }) {
    const input = m.args[0]?.toLowerCase()
    const zodiac = zodiacMap[input]
    
    if (!input || !zodiac) {
        return m.reply(`⭐ *ᴢᴏᴅɪᴀᴄᴏ*\n\n> Ingresa el nombre de un signo:\n\n${validZodiacs.map(z => `• ${z}`).join('\n')}\n\n\`Ejemplo: ${m.prefix}zodiaco aries\``)
    }
    
    m.react('⭐')
    
    try {
        const url = `https://api.siputzx.my.id/api/primbon/zodiak?zodiak=${zodiac}`
        const { data } = await axios.get(url, { timeout: 30000 })
        
        if (!data?.status || !data?.data) {
            m.react('❌')
            return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> No se pudo obtener la predicción.`)
        }
        
        const r = data.data
        const response = `⭐ *ᴢᴏᴅɪᴀᴄᴏ ${input.toUpperCase()}*\n\n` +
            `${r.zodiak}\n\n` +
            `🔢 *ɴúᴍᴇʀᴏ sᴜᴇʀᴛᴇ:* ${r.nomor_keberuntungan}\n` +
            `🌸 *ғʟᴏʀ:* ${r.bunga_keberuntungan}\n` +
            `🎨 *ᴄᴏʟᴏʀ:* ${r.warna_keberuntungan}\n` +
            `💎 *ᴘɪᴇᴅʀᴀ:* ${r.batu_keberuntungan}\n` +
            `🔥 *ᴇʟᴇᴍᴇɴᴛᴏ:* ${r.elemen_keberuntungan}\n` +
            `🪐 *ᴘʟᴀɴᴇᴛᴀ:* ${r.planet_yang_mengitari}\n` +
            `💕 *ᴘᴀʀᴇᴊᴀ ɪᴅᴇᴀʟ:* ${r.pasangan_zodiak}`
        
        m.react('✅')
        await m.reply(response)
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
