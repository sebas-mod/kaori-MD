import axios from 'axios'
import config from '../../config.js'
import { f } from '../../src/lib/ourin-http.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'jadwalbola',
    alias: ['calendariofutbol', 'futbol', 'soccer', 'partidos'],
    category: 'info',
    description: 'Consulta el calendario de partidos de fútbol',
    usage: '.futbol [liga/equipo]',
    example: '.futbol argentina',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

const NEOXR_APIKEY = config.APIkey?.neoxr || '𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃'

const LEAGUE_EMOJI = {
    'liga inggris': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'premier league': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'liga italia': '🇮🇹',
    'serie a': '🇮🇹',
    'liga spanyol': '🇪🇸',
    'la liga': '🇪🇸',
    'liga jerman': '🇩🇪',
    'bundesliga': '🇩🇪',
    'liga prancis': '🇫🇷',
    'ligue 1': '🇫🇷',
    'liga argentina': '🇦🇷',
    'liga mexico': '🇲🇽',
    'liga jepang': '🇯🇵',
    'j1 league': '🇯🇵',
    'liga champions': '🏆',
    'champions league': '🏆',
    'copa libertadores': '🏆'
}

function getLeagueEmoji(league) {
    const lower = league.toLowerCase()
    for (const [key, emoji] of Object.entries(LEAGUE_EMOJI)) {
        if (lower.includes(key) || key.includes(lower)) {
            return emoji
        }
    }
    return '⚽'
}

async function handler(m, { sock }) {
    const filter = m.args.join(' ').toLowerCase().trim()
    
    m.react('🕕')
    
    try {
        const data = await f(`https://api.neoxr.eu/api/bola?apikey=${NEOXR_APIKEY}`)
        
        if (!data?.status || !data?.data || data.data.length === 0) {
            throw new Error('No hay partidos programados por ahora')
        }
        
        let matches = data.data
        
        if (filter) {
            matches = matches.filter(match => 
                match.league?.toLowerCase().includes(filter) ||
                match.home_team?.toLowerCase().includes(filter) ||
                match.away_team?.toLowerCase().includes(filter) ||
                match.date?.toLowerCase().includes(filter)
            )
        }
        
        if (matches.length === 0) {
            m.react('❌')
            return m.reply(`❌ No se encontraron partidos para: \`${filter}\``)
        }
        
        const grouped = {}
        for (const match of matches.slice(0, 50)) {
            const date = match.date || 'Por confirmar'
            if (!grouped[date]) grouped[date] = []
            grouped[date].push(match)
        }
        
        const saluranId = config.saluran?.id || '120363208449943317@newsletter'
        const saluranName = config.saluran?.name || config.bot?.name || 'KAORI MD'
        
        let text = `⚽ *ᴘʀᴏɢʀᴀᴍᴀᴄɪóɴ ᴅᴇ ꜰúᴛʙᴏʟ*\n\n`
        if (filter) text += `> Filtro: \`${filter}\`\n\n`
        
        for (const [date, games] of Object.entries(grouped)) {
            text += `📅 *${date}*\n\n`
            
            for (const game of games) {
                const emoji = getLeagueEmoji(game.league)
                text += `${emoji} *${game.league}*\n`
                text += `⏰ Hora: ${game.time}\n`
                text += `🏠 Local: ${game.home_team}\n`
                text += `🆚 Visita: ${game.away_team}\n\n`
            }
        }
        
        text += `Total: *${matches.length}* partidos encontrados\n`
        text += `*KAORI MD — Deportes*`
        
        m.react('✅')
        
        await m.reply(text)
        
    } catch (err) {
        m.react('☢')
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
