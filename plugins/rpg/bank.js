import { getDatabase } from '../../src/lib/ourin-database.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'

const pluginConfig = {
    name: 'banco',
    alias: ['atm', 'cajero', 'depositar', 'retirar', 'canuto'],
    category: 'rpg',
    description: 'Sistema bancario para guardar la guita y que no te la afanen',
    usage: '.banco <depositar/retirar> <cantidad>',
    example: '.banco depositar 10000',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const cleanJid = m.sender.replace(/@.+/g, '')
    
    let user = db.getUser(m.sender)
    if (!user) {
        user = db.setUser(m.sender, {})
    }
    
    if (!db.db.data.users[cleanJid].rpg) {
        db.db.data.users[cleanJid].rpg = {}
    }
    if (typeof db.db.data.users[cleanJid].rpg.bank !== 'number') {
        db.db.data.users[cleanJid].rpg.bank = 0
    }
    
    const currentBalance = db.db.data.users[cleanJid].koin || 0
    const currentBank = db.db.data.users[cleanJid].rpg.bank || 0
    
    const args = m.args || []
    const action = args[0]?.toLowerCase()
    const amountStr = args[1]
    
    // Lógica para Depositar
    if (action === 'deposit' || action === 'depositar' || action === 'depo') {
        let amount = 0
        if (amountStr === 'all' || amountStr === 'todo') {
            amount = currentBalance
        } else {
            amount = parseInt(amountStr)
        }
        
        if (!amount || amount <= 0) return m.reply(`❌ ¡Mandá una cantidad que sirva, che!`)
        if (currentBalance < amount) return m.reply(`❌ No tenés suficiente guita encima. Tenés: $${currentBalance.toLocaleString('es-AR')}`)
        
        db.db.data.users[cleanJid].koin = currentBalance - amount
        db.db.data.users[cleanJid].rpg.bank = currentBank + amount
        
        await db.save()
        
        const newBank = db.db.data.users[cleanJid].rpg.bank
        return m.reply(`✅ Guardaste: $${amount.toLocaleString('es-AR')} en el canuto.\n🏦 En el banco tenés: $${newBank.toLocaleString('es-AR')}`)
    }
    
    // Lógica para Retirar
    if (action === 'withdraw' || action === 'retirar' || action === 'sacar') {
        let amount = 0
        if (amountStr === 'all' || amountStr === 'todo') {
            amount = currentBank
        } else {
            amount = parseInt(amountStr)
        }
        
        if (!amount || amount <= 0) return m.reply(`❌ ¡Poné un número válido para sacar!`)
        if (currentBank < amount) return m.reply(`❌ No tenés tanto en el banco, fijate bien. Saldo en banco: $${currentBank.toLocaleString('es-AR')}`)
        
        db.db.data.users[cleanJid].rpg.bank = currentBank - amount
        db.db.data.users[cleanJid].koin = currentBalance + amount
        
        await db.save()
        
        const newBalance = db.db.data.users[cleanJid].koin
        return m.reply(`✅ Sacaste: $${amount.toLocaleString('es-AR')}.\n💰 Ahora tenés en mano: $${newBalance.toLocaleString('es-AR')}`)
    }
    
    // Menú principal del banco
    let txt = `🏦 *EL BANCO DEL AGUANTE*\n\n`
    txt += `> 💰 Guita encima: $${currentBalance.toLocaleString('es-AR')}\n`
    txt += `> 🏦 En el canuto: $${currentBank.toLocaleString('es-AR')}\n\n`
    txt += `> Usá: \`.banco depositar <cantidad>\`\n`
    txt += `> Usá: \`.banco retirar <cantidad>\`\n`
    txt += `> _Consejo: Usá 'all' si querés meter o sacar todos los manguitos de una._`
    
    await m.reply(txt)
}

export { pluginConfig as config, handler }
