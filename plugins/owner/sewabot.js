import { getDatabase } from '../../src/lib/ourin-database.js'
import fs from 'fs'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'sewabot',
    alias: ['alquilar', 'alquilerbot', 'sewa'],
    category: 'owner',
    description: 'Alternar y gestionar el sistema de alquiler del bot',
    usage: '.sewabot <on/off/leave/status>',
    example: '.sewabot on',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const pendingConfirmations = new Map()

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.text?.trim()?.toLowerCase()

    if (!db.db.data.sewa) {
        db.db.data.sewa = { enabled: false, groups: {} }
        db.db.write()
    }

    const currentStatus = db.db.data.sewa.enabled
    const sewaGroups = Object.keys(db.db.data.sewa.groups || {})

    if (!args || args === 'status') {
        return m.reply(
            `🔧 *SISTEMA DE ALQUILER DEL BOT*\n\n` +
            `Estado: *${currentStatus ? '✅ ACTIVO' : '❌ DESACTIVADO'}*\n` +
            `Grupos registrados: *${sewaGroups.length}*\n\n` +
            `*COMANDOS DISPONIBLES:*\n` +
            `• *${m.prefix}sewabot on* — Activar sistema de alquiler\n` +
            `• *${m.prefix}sewabot off* — Desactivar sistema de alquiler\n` +
            `• *${m.prefix}sewabot leave* — Salir de grupos no autorizados\n\n` +
            `*GESTIÓN DE ALQUILER:*\n` +
            `• *${m.prefix}addsewa <link> <duración>* — Añadir grupo + auto join\n` +
            `• *${m.prefix}delsewa <link/id>* — Eliminar grupo de la lista blanca\n` +
            `• *${m.prefix}renewsewa <link/id> <duración>* — Extender alquiler\n` +
            `• *${m.prefix}listsewa* — Ver todos los grupos registrados\n` +
            `• *${m.prefix}checksewa* — Ver tiempo restante (en el grupo)\n\n` +
            `*FORMATO DE DURACIÓN:*\n` +
            `30i (minutos) \u2022 12h (horas) \u2022 7d (días) \u2022 1m (mes) \u2022 1y (año) \u2022 lifetime\n\n` +
            `*CÓMO FUNCIONA:*\n` +
            `1. Añade un grupo con *${m.prefix}addsewa*\n` +
            `2. El bot se unirá automáticamente si usas un enlace\n` +
            `3. Activa el sistema con *${m.prefix}sewabot on*\n` +
            `4. El bot saldrá de todos los grupos que no estén registrados\n` +
            `5. Al vencer el alquiler → el bot sale automáticamente del grupo`
        )
    }

    if (args === 'off') {
        db.db.data.sewa.enabled = false
        db.db.write()
        await m.react('✅')
        return m.reply(`✅ Sistema de alquiler desactivado.\n\nEl bot no abandonará ningún grupo automáticamente.`)
    }

    if (args === 'on') {
        const pending = pendingConfirmations.get(m.sender)
        if (pending && pending.type === 'sewabot_on' && Date.now() - pending.timestamp < 60000) {
            return m.reply(`🕕 Ya tienes una solicitud pendiente.\n\nEscribe *${m.prefix}sewabot confirm* para continuar\nEscribe *${m.prefix}sewabot cancel* para abortar`)
        }
        pendingConfirmations.set(m.sender, { type: 'sewabot_on', timestamp: Date.now() })
        setTimeout(() => {
            if (pendingConfirmations.get(m.sender)?.type === 'sewabot_on') pendingConfirmations.delete(m.sender)
        }, 60000)
        return m.reply(
            `⚠️ *CONFIRMACIÓN DE ACTIVACIÓN*\n\n` +
            `Si activas el sistema:\n` +
            `• ✅ Los ${sewaGroups.length} grupos en lista blanca están seguros.\n` +
            `• ❌ ¡El bot saldrá de TODOS los demás grupos!\n\n` +
            `Escribe *${m.prefix}sewabot confirm* para continuar\nEscribe *${m.prefix}sewabot cancel* para cancelar\n\n` +
            `💡 Asegúrate de registrar grupos importantes primero con:\n*${m.prefix}addsewa <enlace> <duración>*`
        )
    }

    if (args === 'confirm' || args === 'yes' || args === 'y') {
        const pending = pendingConfirmations.get(m.sender)
        if (!pending || pending.type !== 'sewabot_on') {
            return m.reply(`❌ No hay ninguna solicitud pendiente.\nUsa *${m.prefix}sewabot on* primero.`)
        }
        pendingConfirmations.delete(m.sender)
        db.db.data.sewa.enabled = true
        db.db.write()
        await m.react('🕕')
        await m.reply(`🕕 Sistema de alquiler activado, procesando salida automática...`)
        
        try {
            global.isFetchingGroups = true
            const allGroups = await sock.groupFetchAllParticipating()
            global.isFetchingGroups = false
            const allGroupIds = Object.keys(allGroups)
            const unlistedGroups = allGroupIds.filter(id => !sewaGroups.includes(id))
            
            let leftCount = 0
            let failedCount = 0
            for (const groupId of unlistedGroups) {
                try {
                    await sock.sendText(groupId, `⛔ Este grupo no está registrado en el sistema de alquiler.\nEl bot abandonará el grupo.\n\nContacta al owner para alquilar el bot.`, null, {
                        contextInfo: {
                            forwardingScore: 99,
                            isForwarded: true,
                            externalAdReply: {
                                mediaType: 1,
                                title: 'ALQUILER DE BOT',
                                body: 'Grupo no registrado',
                                thumbnail: fs.readFileSync('./assets/images/ourin.jpg'),
                                renderLargerThumbnail: true
                            }
                        }
                    })
                    await new Promise(r => setTimeout(r, 2000))
                    await sock.groupLeave(groupId)
                    leftCount++
                    await new Promise(r => setTimeout(r, 3000))
                } catch {
                    failedCount++
                }
            }
            await m.react('✅')
            return m.reply(
                `✅ *ALQUILER ACTIVADO*\n\n` +
                `Grupos autorizados: *${sewaGroups.length}*\n` +
                `Salidas exitosas: *${leftCount}*\n` +
                `Fallidos: *${failedCount}*`
            )
        } catch (e) {
            await m.react('✅')
            return m.reply(te(m.prefix, m.command, m.pushName))
        }
    }

    if (args === 'leave') {
        if (!currentStatus) return m.reply(`❌ Primero activa el sistema con *${m.prefix}sewabot on*`)
        await m.react('🕕')
        await m.reply(`🕕 Obteniendo lista de grupos...`)
        global.sewaLeaving = true
        try {
            global.isFetchingGroups = true
            const allGroups = await sock.groupFetchAllParticipating()
            global.isFetchingGroups = false
            const allGroupIds = Object.keys(allGroups)
            const unlistedGroups = allGroupIds.filter(id => !sewaGroups.includes(id))
            
            if (unlistedGroups.length === 0) {
                delete global.sewaLeaving
                await m.react('✅')
                return m.reply(`✅ No hay grupos que necesiten ser abandonados.`)
            }
            
            await m.reply(`📊 Total: ${allGroupIds.length} grupos\nAutorizados: ${sewaGroups.length}\nSaldré de: ${unlistedGroups.length} grupos`)
            
            let leftCount = 0
            let failedCount = 0
            for (const groupId of unlistedGroups) {
                try {
                    await sock.sendText(groupId, `👋 Este grupo no está registrado en el sistema de alquiler.\nEl bot abandonará el grupo.\n\nContacta al owner para alquilar el bot.`, null, {
                        contextInfo: {
                            forwardingScore: 99,
                            isForwarded: true,
                            externalAdReply: {
                                mediaType: 1,
                                title: 'ALQUILER DE BOT',
                                body: 'Grupo no autorizado',
                                thumbnail: fs.readFileSync('./assets/images/ourin.jpg'),
                                renderLargerThumbnail: true
                            }
                        }
                    })
                    await new Promise(r => setTimeout(r, 3000))
                    await sock.groupLeave(groupId)
                    leftCount++
                    await new Promise(r => setTimeout(r, 5000))
                } catch {
                    failedCount++
                }
            }
            delete global.sewaLeaving
            await m.react('✅')
            return m.reply(`✅ Proceso finalizado\n\nSalidas exitosas: *${leftCount}*\nFallidos: *${failedCount}*`)
        } catch (e) {
            delete global.sewaLeaving
            await m.react('☢')
            await m.reply(te(m.prefix, m.command, m.pushName))
        }
    }

    if (args === 'cancel' || args === 'no' || args === 'n') {
        const pending = pendingConfirmations.get(m.sender)
        if (!pending || pending.type !== 'sewabot_on') return m.reply(`❌ No hay ninguna solicitud pendiente.`)
        pendingConfirmations.delete(m.sender)
        await m.react('❌')
        return m.reply(`❌ Activación cancelada.\nRegistra grupos primero con *${m.prefix}addsewa*`)
    }

    return m.reply(`❌ Comando no válido.\n\nEscribe *${m.prefix}sewabot* para ver la guía completa.`)
}

export { pluginConfig as config, handler, pendingConfirmations }
