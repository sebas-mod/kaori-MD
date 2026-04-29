import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'

const pluginConfig = {
    name: 'aventura',
    alias: ['adv', 'explorar', 'laburar'],
    category: 'rpg',
    description: 'Andate de aventura para ganar Exp y unos mangos',
    usage: '.aventura',
    example: '.aventura',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 120,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.rpg) user.rpg = {}
    user.rpg.health = user.rpg.health || 100
    
    if (user.rpg.health < 30) {
        return m.reply(
            `❌ *ESTÁS RE CACHIMBA*\n\n` +
            `> ¡Necesitás al menos 30 de HP para salir a Adventurear, che!\n` +
            `> Tu vida actual: ${user.rpg.health} HP`
        )
    }
    
    const locations = [
        '🌲 El Bosque de Ezeiza', '🏔️ El Cerro Catedral', '🏜️ El Desierto de San Juan',
        '🌋 El Volcán Lanín', '🏰 Un Castillo abandonado en Córdoba', '🌊 La Bristol en plena temporada'
    ]
    const location = locations[Math.floor(Math.random() * locations.length)]
    
    await m.reply(`⚔️ *ARRANCANDO LA AVENTURA*\n\n> Te fuiste para ${location}... bancá un toque.`)
    await new Promise(r => setTimeout(r, 2500))
    
    const isWin = Math.random() < 0.6
    
    if (isWin) {
        const expGain = Math.floor(Math.random() * 2000) + 500
        const moneyGain = Math.floor(Math.random() * 10000) + 2000
        
        user.koin = (user.koin || 0) + moneyGain
        const levelResult = await addExpWithLevelCheck(sock, m, db, user, expGain)
        
        db.save()
        
        let txt = `✅ *¡JOYITA, TE FUE RE BIEN!*\n\n`
        txt += `> 📍 Lugar: ${location}\n\n`
        txt += `╭┈┈⬡「 🎁 *BOTÍN* 」\n`
        txt += `┃ 💰 Guita: *+$${moneyGain.toLocaleString('es-AR')}*\n`
        txt += `┃ 🚄 Exp: *+${expGain}*\n`
        txt += `╰┈┈┈┈┈┈┈┈⬡`
        
        await m.reply(txt)
    } else {
        const healthLoss = Math.floor(Math.random() * 30) + 10
        user.rpg.health = Math.max(0, user.rpg.health - healthLoss)
        
        let msg = `❌ *COBRASTE POR GIL*\n\n`
        msg += `> 📍 En: ${location}\n\n`
        msg += `> ¡Te cruzaste con un bicho y te dio para que tengas!\n`
        msg += `> ❤️ Vida: *-${healthLoss}*`
        
        if (user.rpg.health <= 0) {
            user.rpg.health = 0
            user.rpg.exp = Math.floor((user.rpg.exp || 0) / 2)
            msg += `\n\n💀 *QUEDASTE RE TIESO*\n> ¡Palmaste y perdiste la mitad de la Exp por distraído!`
        }
        
        db.save()
        await m.reply(msg)
    }
}

export { pluginConfig as config, handler }
