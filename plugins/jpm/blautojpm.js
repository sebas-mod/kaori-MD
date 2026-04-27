import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'

const pluginConfig = {
    name: 'blautojpm',
    alias: ['blacklistautojpm', 'autojpmbl', 'listablautojpm'],
    category: 'admin',
    description: 'Gestiona la lista negra de grupos para Auto JPM usando números de índice',
    usage: '.blautojpm [número]',
    example: '.blautojpm 2 3 7',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    let blacklist = db.setting('autoJpmBlacklist') || []
    const allGroups = await sock.groupFetchAllParticipating()
    const groups = Object.values(allGroups).sort((a, b) => a.subject.localeCompare(b.subject))

    if (!m.text) {
        if (groups.length === 0) {
            return m.reply(`❌ El bot aún no se ha unido a ningún grupo.`)
        }

        let listText = `📋 *LISTA DE GRUPOS Y BLACKLIST DE AUTO-JPM*\n\n`
        listText += `A continuación se muestran los *${groups.length} grupos* donde se encuentra ${config.bot?.name || 'KAORI MD'}.\n`
        listText += `La marca *(🚫)* indica que el grupo está excluido de los envíos de Auto-JPM.\n\n`

        for (let i = 0; i < groups.length; i++) {
            const isBlacklisted = blacklist.includes(groups[i].id)
            const icon = isBlacklisted ? ' 🚫' : ''
            listText += `*${i + 1}.* ${groups[i].subject}${icon}\n`
        }

        listText += `\n*CÓMO AGREGAR / QUITAR DE LA LISTA:* \n`
        listText += `Escribe el comando seguido de los números de los grupos (puedes poner varios separados por espacios).\n\n`
        listText += `*Ejemplo:*\n`
        listText += `> \`${m.prefix}blautojpm 2 3 7\``

        return m.reply(listText)
    }

    const args = m.text.trim().split(/\s+/)
    const toggled = []

    for (const numStr of args) {
        const num = parseInt(numStr)
        if (!isNaN(num) && num > 0 && num <= groups.length) {
            const index = num - 1
            const targetGroup = groups[index] 
            if (blacklist.includes(targetGroup.id)) {
                blacklist = blacklist.filter(jid => jid !== targetGroup.id)
                toggled.push(`*${num}.* ${targetGroup.subject} ✅ *(Removido de Blacklist)*`)
            } else {
                blacklist.push(targetGroup.id)
                toggled.push(`*${num}.* ${targetGroup.subject} 🚫 ~(Agregado a Blacklist)~`)
            }
        }
    }

    if (toggled.length === 0) {
        return m.reply(`❌ No ingresaste números de grupo válidos.\n\nEscribe *${m.prefix}blautojpm* para ver la lista numerada.`)
    }

    db.setting('autoJpmBlacklist', blacklist)
    m.react('✅')

    return m.reply(`📢 *ESTADO DE BLACKLIST ACTUALIZADO:*\n\n${toggled.join('\n')}`)
}

export { pluginConfig as config, handler }
