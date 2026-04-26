import axios from 'axios'
import config from '../../config.js'
import { f } from '../../src/lib/ourin-http.js'
import te from '../../src/lib/ourin-error.js'

const NEOXR_APIKEY = config.APIkey?.neoxr || 'Milik-Bot-OurinMD'

const pluginConfig = {
    name: 'romantico',
    alias: ['frasesamor', 'poesia', 'senja'],
    category: 'fun',
    description: 'Genera frases románticas o poéticas al azar',
    usage: '.romantico',
    example: '.romantico',
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
        const res = await f(`https://api.neoxr.eu/api/senja?apikey=${NEOXR_APIKEY}`)

        if (!res.status || !res.data?.text) {
            m.react('❌')
            return m.reply(`❌ No pude obtener la frase romántica.`)
        }
        
        await m.reply(res.data.text)
        m.react('✅')
    } catch (err) {
        m.react('☢')
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
