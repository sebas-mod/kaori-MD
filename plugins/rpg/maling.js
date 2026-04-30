import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'

const pluginConfig = {
    name: 'maling',
    alias: ['robarchico', 'carterista', 'pickpocket', 'copet'],
    category: 'rpg',
    description: 'Intentá robarle a alguien en la calle (Arriesgado)',
    usage: '.maling',
    example: '.maling',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 180, // 3 minutos
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.rpg) user.rpg = {}
    user.rpg.health = user.rpg.health || 100
    
    if (user.rpg.health < 40) {
        return m.reply(
            `❌ *𝐕𝐈𝐃𝐀 𝐃𝐄𝐌𝐀𝐒𝐈𝐀𝐃𝐎 𝐁𝐀𝐉𝐀*\n\n` +
            `> ¡Necesitás al menos 40 HP para arriesgarte a robar!\n` +
            `> Tu vida actual: ${user.rpg.health} HP`
        )
    }
    
    await sock.sendMessage(m.chat, { 
        text: '🦹 *Buscando un objetivo distraído...*', 
        contextInfo: getRpgContextInfo('🦹 𝐌𝐀𝐋𝐈𝐍𝐆', '¡Robando!') 
    }, { quoted: m })
    
    await new Promise(r => setTimeout(r, 2500))
    
    const outcomes = [
        { success: true, type: 'big', money: 20000, exp: 500, msg: '¡Le choreaste la billetera a un empresario! Alta suerte.' },
        { success: true, type: 'medium', money: 8000, exp: 200, msg: 'Manoteaste una billetera con un par de billetes.' },
        { success: true, type: 'small', money: 2000, exp: 50, msg: 'Apenas rescataste unos pesos para el bondi.' },
        { success: false, type: 'caught', fine: 15000, health: 30, msg: '¡Te engancharon y te dieron una paliza entre todos!' },
        { success: false, type: 'police', fine: 25000, health: 10, msg: '¡Apareció un patrullero y terminaste en la comisaría!' },
        { success: false, type: 'fail', fine: 0, health: 0, msg: 'El objetivo se dio cuenta y se tomó el palo. Fallaste.' }
    ]
    
    // Probabilidades (Pesos)
    const weights = [5, 20, 30, 15, 10, 20]
    const rand = Math.random() * 100
    let cumulative = 0
    let outcome = outcomes[5]
    
    for (let i = 0; i < outcomes.length; i++) {
        cumulative += weights[i]
        if (rand <= cumulative) {
            outcome = outcomes[i]
            break
        }
    }
    
    let txt = ''
    
    if (outcome.success) {
        user.koin = (user.koin || 0) + outcome.money
        await addExpWithLevelCheck(sock, m, db, user, outcome.exp)
        
        txt = `✅ *¡𝐑𝐎𝐁𝐎 𝐄𝐗𝐈𝐓𝐎𝐒𝐎!*\n\n`
        txt += `> ${outcome.msg}\n`
        txt += `> 💰 Ganancia: *+$${outcome.money.toLocaleString('es-AR')}*\n`
        txt += `> 🚄 Exp: *+${outcome.exp}*`
    } else {
        const actualFine = Math.min(outcome.fine, user.koin || 0)
        user.koin = Math.max(0, (user.koin || 0) - actualFine)
        user.rpg.health = Math.max(0, user.rpg.health - outcome.health)
        
        txt = `❌ *¡𝐅𝐀𝐋𝐋𝐀𝐒𝐓𝐄 𝐄𝐋 𝐑𝐎𝐁𝐎!*\n\n`
        txt += `> ${outcome.msg}\n`
        if (outcome.fine > 0) txt += `> 💸 Multa/Pérdida: *-$${actualFine.toLocaleString('es-AR')}*\n`
        if (outcome.health > 0) txt += `> ❤️ Vida: *-${outcome.health}*`
        
        if (user.rpg.health <= 0) {
            user.rpg.health = 0
            user.rpg.exp = Math.floor((user.rpg.exp || 0) / 2)
            txt += `\n\n💀 *𝐐𝐔𝐄𝐃𝐀𝐒𝐓𝐄 𝐊.𝐎.*\n> ¡Perdiste el 50% de tu Exp por la paliza!`
        }
    }
    
    db.save()
    await sock.sendMessage(m.chat, { 
        text: txt, 
        contextInfo: getRpgContextInfo('🦹 𝐌𝐀𝐋𝐈𝐍𝐆', 'Resultado') 
    }, { quoted: m })
}

export { pluginConfig as config, handler }
