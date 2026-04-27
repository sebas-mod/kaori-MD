import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'notiforacion',
    alias: ['notifsholat', 'notifsolat', 'recordatorio'],
    category: 'group',
    description: 'Activa o desactiva las notificaciones de tiempos de oración en este grupo',
    usage: '.notiforacion on/off',
    example: '.notiforacion on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
};

function handler(m, { sock, db }) {
    if (!m.isAdmin && !m.isOwner) {
        return m.reply(`❌ Solo los administradores del grupo pueden usar esta función.`);
    }

    const args = m.args[0]?.toLowerCase();
    const group = db.getGroup(m.chat) || {};
    const globalDb = getDatabase();
    
    // Configuración de ubicación (Se mantiene la lógica de la base de datos)
    const kotaSetting = globalDb.setting('autoSholatKota') || { nama: 'CIUDAD DE JAKARTA' };

    if (!['on', 'off', 'activar', 'desactivar'].includes(args)) {
        const isGlobalActive = globalDb.setting('autoSholat') || false;
        const statusGlobal = isGlobalActive ? '✅ ACTIVO' : '❌ INACTIVO';
        const statusGrup = group.notifSholat !== false ? '✅ ACTIVO' : '❌ INACTIVO';
        
        return m.reply(
            `🕌 *ʀᴇᴄᴏʀᴅᴀᴛᴏʀɪᴏ ᴅᴇ ᴏʀᴀᴄɪᴏ́ɴ*\n\n` +
            `Estado Global: *${statusGlobal}* (Control del Owner)\n` +
            `Estado del Grupo: *${statusGrup}*\n` +
            `Ubicación: *${kotaSetting.nama}*\n\n` +
            `*AJUSTES DEL GRUPO:*\n` +
            `• *${m.prefix}notiforacion on* — Activar avisos en este grupo\n` +
            `• *${m.prefix}notiforacion off* — Desactivar avisos en este grupo\n\n` +
            `*CÓMO FUNCIONA:*\n` +
            `1. Envía el audio del Adzan e imagen del horario al entrar en tiempo de oración.\n` +
            `2. Sigue el horario en tiempo real basado en el servicio configurado.\n` +
            `3. Si el Estado Global está INACTIVO, el grupo no recibirá avisos aunque su estado sea ACTIVO.\n` +
            `4. Los administradores pueden apagarlo si consideran que interrumpe el chat.\n\n` +
            `*𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃 — Espiritualidad*`
        );
    }

    if (args === 'on' || args === 'activar') {
        group.notifSholat = true;
        db.setGroup(m.chat, group);
        return m.reply(`✅ *ɴᴏᴛɪꜰɪᴄᴀᴄɪᴏ́ɴ ᴀᴄᴛɪᴠᴀᴅᴀ*\n\n> Este grupo ahora recibirá recordatorios de oración.\n> Ubicación actual: ${kotaSetting.nama}`);
    }

    if (args === 'off' || args === 'desactivar') {
        group.notifSholat = false;
        db.setGroup(m.chat, group);
        return m.reply(`❌ *ɴᴏᴛɪꜰɪᴄᴀᴄɪᴏ́ɴ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴀ*\n\n> Se han desactivado los avisos de oración para este grupo.`);
    }
}

export { pluginConfig as config, handler }
