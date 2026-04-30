import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'petshop',
    alias: ['tiendapet', 'comprarpet', 'belipet'],
    category: 'rpg',
    description: 'Comprá una mascota en la tienda',
    usage: '.petshop <buy> <mascota>',
    example: '.petshop buy cat',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

const PETS_FOR_SALE = {
    cat: { name: '🐱 Gato', price: 5000, desc: 'Mucha suerte, ataque moderado' },
    dog: { name: '🐕 Perro', price: 6000, desc: 'Ataque alto, buena defensa' },
    bird: { name: '🐦 Pájaro', price: 4500, desc: 'Suerte muy alta' },
    fish: { name: '🐟 Pez', price: 3000, desc: 'Barato y con mucha suerte' },
    rabbit: { name: '🐰 Conejo', price: 5500, desc: 'Estadísticas equilibradas' }
}

function handler(m) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.rpg) user.rpg = {}
    if (!user.inventory) user.inventory = {}
    
    const args = m.args || []
    const action = args[0]?.toLowerCase()
    const petKey = args[1]?.toLowerCase()
    
    if (!action || (action !== 'buy' && action !== 'comprar')) {
        let txt = `🏪 *𝐓𝐈𝐄𝐍𝐃𝐀 𝐃𝐄 𝐌𝐀𝐒𝐂𝐎𝐓𝐀𝐒*\n\n`
        txt += `> ¡Comprá un compañero para tus aventuras!\n\n`
        txt += `╭┈┈⬡「 🐾 *𝐌𝐀𝐒𝐂𝐎𝐓𝐀𝐒* 」\n`
        
        for (const [key, pet] of Object.entries(PETS_FOR_SALE)) {
            txt += `┃ ${pet.name}\n`
            txt += `┃ 💰 Precio: $${pet.price.toLocaleString('es-AR')}\n`
            txt += `┃ 📝 ${pet.desc}\n`
            txt += `┃ → \`${m.prefix}petshop buy ${key}\`\n┃\n`
        }
        txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        txt += `💰 *Tu Saldo:* $${(user.koin || 0).toLocaleString('es-AR')}`
        
        return m.reply(txt)
    }
    
    if (action === 'buy' || action === 'comprar') {
        if (!petKey) {
            return m.reply(`❌ ¡Tenés que elegir una mascota!\n\n> Ejemplo: \`${m.prefix}petshop buy cat\``)
        }
        
        if (user.rpg.pet) {
            return m.reply(`❌ ¡Ya tenés una mascota! Vendela o usá el sistema de crianza (breeding) para tener otra.`)
        }
        
        const petToBuy = PETS_FOR_SALE[petKey]
        if (!petToBuy) {
            return m.reply(`❌ ¡Esa mascota no está en la tienda!`)
        }
        
        if ((user.koin || 0) < petToBuy.price) {
            return m.reply(
                `❌ *𝐒𝐀𝐋𝐃𝐎 𝐈𝐍𝐒𝐔𝐅𝐈𝐂𝐈𝐄𝐍𝐓𝐄*\n\n` +
                `> Precio: $${petToBuy.price.toLocaleString('es-AR')}\n` +
                `> Tu saldo: $${(user.koin || 0).toLocaleString('es-AR')}`
            )
        }
        
        // Descontar dinero
        user.koin -= petToBuy.price
        
        // Asignar mascota
        user.rpg.pet = {
            type: petKey,
            name: petToBuy.name.split(' ')[1] || 'Mi Mascota',
            level: 1,
            exp: 0,
            hunger: 80,
            stats: null
        }
        
        db.save()
        
        return m.reply(
            `🎉 *¡𝐌𝐀𝐒𝐂𝐎𝐓𝐀 𝐂𝐎𝐌𝐏𝐑𝐀𝐃𝐀!*\n\n` +
            `╭┈┈⬡「 🐾 *𝐍𝐔𝐄𝐕𝐀 𝐌𝐀𝐒𝐂𝐎𝐓𝐀* 」\n` +
            `┃ 🏷️ Nombre: *${user.rpg.pet.name}*\n` +
            `┃ 🐾 Especie: *${petToBuy.name}*\n` +
            `┃ 💰 Costo: *-$${petToBuy.price.toLocaleString('es-AR')}*\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `> ¡Usá \`${m.prefix}mascota\` para ver cómo está tu nuevo amigo en **𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈Ɀ𝐀𝐖𝐀 𝐌𝐃**!`
        )
    }
}

export { pluginConfig as config, handler }
