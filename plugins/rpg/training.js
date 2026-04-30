import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'

const pluginConfig = {
    name: 'entrenar',
    alias: ['training', 'train', 'latihan', 'workout', 'entrenamiento'],
    category: 'rpg',
    description: 'Entrená para mejorar tus estadísticas de combate',
    usage: '.entrenar <ataque/defensa/vida/velocidad/suerte>',
    example: '.entrenar ataque',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 180, // 3 minutos
    energi: 1,
    isEnabled: true
}

const TRAINING_TYPES = {
    ataque: { name: '⚔️ Entrenamiento de Ataque', stat: 'attack', bonus: [1, 3], exp: 80, staminaCost: 20 },
    defensa: { name: '🛡️ Entrenamiento de Defensa', stat: 'defense', bonus: [1, 2], exp: 70, staminaCost: 15 },
    vida: { name: '❤️ Entrenamiento de Vida', stat: 'health', bonus: [5, 15], exp: 90, staminaCost: 25 },
    velocidad: { name: '💨 Entrenamiento de Velocidad', stat: 'speed', bonus: [1, 2], exp: 75, staminaCost: 18 },
    suerte: { name: '🍀 Entrenamiento de Suerte', stat: 'luck', bonus: [1, 2], exp: 85, staminaCost: 22 }
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)

    if (!user.rpg) user.rpg = {}

    const args = m.args || []
    const trainType = args[0]?.toLowerCase()

    // Menú principal de entrenamiento si no hay argumentos
    if (!trainType) {
        let txt = `🏋️ *𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐃𝐄 𝐄𝐍𝐓𝐑𝐄𝐍𝐀𝐌𝐈𝐄𝐍𝐓𝐎*\n\n`
        txt += `> ¡Entrená duro para mejorar tus stats!\n\n`
        txt += `╭┈┈⬡「 📊 *𝐓𝐔𝐒 𝐒𝐓𝐀𝐓𝐒* 」\n`
        txt += `┃ ⚔️ Ataque: *${user.rpg.attack || 10}*\n`
        txt += `┃ 🛡️ Defensa: *${user.rpg.defense || 5}*\n`
        txt += `┃ ❤️ Vida: *${user.rpg.health || 100}*\n`
        txt += `┃ 💨 Velocidad: *${user.rpg.speed || 10}*\n`
        txt += `┃ 🍀 Suerte: *${user.rpg.luck || 5}*\n`
        txt += `┃ ⚡ Stamina: *${user.rpg.stamina ?? 100}*\n`
        txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        txt += `╭┈┈⬡「 🏋️ *𝐄𝐍𝐓𝐑𝐄𝐍𝐀𝐌𝐈𝐄𝐍𝐓𝐎𝐒* 」\n`
        for (const [key, train] of Object.entries(TRAINING_TYPES)) {
            txt += `┃ ${train.name}\n`
            txt += `┃ ⚡ Stamina: ${train.staminaCost}\n`
            txt += `┃ → \`${m.prefix}entrenar ${key}\`\n┃\n`
        }
        txt += `╰┈┈┈┈┈┈┈┈⬡`
        return m.reply(txt)
    }

    const training = TRAINING_TYPES[trainType]
    if (!training) {
        return m.reply(`❌ ¡Ese entrenamiento no existe!\n\n> Usá \`${m.prefix}entrenar\` para ver la lista.`)
    }

    user.rpg.stamina = user.rpg.stamina ?? 100

    if (user.rpg.stamina < training.staminaCost) {
        return m.reply(
            `⚡ *𝐒𝐓𝐀𝐌𝐈𝐍𝐀 𝐈𝐍𝐒𝐔𝐅𝐈𝐂𝐈𝐄𝐍𝐓𝐄*\n\n` +
            `> Necesitás: ${training.staminaCost}\n` +
            `> Tenés: ${user.rpg.stamina}\n\n` +
            `💡 Podés usar \`${m.prefix}stamina recuperar\` para recargar.`
        )
    }

    // Ejecución del entrenamiento
    user.rpg.stamina -= training.staminaCost

    await m.react('🏋️')
    await m.reply(`🏋️ *𝐄𝐍𝐓𝐑𝐄𝐍𝐀𝐍𝐃𝐎 ${trainType.toUpperCase()}...*`)
    await new Promise(r => setTimeout(r, 2500))

    // Cálculo de bono y actualización de stats
    const statBonus = Math.floor(Math.random() * (training.bonus[1] - training.bonus[0] + 1)) + training.bonus[0]
    const currentStat = user.rpg[training.stat] || (training.stat === 'health' ? 100 : training.stat === 'attack' ? 10 : 5)
    user.rpg[training.stat] = currentStat + statBonus

    // Subida de experiencia
    await addExpWithLevelCheck(sock, m, db, user, training.exp)
    db.save()

    await m.react('💪')
    return m.reply(
        `💪 *¡𝐄𝐍𝐓𝐑𝐄𝐍𝐀𝐌𝐈𝐄𝐍𝐓𝐎 𝐅𝐈𝐍𝐀𝐋𝐈𝐙𝐀𝐃𝐎!*\n\n` +
        `╭┈┈⬡「 📊 *𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎* 」\n` +
        `┃ 🏋️ Tipo: *${training.name}*\n` +
        `┃ 📈 Mejora: *${currentStat} → ${currentStat + statBonus}* (+${statBonus})\n` +
        `┃ ⚡ Stamina: *-${training.staminaCost}*\n` +
        `┃ ✨ EXP: *+${training.exp}*\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `> ¡Seguí así para ser el más fuerte en **𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈Ɀ𝐀𝐖𝐀 𝐌𝐃**!`
    )
}

export { pluginConfig as config, handler }
