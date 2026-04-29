import config from '../../config.js'
/**
 * @file plugins/owner/public.js
 * @description Plugin para activar el modo público (todos pueden acceder)
 */
import { getDatabase } from '../../src/lib/ourin-database.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'publico',
    alias: ['publicmode', 'abrir', 'modopublico'],
    category: 'owner',
    description: 'Activa el modo público (todos los usuarios pueden acceder)',
    usage: '.publico',
    example: '.publico',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

/**
 * Handler para el comando publico
 */
async function handler(m, { sock }) {
    try {
        const isRealOwner = validateOwner(m);
        if (!isRealOwner) {
            return await m.reply('🚫 *ᴀᴄᴄᴇsᴏ ᴅᴇɴᴇɢᴀᴅᴏ*\n\n> ¡Solo el propietario puede cambiar el modo del bot!');
        }

        const currentMode = config.mode;
        if (currentMode === 'public') {
            return await m.reply('ℹ️ El bot ya se encuentra en modo *público*');
        }

        config.mode = 'public';
        const db = getDatabase();
        db.setting('botMode', 'public');
        
        const responseText = `🌐 *ᴍᴏᴅᴏ ᴘᴜ́ʙʟɪᴄᴏ ᴀᴄᴛɪᴠᴀᴅᴏ*\n\n` +
            `> ¡El bot ahora responderá a todos los usuarios!\n\n` +
            `_Usa .self para restringir el acceso nuevamente_`;

        await m.reply(responseText);
        console.log(`[Modo] Cambiado a PUBLICO por ${m.pushName} (${m.sender})`);
    } catch (error) {
        console.error('[Error en Comando Publico]', error);
        await m.reply(te(m.prefix, m.command, m.pushName));
    }
}

/**
 * Validación de propietario con múltiples comprobaciones
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
