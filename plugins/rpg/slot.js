import { getDatabase } from '../../src/lib/ourin-database.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'

const pluginConfig = {
    name: 'slots',
    alias: ['slot', 'mesin', 'maquinita', 'casino'],
    category: 'rpg',
    description: 'Probá tu suerte en la máquina tragamonedas',
    usage: '.slots <apuesta>',
    example: '.slots 5000',
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
    let bet = parseInt(args[0])
    
    if (!bet || bet < 1000) {
        return m.reply(
            `❌ *𝐀𝐏𝐔𝐄𝐒𝐓𝐀 𝐈𝐍𝐕𝐀́𝐋𝐈𝐃𝐀*\n\n` +
            `> La apuesta mínima es de $1.000!\n` +
            `> Ejemplo: \`.slots 5000\``
        )
    }
    
    if ((user.koin || 0) < bet) {
        return m.reply(
            `❌ *𝐒𝐀𝐋𝐃𝐎 𝐈𝐍𝐒𝐔𝐅𝐈𝐂𝐈𝐄𝐍𝐓𝐄*\n\n` +
            `> Tu saldo: $${(user.koin || 0).toLocaleString('es-AR')}\n` +
            `> Necesitás: $${bet.toLocaleString('es-AR')}`
        )
    }
    
    // Cobrar la apuesta por adelantado
    user.koin -= bet
    
    const symbols = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣']
    const weights = [30, 25, 20, 15, 7, 3] // Probabilidades en %
    
    function spin() {
        const rand = Math.random() * 100
        let cumulative = 0
        for (let i = 0; i < symbols.length; i++) {
            cumulative += weights[i]
            if (rand <= cumulative) return symbols[i]
        }
        return symbols[0]
    }
    
    const result = [spin(), spin(), spin()]
    
    await sock.sendMessage(m.chat, { 
        text: `🎰 *𝐆𝐈𝐑𝐀𝐍𝐃𝐎...*`, 
        contextInfo: getRpgContextInfo('🎰 𝐒𝐋𝐎𝐓𝐒', '¡Mucha suerte!') 
    }, { quoted: m })
    
    await new Promise(r => setTimeout(r, 1500))
    
    let multiplier = 0
    let winText = ''
    
    // Lógica de premios
    if (result[0] === result[1] && result[1] === result[2]) {
        if (result[0] === '7️⃣') {
            multiplier = 10
            winText = '🎉 ¡¡¡JACKPOT TOTAL!!!'
        } else if (result[0] === '💎') {
            multiplier = 5
            winText = '💎 ¡DIAMANTES!'
        } else {
            multiplier = 3
            winText = '✨ ¡TRIPLE!'
        }
    } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
        multiplier = 1.5
        winText = '👍 ¡DOBLE!'
    }
    
    const winnings = Math.floor(bet * multiplier)
    user.koin = (user.koin || 0) + winnings
    
    let txt = `🎰 *𝐌𝐀́𝐐𝐔𝐈𝐍𝐀 𝐓𝐑𝐀𝐆𝐀𝐌𝐎𝐍𝐄𝐃𝐀𝐒*\n\n`
    txt += `╔═══════════╗\n`
    txt += `║ ${result[0]} │ ${result[1]} │ ${result[2]} ║\n`
    txt += `╚═══════════╝\n\n`
    
    if (multiplier > 0) {
        txt += `> ${winText}\n`
        txt += `> 💰 Ganaste: *+$${winnings.toLocaleString('es-AR')}*`
    } else {
        txt += `> 😢 ¡Perdiste!\n`
        txt += `> 💸 Perdiste: *-$${bet.toLocaleString('es-AR')}*`
    }
    
    txt += `\n\n> Seguí jugando en **𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈Ɀ𝐀𝐖𝐀 𝐌𝐃**`
    
    db.save()
    await sock.sendMessage(m.chat, { 
        text: txt, 
        contextInfo: getRpgContextInfo('🎰 𝐒𝐋𝐎𝐓𝐒', '¡Resultado!') 
    }, { quoted: m })
}

export { pluginConfig as config, handler }
