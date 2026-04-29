import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'

const pluginConfig = {
    name: 'cruza',
    alias: ['breed', 'breeding', 'cruzar', 'petbreed'],
    category: 'rpg',
    description: 'Cruza tus mascotas con las de otros para obtener una nueva cría',
    usage: '.cruza @user',
    example: '.cruza @user',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 3600,
    energi: 3,
    isEnabled: true
}

const BREEDING_RESULTS = {
    'gato+gato': ['gato', 'gato', 'leon'],
    'perro+perro': ['perro', 'perro', 'lobo'],
    'gato+perro': ['gato', 'perro', 'conejo'],
    'pajaro+pajaro': ['pajaro', 'pajaro', 'fenix'],
    'pez+pez': ['pez', 'pez', 'dragon'],
    'conejo+conejo': ['conejo', 'conejo', 'conejo_trueno'],
    'gato+pajaro': ['gato', 'pajaro', 'fenix'],
    'perro+conejo': ['perro', 'conejo', 'lobo'],
    'default': ['gato', 'perro', 'pajaro', 'pez', 'conejo']
}

const PET_NAMES = {
    gato: '🐱 Gato',
    perro: '🐕 Perro',
    pajaro: '🐦 Pájaro',
    pez: '🐟 Pez',
    conejo: '🐰 Conejo',
    leon: '🦁 León',
    lobo: '🐺 Lobo',
    fenix: '🔥 Fénix',
    dragon: '🐉 Dragón',
    conejo_trueno: '⚡ Conejo Trueno'
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.rpg) user.rpg = {}
    
    const mentioned = m.mentionedJid?.[0] || m.quoted?.sender
    
    if (!mentioned) {
        return m.reply(
            `🐾 *SISTEMA DE CRÍA - 𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃*\n\n` +
            `> ¡Cruzá tu mascota con la de otro usuario para obtener una nueva!\n\n` +
            `╭┈┈⬡「 📋 *MODO DE USO* 」\n` +
            `┃ ${m.prefix}cruza @user\n` +
            `┃ Respondé a un mensaje con ${m.prefix}cruza\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `⚠️ *Requisitos:*\n` +
            `> • Ambos deben tener una mascota.\n` +
            `> • Nivel de mascota 5 o superior.\n` +
            `> • Costo: $3.000 monedas cada uno.`
        )
    }
    
    if (mentioned === m.sender) {
        return m.reply(`❌ No podés cruzar mascotas con vos mismo. ¡Buscá un socio!`)
    }
    
    if (!user.rpg.pet) {
        return m.reply(`❌ No tenés ninguna mascota activa. Comprá una en el \`${m.prefix}petshop\`.`)
    }
    
    const partner = db.getUser(mentioned)
    if (!partner?.rpg?.pet) {
        return m.reply(`❌ La persona mencionada no tiene mascotas.`)
    }
    
    const myPet = user.rpg.pet
    const partnerPet = partner.rpg.pet
    
    if ((myPet.level || 1) < 5) {
        return m.reply(`❌ Tu mascota necesita ser nivel 5+. (Actual: ${myPet.level || 1})`)
    }
    
    if ((partnerPet.level || 1) < 5) {
        return m.reply(`❌ La mascota de tu compañero necesita ser nivel 5+. (Actual: ${partnerPet.level || 1})`)
    }
    
    const breedingCost = 3000
    if ((user.koin || 0) < breedingCost) {
        return m.reply(`❌ No tenés guita suficiente. Necesitás $${breedingCost.toLocaleString('es-AR')}`)
    }
    
    user.koin -= breedingCost
    
    await m.react('🐾')
    await m.reply(`🐾 *INICIANDO CRUZA...*\n\n> ${PET_NAMES[myPet.type]} + ${PET_NAMES[partnerPet.type]}`)
    await new Promise(r => setTimeout(r, 3000))
    
    const breedKey = [myPet.type, partnerPet.type].sort().join('+')
    const possibleResults = BREEDING_RESULTS[breedKey] || BREEDING_RESULTS['default']
    const resultPetType = possibleResults[Math.floor(Math.random() * possibleResults.length)]
    
    const isRare = ['leon', 'lobo', 'fenix', 'dragon', 'conejo_trueno'].includes(resultPetType)
    
    if (!user.rpg.petStorage) user.rpg.petStorage = []
    
    const newPet = {
        type: resultPetType,
        name: 'Cría de ' + (PET_NAMES[resultPetType]?.split(' ')[1] || 'Baby'),
        level: 1,
        exp: 0,
        hunger: 100,
        stats: null,
        birthDate: Date.now()
    }
    
    user.rpg.petStorage.push(newPet)
    
    const expReward = isRare ? 500 : 200
    await addExpWithLevelCheck(sock, m, db, user, expReward)
    db.save()
    
    await m.react(isRare ? '🎉' : '✅')
    
    let txt = `${isRare ? '🎉' : '✅'} *¡CRUZA COMPLETADA!*\n\n`
    txt += `╭┈┈⬡「 🐾 *NUEVA MASCOTA* 」\n`
    txt += `┃ 🏷️ Tipo: *${PET_NAMES[resultPetType]}*\n`
    txt += `┃ ${isRare ? '⭐ *¡ES UNA MASCOTA RARA!*' : '📊 Mascota común'}\n`
    txt += `┃ ✨ EXP: *+${expReward}*\n`
    txt += `┃ 💰 Costo: *-$${breedingCost.toLocaleString('es-AR')}*\n`
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    txt += `> La cría se guardó en el depósito. Tenés un total de ${user.rpg.petStorage.length} mascotas guardadas.`
    
    return m.reply(txt, { mentions: [m.sender, mentioned] })
}

export { pluginConfig as config, handler }
