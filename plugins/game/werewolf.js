import { getDatabase } from '../../src/lib/ourin-database.js'
/**
 * 🐺 WEREWOLF GAME
 * Juego de deducción social para WhatsApp
 * * Basado en referencia: RTXZY-MD-pro/lib/werewolf.js
 * Adaptado para OurinAI con soporte multilenguaje y visuales mejorados
 */
import config from '../../config.js'
import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'werewolf',
    alias: ['ww', 'lobo', 'lobos'],
    category: 'game',
    description: 'Jugá al Hombre Lobo con otros usuarios',
    usage: '.ww <create|join|start|vote|player|exit|delete>',
    example: '.ww create',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

if (!global.werewolfGames) global.werewolfGames = {}

let thumbWW = null, thumbNight = null, thumbDay = null, thumbWin = null

try {
    const assetsPath = path.join(process.cwd(), 'assets', 'images')
    if (fs.existsSync(path.join(assetsPath, 'ourin-games.jpg'))) thumbWW = fs.readFileSync(path.join(assetsPath, 'ourin-games.jpg'))
    if (fs.existsSync(path.join(assetsPath, 'ourin.jpg'))) {
        thumbNight = fs.readFileSync(path.join(assetsPath, 'ourin.jpg'))
        thumbDay = thumbNight
    }
    if (fs.existsSync(path.join(assetsPath, 'ourin-winner.jpg'))) thumbWin = fs.readFileSync(path.join(assetsPath, 'ourin-winner.jpg'))
} catch (e) {
    console.log('[WW] Error cargando miniaturas:', e.message)
}

const ROLES = {
    werewolf: { emoji: '🐺', name: 'Hombre Lobo', team: 'wolf', desc: 'Matá a un aldeano cada noche' },
    seer: { emoji: '🔮', name: 'Vidente', team: 'village', desc: 'Mirá el rol de un jugador cada noche' },
    guardian: { emoji: '🛡️', name: 'Guardián', team: 'village', desc: 'Protegé a alguien cada noche' },
    sorcerer: { emoji: '🧙', name: 'Hechicero', team: 'wolf', desc: 'Buscá a la Vidente para los lobos' },
    villager: { emoji: '👨‍🌾', name: 'Aldeano', team: 'village', desc: 'Debatí y votá para linchar lobos' }
}

const WIN_REWARD = { koin: 5000, exp: 1000 }
const MIN_PLAYERS = 4
const MAX_PLAYERS = 15
const PHASE_DURATION = { night: 60000, day: 90000 }

function getWWContextInfo(title = '🐺 WEREWOLF', body = '¡Deducción social!', thumbBuffer = thumbWW, mentions) {
    const saluranId = config.saluran?.id || '120363208449943317@newsletter'
    const saluranName = config.saluran?.name || config.bot?.name || 'Ourin-AI'
    const contextInfo = {
        forwardingScore: 9999,
        isForwarded: true,
        mentionedJid: mentions,
        forwardedNewsletterMessageInfo: { newsletterJid: saluranId, newsletterName: saluranName, serverMessageId: 127 }
    }
    if (thumbBuffer) {
        contextInfo.externalAdReply = { title, body, thumbnail: thumbBuffer, mediaType: 1, renderLargerThumbnail: true, sourceUrl: config.saluran?.link || '' }
    }
    return contextInfo
}

function generateRoles(playerCount) {
    const roles = []
    if (playerCount === 4) roles.push('werewolf', 'seer', 'guardian', 'villager')
    else if (playerCount === 5) roles.push('werewolf', 'seer', 'guardian', 'villager', 'villager')
    else if (playerCount === 6) roles.push('werewolf', 'werewolf', 'seer', 'guardian', 'villager', 'villager')
    else if (playerCount <= 8) roles.push('werewolf', 'werewolf', 'seer', 'guardian', ...Array(playerCount - 4).fill('villager'))
    else {
        roles.push('werewolf', 'werewolf', 'seer', 'guardian', 'sorcerer')
        while (roles.length < playerCount) roles.push('villager')
    }
    return roles.sort(() => Math.random() - 0.5)
}

