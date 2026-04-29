import { getDatabase } from '../../src/lib/ourin-database.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'
import config from '../../config.js'
import path from 'path'
import fs from 'fs'

const pluginConfig = {
    name: 'comprarmonedas',
    alias: ['buykoin', 'comprarcoins', 'canjear', 'exptokoin'],
    category: 'rpg',
    description: 'Cambia tu EXP acumulada por Monedas',
    usage: '.comprarmonedas <cantidad>',
    example: '.comprarmonedas 10000',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const EXP_PER_KOIN = 2

let thumbRpg = null
try {
    const thumbPath = path.join(process.cwd(), 'assets', 'images', 'ourin-rpg.jpg')
    if (fs.existsSync(thumbPath)) thumbRpg = fs.readFileSync(thumbPath)
} catch (e) {}

function getContextInfo(title = '💱 *CASA DE CAMBIO*', body = 'Cambio de EXP por Monedas') {
    const saluranId = config.saluran?.id || '120363208449943317@newsletter'
    const saluranName = config.saluran?.name || '𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃'
    
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

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.rpg) user.rpg = {}
    
    const args = m.args || []
    const amountStr = args[0]
    
    if (!amountStr) {
        let txt = `💱 *INTERCAMBIO DE EXP*\n\n`
        txt += `> ¡Cambiá tu experiencia por monedas para el juego!\n\n`
        txt += `╭┈┈⬡「 📊 *COTIZACIÓN* 」\n`
        txt += `┃ 💎 ${EXP_PER_KOIN} EXP = 1 Moneda\n`
        txt += `╰┈┈⬡\n\n`
        txt += `╭┈┈⬡「 📋 *TU SALDO* 」\n`
        txt += `┃ ✨ EXP: *${(user.exp || 0).toLocaleString('es-AR')}*\n`
        txt += `┃ 💰 Monedas: *${(user.koin || 0).toLocaleString('es-AR')}*\n`
        txt += `╰┈┈⬡\n\n`
        txt += `> Ejemplo: \`.comprarmonedas 10000\`\n`
        txt += `> Costará ${ (10000 * EXP_PER_KOIN).toLocaleString('es-AR') } de EXP.`
        
        return m.reply(txt)
    }
    
    let koinAmount = 0
    if (amountStr === 'all' || amountStr === 'max') {
        koinAmount = Math.floor((user.exp || 0) / EXP_PER_KOIN)
    } else {
        koinAmount = parseInt(amountStr)
    }
    
    if (!koinAmount || koinAmount <= 0) {
        return m.reply(`❌ ¡Mandame un número válido de monedas para comprar!`)
    }
    
    const expNeeded = koinAmount * EXP_PER_KOIN
    
    if ((user.exp || 0) < expNeeded) {
        const maxPossible = Math.floor((user.exp || 0) / EXP_PER_KOIN)
        return m.reply(
            `❌ *NO TE ALCANZA LA EXP*\n\n` +
            `> Necesitás: *${expNeeded.toLocaleString('es-AR')} EXP*\n` +
            `> Tenés: *${(user.exp || 0).toLocaleString('es-AR')} EXP*\n\n` +
            `> Lo máximo que podés comprar son: *${maxPossible.toLocaleString('es-AR')} Monedas*`
        )
    }
    
    const newExp = (user.exp || 0) - expNeeded
    const newKoin = (user.koin || 0) + koinAmount
    
    db.setUser(m.sender, {
        exp: newExp,
        koin: newKoin
    })
    
    await m.react('💱')
    
    let txt = `💱 *¡CAMBIO EXITOSO!*\n\n`
    txt += `╭┈┈⬡「 📋 *DETALLE* 」\n`
    txt += `┃ ✨ EXP usada: *-${expNeeded.toLocaleString('es-AR')}*\n`
    txt += `┃ 💰 Monedas: *+${koinAmount.toLocaleString('es-AR')}*\n`
    txt += `╰┈┈⬡\n\n`
    txt += `╭┈┈⬡「 📊 *NUEVO SALDO* 」\n`
    txt += `┃ ✨ EXP: *${newExp.toLocaleString('es-AR')}*\n`
    txt += `┃ 💰 Monedas: *${newKoin.toLocaleString('es-AR')}*\n`
    txt += `╰┈┈⬡`
    
    await sock.sendMessage(m.chat, {
        text: txt,
        contextInfo: getContextInfo('💱 CAMBIO REALIZADO', 'Transacción de 𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃')
    }, { quoted: m })
}

export { pluginConfig as config, handler }
