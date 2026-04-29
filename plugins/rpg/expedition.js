import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'

const pluginConfig = {
    name: 'expedicion',
    alias: ['exp', 'explorar', 'mision', 'aventura'],
    category: 'rpg',
    description: 'Enviá expediciones automáticas para conseguir items',
    usage: '.expedicion <start/claim/status/list>',
    example: '.expedicion start bosque',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

const EXPEDITIONS = {
    bosque: { name: '🌲 Bosque Profundo', duration: 1800000, rewards: ['madera', 'hierba', 'hongo'], exp: 100, minLevel: 1 },
    cueva: { name: '🏔️ Cueva Sombría', duration: 3600000, rewards: ['hierro', 'oro', 'gema'], exp: 200, minLevel: 5 },
    volcan: { name: '🌋 Volcán de Sangre', duration: 7200000, rewards: ['lava', 'escama_dragon', 'nucleo_titan'], exp: 400, minLevel: 15 },
    oceano: { name: '🌊 Océano Abisal', duration: 5400000, rewards: ['pescado', 'perla', 'gema_marina'], exp: 300, minLevel: 10 },
    ruinas: { name: '🏛️ Ruinas Antiguas', duration: 10800000, rewards: ['moneda_antigua', 'reliquia', 'cofre_misterioso'], exp: 600, minLevel: 20 }
}

function formatTime(ms) {
    const hours = Math.floor(ms / 3600000)
    const minutes = Math.floor((ms % 3600000) / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    if (hours > 0) return `${hours}h ${minutes}m`
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.inventory) user.inventory = {}
    if (!user.rpg) user.rpg = {}
    if (!user.rpg.expeditions) user.rpg.expeditions = []
    
    const args = m.args || []
    const action = args[0]?.toLowerCase()
    const expType = args[1]?.toLowerCase()
    
    // Slots máximos: 1 base + 1 cada 10 niveles (máximo 5)
    const maxExpeditions = Math.min(5, 1 + Math.floor((user.level || 1) / 10))
    
    if (!action || !['start', 'claim', 'status', 'list'].includes(action)) {
        let txt = `🗺️ *𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐃𝐄 𝐄𝐗𝐏𝐄𝐃𝐈𝐂𝐈𝐎𝐍𝐄𝐒*\n\n`
        txt += `> ¡Mandá a tu equipo a farmear de forma automática!\n\n`
        txt += `╭┈┈⬡「 📋 *COMANDOS* 」\n`
        txt += `┃ ${m.prefix}expedicion list\n`
        txt += `┃ ${m.prefix}expedicion start <zona>\n`
        txt += `┃ ${m.prefix}expedicion status\n`
        txt += `┃ ${m.prefix}expedicion claim\n`
        txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        txt += `> 📊 Slots ocupados: ${user.rpg.expeditions.length}/${maxExpeditions}`
        return m.reply(txt)
    }
    
    if (action === 'list') {
        let txt = `🗺️ *𝐙𝐎𝐍𝐀𝐒 𝐃𝐄 𝐄𝐗𝐏𝐄𝐃𝐈𝐂𝐈𝐎́𝐍*\n\n`
        txt += `╭┈┈⬡「 📍 *AREAS* 」\n`
        
        for (const [key, exp] of Object.entries(EXPEDITIONS)) {
            const canGo = (user.level || 1) >= exp.minLevel
            txt += `┃ ${exp.name} ${canGo ? '✅' : '🔒'}\n`
            txt += `┃ ⏱️ Duración: ${formatTime(exp.duration)}\n`
            txt += `┃ 📦 Recompensas: ${exp.rewards.join(', ')}\n`
            txt += `┃ ✨ EXP: ${exp.exp}\n`
            txt += `┃ 📊 Nivel Mínimo: ${exp.minLevel}\n`
            txt += `┃ → Comando: \`${key}\`\n┃\n`
        }
        txt += `╰┈┈┈┈┈┈┈┈⬡`
        return m.reply(txt)
    }
    
    if (action === 'start') {
        if (user.rpg.expeditions.length >= maxExpeditions) {
            return m.reply(`❌ ¡No tenés más slots libres! (${user.rpg.expeditions.length}/${maxExpeditions})`)
        }
        
        if (!expType) {
            return m.reply(`❌ ¡Tenés que elegir una zona!\n\n> Ejemplo: \`${m.prefix}expedicion start bosque\``)
        }
        
        const exp = EXPEDITIONS[expType]
        if (!exp) {
            return m.reply(`❌ ¡Esa zona no existe en el mapa!`)
        }
        
        if ((user.level || 1) < exp.minLevel) {
            return m.reply(`❌ Nivel insuficiente. Necesitás ser Nivel ${exp.minLevel} para ir acá.`)
        }
        
        user.rpg.expeditions.push({
            type: expType,
            startedAt: Date.now(),
            duration: exp.duration
        })
        db.save()
        
        return m.reply(
            `✅ *𝐄𝐗𝐏𝐄𝐃𝐈𝐂𝐈𝐎́𝐍 𝐄𝐍 𝐌𝐀𝐑𝐂𝐇𝐀*\n\n` +
            `> 📍 Destino: *${exp.name}*\n` +
            `> ⏱️ Tiempo estimado: *${formatTime(exp.duration)}*\n\n` +
            `💡 Podés reclamar las recompensas al terminar con \`${m.prefix}expedicion claim\``
        )
    }
    
    if (action === 'status') {
        if (user.rpg.expeditions.length === 0) {
            return m.reply(`❌ No tenés ninguna expedición activa en este momento.`)
        }
        
        let txt = `🗺️ *𝐄𝐒𝐓𝐀𝐃𝐎 𝐃𝐄 𝐄𝐗𝐏𝐄𝐃𝐈𝐂𝐈𝐎𝐍𝐄𝐒*\n\n`
        txt += `╭┈┈⬡「 📍 *𝐀𝐂𝐓𝐈𝐕𝐀𝐒* 」\n`
        
        for (let i = 0; i < user.rpg.expeditions.length; i++) {
            const exp = user.rpg.expeditions[i]
            const expInfo = EXPEDITIONS[exp.type]
            const elapsed = Date.now() - exp.startedAt
            const remaining = Math.max(0, exp.duration - elapsed)
            const done = remaining <= 0
            
            txt += `┃ ${i + 1}. ${expInfo.name}\n`
            txt += `┃ ${done ? '✅ ¡LISTO PARA COBRAR!' : `🕕 Restante: ${formatTime(remaining)}`}\n`
            txt += `┃\n`
        }
        txt += `╰┈┈┈┈┈┈┈┈⬡`
        return m.reply(txt)
    }
    
    if (action === 'claim') {
        const completedExps = user.rpg.expeditions.filter(e => {
            return Date.now() - e.startedAt >= e.duration
        })
        
        if (completedExps.length === 0) {
            return m.reply(`❌ Todavía ninguna expedición ha terminado. ¡Tené paciencia!`)
        }
        
        let totalExp = 0
        let allRewards = []
        
        for (const exp of completedExps) {
            const expInfo = EXPEDITIONS[exp.type]
            totalExp += expInfo.exp
            
            for (const rewardItem of expInfo.rewards) {
                if (Math.random() > 0.4) {
                    const qty = Math.floor(Math.random() * 5) + 1
                    user.inventory[rewardItem] = (user.inventory[rewardItem] || 0) + qty
                    allRewards.push(`${rewardItem} x${qty}`)
                }
            }
        }
        
        // Limpiamos las expediciones reclamadas
        user.rpg.expeditions = user.rpg.expeditions.filter(e => {
            return Date.now() - e.startedAt < e.duration
        })
        
        await addExpWithLevelCheck(sock, m, db, user, totalExp)
        db.save()
        
        await m.react('✅')
        
        let txt = `🎉 *𝐄𝐗𝐏𝐄𝐃𝐈𝐂𝐈𝐎́𝐍 𝐅𝐈𝐍𝐀𝐋𝐈𝐙𝐀𝐃𝐀*\n\n`
        txt += `> Se completaron ${completedExps.length} expediciones con éxito.\n\n`
        txt += `╭┈┈⬡「 🎁 *𝐁𝐎𝐓𝐈́𝐍* 」\n`
        txt += `┃ ✨ EXP total: *+${totalExp}*\n`
        if (allRewards.length > 0) {
            txt += `┃ 📦 Items encontrados:\n`
            for (const r of allRewards) {
                txt += `┃    • ${r}\n`
            }
        } else {
            txt += `┃ 📦 No encontraste items esta vez.\n`
        }
        txt += `╰┈┈┈┈┈┈┈┈⬡`
        
        return m.reply(txt)
    }
}

export { pluginConfig as config, handler }
