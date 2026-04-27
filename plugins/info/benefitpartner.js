import config from '../../config.js'

const pluginConfig = {
    name: 'benefitpartner',
    alias: ['beneficiospartner', 'ventajaspartner', 'partner'],
    category: 'info',
    description: 'Mira las ventajas de ser partner oficial del bot',
    usage: '.benefitpartner',
    example: '.benefitpartner',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {

    const prefix = m.prefix || '.'

    let txt = `🤝 *VENTAJAS DE SER PARTNER*\n\n`
    txt += `Beneficios exclusivos por ser partner de ${config.bot?.name || '𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃'}:\n\n`

    txt += `🔓 *Acceso Total*\n`
    txt += `├ Todas las funciones Premium desbloqueadas\n`
    txt += `├ Energía y monedas ilimitadas\n`
    txt += `├ Acceso a comandos de gestión específicos\n`
    txt += `└ Soporte técnico prioritario\n\n`

    txt += `📦 *Panel Pterodactyl*\n`
    txt += `├ Capacidad para crear tus propios servidores\n`
    txt += `├ Acceso al panel de administración\n`
    txt += `└ Posibilidad de revender servicios (Reseller)\n\n`

    txt += `💎 *Bonificaciones*\n`
    txt += `├ +200.000 EXP al activar el rango\n`
    txt += `├ +20.000 Monedas de regalo\n`
    txt += `├ Badge (insignia) de Partner en tu perfil\n`
    txt += `└ Acceso anticipado a nuevas funciones\n\n`

    txt += `💰 *Cómo ser Partner*\n`
    txt += `├ Contacta con: ${config.owner?.name || 'Owner'}\n`
    txt += `├ Duración: Planes de 30/60/90 días\n`
    txt += `└ Comando: \`${prefix}addpartner\` (Solo Owner)\n\n`

    txt += `📋 *Comandos de Partner*\n`
    txt += `├ \`${prefix}cekpartner\` — Ver tu estado de partner\n`
    txt += `├ \`${prefix}cekprem\` — Ver estado premium\n`
    txt += `├ \`${prefix}role\` — Ver tu rango actual\n`
    txt += `└ \`${prefix}listpartner\` — Lista de partners oficiales\n\n`

    txt += `> _Contacta con el administrador para más información._`

    await m.reply(txt)
}

export { pluginConfig as config, handler }
