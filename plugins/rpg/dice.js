import { getDatabase } from '../../src/lib/ourin-database.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'

const pluginConfig = {
    name: 'dados',
    alias: ['dice', 'dadu', 'roll', 'suerte'],
    category: 'rpg',
    description: 'Tirá los dados y apostá tus monedas',
    usage: '.dados <1-6> <apuesta>',
    example: '.dados 6 5000',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 15,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    const args = m.args || []
    const guess = parseInt(args[0])
    const bet = parseInt(args[1])
    
    if (!guess || guess < 1 || guess > 6) {
        return m.reply(
            `🎲 *JUEGO DE DADOS - 𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃*\n\n` +
            `╭┈┈⬡「 📋 *COMO JUGAR* 」\n` +
            `┃ > ¡Elegí un número del 1 al 6!\n` +
            `┃ > \`${m.prefix}dados 6 5000\`\n` +
            `╰┈┈┈┈┈┈┈┈⬡`
        )
    }
    
    if (!bet || bet < 1000) {
        return m.reply(
            `❌ *APUESTA INVÁLIDA*\n\n` +
            `> El mínimo para jugar es de $1.000 monedas.`
        )
    }
    
    if ((user.koin || 0) < bet) {
        return m.reply(
            `❌ *NO TENÉS RECURSOS*\n\n` +
            `> Tus monedas: $${(user.koin || 0).toLocaleString('es-AR')}\n` +
            `> Necesitás: $${bet.toLocaleString('es-AR')}`
        )
    }
    
    user.koin -= bet
    
    await sock.sendMessage(m.chat, { 
        text: `🎲 *VOLEANDO LOS DADOS...*`, 
        contextInfo: getRpgContextInfo('🎲 DADOS', '¡Suerte en la timba!') 
    }, { quoted: m })
    
    await new Promise(r => setTimeout(r, 1500))
    
    const result = Math.floor(Math.random() * 6) + 1
    const diceEmoji = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][result - 1]
    
    const isWin = guess === result
    
    let txt = `🎲 *RESULTADO DEL TIRO*\n\n`
    txt += `> ${diceEmoji} Salió el: *${result}*\n`
    txt += `> 🎯 Tu número: *${guess}*\n\n`
    
    if (isWin) {
        const winnings = bet * 5
        user.koin = (user.koin || 0) + winnings
        txt += `✅ *¡TE LLEVASTE EL PREMIO MAYOR!*\n`
        txt += `> 💰 Ganaste: *+$${winnings.toLocaleString('es-AR')}* (x5)`
    } else {
        txt += `❌ *¡PERDISTE TODO!*\n`
        txt += `> 💸 Perdiste: *-$${bet.toLocaleString('es-AR')}*`
    }
    
    db.save()
    await sock.sendMessage(m.chat, { 
        text: txt, 
        contextInfo: getRpgContextInfo('🎲 DADOS', '¡Resultado final!') 
    }, { quoted: m })
}

export { pluginConfig as config, handler }
