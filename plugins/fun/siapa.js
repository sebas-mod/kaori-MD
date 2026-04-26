import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: [
        'tonto', 'boludo', 'idiota', 'estupido', 'gordo', 'flaco', 'pelotudo', 
        'pro', 'inteligente', 'genio', 'perro', 'burro', 'gay', 'lesbi',
        'hdp', 'mierda', 'rata', 'manco', 'noob', 'master', 'newbie', 
        'sucio', 'pajero', 'pajera', 'horny', 'caliente', 'otaku', 'wibu', 
        'diablo', 'demonio', 'lindo', 'linda', 'fachero', 'facha', 'hermoso',
        'feo', 'fea', 'crack', 'pobre', 'millonario', 'cheto', 'sultan', 'quien'
    ],
    alias: [],
    category: 'fun',
    description: 'Elige un miembro del grupo al azar para una categoría específica',
    usage: '.<categoría>',
    example: '.fachero',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const command = m.command?.toLowerCase()
    m.react('🕕')
    try {
        const groupMeta = m.groupMetadata
        const participants = groupMeta.participants || []
        const members = participants
            .map(p => p.id || p.jid)
            .filter(id => id && id !== sock.user?.id?.split(':')[0] + '@s.whatsapp.net')

        if (members.length === 0) {
            return m.reply(`❌ ¡No hay suficientes miembros en el grupo!`)
        }

        const randomMember = members[Math.floor(Math.random() * members.length)]
        
        // Lista de palabras positivas para cambiar el tono del mensaje
        const positiveWords = [
            'lindo', 'linda', 'fachero', 'facha', 'hermoso', 'crack', 
            'pro', 'master', 'genio', 'inteligente', 'millonario', 'cheto'
        ]
        
        const isPositive = positiveWords.includes(command)
        const emoji = isPositive ? '✨' : '😏'
        const label = isPositive ? 'El más' : 'El/La'
        
        await m.reply(`${emoji} *${label} ${command} de acá es:* @${randomMember.split('@')[0]}`, { 
            mentions: [randomMember] 
        })
        
        m.react('✅')
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
