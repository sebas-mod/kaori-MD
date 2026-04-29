import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'

const pluginConfig = {
    name: 'duelo',
    alias: ['pvp', 'pelea', 'fight', 'duel'],
    category: 'rpg',
    description: 'Retá a un duelo a otro usuario por monedas',
    usage: '.duelo @user <apuesta>',
    example: '.duelo @user 5000',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 120,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    
    const target = m.mentionedJid?.[0] || m.quoted?.sender
    const bet = parseInt(args[1]) || 1000
    
    if (!target) {
        return m.reply(
            `⚔️ *DUELO PvP - 𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃*\n\n` +
            `╭┈┈⬡「 📋 *COMO PELEAR* 」\n` +
            `┃ > ¡Etiquetá a tu oponente!\n` +
            `┃ > \`${m.prefix}duelo @user 5000\`\n` +
            `╰┈┈┈┈┈┈┈┈⬡`
        )
    }
    
    if (target === m.sender) {
        return m.reply(`❌ *ERROR*\n\n> No podés pegarte a vos mismo, buscate un oponente real.`)
    }
    
    if (bet < 1000) {
        return m.reply(`❌ *APUESTA INVÁLIDA*\n\n> El mínimo para un duelo es de $1.000 monedas.`)
    }
    
    const player1 = db.getUser(m.sender)
    const player2 = db.getUser(target) || db.setUser(target)
    
    if ((player1.koin || 0) < bet) {
        return m.reply(
            `❌ *NO TENÉS RECURSOS*\n\n` +
            `> Tu saldo: $${(player1.koin || 0).toLocaleString('es-AR')}\n` +
            `> Necesitás: $${bet.toLocaleString('es-AR')}`
        )
    }
    
    if ((player2.koin || 0) < bet) {
        return m.reply(
            `❌ *OPONENTE POBRE*\n\n` +
            `> Tu oponente no tiene suficientes monedas para aceptar la apuesta.`
        )
    }
    
    if (!player1.rpg) player1.rpg = {}
    if (!player2.rpg) player2.rpg = {}
    
    player1.rpg.health = player1.rpg.health || 100
    player2.rpg.health = player2.rpg.health || 100
    
    if (player1.rpg.health < 30) {
        return m.reply(
            `❌ *SALUD MUY BAJA*\n\n` +
            `> Necesitás al menos 30 HP para pelear.\n` +
            `> Salud actual: ${player1.rpg.health} HP`
        )
    }
    
    await sock.sendMessage(m.chat, { 
        text: `⚔️ *EL DUELO COMIENZA*\n\n> @${m.sender.split('@')[0]} 🆚 @${target.split('@')[0]}\n> 💰 Apuesta: $${bet.toLocaleString('es-AR')}`, 
        contextInfo: getRpgContextInfo('⚔️ DUEL', '¡A LA CARGA!') 
    }, { quoted: m, mentions: [m.sender, target] })
    
    await new Promise(r => setTimeout(r, 2000))
    
    // Cálculo de poder basado en nivel y un poco de suerte
    const p1Power = (player1.level || 1) * 10 + Math.random() * 50
    const p2Power = (player2.level || 1) * 10 + Math.random() * 50
    
    const winner = p1Power > p2Power ? m.sender : target
    const loser = winner === m.sender ? target : m.sender
    const winnerData = winner === m.sender ? player1 : player2
    const loserData = winner === m.sender ? player2 : player1
    
    // Transacción de premios
    winnerData.koin = (winnerData.koin || 0) + bet
    loserData.koin = (loserData.koin || 0) - bet
    loserData.rpg.health = Math.max(0, (loserData.rpg.health || 100) - 20)
    
    const expGain = 500
    await addExpWithLevelCheck(sock, { ...m, sender: winner }, db, winnerData, expGain)
    
    db.save()
    
    let txt = `⚔️ *RESULTADO DEL COMBATE*\n\n`
    txt += `🏆 Ganador: @${winner.split('@')[0]}\n`
    txt += `💀 Derrotado: @${loser.split('@')[0]}\n\n`
    txt += `> 💰 Premio: $${bet.toLocaleString('es-AR')}\n`
    txt += `> ✨ EXP: +${expGain} (para el ganador)`
    
    await sock.sendMessage(m.chat, { 
        text: txt, 
        contextInfo: getRpgContextInfo('⚔️ DUEL', '¡Combate finalizado!') 
    }, { quoted: m, mentions: [winner, loser] })
}

export { pluginConfig as config, handler }
