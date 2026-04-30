import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'mision',
    alias: ['quest', 'misi', 'mission', 'misiones'],
    category: 'rpg',
    description: 'Aceptá misiones diarias para ganar recompensas extra',
    usage: '.mision',
    example: '.mision',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    energi: 0,
    isEnabled: true
}

const QUESTS = [
    { id: 'mining5', name: 'Minero Novato', desc: 'Minar 5 veces', target: 5, reward: { money: 10000, exp: 1000 } },
    { id: 'fishing5', name: 'Pescador con Suerte', desc: 'Pescar 5 veces', target: 5, reward: { money: 8000, exp: 800 } },
    { id: 'adventure3', name: 'Explorador Urbano', desc: 'Ir de aventura 3 veces', target: 3, reward: { money: 15000, exp: 1500 } },
    { id: 'work10', name: 'Laburante Fiel', desc: 'Trabajar 10 veces', target: 10, reward: { money: 20000, exp: 2000 } },
    { id: 'hunt5', name: 'Cazador de Élite', desc: 'Cazar 5 veces', target: 5, reward: { money: 12000, exp: 1200 } }
]

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.rpg) user.rpg = {}
    if (!user.quest) user.quest = {}
    
    const args = m.args || []
    const sub = args[0]?.toLowerCase()
    
    // Acción: Reclamar recompensa
    if (sub === 'claim' || sub === 'reclamar') {
        const questId = args[1]
        if (!questId || !user.quest[questId]) {
            return m.reply(`❌ *𝐌𝐈𝐒𝐈𝐎́𝐍 𝐍𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐀*\n\n> ¡La misión no existe o todavía no la aceptaste!`)
        }
        
        const quest = QUESTS.find(q => q.id === questId)
        if (!quest) {
            return m.reply(`❌ *𝐈𝐃 𝐈𝐍𝐕𝐀́𝐋𝐈𝐃𝐎*\n\n> Ese ID de misión no existe.`)
        }
        
        if (user.quest[questId].progress < quest.target) {
            return m.reply(
                `❌ *𝐌𝐈𝐒𝐈𝐎́𝐍 𝐈𝐍𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀*\n\n` +
                `> Progreso: ${user.quest[questId].progress}/${quest.target}`
            )
        }
        
        if (user.quest[questId].claimed) {
            return m.reply(`❌ *𝐘𝐀 𝐑𝐄𝐂𝐋𝐀𝐌𝐀𝐃𝐎*\n\n> ¡Ya cobraste esta recompensa!`)
        }
        
        // Entregar premios
        user.koin = (user.koin || 0) + quest.reward.money
        user.rpg.exp = (user.rpg.exp || 0) + quest.reward.exp
        user.quest[questId].claimed = true
        
        db.save()
        
        return m.reply(
            `✅ *¡𝐑𝐄𝐂𝐎𝐌𝐏𝐄𝐍𝐒𝐀 𝐂𝐎𝐁𝐑𝐀𝐃𝐀!*\n\n` +
            `> 🎯 Misión: ${quest.name}\n` +
            `> 💰 Guita: +$${quest.reward.money.toLocaleString('es-AR')}\n` +
            `> 🚄 Exp: +${quest.reward.exp}\n\n` +
            `> ¡Seguí así en **𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈Ɀ𝐀𝐖𝐀 𝐌𝐃**!`
        )
    }
    
    // Acción: Aceptar misión
    if (sub === 'take' || sub === 'aceptar') {
        const questId = args[1]
        const quest = QUESTS.find(q => q.id === questId)
        if (!quest) {
            return m.reply(`❌ *𝐌𝐈𝐒𝐈𝐎́𝐍 𝐍𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐀*\n\n> Mirá la lista con: \`.mision\``)
        }
        
        if (user.quest[questId]) {
            return m.reply(`❌ *𝐘𝐀 𝐀𝐂𝐄𝐏𝐓𝐀𝐃𝐀*\n\n> ¡Ya estás haciendo esta misión!`)
        }
        
        user.quest[questId] = { progress: 0, claimed: false, takenAt: Date.now() }
        db.save()
        
        return m.reply(
            `✅ *𝐌𝐈𝐒𝐈𝐎́𝐍 𝐀𝐂𝐄𝐏𝐓𝐀𝐃𝐀*\n\n` +
            `> 🎯 ${quest.name}\n` +
            `> 📝 Objetivo: ${quest.desc}\n` +
            `> 🎁 Recompensa: $${quest.reward.money.toLocaleString('es-AR')} + ${quest.reward.exp} Exp`
        )
    }
    
    // Lista de misiones
    let txt = `📜 *𝐋𝐈𝐒𝐓𝐀 𝐃𝐄 𝐌𝐈𝐒𝐈𝐎𝐍𝐄𝐒*\n\n`
    
    for (const quest of QUESTS) {
        const userQuest = user.quest[quest.id]
        let status = '⬜ No aceptada'
        if (userQuest) {
            if (userQuest.claimed) {
                status = '✅ Finalizada'
            } else if (userQuest.progress >= quest.target) {
                status = '🎁 ¡Lista para cobrar!'
            } else {
                status = `🔄 Progreso: ${userQuest.progress}/${quest.target}`
            }
        }
        
        txt += `╭┈┈⬡「 🎯 *${quest.name}* 」\n`
        txt += `┃ 🆔 ID: \`${quest.id}\`\n`
        txt += `┃ 📝 ${quest.desc}\n`
        txt += `┃ 🎁 $${quest.reward.money.toLocaleString('es-AR')} + ${quest.reward.exp} Exp\n`
        txt += `┃ 📊 Status: ${status}\n`
        txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    }
    
    txt += `> Aceptar: \`.mision aceptar <id>\`\n`
    txt += `> Cobrar: \`.mision reclamar <id>\``
    
    await m.reply(txt)
}

export { pluginConfig as config, handler }
