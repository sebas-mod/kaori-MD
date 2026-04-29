import axios from 'axios'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'artinama',
    alias: ['significadonombre', 'minombre', 'nombre'],
    category: 'diversion',
    description: 'Consulta el significado de un nombre',
    usage: '.artinama <nombre>',
    example: '.artinama Juan',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const nombre = m.args.join(' ')
    if (!nombre) {
        return m.reply(`📛 *sɪɢɴɪғɪᴄᴀᴅᴏ ᴅᴇ ɴᴏᴍʙʀᴇ*\n\n> Por favor, ingresa un nombre\n\n\`Ejemplo: ${m.prefix}artinama Juan\``)
    }
    
    m.react('📛')
    
    try {
        // Nota: La API externa sigue siendo la misma, los resultados dependerán de su base de datos.
        const url = `https://api.siputzx.my.id/api/primbon/artinama?nama=${encodeURIComponent(nombre)}`
        const { data } = await axios.get(url, { timeout: 30000 })
        
        if (!data?.status || !data?.data) {
            m.react('❌')
            return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> No se pudo analizar el nombre proporcionado.`)
        }
        
        const result = data.data
        const response = `📛 *sɪɢɴɪғɪᴄᴀᴅᴏ ᴅᴇ ɴᴏᴍʙʀᴇ*\n\n` +
            `> Nombre: *${result.nama}*\n\n` +
            `${result.arti}\n\n` +
            `> _${result.catatan || 'Sin notas adicionales.'}_`
        
        m.react('✅')
        await m.reply(response)
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
