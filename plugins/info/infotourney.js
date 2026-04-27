import axios from 'axios'
import * as cheerio from 'cheerio'
import moment from 'moment-timezone'
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'infotourney',
    alias: ['tourney', 'torneo', 'mltorneo'],
    category: 'info',
    description: 'Muestra información sobre los últimos torneos de Mobile Legends',
    usage: '.infotourney',
    example: '.infotourney',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function getInfoTourney() {
    const url = 'https://infotourney.com/tournament/mobile-legends'
    const { data } = await axios.get(url)
    const $ = cheerio.load(data)
    const tournaments = []

    $('.items-row .item').each((_, element) => {
        const item = $(element)

        const title = item.find('h2[itemprop="name"] a').text().trim()
        const link = item.find('h2[itemprop="name"] a').attr('href')
        const image = item.find('p img').attr('src')
        let datePublished = item.find('time[itemprop="datePublished"]').attr('datetime')

        if (datePublished) {
            // Ajustado a la zona horaria local de Argentina
            datePublished = moment(datePublished).tz('America/Argentina/Buenos_Aires').format('DD/MM/YYYY HH:mm')
        }

        const descriptionHtml = item.find('p[style="text-align: center;"]').html() || ""
        const [rawDescription, rawInfo] = descriptionHtml.split('<br>').map(text => text.trim())

        const description = rawDescription ? rawDescription.replace(/&nbsp;/g, ' ') : ""
        const info = rawInfo ? rawInfo.replace(/&nbsp;/g, ' ') : ""

        tournaments.push({
            title,
            imageUrl: new URL(image, url).href,
            datePublished,
            description,
            info,
            url: new URL(link, url).href
        })
    })

    return tournaments.slice(0, 5)
}

async function handler(m, { sock }) {
    await m.react('🕕')
    
    try {
        const tournaments = await getInfoTourney()
        
        if (!tournaments || tournaments.length === 0) {
            await m.react('❌')
            return m.reply('❌ No se encontraron torneos disponibles en este momento.')
        }
        
        const saluranId = config.saluran?.id || '120363208449943317@newsletter'
        const saluranName = config.saluran?.name || config.bot?.name || 'KAORI MD'
        
        let text = `🏆 *ɪɴꜰᴏ ᴅᴇ ᴛᴏʀɴᴇᴏs ᴍᴏʙɪʟᴇ ʟᴇɢᴇɴᴅs*\n\n`
        text += `> Los 5 torneos más recientes:\n\n`
        
        for (let i = 0; i < tournaments.length; i++) {
            const t = tournaments[i]
            text += `${i + 1}. *${t.title}*\n`
            text += `📅 Publicado: ${t.datePublished || 'N/A'}\n`
            if (t.description) text += `📝 ${t.description}\n`
            if (t.info) text += `⚠️ ${t.info}\n`
            text += `🔗 Enlace: ${t.url}\n\n`
        }

        text += `*𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃 — E-Sports*`
        
        const firstImage = tournaments[0]?.imageUrl
        
        if (firstImage) {
            // Se asume que sock.sendMedia es una función compatible en tu versión de KAORI MD
            await sock.sendMessage(m.chat, {
                image: { url: firstImage },
                caption: text,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: saluranId,
                        newsletterName: saluranName,
                    }
                }
            }, { quoted: m })
        } else {
            await m.reply(text)
        }
        
        await m.react('✅')
        
    } catch (error) {
        await m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
