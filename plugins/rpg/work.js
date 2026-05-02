import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'

const pluginConfig = {
    name: 'trabajar',
    alias: ['work', 'kerja', 'job', 'chambear'],
    category: 'rpg',
    description: 'Realizá trabajos para ganar guita y experiencia',
    usage: '.trabajar',
    example: '.trabajar',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 180, // 3 minutos
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)

    if (!user.rpg) user.rpg = {}

    const staminaCost = 10
    user.rpg.stamina = user.rpg.stamina || 100

    if (user.rpg.stamina < staminaCost) {
        return m.reply(
            `⚡ *𝐒𝐓𝐀𝐌𝐈𝐍𝐀 𝐈𝐍𝐒𝐔𝐅𝐈𝐂𝐈𝐄𝐍𝐓𝐄*\n\n` +
            `> Necesitás ${staminaCost} de energía para laburar.\n` +
            `> Tu energía actual: ${user.rpg.stamina}`
        )
    }

    // Lista de laburos con sus rangos de pago
    const jobs = [
        { name: '👨‍🌾 Granjero', min: 1000, max: 3000 },
        { name: '🧹 Personal de Limpieza', min: 2000, max: 5000 },
        { name: '📦 Repartidor', min: 3000, max: 7000 },
        { name: '👨‍🍳 Cocinero', min: 4000, max: 10000 },
        { name: '👨‍💻 Programador', min: 8000, max: 20000 },
        { name: '👨‍⚕️ Médico', min: 15000, max: 30000 }
    ]

    const job = jobs[Math.floor(Math.random() * jobs.length)]
    const salary = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min
    const expGain = Math.floor(salary / 10)

    user.rpg.stamina -= staminaCost

    await m.reply(`💼 *𝐋𝐀𝐁𝐔𝐑𝐀𝐍𝐃𝐎...*\n> Puesto: ${job.name}`)
    await new Promise(r => setTimeout(r, 2000))

    user.koin = (user.koin || 0) + salary
    await addExpWithLevelCheck(sock, m, db, user, expGain)

    db.save()

    let txt = `💼 *¡𝐉𝐎𝐑𝐍𝐀𝐃𝐀 𝐅𝐈𝐍𝐀𝐋𝐈𝐙𝐀𝐃𝐀!*\n\n`
    txt += `╭┈┈⬡「 💰 *𝐒𝐔𝐄𝐋𝐃𝐎* 」\n`
    txt += `┃ 👔 Laburo: ${job.name}\n`
    txt += `┃ 💵 Cobraste: *+$${salary.toLocaleString('es-AR')}*\n`
    txt += `┃ ✨ Exp: *+${expGain}*\n`
    txt += `┃ ⚡ Stamina: *-${staminaCost}*\n`
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    txt += `> ¡Seguí laburando en **𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈Ɀ𝐀𝐖𝐀 𝐌𝐃** para ser millonario!`

    await m.reply(txt)
}

export { pluginConfig as config, handler }