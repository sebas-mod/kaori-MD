import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'
import fs from 'fs'
import path from 'path'
const pluginConfig = {
    name: 'autoreply',
    alias: ['smarttrigger', 'smarttriggers', 'ar'],
    category: 'group',
    description: 'Configurar respuestas automáticas/triggers inteligentes por grupo',
    usage: '.autoreply on/off/add/del/list/private',
    example: '.autoreply on',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true,
    isAdmin: false,
    isBotAdmin: false
}

const AUTOREPLY_MEDIA_DIR = path.join(process.cwd(), 'database', 'autoreply_media')

if (!fs.existsSync(AUTOREPLY_MEDIA_DIR)) {
    fs.mkdirSync(AUTOREPLY_MEDIA_DIR, { recursive: true })
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    const action = args[0]?.toLowerCase()
    
    const privateAutoreply = db.setting('autoreplyPrivate') ?? false
    
    if (action === 'private') {
        if (!m.isOwner) {
            return m.reply(`❌ *ERROR*\n\n> ¡Solo el Owner puede configurar el autoreply privado!`)
        }
        
        const subAction = args[1]?.toLowerCase()
        
        if (subAction === 'on') {
            db.setting('autoreplyPrivate', true)
            m.react('✅')
            return m.reply(`✅ *AUTOREPLY PRIVADO ACTIVADO*\n\n> El Bot responderá automáticamente en chats privados`)
        }
        
        if (subAction === 'off') {
            db.setting('autoreplyPrivate', false)
            m.react('❌')
            return m.reply(`❌ *AUTOREPLY PRIVADO DESACTIVADO*\n\n> El Bot no responderá automáticamente en chats privados`)
        }
        
        const currentStatus = db.setting('autoreplyPrivate') ?? false
        return m.reply(
            `📱 *AUTOREPLY PRIVADO*\n\n` +
            `Estado: *${currentStatus ? '✅ ACTIVO' : '❌ INACTIVO'}*\n\n` +
            `*COMANDOS DISPONIBLES:*\n` +
            `• *${m.prefix}autoreply private on* — Activar privado\n` +
            `• *${m.prefix}autoreply private off* — Desactivar privado`
        )
    }
    
    if (action === 'global') {
        if (!m.isOwner) {
            return m.reply(`❌ *ERROR*\n\n> ¡Solo el Owner puede configurar el autoreply global!`)
        }
        
        const subAction = args[1]?.toLowerCase()
        const globalCustomReplies = db.setting('globalCustomReplies') || []
        
        if (subAction === 'add') {
            const fullBody = m.body || ''
            const pipeIdx = fullBody.indexOf('|')
            if (pipeIdx === -1) {
                return m.reply(
                    `❌ *FORMATO INCORRECTO*\n\n` +
                    `> Usa el formato: \`trigger|respuesta\`\n\n` +
                    `> Ejemplo:\n` +
                    `> \`${m.prefix}autoreply global add hola|¡Hola {name}!\``
                )
            }
            
            const triggerStart = fullBody.toLowerCase().indexOf('global add ') + 'global add '.length
            const triggerEnd = pipeIdx
            const trigger = fullBody.substring(triggerStart, triggerEnd).trim()
            const reply = fullBody.substring(pipeIdx + 1)
            
            if (!trigger.trim() || !reply) {
                return m.reply(`❌ *ERROR*\n\n> ¡El trigger y la respuesta no pueden estar vacíos!`)
            }
            
            const existingIndex = globalCustomReplies.findIndex(r => r.trigger.toLowerCase() === trigger.trim().toLowerCase())
            if (existingIndex !== -1) {
                globalCustomReplies[existingIndex].reply = reply
            } else {
                globalCustomReplies.push({ trigger: trigger.trim().toLowerCase(), reply: reply })
            }
            
            db.setting('globalCustomReplies', globalCustomReplies)
            await db.save()
            
            m.react('✅')
            return m.reply(
                `✅ *AUTOREPLY GLOBAL AÑADIDO*\n\n` +
                `• Trigger: *${trigger.trim()}*\n` +
                `• Total: *${globalCustomReplies.length}* respuestas\n\n` +
                `_Activo en todos los grupos y chats privados_`
            )
        }
        
        if (subAction === 'del' || subAction === 'rm') {
            const trigger = args.slice(2).join(' ').toLowerCase().trim()
            if (!trigger) {
                return m.reply(`❌ *ERROR*\n\n> ¡Ingresa el trigger que deseas eliminar!`)
            }
            
            const index = globalCustomReplies.findIndex(r => r.trigger === trigger)
            if (index === -1) {
                return m.reply(`❌ *ERROR*\n\n> ¡Trigger \`${trigger}\` no encontrado!`)
            }
            
            globalCustomReplies.splice(index, 1)
            db.setting('globalCustomReplies', globalCustomReplies)
            await db.save()
            
            m.react('🗑️')
            return m.reply(`🗑️ *AUTOREPLY GLOBAL ELIMINADO*\n\n¡El trigger *${trigger}* fue eliminado con éxito!`)
        }
        
        if (subAction === 'list' || !subAction) {
            if (globalCustomReplies.length === 0) {
                return m.reply(
                    `📋 *AUTOREPLY GLOBAL*\n\n` +
                    `Estado: *❌ SIN DATOS*\n\n` +
                    `*COMANDOS DISPONIBLES:*\n` +
                    `• *${m.prefix}autoreply global add <trigger>|<respuesta>*`
                )
            }
            
            let text = `📋 *AUTOREPLY GLOBAL*\n\n`
            text += `Total: *${globalCustomReplies.length}* respuestas\n`
            text += `Válido en: *Todos los Grupos y Chats Privados*\n\n`
            text += `*LISTA DE TRIGGERS:*\n`
            globalCustomReplies.forEach((r, i) => {
                const hasImage = r.image ? '🖼️' : ''
                text += `${i + 1}. *${r.trigger}* ${hasImage}\n   ↳ ${r.reply.substring(0, 30)}${r.reply.length > 30 ? '...' : ''}\n\n`
            })
            return m.reply(text.trim())
        }
        
        return m.reply(
            `📱 *AUTOREPLY GLOBAL*\n\n` +
            `> \`${m.prefix}autoreply global add trigger|respuesta\`\n` +
            `> \`${m.prefix}autoreply global del trigger\`\n` +
            `> \`${m.prefix}autoreply global list\``
        )
    }
    
    if (!m.isGroup) {
        return m.reply(
            `📱 *SISTEMA DE AUTOREPLY*\n\n` +
            `Autoreply Privado: *${privateAutoreply ? '✅ ACTIVO' : '❌ INACTIVO'}*\n\n` +
            `*COMANDOS DISPONIBLES:*\n` +
            `• *${m.prefix}autoreply private on/off* — Alternar privado\n` +
            `• *${m.prefix}autoreply global add/del/list* — Triggers globales\n\n` +
            `_Nota: Para configurar autoreply de grupo, usa este comando dentro de un grupo._`
        )
    }
    
    if (!m.isAdmin && !m.isOwner) {
        return m.reply(`❌ *ERROR*\n\n> ¡Solo los administradores pueden configurar el autoreply en el grupo!`)
    }
    
    const groupData = db.getGroup(m.chat) || {}
    const globalSmartTriggers = db.setting('smartTriggers') ?? config.features?.smartTriggers ?? false
    
    if (!action || action === 'status') {
        const groupStatus = groupData.autoreply
        const effectiveStatus = groupStatus ?? globalSmartTriggers
        const customReplies = groupData.customReplies || []
        
        let text = `🤖 *SISTEMA DE AUTOREPLY GRUPAL*\n\n`
        text += `Estado Global: *${globalSmartTriggers ? '✅ ACTIVO' : '❌ INACTIVO'}*\n`
        text += `Estado de este Grupo: *${groupStatus === undefined ? 'POR DEFECTO' : (groupStatus ? '✅ ACTIVO' : '❌ INACTIVO')}*\n`
        text += `Estado Privado: *${privateAutoreply ? '✅ ACTIVO' : '❌ INACTIVO'}*\n`
        text += `Efectivo en Grupo: *${effectiveStatus ? '✅ ACTIVO' : '❌ INACTIVO'}*\n`
        text += `Total Respuestas Custom (Grupo): *${customReplies.length}*\n\n`
        text += `*GESTIÓN DE GRUPO:*\n`
        text += `• *${m.prefix}autoreply on* — Activar en este grupo\n`
        text += `• *${m.prefix}autoreply off* — Desactivar en este grupo\n`
        text += `• *${m.prefix}autoreply add <trigger>|<respuesta>* — Añadir respuesta custom\n`
        text += `• *${m.prefix}autoreply del <trigger>* — Eliminar respuesta custom\n`
        text += `• *${m.prefix}autoreply list* — Ver triggers de este grupo\n`
        text += `• *${m.prefix}autoreply reset* — Eliminar TODAS las custom de este grupo\n\n`
        
        if (m.isOwner) {
            text += `*GESTIÓN GLOBAL (OWNER):*\n`
            text += `• *${m.prefix}autoreply global add <trigger>|<respuesta>*\n`
            text += `• *${m.prefix}autoreply global del <trigger>*\n`
            text += `• *${m.prefix}autoreply global list* — Triggers globales activos\n`
            text += `• *${m.prefix}autoreply private on/off* — Alternar respuesta en DM\n\n`
        }
        
        text += `*CÓMO AÑADIR IMÁGENES:*\n`
        text += `1. Envía una imagen con el texto: *${m.prefix}autoreply add trigger|respuesta*\n`
        text += `2. O responde a una imagen con: *${m.prefix}autoreply add trigger|respuesta*\n\n`
        text += `*PLACEHOLDERS DISPONIBLES:*\n`
        text += `{name} • {tag} • {sender} • {botname} • {time} • {date}`
        
        return m.reply(text)
    }
    
    if (action === 'on') {
        db.setGroup(m.chat, { ...groupData, autoreply: true })
        m.react('✅')
        return m.reply(`✅ *AUTOREPLY ACTIVADO*\n\n> El Bot responderá automáticamente en este grupo`)
    }
    
    if (action === 'off') {
        db.setGroup(m.chat, { ...groupData, autoreply: false })
        m.react('❌')
        return m.reply(`❌ *AUTOREPLY DESACTIVADO*\n\n> El Bot no responderá automáticamente en este grupo`)
    }
    
    if (action === 'add') {
        const fullBody = m.body || ''
        const pipeIdx = fullBody.indexOf('|')
        
        if (pipeIdx === -1) {
            return m.reply(
                `❌ *FORMATO INCORRECTO*\n\n` +
                `Usa el formato: *trigger|respuesta*\n\n` +
                `*Solo Texto:*\n` +
                `• ${m.prefix}ar add hola|¡Hola {name}! 👋\n\n` +
                `*Con Imagen:*\n` +
                `1. Responde a una imagen + ${m.prefix}ar add trigger|respuesta\n` +
                `2. Envía imagen + texto ${m.prefix}ar add trigger|respuesta\n\n` +
                `*Placeholders:*\n` +
                `• {name} - Nombre del usuario\n` +
                `• {tag} - Mencionar @usuario\n` +
                `• {sender} - Número del usuario\n` +
                `• {botname} - Nombre del bot\n` +
                `• {time} - Hora actual\n` +
                `• {date} - Fecha actual`
            )
        }
        
        const addIdx = fullBody.toLowerCase().indexOf('add ')
        const triggerStart = addIdx + 'add '.length
        const trigger = fullBody.substring(triggerStart, pipeIdx).trim()
        const reply = fullBody.substring(pipeIdx + 1)
        
        if (!trigger) {
            return m.reply(`❌ *ERROR*\n\n> ¡El trigger no puede estar vacío!`)
        }
        
        let imageBuffer = null
        let imagePath = null
        
        const hasQuotedImage = m.quoted && (m.quoted.mtype === 'imageMessage' || m.quoted.type === 'image')
        const hasDirectImage = m.mtype === 'imageMessage' || m.type === 'image'
        
        if (hasQuotedImage) {
            try {
                imageBuffer = await m.quoted.download()
            } catch (e) {
                console.error('[Autoreply] Error al descargar imagen citada:', e.message)
            }
        } else if (hasDirectImage) {
            try {
                imageBuffer = await m.download()
            } catch (e) {
                console.error('[Autoreply] Error al descargar imagen directa:', e.message)
            }
        }
        
        if (imageBuffer) {
            const filename = `${m.chat.replace('@g.us', '')}_${trigger.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.jpg`
            imagePath = path.join(AUTOREPLY_MEDIA_DIR, filename)
            fs.writeFileSync(imagePath, imageBuffer)
        }
        
        const customReplies = groupData.customReplies || []
        const existingIndex = customReplies.findIndex(r => r.trigger.toLowerCase() === trigger.toLowerCase())
        
        const replyData = {
            trigger: trigger.toLowerCase(),
            reply: reply || '',
            image: imagePath || null,
            createdAt: Date.now()
        }
        
        if (existingIndex !== -1) {
            if (customReplies[existingIndex].image && customReplies[existingIndex].image !== imagePath) {
                try {
                    if (fs.existsSync(customReplies[existingIndex].image)) {
                        fs.unlinkSync(customReplies[existingIndex].image)
                    }
                } catch {}
            }
            customReplies[existingIndex] = replyData
        } else {
            customReplies.push(replyData)
        }
        
        db.setGroup(m.chat, { ...groupData, customReplies })
        
        m.react('✅')
        
        let successMsg = `✅ *AUTOREPLY AÑADIDO*\n\n`
        successMsg += `*DETALLES:*\n`
        successMsg += `• Trigger: *${trigger.trim()}*\n`
        if (reply) {
            successMsg += `• Respuesta: ${reply.substring(0, 50)}${reply.length > 50 ? '...' : ''}\n`
        }
        if (imagePath) {
            successMsg += `• Imagen: ✅ Guardada\n`
        }
        successMsg += `\nTotal: *${customReplies.length}* respuestas en este grupo`
        
        return m.reply(successMsg)
    }
    
    if (action === 'del' || action === 'rm' || action === 'remove') {
        const trigger = args.slice(1).join(' ').toLowerCase().trim()
        
        if (!trigger) {
            return m.reply(`❌ *ERROR*\n\n> ¡Ingresa el trigger que deseas eliminar!\n\n\`${m.prefix}autoreply del hola\``)
        }
        
        const customReplies = groupData.customReplies || []
        const index = customReplies.findIndex(r => r.trigger === trigger)
        
        if (index === -1) {
            return m.reply(`❌ *ERROR*\n\n> ¡Trigger \`${trigger}\` no encontrado!`)
        }
        
        if (customReplies[index].image) {
            try {
                if (fs.existsSync(customReplies[index].image)) {
                    fs.unlinkSync(customReplies[index].image)
                }
            } catch {}
        }
        
        customReplies.splice(index, 1)
        db.setGroup(m.chat, { ...groupData, customReplies })
        
        m.react('🗑️')
        return m.reply(
            `🗑️ *AUTOREPLY ELIMINADO*\n\n` +
            `¡El trigger *${trigger}* fue eliminado con éxito!\n` +
            `Restantes: *${customReplies.length}* respuestas`
        )
    }
    
    if (action === 'list') {
        const customReplies = groupData.customReplies || []
        
        const defaultTriggers = [
            { trigger: '@mention', reply: '👋 ¡Hola! ¿Alguien llamó al bot?' },
            { trigger: 'p', reply: '💬 ¡Por favor, saluda antes de empezar!' },
            { trigger: 'bot / ourin', reply: '🤖 ¡El bot está activo y listo!' },
            { trigger: 'assalamualaikum', reply: 'Waalaikumsalam, hermano/a' }
        ]
        
        let text = `📋 *LISTA DE AUTOREPLY DEL GRUPO*\n\n`
        
        text += `*TRIGGERS POR DEFECTO:*\n`
        defaultTriggers.forEach((r, i) => {
            text += `• *${r.trigger}*\n`
            text += `   ↳ ${r.reply}\n`
        })
        text += `\n`
        
        if (customReplies.length > 0) {
            text += `*TRIGGERS PERSONALIZADOS:*\n`
            customReplies.forEach((r, i) => {
                const hasImage = r.image ? '🖼️' : ''
                text += `• *${r.trigger}* ${hasImage}\n`
                if (r.reply) {
                    text += `   ↳ ${r.reply.substring(0, 35)}${r.reply.length > 35 ? '...' : ''}\n`
                }
            })
            text += `\n`
        } else {
            text += `*TRIGGERS PERSONALIZADOS:*\n`
            text += `_Aún no hay triggers personalizados en este grupo_\n\n`
        }
        
        text += `_Nota: Los triggers por defecto del bot no se pueden editar._`
        
        return m.reply(text)
    }
    
    if (action === 'reset' || action === 'clear') {
        const customReplies = groupData.customReplies || []
        for (const r of customReplies) {
            if (r.image) {
                try {
                    if (fs.existsSync(r.image)) fs.unlinkSync(r.image)
                } catch {}
            }
        }
        
        db.setGroup(m.chat, { ...groupData, customReplies: [] })
        m.react('🗑️')
        return m.reply(`🗑️ *AUTOREPLY REINICIADO*\n\n> ¡Se eliminaron todas las respuestas personalizadas!`)
    }
    
    return m.reply(`❌ *ACCIÓN NO VÁLIDA*\n\n> Usa: \`on\`, \`off\`, \`private on/off\`, \`add\`, \`del\`, \`list\`, \`reset\``)
}

export { pluginConfig as config, handler }
