import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'
import moment from 'moment-timezone'

const pluginConfig = {
    name: 'intro',
    alias: ['presentacion', 'bienvenida', 'reglas'],
    category: 'group',
    description: 'Muestra el mensaje de introducción del grupo',
    usage: '.intro',
    example: '.intro',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

const DEFAULT_INTRO = `Hola @user 🖐

¡Bienvenido/a al grupo! Preséntate para conocerte:
- *Nombre:* - *Edad:* - *País/Ciudad:* - *Hobby:* - *Estado:* Esperamos que te diviertas en el grupo: *@group*

> *Nota para Admins:*
Puedes cambiar este mensaje usando el comando: `.setintro <texto>``

function parsePlaceholders(text, m, groupMeta) {
    // Ajustado a la zona horaria local
    const now = moment().tz('America/Argentina/Buenos_Aires')
    const dateStr = now.format('D [de] MMMM [de] YYYY')
    const timeStr = now.format('HH:mm')
    
    return text
        .replace(/@user/gi, `@${m.sender.split('@')[0]}`)
        .replace(/@group/gi, groupMeta?.subject || 'este grupo')
        .replace(/@count/gi, groupMeta?.participants?.length || '0')
        .replace(/@date/gi, dateStr)
        .replace(/@time/gi, timeStr)
        .replace(/@desc/gi, groupMeta?.desc || 'Sin descripción')
        .replace(/@botname/gi, '𝐊𝐀𝐎𝐑𝐈 𝐌𝐃')
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const groupData = db.getGroup(m.chat) || db.setGroup(m.chat)
    const groupMeta = m.groupMetadata
    
    const introText = groupData.intro || DEFAULT_INTRO
    const parsed = parsePlaceholders(introText, m, groupMeta)
    
    await m.reply(parsed, { mentions: [m.sender] })
}

export { pluginConfig as config, handler, parsePlaceholders, DEFAULT_INTRO }
