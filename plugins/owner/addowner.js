import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
import { addJadibotOwner, removeJadibotOwner, getJadibotOwners } from '../../src/lib/ourin-jadibot-database.js'
import fs from 'fs'
import path from 'path'
import { isLid, lidToJid, resolveAnyLidToJid, isLidConverted } from '../../src/lib/ourin-lid.js'
import { getGroupMode } from '../group/botmode.js'

const pluginConfig = {
    name: 'addowner',
    alias: ['addown', 'setowner', 'delowner', 'dedown', 'ownerlist', 'listowner'],
    category: 'owner',
    description: 'Gestionar propietarios del bot (mode-aware)',
    usage: '.addowner <número/@tag/reply>',
    example: '.addowner 34600000000',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function cleanJid(jid) {
    if (!jid) return null
    if (isLid(jid)) jid = lidToJid(jid)
    return jid.includes('@') ? jid : jid + '@s.whatsapp.net'
}

function extractNumber(m) {
    let targetNumber = ''
    
    if (m.quoted) {
        let sender = m.quoted.sender || ''
        if (isLid(sender) || isLidConverted(sender)) {
            sender = resolveAnyLidToJid(sender, m.groupMembers || [])
        }
        targetNumber = sender?.replace(/[^0-9]/g, '') || ''
    } else if (m.mentionedJid?.length) {
        let jid = cleanJid(m.mentionedJid[0])
        if (isLid(jid) || isLidConverted(jid)) {
            jid = resolveAnyLidToJid(jid, m.groupMembers || [])
        }
        targetNumber = jid?.replace(/[^0-9]/g, '') || ''
    } else if (m.args[0]) {
        targetNumber = m.args[0].replace(/[^0-9]/g, '')
        if (targetNumber.startsWith('0')) {
            // Ajuste para números locales si fuera necesario, 
            // generalmente se prefiere formato internacional completo
            targetNumber = targetNumber.replace(/^0/, '34') // Ejemplo para España, ajustar según prefijo
        }
    }
    
    if (targetNumber.length > 15) return ''
    return targetNumber
}

function savePanelConfig() {
    try {
        const configPath = path.join(process.cwd(), 'config.js')
        let content = fs.readFileSync(configPath, 'utf8')
        
        const ownerPanelsStr = JSON.stringify(config.pterodactyl.ownerPanels || [])
        content = content.replace(
            /ownerPanels:\s*\[.*?\]/s,
            `ownerPanels: ${ownerPanelsStr}`
        )
        
        const sellersStr = JSON.stringify(config.pterodactyl.sellers || [])
        content = content.replace(
            /sellers:\s*\[.*?\]/s,
            `sellers: ${sellersStr}`
        )
        
        fs.writeFileSync(configPath, content, 'utf8')
        return true
    } catch (e) {
        console.error('[AddOwner] Error al guardar config del panel:', e.message)
        return false
    }
}

function removeFromSellers(targetNumber) {
    if (!config.pterodactyl.sellers) return false
    const idx = config.pterodactyl.sellers.findIndex(s => String(s).trim() === String(targetNumber).trim())
    if (idx !== -1) {
        config.pterodactyl.sellers.splice(idx, 1)
        return true
    }
    return false
}

function removeFromOwnerPanels(targetNumber) {
    if (!config.pterodactyl.ownerPanels) return false
    const idx = config.pterodactyl.ownerPanels.findIndex(s => String(s).trim() === String(targetNumber).trim())
    if (idx !== -1) {
        config.pterodactyl.ownerPanels.splice(idx, 1)
        return true
    }
    return false
}

async function handler(m, { sock, jadibotId, isJadibot }) {
    const db = getDatabase()
    const cmd = m.command.toLowerCase()
    const groupMode = m.isGroup ? getGroupMode(m.chat, db) : 'private'
    const isCpanelMode = m.isGroup && groupMode === 'cpanel'
    
    const isAdd = ['addowner', 'addown', 'setowner'].includes(cmd)
    const isDel = ['delowner', 'dedown'].includes(cmd)
    const isList = ['ownerlist', 'listowner'].includes(cmd)
    
    if (!config.pterodactyl) config.pterodactyl = {}
    if (!config.pterodactyl.ownerPanels) config.pterodactyl.ownerPanels = []
    if (!config.pterodactyl.sellers) config.pterodactyl.sellers = []
    if (!db.data.owner) db.data.owner = []
    
    if (isList) {
        if (isJadibot && jadibotId) {
            const jbOwners = getJadibotOwners(jadibotId)
            if (jbOwners.length === 0) {
                return m.reply(`📋 *LISTA DE OWNERS JADIBOT*\n\n> No hay propietarios registrados.\n> Usa \`${m.prefix}addowner\` para añadir.`)
            }
            let txt = `📋 *LISTA DE OWNERS JADIBOT* — ${jadibotId}\n\n`
            jbOwners.forEach((s, i) => { txt += `${i + 1}. \`${s}\`\n` })
            txt += `\nTotal: *${jbOwners.length}* propietarios`
            return m.reply(txt)
        } else if (isCpanelMode) {
            const panelOwners = config.pterodactyl.ownerPanels || []
            const fullOwners = db.data.owner || []
            const allOwners = [...new Set([...panelOwners, ...fullOwners])]
            
            if (allOwners.length === 0) {
                return m.reply(`📋 *LISTA DE OWNERS DEL PANEL*\n\n> No hay propietarios de panel registrados.`)
            }
            let txt = `📋 *LISTA DE OWNERS DEL PANEL*\n\n`
            allOwners.forEach((s, i) => {
                const label = panelOwners.includes(s) && fullOwners.includes(s) ? '👑🖥️' : (fullOwners.includes(s) ? '👑' : '🖥️')
                txt += `${i + 1}. ${label} \`${s}\`\n`
            })
            txt += `\nTotal: *${allOwners.length}* propietarios | 👑 Full, 🖥️ Panel`
            return m.reply(txt)
        } else {
            const fullOwners = db.data.owner || []
            if (fullOwners.length === 0) {
                return m.reply(`📋 *LISTA DE FULL OWNERS*\n\n> No hay propietarios full registrados.`)
            }
            let txt = `📋 *LISTA DE FULL OWNERS*\n\n`
            fullOwners.forEach((s, i) => { txt += `${i + 1}. 👑 \`${s}\`\n` })
            txt += `\nTotal: *${fullOwners.length}* propietarios`
            return m.reply(txt)
        }
    }
    
    const targetNumber = await extractNumber(m)
    
    if (!targetNumber) {
        return m.reply(
            `👑 *${isAdd ? 'AÑADIR' : 'ELIMINAR'} OWNER*\n\n` +
            `Responde, etiqueta o escribe el número del usuario\n` +
            `\`Ejemplo: ${m.prefix}${cmd} 34600000000\``
        )
    }
    
    if (targetNumber.length < 10 || targetNumber.length > 15) {
        return m.reply(`❌ *ERROR*\n\n> El formato del número no es válido`)
    }
    
    if (isJadibot && jadibotId) {
        if (isAdd) {
            if (addJadibotOwner(jadibotId, targetNumber)) {
                await m.react('👑')
                return m.reply(`✅ *${targetNumber}* ha sido añadido como owner del jadibot`)
            } else {
                return m.reply(`❌ \`${targetNumber}\` ya es owner de este Jadibot.`)
            }
        } else if (isDel) {
            if (removeJadibotOwner(jadibotId, targetNumber)) {
                await m.react('✅')
                return m.reply(`✅ *${targetNumber}* ha sido eliminado de los owners del jadibot`)
            } else {
                return m.reply(`❌ \`${targetNumber}\` no es owner de este Jadibot.`)
            }
        }
        return
    }
    
    if (isCpanelMode) {
        if (isAdd) {
            if (config.pterodactyl.ownerPanels.includes(targetNumber)) {
                return m.reply(`❌ \`${targetNumber}\` ya es owner del panel.`)
            }
            
            let roleChanged = ''
            if (removeFromSellers(targetNumber)) {
                roleChanged = `\n> ⚡ Mejora automática de Vendedor a Owner de Panel`
            }
            
            config.pterodactyl.ownerPanels.push(targetNumber)
            if (savePanelConfig()) {
                await m.react('👑')
                return m.reply(`✅ *${targetNumber}* ha sido añadido como owner del panel${roleChanged}`)
            } else {
                config.pterodactyl.ownerPanels = config.pterodactyl.ownerPanels.filter(s => s !== targetNumber)
                return m.reply(`❌ Error al guardar en config.js`)
            }
        } else if (isDel) {
            const ownerList = config.pterodactyl.ownerPanels || []
            const found = ownerList.find(o => String(o).trim() === String(targetNumber).trim())
            if (!found) {
                return m.reply(`❌ \`${targetNumber}\` no es owner del panel.`)
            }
            config.pterodactyl.ownerPanels = ownerList.filter(s => String(s).trim() !== String(targetNumber).trim())
            if (savePanelConfig()) {
                await m.react('✅')
                return m.reply(`✅ *${targetNumber}* ha sido eliminado de los owners del panel`)
            } else {
                return m.reply(`❌ Error al guardar en config.js`)
            }
        }
    } else {
        if (isAdd) {
            if (db.data.owner.includes(targetNumber)) {
                return m.reply(`❌ \`${targetNumber}\` ya es full owner.`)
            }
            
            let roleChanged = ''
            if (removeFromSellers(targetNumber)) {
                roleChanged = `\n> ⚡ Mejora automática desde Vendedor`
                savePanelConfig()
            }
            if (removeFromOwnerPanels(targetNumber)) {
                roleChanged = `\n> ⚡ Mejora automática desde Owner de Panel`
                savePanelConfig()
            }
            
            db.data.owner.push(targetNumber)
            db.save()
            
            await m.react('👑')
            return m.reply(`✅ *${targetNumber}* ha sido añadido como full owner${roleChanged}`)
        } else if (isDel) {
            const index = db.data.owner.indexOf(targetNumber)
            if (index === -1) {
                return m.reply(`❌ \`${targetNumber}\` no es full owner.`)
            }
            
            db.data.owner.splice(index, 1)
            db.save()
            
            await m.react('✅')
            return m.reply(`✅ *${targetNumber}* ha sido eliminado de los full owners`)
        }
    }
}

export { pluginConfig as config, handler, removeFromSellers, removeFromOwnerPanels }
