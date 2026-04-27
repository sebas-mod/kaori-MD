import * as pakasir from '../../src/lib/ourin-pakasir.js'
import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'botmode',
    alias: ['setmode', 'mode', 'modobot'],
    category: 'group',
    description: 'Configura el modo operativo del bot para este grupo',
    usage: '.botmode <md/cpanel/pushkontak/store/otp/all>',
    example: '.botmode store',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const MODES = {
    md: {
        name: 'Multi-Device',
        desc: 'Modo predeterminado con todas las funciones estándar',
        allowedCategories: null,
        excludeCategories: ['cpanel', 'pushkontak', 'store']
    },
    all: {
        name: 'Todas las Funciones',
        desc: 'Se puede acceder a todas las funciones de todos los modos',
        allowedCategories: null,
        excludeCategories: null
    },
    cpanel: {
        name: 'CPanel Pterodactyl',
        desc: 'Modo especializado para gestión de paneles de servidores',
        allowedCategories: ['main', 'group', 'sticker', 'owner', 'tools', 'panel'],
        excludeCategories: null
    },
    pushkontak: {
        name: 'Push Contactos',
        desc: 'Modo exclusivo para difusión y push de contactos',
        allowedCategories: ['owner', 'main', 'group', 'sticker', 'pushkontak'],
        excludeCategories: null
    },
    store: {
        name: 'Tienda / Store',
        desc: 'Modo especializado para ventas y comercio online',
        allowedCategories: ['main', 'group', 'sticker', 'owner', 'store'],
        excludeCategories: null
    },
    otp: {
        name: 'Servicio OTP',
        desc: 'Modo para servicios de mensajería OTP automática',
        allowedCategories: ['main', 'group', 'sticker', 'owner'],
        excludeCategories: null
    }
}

function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    const mode = (args[0] || '').toLowerCase()
    const flags = args.slice(1).map(f => f.toLowerCase())

    const groupData = db.getGroup(m.chat) || {}
    const currentMode = groupData.botMode || 'md'

    if (!mode) {
        let modeList = ''
        for (const [key, val] of Object.entries(MODES)) {
            const isCurrent = key === currentMode ? ' ⬅️' : ''
            modeList += `┃ \`${m.prefix}botmode ${key}\`${isCurrent}\n`
            modeList += `┃ └ ${val.desc}\n`
        }

        const autoorderStatus = groupData.storeConfig?.autoorder ? '✅ ON' : '❌ OFF'

        return m.reply(
            `🔧 *ʙᴏᴛ ᴍᴏᴅᴇ | ᴋᴀᴏʀɪ ᴍᴅ*\n\n` +
            `> Modo actual: *${currentMode.toUpperCase()}* (${MODES[currentMode]?.name || 'Desconocido'})\n` +
            (currentMode === 'store' ? `> Auto-pedido: *${autoorderStatus}*\n` : '') +
            `\n╭─「 📋 *ᴏᴘᴄɪᴏɴᴇs ᴅɪsᴘᴏɴɪʙʟᴇs* 」\n` +
            `${modeList}` +
            `╰───────────────\n\n` +
            `*ꜰʟᴀɢs ᴅᴇ ᴛɪᴇɴᴅᴀ (sᴛᴏʀᴇ):*\n` +
            `> \`${m.prefix}botmode store\` - Pedido manual\n` +
            `> \`${m.prefix}botmode store --autoorder\` - Pago automático\n\n` +
            `> _La configuración es individual por grupo._`
        )
    }

    if (!Object.keys(MODES).includes(mode)) {
        return m.reply(`❌ Modo no válido. Elige entre: \`${Object.keys(MODES).join(', ')}\``)
    }

    const isAutoorder = flags.includes('--autoorder')

    const newGroupData = {
        ...groupData,
        botMode: mode
    }

    if (mode === 'store') {
        let pakasirEnabled = false
        try {
            pakasirEnabled = pakasir.isEnabled()
        } catch (e) {}

        if (isAutoorder && !pakasirEnabled) {
            return m.reply(
                `⚠️ *ɴᴏ sᴇ ᴘᴜᴇᴅᴇ ᴀᴄᴛɪᴠᴀʀ ᴀᴜᴛᴏᴏʀᴅᴇʀ*\n\n` +
                `> ¡Pakasir no ha sido configurado correctamente!\n\n` +
                `*ᴘᴀsᴏs ᴅᴇ ᴄᴏɴꜰɪɢᴜʀᴀᴄɪóɴ:*\n` +
                `1. Abre \`config.js\`\n` +
                `2. Configura \`pakasir.slug\` y \`pakasir.apiKey\`\n` +
                `3. Reinicia el bot\n\n` +
                `> O usa el modo manual:\n` +
                `\`${m.prefix}botmode store\``
            )
        }

        newGroupData.storeConfig = {
            ...(groupData.storeConfig || {}),
            autoorder: isAutoorder,
            products: groupData.storeConfig?.products || []
        }
    }

    db.setGroup(m.chat, newGroupData)
    db.save()

    m.react('✅')

    let extraInfo = ''
    if (mode === 'store') {
        const products = newGroupData.storeConfig?.products || []
        if (isAutoorder) {
            extraInfo = `\n\n✅ *¡Auto-pedido activo!*\n` +
                `> Pago automático mediante Pakasir\n` +
                `> Productos: \`${products.length}\` ítems configurados`
        } else {
            extraInfo = `\n\n📋 *Modo Manual*\n` +
                `> El admin debe confirmar los pedidos manualmente\n` +
                `> Productos: \`${products.length}\` ítems configurados\n\n` +
                `*ɢᴜíᴀ ʀáᴘɪᴅᴀ:*\n` +
                `> \`${m.prefix}addprod <código> <precio> <nombre>\`\n` +
                `> \`${m.prefix}listprod\` - Ver catálogo`
        }
    }

    return m.reply(
        `✅ *ᴍᴏᴅᴇ ᴄᴀᴍʙɪᴀᴅᴏ*\n\n` +
        `> Modo: *${mode.toUpperCase()}* (${MODES[mode].name})\n` +
        `> Grupo: *${m.chat.split('@')[0]}*\n` +
        (mode === 'store' ? `> Auto-pedido: *${isAutoorder ? 'ON' : 'OFF'}*` : '') +
        extraInfo +
        `\n\n> Escribe \`${m.prefix}menu\` para ver las funciones disponibles.`
    )
}

function getGroupMode(chatJid, db) {
    const globalMode = db.setting('botMode') || 'md'
    if (!chatJid?.endsWith('@g.us')) return globalMode
    const groupData = db.getGroup(chatJid) || {}
    return groupData.botMode || globalMode
}

function getModeCategories(mode) {
    const modeConfig = MODES[mode] || MODES.md
    return {
        allowed: modeConfig.allowedCategories,
        excluded: modeConfig.excludeCategories
    }
}

function filterCategoriesByMode(categories, mode) {
    const modeConfig = MODES[mode] || MODES.md

    if (modeConfig.allowedCategories) {
        return categories.filter(cat => modeConfig.allowedCategories.includes(cat.toLowerCase()))
    }

    if (modeConfig.excludeCategories) {
        return categories.filter(cat => !modeConfig.excludeCategories.includes(cat.toLowerCase()))
    }

    return categories
}

export { pluginConfig as config, handler, getGroupMode, getModeCategories, filterCategoriesByMode, MODES }
