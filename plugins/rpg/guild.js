import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'clan',
    alias: ['guild', 'team', 'familia', 'equipo'],
    category: 'rpg',
    description: 'Sistema de clanes y equipos',
    usage: '.clan <create/join/leave/info/list/members/deposit>',
    example: '.clan create LosPibes',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.rpg) user.rpg = {}
    
    const args = m.args || []
    const action = args[0]?.toLowerCase()
    const guildName = args.slice(1).join(' ')
    
    // Acceder a la tabla de clanes en la DB
    const guilds = db.db?.data?.guilds || {}
    
    if (!action || !['create', 'join', 'leave', 'info', 'list', 'members', 'deposit'].includes(action)) {
        let txt = `🏰 *𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐃𝐄 𝐂𝐋𝐀𝐍𝐄𝐒*\n\n`
        txt += `> ¡Unite o armá un clan para dominar el servidor!\n\n`
        txt += `╭┈┈⬡「 📋 *COMANDOS* 」\n`
        txt += `┃ ${m.prefix}clan create <nombre>\n`
        txt += `┃ ${m.prefix}clan join <nombre>\n`
        txt += `┃ ${m.prefix}clan leave\n`
        txt += `┃ ${m.prefix}clan info\n`
        txt += `┃ ${m.prefix}clan list\n`
        txt += `┃ ${m.prefix}clan members\n`
        txt += `┃ ${m.prefix}clan deposit <monto>\n`
        txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        
        if (user.rpg.guildId) {
            const myGuild = guilds[user.rpg.guildId]
            txt += `> 🏰 Tu clan actual: *${myGuild?.name || 'Desconocido'}*`
        } else {
            txt += `> ⚠️ No pertenecés a ningún clan actualmente.`
        }
        return m.reply(txt)
    }
    
    if (action === 'list') {
        const guildList = Object.values(guilds)
        if (guildList.length === 0) {
            return m.reply(`❌ ¡Todavía no hay clanes creados! Sé el primero con \`${m.prefix}clan create <nombre>\``)
        }
        
        let txt = `🏰 *𝐋𝐈𝐒𝐓𝐀 𝐃𝐄 𝐂𝐋𝐀𝐍𝐄𝐒*\n\n`
        txt += `╭┈┈⬡「 📋 *RANKING* 」\n`
        for (const g of guildList.slice(0, 10)) {
            txt += `┃ 🏰 *${g.name}*\n`
            txt += `┃ 👥 Miembros: ${g.members?.length || 0}/50\n`
            txt += `┃ 💰 Tesorería: $${(g.treasury || 0).toLocaleString('es-AR')}\n`
            txt += `┃\n`
        }
        txt += `╰┈┈┈┈┈┈┈┈⬡`
        return m.reply(txt)
    }
    
    if (action === 'create') {
        if (user.rpg.guildId) {
            return m.reply(`❌ ¡Ya estás en un clan! Salite primero para crear uno nuevo.`)
        }
        
        if (!guildName || guildName.length < 3) {
            return m.reply(`❌ ¡El nombre del clan es muy corto! (Mínimo 3 caracteres)`)
        }
        
        if (guildName.length > 20) {
            return m.reply(`❌ ¡Nombre demasiado largo! (Máximo 20 caracteres)`)
        }
        
        const existingGuild = Object.values(guilds).find(g => g.name.toLowerCase() === guildName.toLowerCase())
        if (existingGuild) {
            return m.reply(`❌ Ya existe un clan con ese nombre. Elegí otro.`)
        }
        
        const createCost = 10000
        if ((user.koin || 0) < createCost) {
            return m.reply(`❌ No tenés suficiente guita. Crear un clan cuesta $${createCost.toLocaleString('es-AR')}`)
        }
        
        user.koin -= createCost
        
        const guildId = `guild_${Date.now()}`
        if (!db.db.data.guilds) db.db.data.guilds = {}
        
        db.db.data.guilds[guildId] = {
            id: guildId,
            name: guildName,
            leader: m.sender,
            members: [m.sender],
            treasury: 0,
            level: 1,
            exp: 0,
            createdAt: Date.now()
        }
        
        user.rpg.guildId = guildId
        db.save()
        
        return m.reply(
            `🎉 *¡𝐂𝐋𝐀𝐍 𝐅𝐔𝐍𝐃𝐀𝐃𝐎!*\n\n` +
            `╭┈┈⬡「 🏰 *DETALLES* 」\n` +
            `┃ 🏰 Nombre: *${guildName}*\n` +
            `┃ 👑 Líder: *Vos*\n` +
            `┃ 💰 Costo: *-$${createCost.toLocaleString('es-AR')}*\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `> ¡Invitá a otros pibes a unirse!`
        )
    }
    
    if (action === 'join') {
        if (user.rpg.guildId) {
            return m.reply(`❌ Ya pertenecés a un clan.`)
        }
        
        if (!guildName) {
            return m.reply(`❌ Tenés que poner el nombre del clan.\n\n> Ejemplo: \`${m.prefix}clan join LosPibes\``)
        }
        
        const targetGuild = Object.values(guilds).find(g => g.name.toLowerCase() === guildName.toLowerCase())
        if (!targetGuild) {
            return m.reply(`❌ No encontré ningún clan con ese nombre.`)
        }
        
        if (targetGuild.members?.length >= 50) {
            return m.reply(`❌ El clan está lleno. (Máximo 50 miembros)`)
        }
        
        targetGuild.members = targetGuild.members || []
        targetGuild.members.push(m.sender)
        user.rpg.guildId = targetGuild.id
        db.save()
        
        return m.reply(
            `✅ *¡𝐍𝐔𝐄𝐕𝐎 𝐌𝐈𝐄𝐌𝐁𝐑𝐎!*\n\n` +
            `> Ahora formás parte de *${targetGuild.name}*. ¡A darlo todo!`
        )
    }
    
    if (action === 'leave') {
        if (!user.rpg.guildId) {
            return m.reply(`❌ No estás en ningún clan.`)
        }
        
        const myGuild = guilds[user.rpg.guildId]
        if (!myGuild) {
            user.rpg.guildId = null
            db.save()
            return m.reply(`❌ Error: El clan no existía en la base de datos. Se limpió tu estado.`)
        }
        
        if (myGuild.leader === m.sender && myGuild.members?.length > 1) {
            return m.reply(`❌ Sos el líder. Transferí el mando o echá a todos antes de irte.`)
        }
        
        myGuild.members = (myGuild.members || []).filter(member => member !== m.sender)
        
        if (myGuild.members.length === 0) {
            delete db.db.data.guilds[user.rpg.guildId]
        }
        
        const oldName = myGuild.name
        user.rpg.guildId = null
        db.save()
        
        return m.reply(`✅ Has abandonado el clan *${oldName}*.`)
    }
    
    if (action === 'info') {
        if (!user.rpg.guildId) {
            return m.reply(`❌ No estás en ningún clan.`)
        }
        
        const myGuild = guilds[user.rpg.guildId]
        if (!myGuild) return m.reply(`❌ No se encontró la info de tu clan.`)
        
        return m.reply(
            `🏰 *𝐈𝐍𝐅𝐎 𝐃𝐄𝐋 𝐂𝐋𝐀𝐍*\n\n` +
            `╭┈┈⬡「 📊 *ESTADÍSTICAS* 」\n` +
            `┃ 🏰 Nombre: *${myGuild.name}*\n` +
            `┃ 👑 Líder: @${myGuild.leader?.split('@')[0]}\n` +
            `┃ 👥 Miembros: *${myGuild.members?.length || 0}/50*\n` +
            `┃ 📈 Nivel: *${myGuild.level || 1}*\n` +
            `┃ 💰 Tesorería: *$${(myGuild.treasury || 0).toLocaleString('es-AR')}*\n` +
            `╰┈┈┈┈┈┈┈┈⬡`,
            { mentions: [myGuild.leader] }
        )
    }
    
    if (action === 'members') {
        if (!user.rpg.guildId) {
            return m.reply(`❌ No estás en un clan.`)
        }
        
        const myGuild = guilds[user.rpg.guildId]
        const memberList = (myGuild.members || []).map((member, i) => {
            const isLeader = member === myGuild.leader ? ' 👑' : ''
            return `${i + 1}. @${member.split('@')[0]}${isLeader}`
        }).join('\n')
        
        return m.reply(
            `👥 *𝐌𝐈𝐄𝐌𝐁𝐑𝐎𝐒 𝐃𝐄𝐋 𝐂𝐋𝐀𝐍*\n\n` +
            `🏰 Clan: *${myGuild.name}*\n\n` +
            memberList,
            { mentions: myGuild.members }
        )
    }
    
    if (action === 'deposit') {
        if (!user.rpg.guildId) {
            return m.reply(`❌ No estás en un clan.`)
        }
        
        const myGuild = guilds[user.rpg.guildId]
        const amount = parseInt(args[1]) || 0
        
        if (amount < 100) {
            return m.reply(`❌ El depósito mínimo es de $100.`)
        }
        
        if ((user.koin || 0) < amount) {
            return m.reply(`❌ No tenés esa cantidad de guita en el bolsillo.`)
        }
        
        user.koin -= amount
        myGuild.treasury = (myGuild.treasury || 0) + amount
        db.save()
        
        return m.reply(
            `✅ *𝐃𝐄𝐏𝐎́𝐒𝐈𝐓𝐎 𝐄𝐗𝐈𝐓𝐎𝐒𝐎*\n\n` +
            `> 💰 Donaste $${amount.toLocaleString('es-AR')} a la tesorería.\n` +
            `> 🏰 Fondo total: $${myGuild.treasury.toLocaleString('es-AR')}`
        )
    }
}

export { pluginConfig as config, handler }
