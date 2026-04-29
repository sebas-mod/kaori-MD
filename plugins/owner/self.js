import config from '../../config.js'
/**
 * @file plugins/owner/self.js
 * @description Plugin para activar el modo self (solo dueño y bot)
 */
import { getDatabase } from '../../src/lib/ourin-database.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'self',
    alias: ['modoself', 'modo-privado', 'privado'],
    category: 'owner',
    description: 'Activa el modo self (solo el owner y el bot pueden acceder)',
    usage: '.self',
    example: '.self',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

/**
 * Handler para el comando self
 */
async function handler(m, { sock }) {
    try {
        const isRealOwner = validateOwner(m);
        if (!isRealOwner) {
            return await m.reply('🚫 *ᴀᴄᴄᴇsᴏ ᴅᴇɴᴇɢᴀᴅᴏ*\n\n> ¡Solo el propietario puede cambiar el modo del bot!');
        }

        const currentMode = config.mode;
        if (currentMode === 'self') {
            return await m.reply('ℹ️ El bot ya se encuentra en modo *self*');
        }

        config.mode = 'self';
        const db = getDatabase();
        db.setting('botMode', 'self');
        
        const responseText = `🔒 *ᴍᴏᴅᴇ sᴇʟꜰ ᴀᴄᴛɪᴠᴀᴅᴏ*\n\n` +
            `> Ahora el bot solo responderá a:\n` +
            `> • Propietario del bot\n` +
            `> • El propio bot (fromMe)\n\n` +
            `_Usa .public para abrir el acceso de nuevo_`;

        await m.reply(responseText);
        console.log(`[Modo] Cambiado a SELF por ${m.pushName} (${m.sender})`);
    } catch (error) {
        console.error('[Error Comando Self]', error);
        await m.reply(te(m.prefix, m.command, m.pushName));
    }
}

/**
 * Validación de owner con múltiples comprobaciones
 */
function validateOwner(m) {
    if (!m.isOwner) return false;
    if (m.fromMe) return true;
    const senderNumber = m.sender?.replace(/[^0-9]/g, '') || '';
    const ownerNumbers = config.owner?.number || [];
    
    const isInOwnerList = ownerNumbers.some(owner => {
        const cleanOwner = owner.replace(/[^0-9]/g, '');
        return senderNumber.includes(cleanOwner) || cleanOwner.includes(senderNumber);
    });

    if (!isInOwnerList) return false;
    if (!m.sender || !m.sender.includes('@')) return false;
    return true;
}

export { pluginConfig as config, handler }
