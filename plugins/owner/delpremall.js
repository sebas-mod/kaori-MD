import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'delpremall',
    alias: ['delpremiumall', 'quitarpremall', 'removerpremall'],
    category: 'owner',
    description: 'Elimina el estatus premium de todos los miembros del grupo actual',
    usage: '.delpremall',
    example: '.delpremall',
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
        const groupMeta = m.groupMetadata
        const participants = groupMeta.participants || []
        
        if (participants.length === 0) {
            return m.reply(`❌ *ERROR*\n\n> No se encontraron miembros en este grupo`)
        }
        
        await m.react('🕕')
        
        const db = getDatabase()
        if (!db.data.premium) db.data.premium = []
        
        let removedCount = 0
        let notPremCount = 0
        
        for (const participant of participants) {
            const number = participant.jid?.replace(/[^0-9]/g, '') || ''
            if (!number) continue
            
            const index = db.data.premium.indexOf(number)
            
            if (index === -1) {
                notPremCount++
                continue
            }
            
            // Eliminar de la lista global de premium
            db.data.premium.splice(index, 1)
            
            // Actualizar objeto de usuario en la DB
            const jid = number + '@s.whatsapp.net'
            const user = db.getUser(jid)
            if (user) {
                user.isPremium = false
                db.setUser(jid, user)
            }
            
            removedCount++
        }
        
        db.save()
        
        await m.react('🗑️')
        
        await m.reply(
            `🗑️ *QUITAR PREMIUM MASIVO*\n\n` +
            `╭┈┈⬡「 📋 *RESULTADOS* 」\n` +
            `┃ 👥 Total miembros: \`${participants.length}\`\n` +
            `┃ ✅ Eliminados: \`${removedCount}\`\n` +
            `┃ ⏭️ No eran premium: \`${notPremCount}\`\n` +
            `┃ 💎 Premium restantes: \`${db.data.premium.length}\`\n` +
            `╰┈┈⬡\n\n` +
            `> Grupo: ${groupMeta.subject}`
        )
        
    } catch (error) {
        await m.react('☢')
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