function getRoleDescription(role, prefix = '.') {
    const descriptions = {
        werewolf: `🐺 *HOMBRE LOBO*\n\n¡Sos el depredador!\n\n╭┈┈⬡「 📋 *INFO* 」\n┃ 🎯 Objetivo: Matar a los Aldeanos\n┃ ⚔️ Habilidad: Matá a 1 cada noche\n┃ 🕐 Acción: Noche\n╰┈┈┈┈┈┈┈┈⬡\n\n> Por privado al bot, escribí:\n> \`${prefix}wwkill <número>\``,
        seer: `🔮 *VIDENTE*\n\n¡Podés ver la verdad!\n\n╭┈┈⬡「 📋 *INFO* 」\n┃ 🎯 Objetivo: Ayudar a la Aldea\n┃ 🔮 Habilidad: Ver el rol de alguien\n┃ 🕐 Acción: Noche\n╰┈┈┈┈┈┈┈┈⬡\n\n> Por privado al bot, escribí:\n> \`${prefix}wwsee <número>\``,
        guardian: `🛡️ *GUARDIÁN*\n\n¡Protegé a los tuyos!\n\n╭┈┈⬡「 📋 *INFO* 」\n┃ 🎯 Objetivo: Que no maten aldeanos\n┃ 🛡️ Habilidad: Proteger a 1 jugador\n┃ 🕐 Acción: Noche\n╰┈┈┈┈┈┈┈┈⬡\n\n> Por privado al bot, escribí:\n> \`${prefix}wwprotect <número>\``,
        sorcerer: `🧙 *HECHICERO*\n\n¡Aliado de los lobos!\n\n╭┈┈⬡「 📋 *INFO* 」\n┃ 🎯 Objetivo: Ayudar a los lobos\n┃ 🔍 Habilidad: Detectar a la vidente\n┃ 🕐 Acción: Noche\n╰┈┈┈┈┈┈┈┈⬡\n\n> Por privado al bot, escribí:\n> \`${prefix}wwsorcerer <número>\``,
        villager: `👨‍🌾 *ALDEANO*\n\n¡Gente de bien!\n\n╭┈┈⬡「 📋 *INFO* 」\n┃ 🎯 Objetivo: Linchar a los lobos\n┃ 🗳️ Habilidad: Votar de día\n┃ 🕐 Acción: Día\n╰┈┈┈┈┈┈┈┈⬡\n\n> ¡Debatí y votá en el grupo!\n> \`${prefix}ww vote <número>\``
    }
    return descriptions[role] || 'Rol desconocido'
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    const action = args[0]?.toLowerCase()
    const target = args[1]
    const ww = global.werewolfGames
    const prefix = m.prefix || config.command?.prefix || '.'

    const commands = {
        create: async () => {
            if (ww[m.chat]) return m.reply(`❌ *SALA YA CREADA*\n\nUsa \`${prefix}ww join\` para unirte.\nHost: @${ww[m.chat].owner.split('@')[0]}`, { mentions: [ww[m.chat].owner] })
            
            ww[m.chat] = {
                room: m.chat, owner: m.sender, status: 'waiting', day: 0, phase: 'lobby',
                players: [{ id: m.sender, number: 1, role: null, alive: true, voted: false, skillUsed: false }],
                dead: [], votes: {}, nightActions: { kill: null, protect: null, see: null, sorcerer: null },
                createdAt: Date.now(), timeout: null
            }

            await m.react('🐺')
            await m.reply(`🐺 *WEREWOLF GAME*\n\n¡Sala creada!\n\n╭┈┈⬡「 📋 *INFO SALA* 」\n┃ 👑 Host: @${m.sender.split('@')[0]}\n┃ 👥 Jugadores: 1/${MAX_PLAYERS}\n┃ ⏱️ Mínimo: ${MIN_PLAYERS}\n╰┈┈┈┈┈┈┈┈⬡\n\n> Comandos:\n> \`${prefix}ww join\` - Unirse\n> \`${prefix}ww start\` - Empezar`, { mentions: [m.sender] })
        },

        join: async () => {
            if (!ww[m.chat]) return m.reply(`❌ No hay sala. Creá una con \`${prefix}ww create\``)
            if (ww[m.chat].status !== 'waiting') return m.reply(`❌ Partida en curso.`)
            if (ww[m.chat].players.some(p => p.id === m.sender)) return m.reply(`❌ Ya estás adentro.`)

            ww[m.chat].players.push({ id: m.sender, number: ww[m.chat].players.length + 1, role: null, alive: true, voted: false, skillUsed: false })
            
            const canStart = ww[m.chat].players.length >= MIN_PLAYERS
            await m.react('✅')
            await m.reply(`✅ @${m.sender.split('@')[0]} se unió.\nTotal: ${ww[m.chat].players.length}/${MIN_PLAYERS}\n${canStart ? '¡Ya pueden empezar!' : `Faltan ${MIN_PLAYERS - ww[m.chat].players.length}`}`, { mentions: [m.sender] })
        },

        start: async () => {
            const game = ww[m.chat]
            if (!game || game.status !== 'waiting') return m.reply(`❌ Error al iniciar.`)
            if (game.owner !== m.sender) return m.reply(`❌ Solo el Host inicia.`)
            if (game.players.length < MIN_PLAYERS) return m.reply(`❌ Faltan jugadores.`)

            const roles = generateRoles(game.players.length)
            game.players.forEach((p, i) => { p.role = roles[i] })
            game.status = 'playing'; game.day = 1; game.phase = 'night'

            for (const player of game.players) {
                await sock.sendMessage(player.id, { text: getRoleDescription(player.role, prefix), contextInfo: getWWContextInfo(`${ROLES[player.role].emoji} ${ROLES[player.role].name}`, '¡Tu Rol!') })
            }

            await m.reply(`🐺 *COMIENZA LA CAZA*\n\n🌙 *Noche 1*\nRevisen sus privados. Lobos, elijan su presa.\nDuración: ${PHASE_DURATION.night / 1000}s`, { mentions: game.players.map(p => p.id) })
            await sendNightPrompts(m.chat, sock, prefix)
            game.timeout = setTimeout(() => processNightActions(m.chat, sock, db, prefix), PHASE_DURATION.night)
        },

        vote: async () => {
            const game = ww[m.chat]
            if (!game || game.phase !== 'day') return m.reply(`❌ No es momento de votar.`)
            const player = game.players.find(p => p.id === m.sender)
            if (!player?.alive || player.voted) return m.reply(`❌ No podés votar.`)

            if (!target) return m.reply(`🗳️ *VOTACIÓN*\n\nEscribí \`${prefix}ww vote <número>\` para linchar a alguien.`)
            const targetPlayer = game.players.find(p => p.number === parseInt(target) && p.alive)
            if (!targetPlayer) return m.reply(`❌ Jugador no encontrado.`)

            player.voted = true
            game.votes[targetPlayer.id] = (game.votes[targetPlayer.id] || 0) + 1
            await m.reply(`🗳️ @${m.sender.split('@')[0]} votó a @${targetPlayer.id.split('@')[0]}`, { mentions: [m.sender, targetPlayer.id] })

            if (game.players.filter(p => p.alive && p.voted).length >= game.players.filter(p => p.alive).length) {
                clearTimeout(game.timeout); await executeVote(m.chat, sock, db, prefix)
            }
        },

        player: async () => {
            if (!ww[m.chat]) return m.reply(`❌ No hay juego.`)
            const list = ww[m.chat].players.map(p => `${p.number}. @${p.id.split('@')[0]} ${p.alive ? '✅' : '☠️ ('+ROLES[p.role].name+')'}`).join('\n')
            await m.reply(`🐺 *ESTADO DE LA ALDEA*\n\n${list}`, { mentions: ww[m.chat].players.map(p => p.id) })
        }
    }

    if (!action || !commands[action]) return m.reply(`🐺 *WEREWOLF COMMANDS*\n\n- \`${prefix}ww create\`: Crear\n- \`${prefix}ww join\`: Unirse\n- \`${prefix}ww start\`: Empezar\n- \`${prefix}ww vote <n>\`: Votar`)
    try { await commands[action]() } catch (e) { console.error(e); m.reply('Error en el comando.') }
}

