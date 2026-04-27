import * as pakasir from '../../src/lib/ourin-pakasir.js'
import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'botmode',
    alias: ['setmode', 'modo'],
    category: 'owner',
    description: 'Configura el modo del bot (md/cpanel/store/pushkontak/all)',
    usage: '.botmode <modo> [--autoorder]',
    example: '.botmode store --autoorder',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

const VALID_MODES = ['md', 'cpanel', 'store', 'pushkontak', 'all']

const MODE_DESCRIPTIONS = {
    md: 'Modo predeterminado: todas las funciones excepto panel/tienda/pushkontak',
    cpanel: 'Modo Panel: funciones principales + grupos + stickers + owner + herramientas + panel',
    store: 'Modo Tienda: funciones principales + grupos + stickers + owner + tienda',
    pushkontak: 'Modo Push: funciones principales + grupos + stickers + owner + pushkontak',
    all: 'Modo Full: permite el acceso a TODAS las funciones de todos los modos'
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    const mode = (args[0] || '').toLowerCase()
    const flags = args.slice(1).map(f => f.toLowerCase())
    
    // Nota: El flag se detecta si incluye '--autoorder'
    const isAutoorder = flags.includes('--autoorder')
    
    const globalMode = db.setting('botMode') || 'md'
    const groupData = m.isGroup ? (db.getGroup(m.chat) || {}) : {}
    const groupMode = groupData.botMode || null

    if (!mode) {
        const autoorderStatus = groupData.storeConfig?.autoorder ? '✅ ON' : '❌ OFF'
        let txt = `╭┈┈⬡「 🤖 *MODO DEL BOT* 」
┃ ㊗ Global: *${globalMode.toUpperCase()}*
${m.isGroup ? `┃ ㊗ Grupo: *${(groupMode || 'HEREDADO').toUpperCase()}*\n` : ''}${m.isGroup && (groupMode === 'store' || (!groupMode && globalMode === 'store')) ? `┃ ㊗ Auto-pedido: *${autoorderStatus}*\n` : ''}╰┈┈⬡

╭┈┈⬡「 📋 *MODOS DISPONIBLES* 」
`
        const currentMode = m.isGroup ? (groupMode || globalMode) : globalMode
        for (const [key, desc] of Object.entries(MODE_DESCRIPTIONS)) {
            const isActive = key === currentMode ? ' ✅' : ''
            txt += `┃ ㊗ *${key.toUpperCase()}*${isActive}\n`
            txt += `┃   ${desc}\n`
        }
        txt += `╰┈┈⬡

*FLAGS DE TIENDA:*
> \`${m.prefix}botmode store\` - Pedido manual
> \`${m.prefix}botmode store --autoorder\` - Pago automático
> \`${m.prefix}botmode md\` → Modo predeterminado
> \`${m.prefix}botmode all\` → Todas las funciones`
        
        await m.reply(txt)
        return
    }

    if (!VALID_MODES.includes(mode)) {
        return m.reply(
            `❌ *MODO NO VÁLIDO*\n\n` +
            `> Modos disponibles: \`${VALID_MODES.join(', ')}\``
        )
    }

    if (m.isGroup) {
        const newGroupData = {
            ...groupData,
            botMode: mode
        }
        if (mode === 'store') {
            newGroupData.storeConfig = {
                ...(groupData.storeConfig || {}),
                autoorder: isAutoorder,
                products: groupData.storeConfig?.products || []
            }
        }
        db.setGroup(m.chat, newGroupData)
    } else {
        db.setting('botMode', mode)
    }
    db.save()
    
    await m.react('✅')
    
    let extraInfo = ''
    if (mode === 'store' && m.isGroup) {
        if (isAutoorder) {
            try {
                if (!pakasir.isEnabled()) {
                    extraInfo = `\n\n⚠️ *¡Pakasir no está configurado!*\n> Configura en config.js: pakasir.slug y pakasir.apiKey`
                } else {
                    extraInfo = `\n\n✅ *¡Auto-pedido activo!*\n> Pagos automáticos vía Pakasir`
                }
            } catch {
                extraInfo = `\n\n⚠️ *Módulo Pakasir no encontrado*`
            }
        } else {
            extraInfo = `\n\n📋 *Modo Manual*\n> El administrador debe confirmar los pedidos manualmente`
        }
    }

    await m.reply(
        `✅ *MODO CAMBIADO*\n\n` +
        `> Modo: *${mode.toUpperCase()}*\n` +
        `> ${MODE_DESCRIPTIONS[mode]}\n` +
        (mode === 'store' && m.isGroup ? `> Auto-pedido: *${isAutoorder ? 'ON' : 'OFF'}*` : '') +
        extraInfo +
        `\n\n` +
        (m.isGroup ? `> _Se cambió el modo para este grupo._` : `> _Se cambió el modo global._`)
    )
}

export { pluginConfig as config, handler, VALID_MODES, MODE_DESCRIPTIONS }
