import { getDatabase } from '../../src/lib/ourin-database.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'

const pluginConfig = {
    name: 'transferir',
    alias: ['tf', 'kirim', 'transfer', 'dar', 'enviar'],
    category: 'rpg',
    description: 'Transferí guita o ítems de tu inventario a otro usuario',
    usage: '.transferir <guita/item> <cantidad> @user',
    example: '.transferir guita 10000 @tag',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const sender = db.getUser(m.sender)

    const args = m.args || []
    if (args.length < 3) {
        return m.reply(
            `💸 *𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐃𝐄 𝐓𝐑𝐀𝐍𝐒𝐅𝐄𝐑𝐄𝐍𝐂𝐈𝐀𝐒*\n\n` +
            `╭┈┈⬡「 📋 *𝐔𝐒𝐎* 」\n` +
            `┃ > \`.transferir guita 10000 @user\`\n` +
            `┃ > \`.transferir potion 5 @user\`\n` +
            `╰┈┈┈┈┈┈┈┈⬡`
        )
    }

    const type = args[0].toLowerCase()
    const amount = parseInt(args[1])
    const target = m.mentionedJid?.[0] || m.quoted?.sender

    if (!target) {
        return m.reply(`❌ *𝐓𝐀𝐑𝐆𝐄𝐓 𝐍𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎*\n\n> ¡Tenés que mencionar a alguien o responder a su mensaje!`)
    }

    if (target === m.sender) {
        return m.reply(`❌ *𝐄𝐑𝐑𝐎𝐑*\n\n> ¡No podés transferirte cosas a vos mismo, che!`)
    }

    if (!amount || amount <= 0) {
        return m.reply(`❌ *𝐂𝐀𝐍𝐓𝐈𝐃𝐀𝐃 𝐈𝐍𝐕𝐀́𝐋𝐈𝐃𝐀*\n\n> ¡El monto tiene que ser mayor a 0!`)
    }

    const recipient = db.getUser(target) || db.setUser(target)

    // Lógica para transferencia de dinero (Koin)
    if (['guita', 'money', 'balance', 'koin', 'plata'].includes(type)) {
        if ((sender.koin || 0) < amount) {
            return m.reply(
                `❌ *𝐒𝐀𝐋𝐃𝐎 𝐈𝐍𝐒𝐔𝐅𝐈𝐂𝐈𝐄𝐍𝐓𝐄*\n\n` +
                `> Tu saldo: $${(sender.koin || 0).toLocaleString('es-AR')}\n` +
                `> Falta: $${(amount - (sender.koin || 0)).toLocaleString('es-AR')}`
            )
        }

        sender.koin -= amount
        recipient.koin = (recipient.koin || 0) + amount

        db.save()
        return m.reply(`✅ *𝐓𝐑𝐀𝐍𝐒𝐅𝐄𝐑𝐄𝐍𝐂𝐈𝐀 𝐄𝐗𝐈𝐓𝐎𝐒𝐀*\n\n> 💸 Enviado: *$${amount.toLocaleString('es-AR')}*\n> 👤 Destinatario: @${target.split('@')[0]}`, { mentions: [target] })
    } 
    
    // Lógica para transferencia de ítems del inventario
    else {
        sender.inventory = sender.inventory || {}
        recipient.inventory = recipient.inventory || {}

        if ((sender.inventory[type] || 0) < amount) {
            return m.reply(
                `❌ *𝐈́𝐓𝐄𝐌𝐒 𝐈𝐍𝐒𝐔𝐅𝐈𝐂𝐈𝐄𝐍𝐓𝐄𝐒*\n\n` +
                `> Tenés de *${type}*: ${sender.inventory[type] || 0}\n` +
                `> Querés enviar: ${amount}`
            )
        }

        sender.inventory[type] -= amount
        recipient.inventory[type] = (recipient.inventory[type] || 0) + amount

        db.save()
        return m.reply(`✅ *𝐓𝐑𝐀𝐍𝐒𝐅𝐄𝐑𝐄𝐍𝐂𝐈𝐀 𝐄𝐗𝐈𝐓𝐎𝐒𝐀*\n\n> 📦 Ítem: *${type}*\n> 🔢 Cantidad: *${amount}*\n> 👤 Destinatario: @${target.split('@')[0]}`, { mentions: [target] })
    }
}

export { pluginConfig as config, handler }