async function sendNightPrompts(chatId, sock, prefix) {
    const game = global.werewolfGames[chatId]
    const alive = game.players.filter(p => p.alive)
    const list = alive.map(p => `(${p.number}) @${p.id.split('@')[0]}`).join('\n')

    for (const p of alive) {
        let msg = ''
        if (p.role === 'werewolf') msg = `🐺 *NOCHE*\nElegí a quién matar:\n${list}\n> \`${prefix}wwkill <n>\``
        else if (p.role === 'seer') msg = `🔮 *NOCHE*\n¿A quién querés investigar?\n${list}\n> \`${prefix}wwsee <n>\``
        else if (p.role === 'guardian') msg = `🛡️ *NOCHE*\n¿A quién protegés?\n${list}\n> \`${prefix}wwprotect <n>\``
        else if (p.role === 'sorcerer') msg = `🧙 *NOCHE*\nBuscá a la vidente:\n${list}\n> \`${prefix}wwsorcerer <n>\``
        
        if (msg) await sock.sendMessage(p.id, { text: msg, mentions: alive.map(a => a.id) })
    }
}

async function processNightActions(chatId, sock, db, prefix) {
    const game = global.werewolfGames[chatId]
    if (!game) return
    const kill = game.nightActions.kill
    const prot = game.nightActions.protect
    let report = `☀️ *AMANECER EN LA ALDEA*\n\n`

    if (kill && kill !== prot) {
        const vic = game.players.find(p => p.id === kill)
        vic.alive = false; game.dead.push(vic)
        report += `☠️ @${vic.id.split('@')[0]} fue devorado anoche!\nEra: ${ROLES[vic.role].name}\n`
    } else {
        report += `🌅 Fue una noche tranquila. Nadie murió.\n`
    }

    const win = checkWinner(chatId)
    if (win) {
        await sock.sendMessage(chatId, { text: report }); return endGame(chatId, sock, db, win)
    }

    game.phase = 'day'; game.votes = {}; game.players.forEach(p => { p.voted = false; p.skillUsed = false })
    report += `\n🗳️ *¡A VOTAR!* Tienen ${PHASE_DURATION.day / 1000}s para decidir.\n> \`${prefix}ww vote <n>\``
    await sock.sendMessage(chatId, { text: report, mentions: game.players.map(p => p.id) })
    game.timeout = setTimeout(() => executeVote(chatId, sock, db, prefix), PHASE_DURATION.day)
}

