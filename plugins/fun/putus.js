import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'terminar',
    alias: ['breakup', 'separarse', 'putus'],
    category: 'fun',
    description: 'Termina la relación con tu pareja actual',
    usage: '.terminar',
    example: '.terminar',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    let senderData = db.getUser(m.sender) || {}
    
    if (!senderData.fun) senderData.fun = {}
    
    if (!senderData.fun.pasangan) {
        await m.react('❌')
        return m.reply(
            `❌ *¡Pero si estás más solo que un hongo!*\n\n` +
            `Primero conseguí a alguien con \`${m.prefix}proponer @tag\``
        )
    }

    const exPartner = senderData.fun.pasangan
    let exData = db.getUser(exPartner) || {}

    // Eliminar la relación de ambos lados en la DB
    delete senderData.fun.pasangan
    if (exData.fun?.pasangan === m.sender) {
        delete exData.fun.pasangan
        db.setUser(exPartner, exData)
    }
    
    db.setUser(m.sender, senderData)

    await m.react('💔')
    await m.reply(
        `💔 *¡SE ACABÓ EL AMOR!*\n\n` +
        `@${m.sender.split('@')[0]} y @${exPartner.split('@')[0]} acaban de terminar su relación oficialmente.\n\n` +
        `¡Ojalá encuentren a alguien mejor! 🙏`,
        { mentions: [m.sender, exPartner] }
    )
}

export { pluginConfig as config, handler }
