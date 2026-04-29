import { getDatabase } from '../../src/lib/ourin-database.js'
import * as timeHelper from '../../src/lib/ourin-time.js'

const pluginConfig = {
    name: 'listalquiler',
    alias: ['sewalist', 'daftarsewa', 'listaquiler'],
    category: 'owner',
    description: 'Ver la lista de grupos con alquiler registrado',
    usage: '.listalquiler',
    example: '.listalquiler',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function formatCountdown(data) {
    if (data.status === 'expired') return '🚫 EXPIRADO (Bot salió)'
    if (data.isLifetime) return '♾️ Permanente'
    const diff = data.expiredAt - Date.now()
    if (diff <= 0) return '❌ EXPIRADO'
    const days = Math.floor(diff / 86400000)
    const hours = Math.floor((diff % 86400000) / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
}

function getStatusEmoji(data) {
    if (data.status === 'expired') return '🚫'
    if (data.isLifetime) return '♾️'
    const diff = data.expiredAt - Date.now()
    if (diff <= 0) return '❌'
    if (diff <= 259200000) return '⚠️' // Menos de 3 días
    return '✅'
}

function handler(m) {
    const db = getDatabase()
    if (!db.db.data.sewa) {
        db.db.data.sewa = { enabled: false, groups: {} }
        db.db.write()
    }

    const sewaGroups = db.db.data.sewa.groups || {}
    const groupIds = Object.keys(sewaGroups)

    if (groupIds.length === 0) {
        return m.reply(
            `📋 *ʟɪsᴛᴀ ᴅᴇ ᴀʟǫᴜɪʟᴇʀ*\n\n` +
            `Estado: *${db.db.data.sewa.enabled ? '✅ ACTIVO' : '❌ INACTIVO'}*\n` +
            `Aún no hay grupos registrados\n\n` +
            `Añade uno con: *${m.prefix}addsewa <link> <duración>*`
        )
    }

    const sorted = groupIds.sort((a, b) => {
        const aData = sewaGroups[a]
        const bData = sewaGroups[b]
        if (aData.isLifetime && !bData.isLifetime) return 1
        if (!aData.isLifetime && bData.isLifetime) return -1
        return (aData.expiredAt || 0) - (bData.expiredAt || 0)
    })

    const active = sorted.filter(id => sewaGroups[id].isLifetime || sewaGroups[id].expiredAt > Date.now())
    const expired = sorted.filter(id => !sewaGroups[id].isLifetime && sewaGroups[id].expiredAt <= Date.now())

    let text = `📋 *ʟɪsᴛᴀ ᴅᴇ ᴀʟǫᴜɪʟᴇʀ*\n\n`
    text += `Estado del sistema: *${db.db.data.sewa.enabled ? '✅ ACTIVO' : '❌ INACTIVO'}*\n`
    text += `Total: *${groupIds.length}* grupos (${active.length} activos, ${expired.length} expirados)\n\n`

    for (let i = 0; i < sorted.length; i++) {
        const gid = sorted[i]
        const data = sewaGroups[gid]
        const status = getStatusEmoji(data)
        const countdown = formatCountdown(data)
        const addedDate = data.addedAt ? timeHelper.fromTimestamp(data.addedAt, 'DD/MM/YYYY') : '-'

        text += `${status} *${i + 1}. ${data.name || 'Desconocido'}*\n`
        text += `   ID: ${gid.split('@')[0]}\n`
        text += `   Restante: ${countdown}\n`
        text += `   Agregado: ${addedDate}\n\n`
    }

    text += `*ACCIONES:*\n`
    text += `• *${m.prefix}renewsewa <id> <duración>* — Renovar\n`
    text += `• *${m.prefix}delsewa <id>* — Eliminar de la lista`

    return m.reply(text)
}

export { pluginConfig as config, handler }
