import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'

const pluginConfig = {
    name: 'crimen',
    alias: ['steal', 'curi', 'chorear', 'robar'],
    category: 'rpg',
    description: 'Intentá robar algo de guita (ojo que te pueden agarrar)',
    usage: '.crimen',
    example: '.crimen',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 300,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.rpg) user.rpg = {}
    
    await m.reply('🦹 *CHOREANDO ALGO POR AHÍ...*')
    await new Promise(r => setTimeout(r, 2000))
    
    const successRate = 0.5
    const isSuccess = Math.random() < successRate
    
    if (isSuccess) {
        const stolen = Math.floor(Math.random() * 15000) + 5000
        const expGain = Math.floor(stolen / 20)
        
        user.koin = (user.koin || 0) + stolen
        await addExpWithLevelCheck(sock, m, db, user, expGain)
        
        db.save()
        
        let txt = `✅ *¡AFANO EXITOSO!* - 𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃\n\n`
        txt += `> 🦹 ¡Te saliste con la tuya, chorro!\n`
        txt += `> 💰 Botín: *+$${stolen.toLocaleString('es-AR')}*\n`
        txt += `> ✨ EXP: *+${expGain}*`
        
        await m.reply(txt)
    } else {
        const fine = Math.floor(Math.random() * 10000) + 5000
        const actualFine = Math.min(fine, user.koin || 0)
        
        user.koin = Math.max(0, (user.koin || 0) - actualFine)
        user.rpg.health = Math.max(0, (user.rpg.health || 100) - 15)
        
        db.save()
        
        let txt = `❌ *¡TE AGARRÓ LA CANA!*\n\n`
        txt += `> 🚔 Fuiste para atrás y terminaste en la comisaría.\n`
        txt += `> 💸 Multa: *-$${actualFine.toLocaleString('es-AR')}*\n`
        txt += `> ❤️ Salud: *-15* (Te acomodaron un poco)`
        
        await m.reply(txt)
    }
}

export { pluginConfig as config, handler }