async function executeVote(chatId, sock, db, prefix) {
    const game = global.werewolfGames[chatId]
    if (!game) return
    let max = 0, target = null, tie = false
    Object.entries(game.votes).forEach(([id, v]) => {
        if (v > max) { max = v; target = id; tie = false }
        else if (v === max) tie = true
    })

    let res = `⚖️ *JUICIO FINAL*\n\n`
    if (tie || !target) res += `🤷 La aldea no se puso de acuerdo. Nadie muere.`
    else {
        const p = game.players.find(x => x.id === target)
        p.alive = false; game.dead.push(p)
        res += `⚰️ @${target.split('@')[0]} fue linchado!\nEra: ${ROLES[p.role].name}`
    }

    const win = checkWinner(chatId)
    if (win) {
        await sock.sendMessage(chatId, { text: res }); return endGame(chatId, sock, db, win)
    }

    game.phase = 'night'; game.day++; game.nightActions = { kill: null, protect: null, see: null, sorcerer: null }
    game.players.forEach(p => { p.voted = false; p.skillUsed = false })
    res += `\n\n🌙 *NOCHE ${game.day}* comienza...`
    await sock.sendMessage(chatId, { text: res, mentions: target ? [target] : [] })
    await sendNightPrompts(chatId, sock, prefix)
    game.timeout = setTimeout(() => processNightActions(chatId, sock, db, prefix), PHASE_DURATION.night)
}

function checkWinner(chatId) {
    const game = global.werewolfGames[chatId]
    const alive = game.players.filter(p => p.alive)
    const wolves = alive.filter(p => ROLES[p.role].team === 'wolf').length
    const vil = alive.length - wolves
    if (wolves === 0) return 'village'
    if (wolves >= vil) return 'wolf'
    return null
}

async function endGame(chatId, sock, db, winner) {
    const game = global.werewolfGames[chatId]
    const reward = winner === 'wolf' ? '¡LOBOS GANAN! 🐺' : '¡ALDEA GANA! 👨‍🌾'
    const list = game.players.map(p => `${p.alive ? '✅' : '☠️'} @${p.id.split('@')[0]}: ${ROLES[p.role].name}`).join('\n')
    
    await sock.sendMessage(chatId, { text: `🎉 *FIN DE LA PARTIDA*\n\n🏆 ${reward}\n\n${list}`, mentions: game.players.map(p => p.id) })
    delete global.werewolfGames[chatId]
}

async function nightActionHandler(m, { sock }) {
    const ww = global.werewolfGames
    const chatId = Object.keys(ww).find(id => ww[id].players.some(p => p.id === m.sender && p.alive) && ww[id].phase === 'night')
    if (!chatId) return false

    const game = ww[chatId], player = game.players.find(p => p.id === m.sender)
    if (player.skillUsed) return m.reply(`❌ Ya usaste tu habilidad.`)

    const cmd = m.command.toLowerCase(), targetNum = parseInt(m.args[0])
    const target = game.players.find(p => p.number === targetNum && p.alive)
    if (!target) return m.reply(`❌ Objetivo inválido.`)

    if (cmd === 'wwkill' && player.role === 'werewolf') {
        game.nightActions.kill = target.id; player.skillUsed = true; m.reply(`🐺 Objetivo marcado: @${target.id.split('@')[0]}`, { mentions: [target.id] })
    } else if (cmd === 'wwsee' && player.role === 'seer') {
        player.skillUsed = true; m.reply(`🔮 @${target.id.split('@')[0]} es: ${ROLES[target.role].name}`, { mentions: [target.id] })
    } else if (cmd === 'wwprotect' && player.role === 'guardian') {
        game.nightActions.protect = target.id; player.skillUsed = true; m.reply(`🛡️ Protegiendo a: @${target.id.split('@')[0]}`, { mentions: [target.id] })
    } else if (cmd === 'wwsorcerer' && player.role === 'sorcerer') {
        player.skillUsed = true; m.reply(`🧙 @${target.id.split('@')[0]} ${target.role === 'seer' ? '¡ES LA VIDENTE!' : 'no es la vidente.'}`, { mentions: [target.id] })
    }
    return true
}

export { pluginConfig as config, handler, nightActionHandler }
