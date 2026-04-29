import axios from 'axios'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'potencialenfermedad',
    alias: ['chequearsalud', 'enfermedad', 'salud'],
    category: 'curiosidades',
    description: 'Consulta el potencial de enfermedades según tu fecha de nacimiento',
    usage: '.potencialenfermedad <día> <mes> <año>',
    example: '.potencialenfermedad 12 05 1998',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    if (m.args.length < 3) {
        return m.reply(`🏥 *ᴘᴏᴛᴇɴᴄɪᴀʟ ᴅᴇ ᴇɴғᴇʀᴍᴇᴅᴀᴅ*\n\n> Formato: día mes año\n\n\`Ejemplo: ${m.prefix}potencialenfermedad 12 05 1998\``)
    }
    
    const [tgl, bln, thn] = m.args
    
    m.react('🏥')
    
    try {
        const url = `https://api.siputzx.my.id/api/primbon/cek_potensi_penyakit?tgl=${tgl}&bln=${bln}&thn=${thn}`
        const { data } = await axios.get(url, { timeout: 30000 })
        
        if (!data?.status || !data?.data) {
            m.react('❌')
            return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> No se pudo realizar el análisis.`)
        }
        
        const result = data.data
        const response = `🏥 *ᴘᴏᴛᴇɴᴄɪᴀʟ ᴅᴇ ᴇɴғᴇʀᴍᴇᴅᴀᴅ*\n\n` +
            `> Fecha: *${tgl}/${bln}/${thn}*\n\n` +
            `📊 *sᴇᴄᴛᴏʀ/ᴇʟᴇᴍᴇɴᴛᴏ:*\n${result.sektor}\n\n` +
            `⚠️ *ᴘᴏᴛᴇɴᴄɪᴀʟ:*\n${result.elemen}\n\n` +
            `> _${result.catatan || 'Sin observaciones adicionales.'}_`
        
        m.react('✅')
        await m.reply(response)
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
