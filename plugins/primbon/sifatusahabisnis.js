import axios from 'axios'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'perfilnegocio',
    alias: ['sifatbisnis', 'suertenegocio', 'negocio'],
    category: 'diversion',
    description: 'Analiza tu perfil para los negocios según tu fecha de nacimiento',
    usage: '.perfilnegocio <día> <mes> <año>',
    example: '.perfilnegocio 1 1 2000',
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
        return m.reply(`💼 *ᴘᴇʀꜰɪʟ ᴅᴇ ɴᴇɢᴏᴄɪᴏs*\n\n> Formato: día mes año\n\n\`Ejemplo: ${m.prefix}perfilnegocio 1 1 2000\``)
    }
    
    const [tgl, bln, thn] = m.args
    
    m.react('💼')
    
    try {
        const url = `https://api.siputzx.my.id/api/primbon/sifat_usaha_bisnis?tgl=${tgl}&bln=${bln}&thn=${thn}`
        const { data } = await axios.get(url, { timeout: 30000 })
        
        if (!data?.status || !data?.data) {
            m.react('❌')
            return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> No se pudo realizar el análisis de negocio.`)
        }
        
        const r = data.data
        const response = `💼 *ᴘᴇʀꜰɪʟ ᴅᴇ ɴᴇɢᴏᴄɪᴏs*\n\n` +
            `> Nacimiento: *${r.hari_lahir}*\n\n` +
            `📊 *ᴀɴáʟɪsɪs ᴅᴇ ᴇᴍᴘʀᴇɴᴅɪᴍɪᴇɴᴛᴏ:*\n${r.usaha}\n\n` +
            `> _${r.catatan || 'Análisis basado en numerología.'}_`
        
        m.react('✅')
        await m.reply(response)
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
