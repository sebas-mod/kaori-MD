import axios from 'axios'
import config from '../../config.js'
import { f } from '../../src/lib/ourin-http.js'
import te from '../../src/lib/ourin-error.js'

const NEOXR_APIKEY = config.APIkey?.neoxr || 'Milik-Bot-OurinMD'

const pluginConfig = {
    name: 'ascovida',
    alias: ['fml', 'fuckmylife'],
    category: 'fun',
    description: 'Historias aleatorias de "Asco de vida" (FML)',
    usage: '.ascovida',
    example: '.ascovida',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    m.react('🕕')

    try {
        const data = await f(`https://api.neoxr.eu/api/fml?apikey=${NEOXR_APIKEY}`)

        if (!data?.status || !data?.data?.text) {
            m.react('❌')
            return m.reply(`❌ Error al obtener la historia de FML.`)
        }    
        
        await m.reply(data.data.text)
        m.react('✅')

    } catch (err) {
        m.react('☢')
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
