import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'soloeste-grupo',
    alias: ['onlythisgroup', 'lockgrup', 'bloqueargrupo'],
    category: 'owner',
    description: 'El bot solo estará activo en este grupo',
    usage: '.soloeste-grupo',
    example: '.soloeste-grupo',
    isOwner: true,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const current = db.setting('onlyThisGroup') || null

    if (current === m.chat) {
        db.setting('onlyThisGroup', null)
        db.save()
        return m.reply(`🔓 *ᴅᴇsʙʟᴏǫᴜᴇᴀᴅᴏ*\n\nEl bot ahora está activo en todos los grupos.`)
    }

    db.setting('onlyThisGroup', m.chat)
    db.save()

    const meta = await sock.groupMetadata(m.chat).catch(() => null)
    const groupName = meta?.subject || m.chat

    await m.reply(
        `🔒 *ʙʟᴏǫᴜᴇᴀᴅᴏ*\n\n` +
        `El bot ahora solo está activo en:\n` +
        `*${groupName}*\n\n` +
        `Otros grupos no podrán usar el bot.\n` +
        `Escribe el comando de nuevo para desbloquear.`
    )
}

export { pluginConfig as config, handler }
