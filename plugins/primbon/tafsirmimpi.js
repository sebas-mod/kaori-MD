import axios from 'axios'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'significadosueño',
    alias: ['sueño', 'soñar', 'interpretarsueño'],
    category: 'diversion',
    description: 'Busca el significado de tus sueños',
    usage: '.significadosueño <palabra clave>',
    example: '.significadosueño volar',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const palabraClave = m.args.join(' ')
    if (!palabraClave) {
        return m.reply(`🌙 *ɪɴᴛᴇʀᴘʀᴇᴛᴀᴄɪóɴ ᴅᴇ sᴜᴇñᴏs*\n\n> Por favor, escribe de qué trata tu sueño\n\n\`Ejemplo: ${m.prefix}significadosueño volar\``)
    }
    
    m.react('🌙')
    
    try {
        const url = `https://api.siputzx.my.id/api/primbon/tafsirmimpi?mimpi=${encodeURIComponent(palabraClave)}`
        const { data } = await axios.get(url, { timeout: 30000 })
        
        if (!data?.status || !data?.data?.hasil?.length) {
            m.react('❌')
            return m.reply(`❌ *sɪɴ ʀᴇsᴜʟᴛᴀᴅᴏs*\n\n> No se encontró una interpretación para: ${palabraClave}`)
        }
        
        const r = data.data
        let response = `🌙 *ɪɴᴛᴇʀᴘʀᴇᴛᴀᴄɪóɴ ᴅᴇ sᴜᴇñᴏs*\n\n`
        response += `> Palabra clave: *${r.keyword}*\n`
        response += `> Resultados: *${r.total} encontrados*\n\n`
        
        // Mostramos los primeros 10 resultados para no saturar el chat
        r.hasil.slice(0, 10).forEach((h, i) => {
            response += `*${i+1}. ${h.mimpi}*\n> ${h.tafsir}\n\n`
        })
        
        if (r.total > 10) {
            response += `_...y otros ${r.total - 10} resultados adicionales._`
        }
        
        m.react('✅')
        await m.reply(response)
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
