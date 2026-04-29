import { stopAllJadibots, getActiveJadibots } from '../../src/lib/ourin-jadibot-manager.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'stopalljadibot',
    alias: ['detenertodoslosjadibots', 'killalljadibots', 'stopsemuajadibot'],
    category: 'owner',
    description: 'Detiene todos los jadibots que estén activos actualmente',
    usage: '.stopalljadibot',
    example: '.stopalljadibot',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const active = getActiveJadibots()

    if (active.length === 0) {
        return m.reply(`❌ No hay ningún jadibot activo en este momento.`)
    }

    await m.react('🕕')

    try {
        const stopped = await stopAllJadibots()

        await m.react('✅')

        const names = stopped.map(id => `@${id}`).join(', ')

        await sock.sendMessage(m.chat, {
            text: `🛑 *ᴛᴏᴅᴏs ʟᴏs ᴊᴀᴅɪʙᴏᴛs ᴅᴇᴛᴇɴɪᴅᴏs*\n\n` +
                `> 📊 Total: *${stopped.length}* jadibot(s)\n` +
                `> 💾 Sesiones: *Guardadas*\n\n` +
                `Detenidos: ${names}\n\n` +
                `> Todas las sesiones han sido almacenadas y pueden reactivarse.`,
            mentions: stopped.map(id => id + '@s.whatsapp.net')
        }, { quoted: m })
    } catch (error) {
        await m.react('☢')
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
