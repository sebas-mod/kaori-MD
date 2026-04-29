import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'

const pluginConfig = {
    name: 'manguear',
    alias: ['beg', 'pedir', 'mendigage'],
    category: 'rpg',
    description: 'Andá a pedir unas monedas a la calle para ver si ligás algo',
    usage: '.manguear',
    example: '.manguear',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.rpg) user.rpg = {}
    
    await m.reply('🙏 *MANGUEANDO UNOS MANGOS...*')
    await new Promise(r => setTimeout(r, 2000))
    
    const responses = [
        { success: true, money: 500, exp: 10, msg: '¡Un tipazo te tiró unos manguitos para el bondi!' },
        { success: true, money: 1000, exp: 20, msg: '¡Te dieron propina por cuidar un coche!' },
        { success: true, money: 2000, exp: 50, msg: '¡A la flauta! ¡Un cheto se apiadó y te dio un billete grande!' },
        { success: false, money: 0, exp: 0, msg: 'No te dio bola ni el loro...' },
        { success: false, money: 0, exp: 0, msg: 'Te miraron con cara de pocos amigos y siguieron de largo.' },
        { success: true, money: 100, exp: 5, msg: '¡Encontraste unas monedas tiradas en la vereda!' },
        { success: false, money: -500, exp: 0, msg: '¡Te quiso primerear otro y te terminó afanando lo poco que tenías!' }
    ]
    
    const result = responses[Math.floor(Math.random() * responses.length)]
    
    if (result.money > 0) {
        user.koin = (user.koin || 0) + result.money
        if (result.exp > 0) {
            await addExpWithLevelCheck(sock, m, db, user, result.exp)
        }
    } else if (result.money < 0) {
        user.koin = Math.max(0, (user.koin || 0) + result.money)
    }
    
    db.save()
    
    let txt = ''
    if (result.success && result.money > 0) {
        txt = `🙏 *MANGUEO CON SUERTE*\n\n> ${result.msg}\n> 💰 Juntaste: *+$${result.money.toLocaleString('es-AR')}*`
        if (result.exp > 0) txt += `\n> ✨ Exp: *+${result.exp}*`
    } else if (result.money < 0) {
        txt = `😭 *TE SALIÓ EL TIRO POR LA CULATA*\n\n> ${result.msg}\n> 💸 Perdiste: *-$${Math.abs(result.money).toLocaleString('es-AR')}*`
    } else {
        txt = `😢 *NI UNA MONEDA*\n\n> ${result.msg}`
    }
    
    await m.reply(txt)
}

export { pluginConfig as config, handler }
