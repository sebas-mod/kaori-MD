import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'antitoxic',
    alias: ['antitoxic', 'prohibir', 'addbadword'],
    category: 'group',
    description: 'Agrega una palabra a la lista de términos prohibidos del grupo',
    usage: '.antitoxi <palabra>',
    example: '.antiToxic boludo',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true, // Solo para los que mandan en el grupo
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const word = m.args.join(' ').trim().toLowerCase()

    // Verificamos que hayan escrito algo
    if (!word) {
        return m.reply(
            `📝 *AGREGAR PALABRA PROHIBIDA*\n\n` +
            `> Modo de uso: \`.addtoxic <palabra>\`\n\n` +
            `*Ejemplo:* \`${m.prefix}addtoxic tonto\``
        )
    }

    // Validaciones de longitud
    if (word.length < 2) {
        return m.reply(`❌ *ERROR*\n\n> La palabra es muy corta (mínimo 2 letras).`)
    }

    if (word.length > 30) {
        return m.reply(`❌ *ERROR*\n\n> La palabra es muy larga (máximo 30 letras).`)
    }

    const groupData = db.getGroup(m.chat) || {}
    const toxicWords = groupData.toxicWords || []

    // Evitar duplicados
    if (toxicWords.includes(word)) {
        return m.reply(`❌ *AVISO*\n\n> La palabra \`${word}\` ya está en la lista de este grupo.`)
    }

    // Guardar en la base de datos
    toxicWords.push(word)
    db.setGroup(m.chat, { ...groupData, toxicWords })

    m.react('✅')

    await m.reply(
        `✅ *PALABRA AGREGADA*\n\n` +
        `╭┈┈⬡「 📋 *DETALLE* 」\n` +
        `┃ 📝 Palabra: \`${word}\`\n` +
        `┃ 📊 Total: \`${toxicWords.length}\` en lista\n` +
        `╰┈┈⬡\n\n` +
        `> _Ahora el bot detectará esta palabra cuando alguien la use._`
    )
}

export { pluginConfig as config, handler }
