import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'add',
    alias: ['agregar', 'invitar', 'añadir'],
    category: 'group',
    description: 'Añadir miembros al grupo (soporta varios números a la vez)',
    usage: '.add <número1> [número2]... [link_grupo]',
    example: '.add 5491122334455',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: true, // Solo admins pueden usarlo
    isBotAdmin: true // El bot debe ser admin
}

async function handler(m, { sock }) {
    const args = m.args || []

    if (args.length === 0) {
        return m.reply(
            `👥 *AGREGAR MIEMBROS*\n\n` +
            `> *Modo de uso:*\n` +
            `> 1. En el grupo: \`${m.prefix}add <número>\`\n` +
            `> 2. Múltiples: \`${m.prefix}add <n1> <n2> <n3>\`\n` +
            `> 3. Por privado: \`${m.prefix}add <número> <link_del_grupo>\`\n\n` +
            `> *Ejemplo:*\n` +
            `> \`${m.prefix}add 5491122334455\`\n` +
            `> \`${m.prefix}add https://chat.whatsapp.com/xxx 5491122334455\`\n\n` +
            `> *Requisitos:*\n` +
            `> - El bot y quien usa el comando deben ser admins.`
        )
    }

    let targetGroup = m.isGroup ? m.chat : null
    let targetNumbers = []

    for (const arg of args) {
        const linkMatch = arg.match(/chat\.whatsapp\.com\/([a-zA-Z0-9]+)/)
        if (linkMatch) {
            try {
                const groupInfo = await sock.groupGetInviteInfo(linkMatch[1])
                targetGroup = groupInfo.id
            } catch (e) {
                return m.reply(`❌ *ERROR*\n\n> ¡El link del grupo no es válido o expiró!`)
            }
        } else if (arg.includes('@g.us')) {
            targetGroup = arg
        } else {
            let num = arg.replace(/[^0-9]/g, '')
            // Si el número empieza con 0 o 11 (típico de acá), intentamos ponerle el 549
            if (num.startsWith('0')) {
                num = '54' + num.slice(1)
            } else if (num.length === 10) {
                num = '54' + num
            }
            
            if (num.length >= 10) {
                targetNumbers.push(num)
            }
        }
    }

    if (targetNumbers.length === 0) {
        return m.reply(`❌ *ERROR*\n\n> ¡Ingresá números válidos!`)
    }

    if (!targetGroup) {
        return m.reply(`❌ *ERROR*\n\n> Usalo en un grupo o pasame el link de uno.\n\n\`${m.prefix}add <número> <link>\``)
    }

    try {
        const groupMeta = await sock.groupMetadata(targetGroup)
        const botId = sock.user?.id?.split(':')[0] + '@s.whatsapp.net'
        const botParticipant = groupMeta.participants.find(p => 
            p.id === botId || p.jid === botId || p.id?.includes(sock.user?.id?.split(':')[0])
        )

        if (!botParticipant || !['admin', 'superadmin'].includes(botParticipant.admin)) {
            return m.reply(`❌ *ERROR*\n\n> ¡El bot no es admin en *${groupMeta.subject}*!`)
        }

        // Si se usa por privado, verificamos que el usuario sea admin en ese grupo
        if (!m.isGroup) {
            const senderParticipant = groupMeta.participants.find(p => p.id === m.sender)
            if (!senderParticipant || !['admin', 'superadmin'].includes(senderParticipant.admin)) {
                return m.reply(`❌ *ERROR*\n\n> No sos admin en *${groupMeta.subject}* para agregar gente.`)
            }
        }

        const validNumbers = []
        const alreadyInGroup = []

        for (const num of targetNumbers) {
            const jid = num + '@s.whatsapp.net'
            const existingMember = groupMeta.participants.find(p => p.id === jid)

            if (existingMember) {
                alreadyInGroup.push(num)
            } else {
                validNumbers.push(jid)
            }
        }

        if (validNumbers.length === 0) {
            return m.reply(`❌ *AVISO*\n\n> Todos esos números ya están en el grupo.`)
        }

        await m.react('🕕')

        const results = await sock.groupParticipantsUpdate(targetGroup, validNumbers, 'add')

        let successList = []
        let invitedList = []
        let failedList = []

        for (const res of results) {
            const num = res.jid?.split('@')[0] || res.content?.attrs?.phone_number || 'Número'
            
            if (res.status === '200' || res.status === 200) {
                successList.push(num)
            } else if (res.status === '408' || res.status === 408) {
                invitedList.push(num) // Status 408 suele ser invitación enviada por privacidad del usuario
            } else {
                failedList.push({ num, status: res.status })
            }
        }

        let resultText = `✅ *RESULTADOS DE LA OPERACIÓN*\n\n`

        if (successList.length > 0) {
            resultText += `*Agregados directamente (${successList.length}):*\n`
            successList.forEach(n => resultText += `• @${n}\n`)
            resultText += `\n`
        }

        if (invitedList.length > 0) {
            resultText += `📨 *Invitación enviada por privado (${invitedList.length}):*\n`
            invitedList.forEach(n => resultText += `• @${n}\n`)
            resultText += `\n`
        }

        if (failedList.length > 0) {
            resultText += `❌ *Errores (${failedList.length}):*\n`
            failedList.forEach(f => resultText += `• @${f.num} (Error: ${f.status})\n`)
            resultText += `\n`
        }

        if (alreadyInGroup.length > 0) {
            resultText += `⏭️ *Ya eran miembros (${alreadyInGroup.length}):*\n`
            alreadyInGroup.forEach(n => resultText += `• @${n}\n`)
        }

        await m.react(successList.length > 0 || invitedList.length > 0 ? '✅' : '❌')
        
        const allMentions = [...successList, ...invitedList, ...alreadyInGroup].map(n => n + '@s.whatsapp.net')
        allMentions.push(m.sender)

        await m.reply(resultText, { mentions: allMentions })

    } catch (error) {
        await m.react('❌')
        console.error(error)
        if (error.message?.includes('not-authorized')) {
            await m.reply(`❌ *ERROR*\n\n> El bot perdió los permisos de admin o no está autorizado.`)
        } else {
            m.reply(te(m.prefix, m.command, m.pushName))
        }
    }
}

export { pluginConfig as config, handler }
