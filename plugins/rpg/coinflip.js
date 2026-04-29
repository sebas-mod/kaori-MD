import { getDatabase } from '../../src/lib/ourin-database.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'

const pluginConfig = {
    name: 'caraoseca',
    alias: ['cf', 'flip', 'toss', 'coinflip', 'suerte'],
    category: 'rpg',
    description: 'Apostá tus monedas al cara o seca',
    usage: '.caraoseca <cara/seca> <apuesta>',
    example: '.caraoseca cara 5000',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    const args = m.args || []
    const choice = args[0]?.toLowerCase()
    const bet = parseInt(args[1])
    
    // Adaptación a términos locales: Cara o Seca
    if (!choice || (choice !== 'cara' && choice !== 'seca' && choice !== 'c' && choice !== 's')) {
        return m.reply(
            `🪙 *CARA O SECA - 𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃*\n\n` +
            `╭┈┈⬡「 📋 *MODO DE USO* 」\n` +
            `┃ > Elegí cara (c) o seca (s)\n` +
            `┃ > \`${m.prefix}caraoseca cara 5000\`\n` +
            `╰┈┈┈┈┈┈┈┈⬡`
        )
    }
    
    if (!bet || bet < 1000) {
        return m.reply(
            `❌ *APUESTA INVÁLIDA*\n\n` +
            `> ¡El mínimo para timbear son $1.000 monedas!\n` +
            `> Ejemplo: \`.caraoseca seca 5000\``
        )
    }
    
    if ((user.koin || 0) < bet) {
        return m.reply(
            `❌ *NO TENÉS UN MANGO*\n\n` +
            `> Tus monedas: $${(user.koin || 0).toLocaleString('es-AR')}\n` +
            `> Te faltan: $${(bet - (user.koin || 0)).toLocaleString('es-AR')}`
        )
    }
    
    // Restamos la apuesta antes de tirar
    user.koin -= bet
    
    const userChoice = (choice === 'cara' || choice === 'c') ? 'cara' : 'seca'
    const result = Math.random() < 0.5 ? 'cara' : 'seca'
    const emoji = result === 'cara' ? '🪙' : '⚖️'
    
    await sock.sendMessage(m.chat, { 
        text: `🪙 *VOLEANDO LA MONEDA...*`, 
        contextInfo: getRpgContextInfo('🪙 CARA O SECA', '¡Mucha suerte!') 
    }, { quoted: m })
    
    await new Promise(r => setTimeout(r, 1500))
    
    const isWin = userChoice === result
    
    let txt = `🪙 *RESULTADO DEL TIRO*\n\n`
    txt += `> ${emoji} Salió: *${result.toUpperCase()}*\n`
    txt += `> 🎯 Vos elegiste: *${userChoice.toUpperCase()}*\n\n`
    
    if (isWin) {
        const winnings = bet * 2
        user.koin = (user.koin || 0) + winnings
        txt += `✅ *¡GANASTE, CAPO!*\n`
        txt += `> 💰 Te llevás: *+$${winnings.toLocaleString('es-AR')}*`
    } else {
        txt += `❌ *¡PERDISTE POR GIL!*\n`
        txt += `> 💸 Perdiste: *-$${bet.toLocaleString('es-AR')}*`
    }
    
    db.save()
    await sock.sendMessage(m.chat, { 
        text: txt, 
        contextInfo: getRpgContextInfo('🪙 CARA O SECA', isWin ? '¡Ganador!' : 'Seguí participando') 
    }, { quoted: m })
}

export { pluginConfig as config, handler }
