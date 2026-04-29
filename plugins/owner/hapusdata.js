import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'borrardatos',
    alias: ['resetdata', 'cleardata', 'wipedata'],
    category: 'owner',
    description: 'Restablecer todos los datos de la base de datos por defecto',
    usage: '.borrardatos',
    example: '.borrardatos',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true
}

const pendingReset = new Map()

async function handler(m, { sock }) {
    const args = m.text

    if (args === 'si' || args === 'yes' || args === 'confirm' || args === 'ya') {
        const pending = pendingReset.get(m.sender)
        if (!pending || Date.now() - pending > 60000) {
            pendingReset.delete(m.sender)
            return m.reply(`❌ No hay ninguna solicitud de restablecimiento activa.\n\n> Escribe \`${m.prefix}borrardatos\` primero.`)
        }

        pendingReset.delete(m.sender)
        await m.react('🕕')

        const db = getDatabase()
        const result = db.resetToDefaults()

        await m.react('✅')

        await sock.sendMessage(m.chat, {
            text:
                `🗑️ *ᴅᴀᴛᴏs ʀᴇsᴛᴀʙʟᴇᴄɪᴅᴏs*\n\n` +
                `> 📁 Archivos restablecidos: *${result.resetCount}/${result.total}*\n` +
                `> 💾 Respaldo: \`${result.backupFolder}/\`\n\n` +
                `Todos los datos han vuelto a sus valores por defecto.\n\n` +
                `> ⚠️ Reinicia el bot para asegurar la sincronización de los datos.`
        }, { quoted: m })
        return
    }

    const db = getDatabase()
    const fileMap = [
        { key: 'users', label: '👥 Usuarios' },
        { key: 'groups', label: '👥 Grupos' },
        { key: 'settings', label: '⚙️ Ajustes' },
        { key: 'stats', label: '📊 Estadísticas' },
        { key: 'sewa', label: '🏪 Alquiler' },
        { key: 'premium', label: '⭐ Premium' },
        { key: 'owner', label: '👑 Owner' },
        { key: 'partner', label: '🤝 Socios' },
    ]

    const existing = []
    let totalSize = 0

    for (const { key, label } of fileMap) {
        const data = db.db.data[key]
        if (!data) continue
        const entries = Array.isArray(data) ? data.length : Object.keys(data).length
        const size = Buffer.byteLength(JSON.stringify(data))
        totalSize += size
        existing.push({ label, key, entries, size: `${(size / 1024).toFixed(1)} KB` })
    }

    if (existing.length === 0) {
        return m.reply(`❌ No se encontraron datos en la base de datos.`)
    }

    pendingReset.set(m.sender, Date.now())

    let txt = `⚠️ *ᴀᴅᴠᴇʀᴛᴇɴᴄɪᴀ — ʙᴏʀʀᴀʀ ᴅᴀᴛᴏs*\n\n`
    txt += `Esta acción eliminará *TODOS* los siguientes datos:\n\n`

    for (const { label, entries, size } of existing) {
        txt += `> ${label}: *${entries}* entradas (${size})\n`
    }

    txt += `\n> 📦 Total: *${(totalSize / 1024).toFixed(1)} KB*\n`
    txt += `> 💾 Se creó un respaldo automático antes del reset.\n\n`
    txt += `Escribe \`${m.prefix}borrardatos si\` en menos de 60 segundos para continuar.`

    await sock.sendMessage(m.chat, {
        text: txt,
        interactiveButtons: [
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: '✅ Sí, borrar todo',
                    id: `${m.prefix}borrardatos si`
                })
            },
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: '❌ Cancelar',
                    id: `${m.prefix}menu`
                })
            }
        ]
    }, { quoted: m })

    setTimeout(() => { pendingReset.delete(m.sender) }, 60000)
}

export { pluginConfig as config, handler }
