import axios from 'axios'
import config from '../../config.js'
import { f } from '../../src/lib/ourin-http.js'
import te from '../../src/lib/ourin-error.js'

const NEOXR_APIKEY = config.APIkey?.neoxr || 'sebas MD'

const pluginConfig = {
    name: 'poesia',
    alias: ['poema', 'verso', 'sajak'],
    category: 'fun',
    description: 'Genera una poesía o poema al azar',
    usage: '.poesia',
    example: '.poesia',
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
        const res = await f(`https://api.neoxr.eu/api/puisi?apikey=${NEOXR_APIKEY}`)

        if (!res.status || !res.data?.text) {
            m.react('❌')
            return m.reply(`❌ No se pudo obtener la poesía.`)
        }

        const text = res.data.text
        await m.reply(text)
        m.react('✅')

    } catch (err) {
        m.react('☢')
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
