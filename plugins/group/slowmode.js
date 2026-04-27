import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'slowmode',
    alias: ['slow', 'modolento', 'setslowmode'],
    category: 'group',
    description: 'Modo lento del grupo — limita la velocidad de mensajes de los miembros',
    usage: '.slowmode <on/off/onlycommand> [segundos]',
    example: '.slowmode on 30',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const lastMessageTime = new Map()

const PRESETS = {
    relajado: 10,
    normal: 30,
    estricto: 60,
    superestricto: 120,
    max: 300,
}

const MODES = {
    all: 'Se eliminan todos los mensajes + comandos',
    onlycommand: 'Comandos silenciados, el chat normal sigue libre',
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    const subCmd = args[0]?.toLowerCase()
    let groupData = db.getGroup(m.chat) || {}

    if (!subCmd || subCmd === 'status' || subCmd === 'estado') {
        const sm = groupData.slowmode || {}
        const enabled = sm.enabled
        const delay = sm.delay || 30
        const mode = sm.mode || 'all'
        const presetList = Object.entries(PRESETS)
            .map(([name, sec]) => `  *.slowmode ${name}* — ${sec}s`)
            .join('\n')

        return m.reply(
            `🐢 *sʟᴏᴡᴍᴏᴅᴇ — KAORI MD*\n\n` +
            `Estado: ${enabled ? `✅ ACTIVADO (${delay}s)` : '❌ DESACTIVADO'}\n` +
            `Modo: *${mode}*\n\n` +
            `*Uso:* \n` +
            `> *.slowmode on 30* — todos los mensajes\n` +
            `> *.slowmode onlycommand 30* — solo comandos\n` +
            `> *.slowmode off* — desactivar\n\n` +
            `*Presets disponibles:*\n${presetList}\n\n` +
            `*Modos:*\n` +
            `  *all* — borra todo durante el delay\n` +
            `  *onlycommand* — solo silencia comandos\n\n` +
            `_Nota: Admins y Owner no son afectados._`
        )
    }

    if (subCmd === 'off' || subCmd === 'desactivar') {
        db.setGroup(m.chat, { ...groupData, slowmode: { enabled: false } })
        return m.reply(`✅ Slowmode *desactivado* con éxito.`)
    }

    let mode = 'all'
    let delay
    let delayArg

    if (subCmd === 'onlycommand' || subCmd === 'oc' || subCmd === 'solocomandos') {
        mode = 'onlycommand'
        delayArg = args[1]
    } else if (subCmd === 'on' || subCmd === 'set' || subCmd === 'activar') {
        delayArg = args[1]
    } else if (PRESETS[subCmd]) {
        delay = PRESETS[subCmd]
        mode = args[1]?.toLowerCase() === 'onlycommand' || args[1]?.toLowerCase() === 'oc'
            ? 'onlycommand' : 'all'
    } else {
        delay = parseInt(subCmd)
        if (isNaN(delay)) {
            return m.reply(`❌ Usa *.slowmode on 30* o *.slowmode onlycommand 30*`)
        }
    }

    if (!delay) {
        if (delayArg && PRESETS[delayArg]) {
            delay = PRESETS[delayArg]
        } else {
            delay = parseInt(delayArg) || 30
        }
    }

    if (delay < 5 || delay > 600) {
        return m.reply(`❌ El delay debe estar entre 5 y 600 segundos.`)
    }

    db.setGroup(m.chat, {
        ...groupData,
        slowmode: { enabled: true, delay, mode }
    })

    const presetName = Object.entries(PRESETS).find(([, v]) => v === delay)?.[0]
    const label = presetName ? ` (${presetName})` : ''
    const modeDesc = MODES[mode]

    await m.reply(
        `✅ *sʟᴏᴡᴍᴏᴅᴇ ᴀᴄᴛɪᴠᴀᴅᴏ*\n\n` +
        `Espera: *${delay} segundos*${label}\n` +
        `Modo: *${mode}*\n` +
        `Efecto: ${modeDesc}\n\n` +
        `_Admins y Owner no son afectados._`
    )
}

function checkSlowmode(m, sock, db) {
    if (!m.isGroup) return false

    const groupData = db.getGroup(m.chat) || {}
    if (!groupData.slowmode?.enabled) return false

    const sm = groupData.slowmode
    const mode = sm.mode || 'all'

    if (mode === 'onlycommand' && !m.isCommand) return false

    const delay = sm.delay || 30
    const key = `${m.chat}_${m.sender}`
    const now = Date.now()

    const lastTime = lastMessageTime.get(key) || 0
    const timePassed = (now - lastTime) / 1000

    if (timePassed < delay) {
        return { remaining: Math.ceil(delay - timePassed), mode }
    }

    lastMessageTime.set(key, now)

    if (lastMessageTime.size > 5000) {
        const cutoff = now - 600_000
        for (const [k, v] of lastMessageTime) {
            if (v < cutoff) lastMessageTime.delete(k)
        }
    }

    return false
}

export { pluginConfig as config, handler, checkSlowmode }
