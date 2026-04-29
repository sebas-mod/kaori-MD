import axios from 'axios'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'numerosuerte',
    alias: ['numerohoki', 'ceknomor', 'suertetelefono'],
    category: 'diversion',
    description: 'Consulta la suerte y energías de tu número de teléfono',
    usage: '.numerosuerte <número>',
    example: '.numerosuerte 521234567890',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    // Limpia el número dejando solo dígitos
    let numero = m.args.join('').replace(/[^0-9]/g, '')
    
    if (!numero) {
        return m.reply(`🍀 *ɴᴜ́ᴍᴇʀᴏ ᴅᴇ ʟᴀ sᴜᴇʀᴛᴇ*\n\n> Ingresa un número de teléfono\n\n\`Ejemplo: ${m.prefix}numerosuerte 521234567890\``)
    }
    
    m.react('🍀')
    
    try {
        const url = `https://api.siputzx.my.id/api/primbon/nomorhoki?phoneNumber=${numero}`
        const { data } = await axios.get(url, { timeout: 30000 })
        
        if (!data?.status || !data?.data) {
            m.react('❌')
            return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> No se pudo analizar el número.`)
        }
        
        const r = data.data
        const ep = r.energi_positif.details
        const en = r.energi_negatif.details
        
        const response = `🍀 *ɴᴜ́ᴍᴇʀᴏ ᴅᴇ ʟᴀ sᴜᴇʀᴛᴇ*\n\n` +
            `> Número: *${r.nomor}*\n\n` +
            `📊 *ᴘᴜɴᴛᴜᴀᴄɪóɴ ʙᴀɢᴜᴀ:* ${r.angka_bagua_shuzi.value}%\n\n` +
            `✅ *ᴇɴᴇʀɢíᴀ ᴘᴏsɪᴛɪᴠᴀ:* ${r.energi_positif.total}%\n` +
            `├ Riqueza: ${ep.kekayaan}\n` +
            `├ Salud: ${ep.kesehatan}\n` +
            `├ Amor: ${ep.cinta}\n` +
            `└ Estabilidad: ${ep.kestabilan}\n\n` +
            `❌ *ᴇɴᴇʀɢíᴀ ɴᴇɢᴀᴛɪᴠᴀ:* ${r.energi_negatif.total}%\n` +
            `├ Conflictos: ${en.perselisihan}\n` +
            `├ Pérdidas: ${en.kehilangan}\n` +
            `├ Infortunios: ${en.malapetaka}\n` +
            `└ Destrucción: ${en.kehancuran}\n\n` +
            `> Estado: ${r.analisis.status ? '✅ CON SUERTE' : '❌ SIN SUERTE'}`
        
        m.react('✅')
        await m.reply(response)
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
