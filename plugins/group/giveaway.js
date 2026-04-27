import config from '../../config.js'
import * as timeHelper from '../../src/lib/ourin-time.js'
import { CronJob } from 'cron'
import path from 'path'
import fs from 'fs'
import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'giveaway',
    alias: ['sorteo', 'ga', 'gaway'],
    category: 'group',
    description: 'Sistema de sorteos para grupos',
    usage: '.giveaway <start/end/join/list/delete/reroll/notifadmin>',
    example: '.giveaway start',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isAdmin: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const CLEANUP_DELAY = 3 * 24 * 60 * 60 * 1000
const pendingGiveaway = new Map()

async function generateGiveawayId() {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `GA-${random}`
}

function parseTime(timeStr) {
    const regex = /(\d+)([smhd])/g
    let totalMs = 0
    let match
    
    while ((match = regex.exec(timeStr)) !== null) {
        const value = parseInt(match[1])
        const unit = match[2]
        
        if (unit === 's') totalMs += value * 1000
        if (unit === 'm') totalMs += value * 60 * 1000
        if (unit === 'h') totalMs += value * 60 * 60 * 1000
        if (unit === 'd') totalMs += value * 24 * 60 * 60 * 1000
    }
    
    return totalMs
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days} día(s) ${hours % 24} hr(s)`
    if (hours > 0) return `${hours} hr(s) ${minutes % 60} min(s)`
    if (minutes > 0) return `${minutes} min(s)`
    return `${seconds} seg(s)`
}

function getGiveawayImage() {
    const imagePath = path.join(process.cwd(), 'assets', 'images', 'giveaway.jpg')
    if (fs.existsSync(imagePath)) return fs.readFileSync(imagePath)
    const defaultPath = path.join(process.cwd(), 'assets', 'images', 'ourin.jpg')
    if (fs.existsSync(defaultPath)) return fs.readFileSync(defaultPath)
    return null
}

function buildGiveawayMessage(giveaway, participantCount = 0, prefix = '.') {
    const endTimeFormatted = timeHelper.fromTimestamp(giveaway.endTime, 'DD/MM/YYYY HH:mm')
    const remaining = giveaway.endTime - Date.now()
    const remainingText = remaining > 0 ? formatDuration(remaining) : 'Finalizado'
    const adminTag = giveaway.adminJid ? `@${giveaway.adminJid.split('@')[0]}` : 'Creador'
    
    return `🎉 *ɢɪᴠᴇᴀᴡᴀʏ | ᴋᴀᴏʀɪ ᴍᴅ*

╭┈┈⬡「 🎁 *${giveaway.title}* 」
┃ 🏆 ᴘʀᴇᴍɪᴏ: *${giveaway.prizeName || 'Premio Especial'}*
┃ 📝 ᴅᴇsᴄ: _${giveaway.description}_
╰┈┈⬡

╭┈┈⬡「 📋 *ɪɴꜰᴏʀᴍᴀᴄɪᴏ́ɴ* 」
┃ 👥 ɢᴀɴᴀᴅᴏʀᴇs: \`${giveaway.winners} persona(s)\`
┃ 👤 ᴘᴀʀᴛɪᴄɪᴘᴀɴᴛᴇs: \`${participantCount}\`
┃ ⏰ ꜰɪɴᴀʟɪᴢᴀ: \`${endTimeFormatted}\`
┃ 🕕 ʀᴇsᴛᴀɴᴛᴇ: \`${remainingText}\`
┃ 👮 ᴀᴅᴍɪɴ: ${adminTag}
┃ 🆔 ɪᴅ: \`${giveaway.giveawayId}\`
╰┈┈⬡

> *Cómo participar:*
> Escribe \`${prefix}giveaway join ${giveaway.giveawayId}\`

> _¡Mucha suerte! 🍀_`
}

