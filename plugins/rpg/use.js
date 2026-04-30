import { getDatabase } from '../../src/lib/ourin-database.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'

const pluginConfig = {
    name: 'usar',
    alias: ['use', 'pake', 'makan', 'open', 'consumir'],
    category: 'rpg',
    description: 'Usá ítems consumibles o abrí cajas de suministros',
    usage: '.usar <ítem>',
    example: '.usar pocion',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    const args = m.args || []
    const itemKey = args[0]?.toLowerCase()

    if (!itemKey) {
        return m.reply(
            `🎒 *𝐔𝐒𝐀𝐑 𝐈́𝐓𝐄𝐌*\n\n` +
            `╭┈┈⬡「 📋 *𝐔𝐒𝐎* 」\n` +
            `┃ > \`.usar <nombre_item>\`\n` +
            `┃ > Ver mochila: \`.inventory\`\n` +
            `╰┈┈┈┈┈┈┈┈⬡`
        )
    }

    user.inventory = user.inventory || {}
    user.rpg = user.rpg || {}
    user.rpg.health = user.rpg.health || 100
    user.rpg.maxHealth = user.rpg.maxHealth || 100
    user.rpg.mana = user.rpg.mana || 100
    user.rpg.maxMana = user.rpg.maxMana || 100
    user.rpg.stamina = user.rpg.stamina || 100
    user.rpg.maxStamina = user.rpg.maxStamina || 100

    const count = user.inventory[itemKey] || 0

    if (count <= 0) {
        return m.reply(
            `❌ *𝐍𝐎 𝐓𝐄𝐍𝐄́𝐒 𝐄𝐒𝐄 𝐈́𝐓𝐄𝐌*\n\n` +
            `> ¡No tenés *${itemKey}* en tu mochila!\n` +
            `> Revisá tus cosas con: \`.inventory\``
        )
    }

    let msg = ''

    switch(itemKey) {
        case 'pocion':
        case 'potion':
            if (user.rpg.health >= user.rpg.maxHealth) {
                return m.reply(`❤️ *𝐕𝐈𝐃𝐀 𝐋𝐋𝐄𝐍𝐀*\n\n> ¡Tu salud ya está al máximo!`)
            }
            user.rpg.health = Math.min(user.rpg.health + 50, user.rpg.maxHealth)
            user.inventory[itemKey]--
            msg = `🥤 *𝐈́𝐓𝐄𝐌 𝐔𝐒𝐀𝐃𝐎*\n\n> Te tomaste una *Poción de Vida*.\n> ❤️ Salud actual: ${user.rpg.health}/${user.rpg.maxHealth}`
            break

        case 'pocion_mana':
        case 'mpotion':
            if (user.rpg.mana >= user.rpg.maxMana) {
                return m.reply(`💧 *𝐌𝐀𝐍𝐀 𝐋𝐋𝐄𝐍𝐎*\n\n> ¡Tu energía mágica ya está al máximo!`)
            }
            user.rpg.mana = Math.min(user.rpg.mana + 50, user.rpg.maxMana)
            user.inventory[itemKey]--
            msg = `🧪 *𝐈́𝐓𝐄𝐌 𝐔𝐒𝐀𝐃𝐎*\n\n> Usaste una *Poción de Maná*.\n> 💧 Maná actual: ${user.rpg.mana}/${user.rpg.maxMana}`
            break

        case 'stamina':
        case 'pocion_stamina':
            if (user.rpg.stamina >= user.rpg.maxStamina) {
                return m.reply(`⚡ *𝐒𝐓𝐀𝐌𝐈𝐍𝐀 𝐋𝐋𝐄𝐍𝐀*\n\n> ¡Tu resistencia ya está al máximo!`)
            }
            user.rpg.stamina = Math.min(user.rpg.stamina + 20, user.rpg.maxStamina)
            user.inventory[itemKey]--
            msg = `⚡ *𝐈́𝐓𝐄𝐌 𝐔𝐒𝐀𝐃𝐎*\n\n> Consumiste una *Poción de Stamina*.\n> ⚡ Energía actual: ${user.rpg.stamina}/${user.rpg.maxStamina}`
            break

        case 'common':
        case 'uncommon':
        case 'mythic':
        case 'legendary':
            user.inventory[itemKey]--
            const rewardMoney = Math.floor(Math.random() * (itemKey === 'legendary' ? 100000 : 10000)) + 1000
            const rewardExp = Math.floor(Math.random() * (itemKey === 'legendary' ? 5000 : 500)) + 100

            user.koin = (user.koin || 0) + rewardMoney
            user.rpg.exp = (user.rpg.exp || 0) + rewardExp

            msg = `🎁 *𝐂𝐀𝐉𝐀 𝐀𝐁𝐈𝐄𝐑𝐓𝐀*\n\n` +
                  `> ¡Abriste una caja de rareza *${itemKey.toUpperCase()}*!\n` +
                  `> 💰 Guita: +$${rewardMoney.toLocaleString('es-AR')}\n` +
                  `> 🚄 EXP: +${rewardExp}\n\n` +
                  `> Seguí sumando en **𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈Ɀ𝐀𝐖𝐀 𝐌𝐃**`
            break

        default:
            return m.reply(`❌ *𝐍𝐎 𝐒𝐄 𝐏𝐔𝐄𝐃𝐄 𝐔𝐒𝐀𝐑*\n\n> El ítem *${itemKey}* es un material o recurso, no se puede "usar" directamente desde acá.`)
    }

    db.save()
    await m.reply(msg)
}

export { pluginConfig as config, handler }
