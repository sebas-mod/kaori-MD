import axios from 'axios'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'compatibilidadnombres',
    alias: ['pareja', 'matchnombres', 'compatibilidad'],
    category: 'diversion',
    description: 'Verifica la compatibilidad entre dos nombres de pareja',
    usage: '.compatibilidadnombres <nombre1> <nombre2>',
    example: '.compatibilidadnombres juan carla',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    if (m.args.length < 2) {
        return m.reply(`💕 *ᴄᴏᴍᴘᴀᴛɪʙɪʟɪᴅᴀᴅ ᴅᴇ ɴᴏᴍʙʀᴇs*\n\n> Formato: nombre1 nombre2\n\n\`Ejemplo: ${m.prefix}compatibilidadnombres juan carla\``)
    }
    
    const [nombre1, nombre2] = m.args
    
    m.react('💕')
    
    try {
        const url = `https://api.siputzx.my.id/api/primbon/kecocokan_nama_pasangan?nama1=${encodeURIComponent(nombre1)}&nama2=${encodeURIComponent(nombre2)}`
        const { data } = await axios.get(url, { timeout: 30000 })
        
        if (!data?.status || !data?.data) {
            m.react('❌')
            return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> No se pudo realizar el análisis.`)
        }
        
        const result = data.data
        const response = `💕 *ᴄᴏᴍᴘᴀᴛɪʙɪʟɪᴅᴀᴅ ᴅᴇ ᴘᴀʀᴇᴊᴀ*\n\n` +
            `> 👤 Tu: *${result.nama_anda}*\n` +
            `> 💑 Pareja: *${result.nama_pasangan}*\n\n` +
            `✅ *ᴘᴜɴᴛᴏs ᴘᴏsɪᴛɪᴠᴏs:*\n${result.sisi_positif}\n\n` +
            `❌ *ᴘᴜɴᴛᴏs ɴᴇɢᴀᴛɪᴠᴏs:*\n${result.sisi_negatif}\n\n` +
            `> _${result.catatan || 'Sin notas adicionales.'}_`
        
        m.react('✅')
        await m.reply(response)
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
