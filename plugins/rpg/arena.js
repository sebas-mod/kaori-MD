import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'

const pluginConfig = {
    name: 'arena',
    alias: ['pvp', 'pelea', 'manoamano', 'bardear'],
    category: 'rpg',
    description: 'Andá a buscar a uno para dársela en la pera en el Arena PvP',
    usage: '.arena <@user>',
    example: '.arena @user',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 180,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.rpg) user.rpg = {}
    if (!user.inventory) user.inventory = {}
    
    const mentioned = m.mentionedJid?.[0] || m.quoted?.sender
    if (!mentioned) {
        return m.reply(
            `⚔️ *EL ARENA DEL AGUANTE*\n\n` +
            `> ¡Buscá a un gil para dársela!\n\n` +
            `╭┈┈⬡「 📋 *CÓMO HACER* 」\n` +
            `┃ ${m.prefix}arena @user\n` +
            `┃ Respondé a un mensaje con ${m.prefix}arena\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `⚠️ *Ojo:* Si perdés, te limpian el 20% de tu guita.`
        )
    }
    
    if (mentioned === m.sender) {
        return m.reply(`❌ ¡No seas boludo, no te podés pelear con vos mismo!`)
    }
    
    const opponent = db.getUser(mentioned)
    if (!opponent) {
        return m.reply(`❌ Ese no está ni registrado, no le podés pegar a un fantasma.`)
    }
    
    if (!opponent.rpg) opponent.rpg = {}
    
    const myHealth = user.rpg.health || 100
    const myAttack = (user.rpg.attack || 10) + (user.level || 1) * 2
    const myDefense = (user.rpg.defense || 5) + (user.level || 1)
    
    const oppHealth = opponent.rpg.health || 100
    const oppAttack = (opponent.rpg.attack || 10) + (opponent.level || 1) * 2
    const oppDefense = (opponent.rpg.defense || 5) + (opponent.level || 1)
    
    await m.react('⚔️')
    await m.reply(`⚔️ *¡SE ARMÓ EL QUILOMBO!*\n\n> @${m.sender.split('@')[0]} vs @${mentioned.split('@')[0]}\n\n_Bancá que se están dando..._`, { mentions: [m.sender, mentioned] })
    await new Promise(r => setTimeout(r, 2000))
    
    let myHp = myHealth
    let oppHp = oppHealth
    let round = 0
    let battleLog = []
    
    while (myHp > 0 && oppHp > 0 && round < 10) {
        round++
        
        const myDmg = Math.max(5, myAttack - oppDefense + Math.floor(Math.random() * 10))
        oppHp -= myDmg
        battleLog.push(`🥊 Le diste un viaje: *-${myDmg} HP*`)
        
        if (oppHp <= 0) break
        
        const oppDmg = Math.max(5, oppAttack - myDefense + Math.floor(Math.random() * 10))
        myHp -= oppDmg
        battleLog.push(`👊 Te la pusieron: *-${oppDmg} HP*`)
    }
    
    const isWin = myHp > oppHp
    
    let txt = `⚔️ *RESUMEN DE LA PIÑERA*\n\n`
    txt += `╭┈┈⬡「 📊 *CÓMO QUEDARON* 」\n`
    txt += `┃ 🧑 Vos: ${Math.max(0, myHp)}/${myHealth} HP\n`
    txt += `┃ 👤 El otro: ${Math.max(0, oppHp)}/${oppHealth} HP\n`
    txt += `┃ 🔄 Rounds: ${round}\n`
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    
    txt += `📜 *Lo que pasó:* \n`
    txt += battleLog.slice(-6).map(l => `> ${l}`).join('\n')
    txt += `\n\n`
    
    if (isWin) {
        const expReward = 300 + (opponent.level || 1) * 50
        const goldReward = Math.floor((opponent.koin || 0) * 0.1)
        
        user.koin = (user.koin || 0) + goldReward
        opponent.koin = Math.max(0, (opponent.koin || 0) - goldReward)
        
        await addExpWithLevelCheck(sock, m, db, user, expReward)
        
        txt += `🎉 *¡VAMOS TODAVÍA!*\n`
        txt += `> ✨ Sacaste: +${expReward} EXP\n`
        txt += `> 💰 Le choreaste: +$${goldReward.toLocaleString()}`
        
        await m.react('🏆')
    } else {
        const goldLoss = Math.floor((user.koin || 0) * 0.2)
        user.koin = Math.max(0, (user.koin || 0) - goldLoss)
        
        txt += `💀 *COBRASTE POR BONDI*\n`
        txt += `> 💸 Te limpiaron: -$${goldLoss.toLocaleString()}`
        
        await m.react('💀')
    }
    
    db.setUser(m.sender, user)
    db.setUser(mentioned, opponent)
    db.save()
    
    return m.reply(txt, { mentions: [m.sender, mentioned] })
}

export { pluginConfig as config, handler }
