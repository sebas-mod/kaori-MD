import { getDatabase } from '../../src/lib/ourin-database.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'

const pluginConfig = {
    name: 'divorcio',
    alias: ['cerai', 'pisah', 'divorce', 'separarse'],
    category: 'rpg',
    description: 'Tramitá el divorcio de tu pareja actual',
    usage: '.divorcio',
    example: '.divorcio',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.rpg) user.rpg = {}
    
    if (!user.rpg.spouse) {
        return m.reply(
            `❌ *ESTÁS SOLTERO/A*\n\n` +
            `> ¡No tenés a nadie de quien divorciarte!\n` +
            `> Primero casate con \`${m.prefix}marry @user\``
        )
    }
    
    const spouseJid = user.rpg.spouse
    const partner = db.getUser(spouseJid)
    
    const divorceCost = 25000
    if ((user.koin || 0) < divorceCost) {
        return m.reply(
            `❌ *NO TENÉS PLATA PARA EL TRÁMITE*\n\n` +
            `> Tus monedas: $${(user.koin || 0).toLocaleString('es-AR')}\n` +
            `> El abogado cobra: $${divorceCost.toLocaleString('es-AR')}`
        )
    }
    
    // Proceso de divorcio
    user.koin -= divorceCost
    user.rpg.spouse = null
    user.rpg.marriedAt = null
    
    if (partner && partner.rpg) {
        partner.rpg.spouse = null
        partner.rpg.marriedAt = null
    }
    
    db.save()
    
    let txt = `💔 *DIVORCIO OFICIAL - 𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃*\n\n`
    txt += `> 😢 @${m.sender.split('@')[0]} y @${spouseJid.split('@')[0]}\n`
    txt += `> ¡Han decidido seguir caminos separados!\n`
    txt += `> 💸 Gastos legales: $${divorceCost.toLocaleString('es-AR')}\n\n`
    txt += `> _A otra cosa, mariposa..._`
    
    await m.reply(txt, { mentions: [m.sender, spouseJid] })
}

export { pluginConfig as config, handler }
