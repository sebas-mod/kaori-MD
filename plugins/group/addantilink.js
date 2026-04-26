import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'antilink',
    alias: ['bloquearlink', 'addalink', 'addblocklink'],
    category: 'group',
    description: 'Agrega un dominio o link a la lista negra del grupo',
    usage: '.addantilink <dominio/patrón>',
    example: '.addantilink tiktok.com',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true, // Solo para admins
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const db = getDatabase()
    const link = m.text?.toLowerCase().trim()

    if (!link) {
        return m.reply(
            `🔗 *AGREGAR ANTI-LINK*\n\n` +
            `> Escribí el dominio o patrón que querés bloquear en este grupo.\n\n` +
            `*Ejemplos:* \n` +
            `\`${m.prefix}addantilink tiktok.com\`\n` +
            `\`${m.prefix}addantilink chat.whatsapp.com\`\n` +
            `\`${m.prefix}addantilink instagram.com\``
        )
    }

    const groupData = db.getGroup(m.chat) || {}
    const antilinkList = groupData.antilinkList || []

    if (antilinkList.includes(link)) {
        return m.reply(`⚠️ El link \`${link}\` ya está bloqueado en este grupo.`)
    }

    antilinkList.push(link)
    db.setGroup(m.chat, { ...groupData, antilinkList })

    m.reply(
        `✅ *LINK BLOQUEADO*\n\n` +
        `> Dominio: \`${link}\`\n` +
        `> Total en lista: *${antilinkList.length}*\n\n` +
        `> Usá \`${m.prefix}listantilink\` para ver toda la lista.`
    )
}

export { pluginConfig as config, handler }
