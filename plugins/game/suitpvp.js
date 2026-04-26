import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'

const pluginConfig = {
    name: 'suitpvp',
    alias: ['suit', 'rps', 'ppt', 'juego'],
    category: 'game',
    description: 'Piedra, papel o tijera contra otro jugador',
    usage: '.suit @tag',
    example: '.suit @user',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

if (!global.suitGames) global.suitGames = {}

const TIMEOUT = 90000
const WIN_REWARD = 1000

const EMOJI = {
    batu: '✊',
    gunting: '✌️',
    kertas: '✋'
}

async function handler(m, { sock }) {
    const db = getDatabase()

    const existingRoom = Object.values(global.suitGames).find(
        room => [room.p, room.p2].includes(m.sender)
    )

    if (existingRoom) {
        return m.reply(
            `❌ ¡Ya estás en una partida!\n\n` +
            `> Terminá tu juego actual primero.`
        )
    }

    let target = null
    if (m.quoted) {
        target = m.quoted.sender
    } else if (m.mentionedJid?.[0]) {
        target = m.mentionedJid[0]
    }

    if (!target) {
        return m.reply(
            `✊✌️✋ *sᴜɪᴛ ᴘᴠᴘ*\n\n` +
            `> ¡Etiquetá a alguien para desafiarlo!\n\n` +
            `*Ejemplo:*\n` +
            `> \`.suit @user\``
        )
    }

    if (target === m.sender) {
        return m.reply('❌ ¡No podés desafiarte a vos mismo!')
    }

    const targetInGame = Object.values(global.suitGames).find(
        room => [room.p, room.p2].includes(target)
    )

    if (targetInGame) {
        return m.reply('❌ ¡Esa persona ya está jugando con alguien más!')
    }

    const roomId = 'suit_' + Date.now()

    global.suitGames[roomId] = {
        id: roomId,
        chat: m.chat,
        p: m.sender,
        p2: target,
        status: 'waiting',
        pilih: null,
        pilih2: null,
        createdAt: Date.now(),
        timeout: setTimeout(() => {
            if (global.suitGames[roomId]) {
                sock.sendMessage(m.chat, {
                    text: `⏱️ *¡TIEMPO AGOTADO!*\n\n@${target.split('@')[0]} no respondió.\nEl duelo fue cancelado.`,
                    mentions: [target]
                })
                delete global.suitGames[roomId]
            }
        }, TIMEOUT)
    }

    await m.react('✊')
    await m.reply(`Desafiaste a @${target.split('@')[0]} a un duelo de Piedra, Papel o Tijera\n\n` +
            `╭┈┈⬡「 💬 *ʀᴇsᴘᴏɴᴅᴇʀ* 」\n` +
            `┃ ✅ Escribí *acepto* / *si* / *ok*\n` +
            `┃ ❌ Escribí *rechazar* / *no*\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `Tiempo: 90 segundos`, { mentions: [target] })
}

async function answerHandler(m, sock) {
    if (!m.body) return false

    const text = m.body.trim().toLowerCase()
    const db = getDatabase()

    let room = null
    let roomId = null

    for (const [id, r] of Object.entries(global.suitGames)) {
        if (r.chat === m.chat && [r.p, r.p2].includes(m.sender)) {
            room = r
            roomId = id
            break
        }
        if (!m.isGroup && [r.p, r.p2].includes(m.sender)) {
            room = r
            roomId = id
            break
        }
    }

    if (!room) return false

    if (room.status === 'waiting' && m.sender === room.p2 && m.chat === room.chat) {
        if (/^(acc(ept)?|acepto?|si|oke?|ok|vale|gas)$/i.test(text)) {
            clearTimeout(room.timeout)
            room.status = 'playing'

            await m.react('🎮')

            await m.reply(`✊✌️✋ *¡ᴇʟ ᴅᴜᴇʟᴏ ᴄᴏᴍɪᴇɴᴢᴀ!*\n\n` +
                    `@${room.p.split('@')[0]} vs @${room.p2.split('@')[0]}\n\n` +
                    `> 📩 ¡Revisen su *Chat Privado* para elegir!\n` +
                    `> ⏱️ Tiempo límite: 90 segundos`, { mentions: [room.p, room.p2] })

            const pmMessage = `✊✌️✋ *sᴜɪᴛ - ᴇʟᴇɢɪ́ ᴛᴜ ᴊᴜɢᴀᴅᴀ*\n\n` +
                `Escribí una opción:\n\n` +
                `┃ ✊ *piedra*\n` +
                `┃ ✌️ *tijera*\n` +
                `┃ ✋ *papel*\n\n` +
                `*TIP: Respondé a este mensaje con tu elección.*`

            try { await sock.sendMessage(room.p, { text: pmMessage }) } catch (e) {}
            try { await sock.sendMessage(room.p2, { text: pmMessage }) } catch (e) {}

            room.timeout = setTimeout(async () => {
                if (global.suitGames[roomId]) {
                    if (!room.pilih && !room.pilih2) {
                        await sock.sendMessage(room.chat, { 
                            text: '⏱️ Ninguno eligió, duelo cancelado.' 
                        })
                    } else if (!room.pilih || !room.pilih2) {
                        const afk = !room.pilih ? room.p : room.p2
                        const winner = !room.pilih ? room.p2 : room.p

                        db.updateKoin(winner, WIN_REWARD)

                        await sock.sendMessage(room.chat, {
                            text: `⏱️ *¡TIEMPO AGOTADO!*\n\n` +
                                `@${afk.split('@')[0]} no eligió a tiempo.\n` +
                                `@${winner.split('@')[0]} gana por abandono. +$${WIN_REWARD.toLocaleString()}`,
                            mentions: [afk, winner]
                        })
                    }
                    delete global.suitGames[roomId]
                }
            }, TIMEOUT)

            return true
        }

        if (/^(rechazar|no|noup|paso|cancelar)$/i.test(text)) {
            clearTimeout(room.timeout)
            await sock.sendMessage(room.chat, {
                text: `❌ @${room.p2.split('@')[0]} rechazó el duelo.\nPartida cancelada.`,
                mentions: [room.p2]
            })
            delete global.suitGames[roomId]
            return true
        }
    }

    if (room.status === 'playing' && !m.isGroup) {
        const choices = /^(piedra|tijera|papel|batu|gunting|kertas)$/i
        if (!choices.test(text)) return false

        let choice = text.toLowerCase()
        if (choice === 'piedra') choice = 'batu'
        if (choice === 'tijera') choice = 'gunting'
        if (choice === 'papel') choice = 'kertas'

        const translateChoice = { batu: 'piedra', gunting: 'tijera', kertas: 'papel' }

        if (m.sender === room.p && !room.pilih) {
            room.pilih = choice
            await m.reply(`✅ Elegiste *${translateChoice[choice]}* ${EMOJI[choice]}\n\n> Esperando al oponente...`)
            if (!room.pilih2) {
                await sock.sendMessage(room.chat, {
                    text: `🕕 @${room.p.split('@')[0]} ya eligió.\n> Esperando a @${room.p2.split('@')[0]}...`,
                    mentions: [room.p, room.p2]
                })
            }
        }

        if (m.sender === room.p2 && !room.pilih2) {
            room.pilih2 = choice
            await m.reply(`✅ Elegiste *${translateChoice[choice]}* ${EMOJI[choice]}\n\n> Esperando al oponente...`)
            if (!room.pilih) {
                await sock.sendMessage(room.chat, {
                    text: `🕕 @${room.p2.split('@')[0]} ya eligió.\n> Esperando a @${room.p.split('@')[0]}...`,
                    mentions: [room.p, room.p2]
                })
            }
        }

        if (room.pilih && room.pilih2) {
            clearTimeout(room.timeout)
            let winner = null
            let tie = false

            if (room.pilih === room.pilih2) {
                tie = true
            } else if (
                (room.pilih === 'batu' && room.pilih2 === 'gunting') ||
                (room.pilih === 'gunting' && room.pilih2 === 'kertas') ||
                (room.pilih === 'kertas' && room.pilih2 === 'batu')
            ) {
                winner = room.p
            } else {
                winner = room.p2
            }

            let resultTxt = `✊✌️✋ *ʀᴇsᴜʟᴛᴀᴅᴏ ᴅᴇʟ ᴅᴜᴇʟᴏ*\n\n`
            resultTxt += `@${room.p.split('@')[0]}: ${translateChoice[room.pilih]} ${EMOJI[room.pilih]}\n`
            resultTxt += `@${room.p2.split('@')[0]}: ${translateChoice[room.pilih2]} ${EMOJI[room.pilih2]}\n\n`

            if (tie) {
                resultTxt += `🤝 *¡EMPATE!*`
            } else {
                db.updateKoin(winner, WIN_REWARD)
                resultTxt += `🏆 @${winner.split('@')[0]} ¡GANÓ EL DUELO!\n`
                resultTxt += `> Recompensa: +$${WIN_REWARD.toLocaleString()}`
            }

            await sock.sendMessage(room.chat, {
                text: resultTxt,
                mentions: [room.p, room.p2]
            }, { quoted: m })

            delete global.suitGames[roomId]
        }
        return true
    }
    return false
}

export { pluginConfig as config, handler, answerHandler }