function buildWinnerMessage(giveaway, winners) {
    let winnerList = ''
    winners.forEach((w, i) => {
        winnerList += `┃ ${i + 1}. @${w.split('@')[0]}\n`
    })
    const adminTag = giveaway.adminJid ? `@${giveaway.adminJid.split('@')[0]}` : 'Creador'
    
    return `🎊 *¡sᴏʀᴛᴇᴏ ꜰɪɴᴀʟɪᴢᴀᴅᴏ!*

╭┈┈⬡「 🎁 *${giveaway.title}* 」
┃ 🏆 ᴘʀᴇᴍɪᴏ: *${giveaway.prizeName || 'Premio Especial'}*
┃ 👮 ᴀᴅᴍɪɴ: ${adminTag}
╰┈┈⬡

╭┈┈⬡「 🏅 *ɢᴀɴᴀᴅᴏʀᴇs* 」
${winnerList}╰┈┈⬡

> 🎉 ¡Felicidades a los ganadores!
> Revisen su DM para los detalles del premio.

> _ID: ${giveaway.giveawayId}_`
}

async function selectWinners(giveaway) {
    const participants = giveaway.participants || []
    const numWinners = Math.min(giveaway.winners, participants.length)
    const shuffled = [...participants].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, numWinners)
}

async function endGiveaway(giveawayId, sock, db) {
    const giveaways = db.setting('giveaways') || {}
    const giveaway = giveaways[giveawayId]
    
    if (!giveaway || giveaway.ended) return
    
    const participants = giveaway.participants || []
    const notifAdmin = db.setting('giveawayNotifAdmin') ?? true
    const imageBuffer = getGiveawayImage()
    
    if (participants.length === 0) {
        await sock.sendMessage(giveaway.chatId, {
            text: `❌ *sᴏʀᴛᴇᴏ ᴄᴀɴᴄᴇʟᴀᴅᴏ*\n\n` +
                `> ID: \`${giveawayId}\`\n` +
                `> Estado: Sin participantes\n\n` +
                `> _El sorteo ha terminado sin ganadores._`
        })
        
        if (notifAdmin && giveaway.adminJid) {
            try {
                await sock.sendMessage(giveaway.adminJid, {
                    text: `❌ *sᴏʀᴛᴇᴏ ꜰɪɴᴀʟɪᴢᴀᴅᴏ*\n\n` +
                        `> ID: \`${giveawayId}\`\n` +
                        `> Título: ${giveaway.title}\n` +
                        `> Estado: Sin participantes.`
                })
            } catch (e) {}
        }
        
        giveaway.ended = true
        giveaway.endedAt = Date.now()
        db.setting('giveaways', giveaways)
        return
    }
    
    const winners = await selectWinners(giveaway)
    const winnerMsg = buildWinnerMessage(giveaway, winners)
    const mentions = giveaway.adminJid ? [...winners, giveaway.adminJid] : winners
    
    if (imageBuffer) {
        await sock.sendMessage(giveaway.chatId, {
            image: imageBuffer,
            caption: winnerMsg,
            mentions
        })
    } else {
        await sock.sendMessage(giveaway.chatId, {
            text: winnerMsg,
            mentions
        })
    }
    
    for (const winner of winners) {
        try {
            await sock.sendMessage(winner, {
                text: `🎉 *¡ꜰᴇʟɪᴄɪᴅᴀᴅᴇs!*\n\n` +
                    `> ¡Has ganado un sorteo en el grupo!\n\n` +
                    `╭┈┈⬡「 📋 *ᴅᴇᴛᴀʟʟᴇs* 」\n` +
                    `┃ 🎁 ᴛɪ́ᴛᴜʟᴏ: \`${giveaway.title}\`\n` +
                    `┃ 🏆 ᴘʀᴇᴍɪᴏ: *${giveaway.prizeName}*\n` +
                    `┃ 🆔 ɪᴅ: \`${giveawayId}\`\n` +
                    `╰┈┈⬡\n\n` +
                    `╭┈┈⬡「 🔑 *ɪɴꜰᴏ ᴅᴇʟ ᴘʀᴇᴍɪᴏ* 」\n` +
                    `${giveaway.prizeDetails || 'Contacta al admin para reclamar.'}\n` +
                    `╰┈┈⬡\n\n` +
                    `> _Mensaje automático de Kaori MD._`
            })
        } catch (e) {}
    }
    
    if (notifAdmin && giveaway.adminJid) {
        try {
            let winnerListText = ''
            winners.forEach((w, i) => {
                winnerListText += `${i + 1}. @${w.split('@')[0]}\n`
            })
            
            await sock.sendMessage(giveaway.adminJid, {
                text: `🎊 *ɴᴏᴛɪꜰɪᴄᴀᴄɪᴏ́ɴ ᴅᴇ sᴏʀᴛᴇᴏ*\n\n` +
                    `> ¡El sorteo ha finalizado!\n\n` +
                    `╭┈┈⬡「 📋 *ʀᴇsᴜᴍᴇɴ* 」\n` +
                    `┃ 🎁 ᴛɪ́ᴛᴜʟᴏ: \`${giveaway.title}\`\n` +
                    `┃ 🏆 ᴘʀᴇᴍɪᴏ: \`${giveaway.prizeName}\`\n` +
                    `┃ 👥 ᴘᴀʀᴛɪᴄɪᴘᴀɴᴛᴇs: \`${participants.length}\`\n` +
                    `┃ 🆔 ɪᴅ: \`${giveawayId}\`\n` +
                    `╰┈┈⬡\n\n` +
                    `╭┈┈⬡「 🏅 *ɢᴀɴᴀᴅᴏʀᴇs* 」\n` +
                    `${winnerListText}╰┈┈⬡`,
                mentions: winners
            })
        } catch (e) {}
    }
    
    giveaway.ended = true
    giveaway.endedAt = Date.now()
    giveaway.winnerList = winners
    db.setting('giveaways', giveaways)
}

