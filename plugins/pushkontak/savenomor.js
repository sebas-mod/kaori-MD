import { getDatabase } from '../../src/lib/ourin-database.js'
import { getGroupMode } from '../group/botmode.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'guardarnumero',
    alias: ['sv', 'save', 'guardar'],
    category: 'pushkontak', // Categoría original sin traducir
    description: 'Guarda un número en los contactos del bot',
    usage: '.guardarnumero <nombre>',
    example: '.guardarnumero JuanPerez',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    
    if (m.isGroup) {
        const modoGrupo = getGroupMode(m.chat, db)
        if (modoGrupo !== 'pushkontak' && modoGrupo !== 'all') {
            return m.reply(`❌ *ᴍᴏᴅᴏ ɴᴏ ᴀᴄᴛɪᴠᴀᴅᴏ*\n\n> Activa el modo pushkontak primero para usar esta función\n\n\`${m.prefix}botmode pushkontak\``)
        }
    }
    
    let numeroTarget = ''
    let nombre = ''
    
    if (m.isGroup) {
        if (m.quoted) {
            numeroTarget = m.quoted.sender
            nombre = m.text?.trim()
        } else if (m.mentionedJid?.length) {
            numeroTarget = m.mentionedJid[0]
            const entrada = m.text?.trim()
            nombre = entrada?.split('|')[1]?.trim() || entrada?.replace(/@\d+/g, '').trim()
        } else if (m.text?.includes('|')) {
            const [num, nm] = m.text.split('|').map(s => s.trim())
            numeroTarget = num.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
            nombre = nm
        } else {
            return m.reply(
                `📱 *ɢᴜᴀʀᴅᴀʀ ɴᴜᴍᴇʀᴏ*\n\n` +
                `> En grupo:\n` +
                `┃ \`${m.prefix}guardarnumero nombre\` (respondiendo un mensaje)\n` +
                `┃ \`${m.prefix}guardarnumero @tag|nombre\`\n` +
                `┃ \`${m.prefix}guardarnumero 549xxx|nombre\`\n\n` +
                `> En privado:\n` +
                `┃ \`${m.prefix}guardarnumero nombre\``
            )
        }
    } else {
        numeroTarget = m.chat
        nombre = m.text?.trim()
    }
    
    if (!nombre) {
        return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> Por favor, ingresa un nombre para el contacto`)
    }
    
    if (!numeroTarget) {
        return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> No se pudo determinar el número de destino`)
    }
    
    m.react('📱')
    
    try {
        const accionContacto = {
            fullName: nombre,
            lidJid: numeroTarget,
            saveOnPrimaryAddressbook: true
        }
        
        await sock.addOrEditContact(numeroTarget, accionContacto)
        
        m.react('✅')
        await m.reply(
            `✅ *ᴄᴏɴᴛᴀᴄᴛᴏ ɢᴜᴀʀᴅᴀᴅᴏ*\n\n` +
            `> ɴᴜᴍᴇʀᴏ: \`${numeroTarget.split('@')[0]}\`\n` +
            `> ɴᴏᴍʙʀᴇ: \`${nombre}\``
        )
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
