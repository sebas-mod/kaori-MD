import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'addenergiall',
    alias: ['addenergianall', 'bonusenergiall'],
    category: 'owner',
    description: 'Añadir límite/energía a todos los miembros del grupo',
    usage: '.addenergiall <cantidad>',
    example: '.addenergiall 50',
    isOwner: true,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    try {
        const amount = parseInt(m.args[0])
        
        if (isNaN(amount) || amount <= 0) {
            return m.reply(`⚠️ *MODO DE USO*\n\n> Ingresa la cantidad de límite que deseas añadir.\n\n\`Ejemplo: ${m.prefix}addenergiall 50\``)
        }
        
        const groupMeta = m.groupMetadata
        const participants = groupMeta.participants || []
        
        if (participants.length === 0) {
            return m.reply(`❌ *ERROR*\n\n> No hay miembros en este grupo`)
        }
        
        await m.react('🕕')
        const db = getDatabase()
        let successCount = 0
        
        for (const participant of participants) {
            const number = participant.jid?.replace(/[^0-9]/g, '') || ''
            if (!number) continue
            const jid = number + '@s.whatsapp.net'
            db.updateEnergi(jid, amount)
            successCount++
        }

        const gb = m?.groupMetadata
        
        await db.save()
        await m.react('⚡')
        await m.reply(
           `✅ Se ha añadido el límite con éxito a todos los miembros (Total: *${successCount}* miembros) en el grupo *${gb?.subject}*`,
            )
        
    } catch (error) {
        await m.react('☢')
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
