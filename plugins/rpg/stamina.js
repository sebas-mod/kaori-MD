import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'
import path from 'path'
import fs from 'fs'

const pluginConfig = {
    name: 'stamina',
    alias: ['energia', 'energy', 'cekstamina', 'st'],
    category: 'rpg',
    description: 'Revisá y recuperá tu stamina para seguir jugando',
    usage: '.stamina / .stamina recuperar',
    example: '.stamina',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

let thumbRpg = null
try {
    const thumbPath = path.join(process.cwd(), 'assets', 'images', 'ourin-rpg.jpg')
    if (fs.existsSync(thumbPath)) thumbRpg = fs.readFileSync(thumbPath)
} catch (e) {}

function getContextInfo(title = '⚡ *𝐄𝐍𝐄𝐑𝐆𝐈́𝐀*', body = 'Sistema RPG') {
    const saluranId = config.saluran?.id || '120363208449943317@newsletter'
    const saluranName = config.saluran?.name || config.bot?.name || '𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈Ɀ𝐀𝐖𝐀 𝐌𝐃'
    
    const contextInfo = {
        forwardingScore: 9999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: saluranId,
            newsletterName: saluranName,
            serverMessageId: 127
        }
    }
    
    if (thumbRpg) {
        contextInfo.externalAdReply = {
            title: title,
            body: body,
            thumbnail: thumbRpg,
            mediaType: 1,
            renderLargerThumbnail: false,
            sourceUrl: config.saluran?.link || ''
        }
    }
    
    return contextInfo
}

function createStaminaBar(current, max) {
    const filled = Math.round((current / max) * 10)
    const empty = 10 - filled
    return '█'.repeat(filled) + '░'.repeat(empty)
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    const args = m.args || []
    
    if (!user.rpg) user.rpg = {}
    user.rpg.stamina = user.rpg.stamina ?? 100
    user.rpg.maxStamina = user.rpg.maxStamina || 100
    
    const subCmd = args[0]?.toLowerCase()
    
    // Acción: Recuperar energía comprando una recarga
    if (subCmd === 'isi' || subCmd === 'recuperar' || subCmd === 'heal' || subCmd === 'llenar') {
        const potionCost = 5000
        
        if (user.rpg.stamina >= user.rpg.maxStamina) {
            return m.reply(`⚡ *𝐒𝐓𝐀𝐌𝐈𝐍𝐀 𝐋𝐋𝐄𝐍𝐀*\n\n> ¡Tu energía ya está al máximo! No necesitás recargar ahora.`)
        }
        
        if ((user.koin || 0) < potionCost) {
            return m.reply(
                `❌ *𝐒𝐀𝐋𝐃𝐎 𝐈𝐍𝐒𝐔𝐅𝐈𝐂𝐈𝐄𝐍𝐓𝐄*\n\n` +
                `> Costo: $${potionCost.toLocaleString('es-AR')}\n` +
                `> Tenés: $${(user.koin || 0).toLocaleString('es-AR')}`
            )
        }
        
        // Proceso de restauración
        user.koin -= potionCost
        const restored = user.rpg.maxStamina - user.rpg.stamina
        user.rpg.stamina = user.rpg.maxStamina
        
        db.save()
        
        await m.react('⚡')
        return sock.sendMessage(m.chat, {
            text: `⚡ *𝐒𝐓𝐀𝐌𝐈𝐍𝐀 𝐑𝐄𝐂𝐔𝐏𝐄𝐑𝐀𝐃𝐀*\n\n` +
                `╭┈┈⬡「 💊 *𝐑𝐄𝐒𝐓𝐎𝐑𝐄* 」\n` +
                `┃ ⚡ Energía: *+${restored}*\n` +
                `┃ 💵 Costo: *-$${potionCost.toLocaleString('es-AR')}*\n` +
                `┃ 📊 Estado: *${user.rpg.stamina}/${user.rpg.maxStamina}*\n` +
                `╰┈┈┈┈┈┈┈┈⬡`,
            contextInfo: getContextInfo('⚡ 𝐒𝐓𝐀𝐌𝐈𝐍𝐀 𝐑𝐄𝐂𝐀𝐑𝐆𝐀𝐃𝐀', '¡Listo para la acción!')
        }, { quoted: m })
    }
    
    // Mostrar estado actual de la energía
    const staminaBar = createStaminaBar(user.rpg.stamina, user.rpg.maxStamina)
    
    let txt = `⚡ *𝐄𝐒𝐓𝐀𝐃𝐎 𝐃𝐄 𝐒𝐓𝐀𝐌𝐈𝐍𝐀*\n\n`
    txt += `╭┈┈⬡「 📊 *𝐈𝐍𝐅𝐎* 」\n`
    txt += `┃ ⚡ Energía: *${user.rpg.stamina}/${user.rpg.maxStamina}*\n`
    txt += `┃ 📊 [${staminaBar}]\n`
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    txt += `> Recargar: \`${m.prefix}stamina recuperar\` ($5.000)\n`
    txt += `> Tip: La energía se recupera sola con el paso del tiempo.`
    
    await sock.sendMessage(m.chat, {
        text: txt,
        contextInfo: getContextInfo()
    }, { quoted: m })
}

export { pluginConfig as config, handler }
