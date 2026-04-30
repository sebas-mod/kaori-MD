import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'

const pluginConfig = {
    name: 'robar',
    alias: ['rob', 'chorear', 'afanar', 'mug'],
    category: 'rpg',
    description: 'Robale guita a otro usuario (con riesgo)',
    usage: '.robar @user',
    example: '.robar @user',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 600, // 10 minutos
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    
    const target = m.mentionedJid?.[0] || m.quoted?.sender
    
    if (!target) {
        return m.reply(
            `🦹 *𝐀𝐓𝐑𝐀𝐂𝐎*\n\n` +
            `╭┈┈⬡「 📋 *𝐔𝐒𝐎* 」\n` +
            `┃ > ¡Mencioná a quién le querés robar!\n` +
            `┃ > \`.robar @user\`\n` +
            `╰┈┈┈┈┈┈┈┈⬡`
        )
    }
    
    if (target === m.sender) {
        return m.reply(`❌ *𝐄𝐑𝐑𝐎𝐑*\n\n> No seas boludo, ¡no te podés robar a vos mismo!`)
    }
    
    const robber = db.getUser(m.sender)
    const victim = db.getUser(target)
    
    if (!victim) {
        return m.reply(`❌ *𝐒𝐈𝐍 𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐎*\n\n> El objetivo no está en mi base de datos.`)
    }
    
    if ((victim.koin || 0) < 1000) {
        return m.reply(`❌ *𝐎𝐁𝐉𝐄𝐓𝐈𝐕𝐎 𝐒𝐄𝐂𝐎*\n\n> La víctima es demasiado pobre, no vale la pena.`)
    }
    
    if (!robber.rpg) robber.rpg = {}
    robber.rpg.health = robber.rpg.health || 100
    
    if (robber.rpg.health < 30) {
        return m.reply(
            `❌ *𝐄𝐒𝐓𝐀́𝐒 𝐌𝐔𝐘 𝐌𝐀𝐋*\n\n` +
            `> Necesitás al menos 30 HP para salir a afanar.\n` +
            `> Tu salud: ${robber.rpg.health} HP`
        )
    }
    
    await sock.sendMessage(m.chat, { 
        text: `🦹 *𝐀𝐒𝐀𝐋𝐓𝐀𝐍𝐃𝐎...*`, 
        contextInfo: getRpgContextInfo('🦹 𝐀𝐓𝐑𝐀𝐂𝐎', '¡Manos arriba!') 
    }, { quoted: m })
    
    await new Promise(r => setTimeout(r, 2500))
    
    const successRate = 0.4
    const isSuccess = Math.random() < successRate
    
    if (isSuccess) {
        const maxSteal = Math.floor((victim.koin || 0) * 0.3)
        const stolen = Math.floor(Math.random() * maxSteal) + 1000
        
        victim.koin = (victim.koin || 0) - stolen
        robber.koin = (robber.koin || 0) + stolen
        
        const expGain = 300
        await addExpWithLevelCheck(sock, m, db, robber, expGain)
        
        db.save()
        
        let txt = `✅ *𝐀𝐓𝐑𝐀𝐂𝐎 𝐄𝐗𝐈𝐓𝐎𝐒𝐎*\n\n`
        txt += `> 🦹 ¡Le choreaste de lo lindo a @${target.split('@')[0]}!\n`
        txt += `> 💰 Botín: *+$${stolen.toLocaleString('es-AR')}*\n`
        txt += `> 🚄 Exp: *+${expGain}*`
        
        await m.reply(txt, { mentions: [target] })
    } else {
        const fine = Math.floor(Math.random() * 10000) + 5000
        const actualFine = Math.min(fine, robber.koin || 0)
        const healthLoss = 25
        
        robber.koin = Math.max(0, (robber.koin || 0) - actualFine)
        robber.rpg.health = Math.max(0, robber.rpg.health - healthLoss)
        
        db.save()
        
        let txt = `❌ *𝐀𝐓𝐑𝐀𝐂𝐎 𝐅𝐀𝐋𝐋𝐈𝐃𝐎*\n\n`
        txt += `> 🚨 ¡Te vio la cana y te molieron a palos!\n`
        txt += `> 💸 Multa: *-$${actualFine.toLocaleString('es-AR')}*\n`
        txt += `> ❤️ Salud: *-${healthLoss} HP*`
        
        await m.reply(txt)
    }
}

export { pluginConfig as config, handler }
