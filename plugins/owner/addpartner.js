import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'addpartner',
    alias: ['delpartner', 'listpartner'],
    category: 'owner',
    description: 'Gestionar la lista de partners del bot',
    usage: '.addpartner <número/@tag> [días]\n.delpartner <número/@tag>\n.listpartner\n.cekpartner <número/@tag>',
    example: '.addpartner 34600000000 30',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function extractNumber(m) {
    if (m.mentionedJid?.length) return m.mentionedJid[0]
    if (m.quoted?.sender) return m.quoted.sender

    const text = m.args?.join(' ')?.trim() || ''
    const match = text.match(/(\d{10,15})/)
    if (match) return `${match[1]}@s.whatsapp.net`

    return null
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const cmd = m.command?.toLowerCase()
    if (!db.data.partner) db.data.partner = []

    if (cmd === 'addpartner') {
        const target = await extractNumber(m)
        if (!target) {
            return m.reply(
                `🤝 *AÑADIR PARTNER*\n\n` +
                `> Modo de uso:\n` +
                `> \`${m.prefix}addpartner @tag [días]\`\n` +
                `> \`${m.prefix}addpartner 34600xxx 30\`\n\n` +
                `> Por defecto: 30 días`
            )
        }
        let targetNumber = target.replace(/@.+/g, '')
        
        // Ajuste de prefijos si es necesario (ejemplo 62 a internacional)
        if (targetNumber.startsWith('0')) {
            targetNumber = '34' + targetNumber.slice(1) 
        }

        if (config.isOwner(targetNumber)) {
            return m.reply(`⚠️ @${targetNumber} ya es el propietario!`, { mentions: [target] })
        }

        const existingIndex = db.data.partner.findIndex(p => p.id === targetNumber)
        const days = parseInt(m.args?.find(a => /^\d+$/.test(a) && a.length <= 4)) || 30
        const pushName = m.quoted?.pushName || m.pushName || 'Desconocido'
        const now = Date.now()
        let newExpired
        
        if (existingIndex !== -1) {
            const currentExpired = db.data.partner[existingIndex].expired || now
            const baseTime = currentExpired > now ? currentExpired : now
            newExpired = baseTime + (days * 24 * 60 * 60 * 1000)
            
            db.data.partner[existingIndex].expired = newExpired
            db.data.partner[existingIndex].name = pushName
        } else {
            newExpired = now + (days * 24 * 60 * 60 * 1000)
            db.data.partner.push({
                id: targetNumber,
                expired: newExpired,
                name: pushName,
                addedAt: now
            })
        }

        db.save()

        const expDate = new Date(newExpired).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })

        await m.reply(
            `✅ Se ha ${existingIndex !== -1 ? 'renovado' : 'añadido'} con éxito al partner @${targetNumber} por *${days} días*\nExpira el: *${expDate}*`,
            { mentions: [target] }
        )
        return
    }

    if (cmd === 'delpartner') {
        const target = await extractNumber(m)
        if (!target) {
            return m.reply(`⚠️ Etiqueta o responde al usuario que deseas eliminar de partners.`)
        }
        let targetNumber = target.replace(/@.+/g, '')

        const initialLength = db.data.partner.length
        db.data.partner = db.data.partner.filter(p => p.id !== targetNumber)
        
        if (db.data.partner.length < initialLength) {
            db.save()
            await m.reply(`✅ @${targetNumber} ha sido eliminado de partners`, { mentions: [target] })
        } else {
            return m.reply(`⚠️ Ese usuario no es partner.`)
        }
        return
    }

    if (cmd === 'listpartner') {
        const partners = db.data.partner
        if (!partners.length) {
            return m.reply(`🤝 *LISTA DE PARTNERS*\n\n> No hay partners registrados.`)
        }

        let txt = `🤝 *LISTA DE PARTNERS*\n\n`
        const mentions = []
        partners.forEach((p, i) => {
            const num = p.id
            const expDate = new Date(p.expired).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
            const remaining = Math.ceil((p.expired - Date.now()) / (1000 * 60 * 60 * 24))
            txt += `${i + 1}. @${num} — ${expDate} (${remaining > 0 ? remaining + 'd' : 'Expirado'})\n`
            mentions.push(`${num}@s.whatsapp.net`)
        })
        txt += `\nTotal: *${partners.length}* partners`
        await m.reply(txt, { mentions })
        return
    }
}

export { pluginConfig as config, handler }
