import axios from 'axios'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'prediccionpareja',
    alias: ['jodoh', 'compatibilidadpareja', 'prediccionamor'],
    category: 'diversion',
    description: 'Predicción de pareja basada en fechas de nacimiento',
    usage: '.prediccionpareja <nombre1> <día1> <mes1> <año1> <nombre2> <día2> <mes2> <año2>',
    example: '.prediccionpareja juan 16 11 2007 carla 1 1 2008',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    if (m.args.length < 8) {
        return m.reply(
            `💑 *ᴘʀᴇᴅɪᴄᴄɪóɴ ᴅᴇ ᴘᴀʀᴇᴊᴀ*\n\n` +
            `> Formato:\n` +
            `<nombre1> <día1> <mes1> <año1> <nombre2> <día2> <mes2> <año2>\n\n` +
            `\`Ejemplo:\n${m.prefix}prediccionpareja juan 16 11 2007 carla 1 1 2008\``
        )
    }
    
    const [nama1, tgl1, bln1, thn1, nama2, tgl2, bln2, thn2] = m.args
    
    m.react('💑')
    
    try {
        const url = `https://api.siputzx.my.id/api/primbon/ramalanjodoh?nama1=${encodeURIComponent(nama1)}&tgl1=${tgl1}&bln1=${bln1}&thn1=${thn1}&nama2=${encodeURIComponent(nama2)}&tgl2=${tgl2}&bln2=${bln2}&thn2=${thn2}`
        const { data } = await axios.get(url, { timeout: 30000 })
        
        if (!data?.status || !data?.data?.result) {
            m.react('❌')
            return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> No se pudo realizar la predicción.`)
        }
        
        const r = data.data.result
        let response = `💑 *ᴘʀᴇᴅɪᴄᴄɪóɴ ᴅᴇ ᴘᴀʀᴇᴊᴀ*\n\n`
        response += `👤 *${r.orang_pertama.nama}*\n> Nacimiento: ${r.orang_pertama.tanggal_lahir}\n\n`
        response += `👤 *${r.orang_kedua.nama}*\n> Nacimiento: ${r.orang_kedua.tanggal_lahir}\n\n`
        response += `📜 *ʀᴇsᴜʟᴛᴀᴅᴏ:* \n`
        
        r.hasil_ramalan.forEach((h, i) => {
            response += `${i+1}. ${h}\n\n`
        })
        
        response += `> ⚠️ _${data.data.peringatan || 'Usa esto solo por diversión.'}_`
        
        m.react('✅')
        await m.reply(response)
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
