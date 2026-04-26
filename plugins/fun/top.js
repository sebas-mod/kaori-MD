import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'top',
    alias: ['top5', 'toplist', 'ranking'],
    category: 'fun',
    description: 'Genera un top 5 aleatorio de miembros para una categoría específica',
    usage: '.top <categoría>',
    example: '.top personas inteligentes',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const kategori = m.args.join(' ')?.trim()

    if (!kategori) {
        return m.reply(
            `⚠️ *ғᴀʟᴛᴀ ʟᴀ ᴄᴀᴛᴇɢᴏʀɪ́ᴀ*\n\n` +
            `> Ejemplo: \`${m.prefix}top personas facheras\``
        )
    }

    m.react('🕕')

    try {
        const groupMeta = m.groupMetadata
        const participants = groupMeta.participants || []

        // Filtrar IDs válidos y excluir al bot
        const members = participants
            .map(p => p.id || p.jid)
            .filter(id => id && id !== sock.user?.id?.split(':')[0] + '@s.whatsapp.net')

        if (members.length < 5) {
            return m.reply(`❌ ¡Necesito al menos 5 personas en el grupo para hacer un Top 5!`)
        }

        // Mezclar aleatoriamente y tomar los primeros 5
        const shuffled = members.sort(() => Math.random() - 0.5)
        const top5 = shuffled.slice(0, 5)

        const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']
        let list = ''

        top5.forEach((jid, index) => {
            list += `*${index + 1}* ${medals[index]} @${jid.split('@')[0]}\n`
        })

        await m.reply(`🏆 *ᴛᴏᴘ 5 ${kategori.toUpperCase()}*\n\n${list}`, { mentions: top5 })
        m.react('✅')
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
