import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'aktifaudiomenu',
    alias: ['audiomenu', 'setaudiomenu', 'toggleaudiomenu'],
    category: 'owner',
    description: 'Activar/Desactivar el audio al mostrar el menú',
    usage: '.aktifaudiomenu si/no',
    example: '.aktifaudiomenu si',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock, db }) {
    const args = m.args || []
    const option = args[0]?.toLowerCase()

    const current = db.setting('audioMenu') !== false

    if (!option) {
        return m.reply(
            `🔊 *AJUSTES DE AUDIO DEL MENÚ*\n\n` +
            `> Estado: *${current ? '✅ Activo' : '❌ Desactivado'}*\n\n` +
            `*Modo de uso:*\n` +
            `> \`${m.prefix}aktifaudiomenu si\` - Activar audio\n` +
            `> \`${m.prefix}aktifaudiomenu no\` - Desactivar audio`
        )
    }

    if (['si', 'on', '1', 'aktif', 'yes'].includes(option)) {
        if (current) {
            return m.reply(`⚠️ ¡El audio del menú ya está activo!`)
        }
        db.setting('audioMenu', true)
        await db.save()
        await m.react('✅')
        return m.reply(`✅ ¡Audio del menú *activado*!\n\n> Ahora, cuando alguien use \`.menu\`, se reproducirá el audio.`)
    }

    if (['no', 'off', '0', 'nonaktif'].includes(option)) {
        if (!current) {
            return m.reply(`⚠️ ¡El audio del menú ya está desactivado!`)
        }
        db.setting('audioMenu', false)
        await db.save()
        await m.react('✅')
        return m.reply(`❌ ¡Audio del menú *desactivado*!\n\n> Ahora \`.menu\` no incluirá audio.`)
    }

    return m.reply(`❌ ¡Opción no válida!\n\nUsa: \`si\` o \`no\``)
}

export { pluginConfig as config, handler }
