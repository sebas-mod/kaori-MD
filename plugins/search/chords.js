import axios from 'axios'
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'acordes',
    alias: ['chords', 'chord', 'guitarra', 'kunci'],
    category: 'search',
    description: 'Buscá los acordes o notas de guitarra de una canción',
    usage: '.acordes <título de la canción>',
    example: '.acordes de música ligera',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const NEOXR_APIKEY = config.APIkey?.neoxr || 'Milik-Bot-OurinMD'

async function handler(m, { sock }) {
    const text = m.text?.trim()

    if (!text) {
        return m.reply(
            `🎸 *𝐁𝐔́𝐒𝐐𝐔𝐄𝐃𝐀 𝐃𝐄 𝐀𝐂𝐎𝐑𝐃𝐄𝐒*\n\n` +
            `> Buscá los acordes para tocar con la guitarra.\n\n` +
            `> Ejemplo:\n` +
            `\`${m.prefix}acordes de música ligera\`\n` +
            `\`${m.prefix}chord flaca calamaro\``
        )
    }

    m.react('🕕')

    try {
        const { data } = await axios.get(`https://api.neoxr.eu/api/chord?q=${encodeURIComponent(text)}&apikey=${NEOXR_APIKEY}`, {
            timeout: 30000
        })

        if (!data?.status || !data?.data?.chord) {
            m.react('❌')
            return m.reply(`❌ No encontré acordes para: \`${text}\``)
        }

        const chord = data.data.chord

        // Enviar los acordes directamente
        await m.reply(`🎼 *𝐀𝐂𝐎𝐑𝐃𝐄𝐒 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎𝐒*\n\n${chord}\n\n> Notas proporcionadas por **𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈Ɀ𝐀𝐖𝐀 𝐌𝐃**`)
        m.react('✅')

    } catch (err) {
        console.error(err)
        m.react('☢')
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }