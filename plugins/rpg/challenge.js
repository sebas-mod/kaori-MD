import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'

const pluginConfig = {
    name: 'desafio',
    alias: ['challenge', 'daily', 'diario', 'mision'],
    category: 'rpg',
    description: 'Desafíos diarios para ganar recompensas especiales',
    usage: '.desafio',
    example: '.desafio',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

const CHALLENGES = [
    { name: '⚔️ Matar 5 Monstruos', type: 'kill', target: 5, reward: { gold: 500, exp: 200 } },
    { name: '🎣 Pescar 3 Peces', type: 'fish', target: 3, reward: { gold: 300, exp: 150 } },
    { name: '⛏️ Minar 10 Minerales', type: 'mine', target: 10, reward: { gold: 400, exp: 180 } },
    { name: '🌱 Cosechar 5 Plantas', type: 'harvest', target: 5, reward: { gold: 350, exp: 160 } },
    { name: '🧪 Crear 3 Pociones', type: 'craft', target: 3, reward: { gold: 450, exp: 190 } },
    { name: '💰 Ganar 1000 Monedas', type: 'earn', target: 1000, reward: { gold: 500, exp: 250 } },
    { name: '🗺️ Completar 2 Expediciones', type: 'expedition', target: 2, reward: { gold: 600, exp: 300 } }
]

function getNewDailyChallenge() {
    return {
        ...CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)],
        progress: 0,
        date: new Date().toDateString(),
        claimed: false
    }
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.rpg) user.rpg = {}
    
    const today = new Date().toDateString()
    
    if (!user.rpg.dailyChallenge || user.rpg.dailyChallenge.date !== today) {
        user.rpg.dailyChallenge = getNewDailyChallenge()
        db.save()
    }
    
    const challenge = user.rpg.dailyChallenge
    const isComplete = challenge.progress >= challenge.target
    
    const args = m.args || []
    const action = args[0]?.toLowerCase()
    
    if (action === 'claim' || action === 'reclamar') {
        if (!isComplete) {
            return m.reply(`❌ ¡Todavía no terminaste! Metéle pata. Progress: ${challenge.progress}/${challenge.target}`)
        }
        
        if (challenge.claimed) {
            return m.reply(`❌ Ya reclamaste el premio de hoy. Aguantá a mañana para el próximo laburo.`)
        }
        
        user.koin = (user.koin || 0) + challenge.reward.gold
        await addExpWithLevelCheck(sock, m, db, user, challenge.reward.exp)
        
        challenge.claimed = true
        db.save()
        
        await m.react('🎉')
        return m.reply(
            `🎉 *¡DESAFÍO COMPLETADO!*\n\n` +
            `╭┈┈⬡「 🎁 *RECOMPENSA* 」\n` +
            `┃ 💰 Monedas: *+$${challenge.reward.gold.toLocaleString('es-AR')}*\n` +
            `┃ ✨ EXP: *+${challenge.reward.exp}*\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `> Mañana te traigo otro desafío, ¡no te duermas!`
        )
    }
    
    let txt = `📋 *DESAFÍO DIARIO - 𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃*\n\n`
    txt += `╭┈┈⬡「 🎯 *OBJETIVO DE HOY* 」\n`
    txt += `┃ 📝 ${challenge.name}\n`
    txt += `┃ 📊 Progreso: *${challenge.progress}/${challenge.target}*\n`
    txt += `┃ ${isComplete ? '✅ ¡LISTO PARA COBRAR!' : '🕕 En proceso...'}\n`
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    
    txt += `╭┈┈⬡「 🎁 *RECOMPENSA* 」\n`
    txt += `┃ 💰 Monedas: *$${challenge.reward.gold.toLocaleString('es-AR')}*\n`
    txt += `┃ ✨ EXP: *${challenge.reward.exp}*\n`
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    
    if (isComplete && !challenge.claimed) {
        txt += `> Escribí \`${m.prefix}desafio claim\` para cobrar tu premio!`
    } else if (challenge.claimed) {
        txt += `> ✅ Premio cobrado. ¡Nos vemos mañana!`
    } else {
        txt += `> ¡Terminá la misión para llevarte el botín!`
    }
    
    return m.reply(txt)
}

export { pluginConfig as config, handler }