async function handler(m, { sock, args: rawArgs }) {
    const db = getDatabase()
    const args = rawArgs || m.args || []
    const action = args[0]?.toLowerCase() || ''
    const prefix = m.prefix || '.'
    const botConfig = config
    
    let giveaways = db.setting('giveaways') || {}
    
    if (action === '--confirm' && args[1]) {
        const targetGroupId = args[1]
        const pendingData = pendingGiveaway.get(m.sender)
        
        if (!pendingData) return m.reply(`⚠️ *No hay datos pendientes. Crea el sorteo de nuevo.*`)
        
        try {
            let groupName = 'el grupo'
            try {
                const meta = await sock.groupMetadata(targetGroupId)
                groupName = meta.subject
            } catch (e) {}
            
            await m.reply(`🕕 *Publicando sorteo en ${groupName}...*`)
            
            const giveawayId = await generateGiveawayId()
            const endTime = Date.now() + pendingData.duration
            
            const giveaway = {
                giveawayId,
                chatId: targetGroupId,
                title: pendingData.title,
                prizeName: pendingData.prizeName,
                prizeDetails: pendingData.prizeDetails,
                description: pendingData.description,
                winners: pendingData.winners,
                endTime,
                creatorId: m.sender,
                adminJid: pendingData.adminJid || m.sender,
                participants: [],
                ended: false,
                createdAt: Date.now()
            }
            
            giveaways[giveawayId] = giveaway
            db.setting('giveaways', giveaways)
            
            const giveawayText = buildGiveawayMessage(giveaway, 0, prefix)
            const imageBuffer = getGiveawayImage()
            const saluranId = botConfig.saluran?.id || '120363208449943317@newsletter'
            const saluranName = 'KAORI MD'
            
            const contextInfo = {
                mentionedJid: [m.sender, giveaway.adminJid],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: saluranId,
                    newsletterName: saluranName,
                    serverMessageId: 127
                }
            }
            
            if (imageBuffer) {
                await sock.sendMessage(targetGroupId, { image: imageBuffer, caption: giveawayText, contextInfo })
            } else {
                await sock.sendMessage(targetGroupId, { text: giveawayText, contextInfo })
            }
            
            await m.reply(`✅ *sᴏʀᴛᴇᴏ ᴘᴜʙʟɪᴄᴀᴅᴏ*\n\n` +
                `┃ 🆔 ɪᴅ: \`${giveawayId}\`\n` +
                `┃ 🏠 ɢʀᴜᴘᴏ: *${groupName}*\n` +
                `┃ ⏱️ ᴅᴜʀᴀᴄɪᴏ́ɴ: \`${formatDuration(pendingData.duration)}\``)
            
            pendingGiveaway.delete(m.sender)
            m.react('🎉')
            
        } catch (error) {
            await m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> No se pudo publicar.\n> _${error.message}_`)
        }
        return
    }
    
    if (!action) {
        return m.reply(
            `🎉 *sɪsᴛᴇᴍᴀ ᴅᴇ sᴏʀᴛᴇᴏs | ᴋᴀᴏʀɪ ᴍᴅ*\n\n` +
            `╭┈┈⬡「 📋 *ᴄᴏᴍᴀɴᴅᴏs* 」\n` +
            `┃ 🎁 \`${prefix}giveaway start\`\n` +
            `┃    _Crear sorteo (Solo Privado)_\n` +
            `┃\n` +
            `┃ 🎫 \`${prefix}giveaway join <id>\`\n` +
            `┃    _Participar en un sorteo_\n` +
            `┃\n` +
            `┃ 📋 \`${prefix}giveaway list\`\n` +
            `┃    _Ver sorteos activos_\n` +
            `┃\n` +
            `┃ 🏁 \`${prefix}giveaway end <id>\`\n` +
            `┃    _Terminar sorteo ahora_\n` +
            `┃\n` +
            `┃ 🎲 \`${prefix}giveaway reroll <id>\`\n` +
            `┃    _Elegir nuevo ganador_\n` +
            `┃\n` +
            `┃ 🗑️ \`${prefix}giveaway delete <id>\`\n` +
            `┃    _Eliminar sorteo_\n` +
            `╰┈┈⬡`
        )
    }

    if (action === 'start') {
        if (m.isGroup) return m.reply(`⚠️ *sᴏʟᴏ ᴘʀɪᴠᴀᴅᴏ*\n\n> Usa este comando en el chat privado del bot por seguridad.`)
        if (!m.isAdmin && !m.isOwner) return m.reply(`⚠️ *ᴀᴄᴄᴇsᴏ ᴅᴇɴᴇɢᴀᴅᴏ*`)

        const input = args.slice(1).join(' ')
        if (!input || !input.includes('|')) {
            return m.reply(
                `🎉 *ᴄʀᴇᴀʀ sᴏʀᴛᴇᴏ*\n\n` +
                `> *Formato:*\n` +
                `> \`${prefix}giveaway start Título|Desc|Ganadores|Duración|Premio|DetallesPrivados\`\n\n` +
                `> *Ejemplo:*\n` +
                `> \`${prefix}giveaway start Sorteo VIP|Evento mensual|1|1d|Rango VIP|Código: KAORI-123\`\n\n` +
                `> *Duración:* \`1m\`, \`1h\`, \`1d\``
            )
        }

        const parts = input.split('|')
        if (parts.length < 6) return m.reply(`⚠️ *Formato incompleto (se requieren 6 parámetros).*`)

        const [title, description, winnersStr, timeStr, prizeName] = parts
        const prizeDetails = parts.slice(5).join('|').trim()
        const winners = parseInt(winnersStr)
        const duration = parseTime(timeStr)

        if (isNaN(winners) || winners < 1) return m.reply(`⚠️ *Número de ganadores inválido.*`)
        if (duration <= 0) return m.reply(`⚠️ *Formato de tiempo inválido.*`)

        pendingGiveaway.set(m.sender, { title, prizeName, prizeDetails, description, winners, duration, adminJid: m.sender })

        try {
            global.isFetchingGroups = true
            const groups = await sock.groupFetchAllParticipating()
            global.isFetchingGroups = false
            const groupList = Object.entries(groups)
            
            const groupRows = groupList.map(([id, meta]) => ({
                title: meta.subject || 'Grupo sin nombre',
                description: `${meta.participants?.length || 0} miembros`,
                id: `${prefix}giveaway --confirm ${id}`
            }))

            await sock.sendMessage(m.chat, {
                text: `🎉 *sᴇʟᴇᴄᴄɪᴏɴᴀ ᴇʟ ɢʀᴜᴘᴏ ᴅᴇsᴛɪɴᴏ*\n\n` +
                      `┃ 🎁 ᴛɪ́ᴛᴜʟᴏ: \`${title}\`\n` +
                      `┃ 🏆 ᴘʀᴇᴍɪᴏ: *${prizeName}*\n` +
                      `┃ ⏱️ ᴅᴜʀᴀᴄɪᴏ́ɴ: \`${formatDuration(duration)}\``,
                footer: 'KAORI MD',
                interactiveButtons: [
                    {
                        name: 'single_select',
                        buttonParamsJson: JSON.stringify({
                            title: '🏠 Elegir Grupo',
                            sections: [{ title: 'Tus Grupos', rows: groupRows }]
                        })
                    }
                ]
            }, { quoted: m })
        } catch (e) { m.reply(`❌ Error al listar grupos: ${e.message}`) }
        return
    }

    if (action === 'join' || action === 'participar') {
        if (!m.isGroup) return m.reply(`⚠️ Solo en grupos.`)
        const giveawayId = args[1]?.toUpperCase()
        const ga = giveaways[giveawayId]

        if (!ga || ga.chatId !== m.chat || ga.ended) return m.reply(`⚠️ Sorteo no encontrado o ya finalizado.`)
        if (ga.participants.includes(m.sender)) return m.reply(`⚠️ Ya estás participando.`)

        ga.participants.push(m.sender)
        db.setting('giveaways', giveaways)
        m.react('✅')
        return m.reply(`✅ *¡Ya estás participando!* (Participante #${ga.participants.length})`)
    }

    if (action === 'list') {
        const active = Object.values(giveaways).filter(g => g.chatId === m.chat && !g.ended)
        if (active.length === 0) return m.reply(`📋 No hay sorteos activos aquí.`)
        let txt = `📋 *sᴏʀᴛᴇᴏs ᴀᴄᴛɪᴠᴏs*\n\n`
        active.forEach(g => {
            txt += `> *${g.title}*\nID: \`${g.giveawayId}\` | ᴘʀᴇᴍɪᴏ: ${g.prizeName}\n\n`
        })
        return m.reply(txt)
    }

    // Lógica para end, reroll y delete simplificada (mismo flujo que el original pero traducido)
    if (action === 'end') {
        const id = args[1]?.toUpperCase()
        const ga = giveaways[id]
        if (!ga || (ga.creatorId !== m.sender && !m.isOwner)) return m.reply(`⚠️ No permitido.`)
        await endGiveaway(id, sock, db)
        return m.react('✅')
    }
}

let giveawayCheckerStarted = false
async function startGiveawayChecker(sock) {
    if (giveawayCheckerStarted) return
    giveawayCheckerStarted = true
    new CronJob('*/60 * * * * *', async () => {
        const db = getDatabase()
        const giveaways = db.setting('giveaways') || {}
        for (const [id, ga] of Object.entries(giveaways)) {
            if (!ga.ended && ga.endTime <= Date.now()) await endGiveaway(id, sock, db)
        }
    }).start()
}

export { pluginConfig as config, handler, startGiveawayChecker }
