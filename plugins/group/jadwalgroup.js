import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'horariogrupo',
    alias: ['schedulegroup', 'horariog', 'abrecierra'],
    category: 'group',
    description: 'Establece un horario de apertura/cierre automático para el grupo',
    usage: '.horariogrupo <abrir/cerrar> <HH:MM>',
    example: '.horariogrupo abrir 06:00',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
};

function parseTime(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return null;
    
    const cleaned = timeStr.trim().replace(/\s+/g, '');
    const match = cleaned.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    
    const hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
    
    return { hours, minutes };
}

function formatTime(hours, minutes) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

async function handler(m, { sock, db }) {
    const args = m.args || []
    const action = args[0]?.toLowerCase();
    
    let time = args[1];
    if (args.length >= 4 && args[2] === ':') {
        time = `${args[1]}:${args[3]}`;
    } else if (args.length >= 2) {
        time = args.slice(1).join('').replace(/\s+/g, '');
    }
    
    if (!action) {
        const group = db.getGroup(m.chat) || {};
        const openTime = group.scheduleOpen || null;
        const closeTime = group.scheduleClose || null;
        
        let scheduleInfo = `⏰ *ʜᴏʀᴀʀɪᴏ ᴅᴇʟ ɢʀᴜᴘᴏ*

「 📋 *ᴇsᴛᴀᴅᴏ ᴀᴄᴛᴜᴀʟ* 」
🔓 ᴀᴘᴇʀᴛᴜʀᴀ: *${openTime || 'No activa'}*
🔒 ᴄɪᴇʀʀᴇ: *${closeTime || 'No activa'}*

*Modo de uso:*
\`.horariogrupo abrir 06:00\`
\`.horariogrupo cerrar 22:00\`
\`.horariogrupo borrar abrir\`
\`.horariogrupo borrar cerrar\``;
        
        await m.reply(scheduleInfo);
        return;
    }
    
    if (action === 'borrar' || action === 'delete' || action === 'remove' || action === 'hapus') {
        const type = args[1]?.toLowerCase();
        
        if (type !== 'abrir' && type !== 'cerrar' && type !== 'open' && type !== 'close') {
            await m.reply(
                `⚠️ *ᴠᴀʟɪᴅᴀᴄɪᴏ́ɴ ꜰᴀʟʟɪᴅᴀ*\n\n` +
                `> Usa: \`.horariogrupo borrar abrir\`\n` +
                `> o: \`.horariogrupo borrar cerrar\``
            );
            return;
        }
        
        const group = db.getGroup(m.chat) || {};
        
        if (type === 'abrir' || type === 'open') {
            delete group.scheduleOpen;
            db.setGroup(m.chat, group);
            
            await m.reply(
                `✅ *ᴇ́xɪᴛᴏ*\n\n` +
                `> El horario de *apertura automática* ha sido eliminado.`
            );
        } else {
            delete group.scheduleClose;
            db.setGroup(m.chat, group);
            
            await m.reply(
                `✅ *ᴇ́xɪᴛᴏ*\n\n` +
                `> El horario de *cierre automático* ha sido eliminado.`
            );
        }
        return;
    }
    
    // Traducción de acciones para compatibilidad
    let finalAction = action;
    if (action === 'abrir') finalAction = 'open';
    if (action === 'cerrar') finalAction = 'close';

    if (finalAction !== 'open' && finalAction !== 'close') {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀᴄɪᴏ́ɴ ꜰᴀʟʟɪᴅᴀ*\n\n` +
            `> ¡La acción debe ser \`abrir\` o \`cerrar\`!\n\n` +
            `> *Ejemplo:*\n` +
            `> \`.horariogrupo abrir 06:00\`\n` +
            `> \`.horariogrupo cerrar 22:00\``
        );
        return;
    }
    
    if (!time) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀᴄɪᴏ́ɴ ꜰᴀʟʟɪᴅᴀ*\n\n` +
            `> ¡Debes indicar una hora!\n\n` +
            `> *Formato:* \`HH:MM\` (24 horas)\n` +
            `> *Ejemplo:* \`.horariogrupo ${action} 08:00\``
        );
        return;
    }
    
    const parsed = parseTime(time);
    if (!parsed) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀᴄɪᴏ́ɴ ꜰᴀʟʟɪᴅᴀ*\n\n` +
            `> ¡Formato de hora no válido!\n\n` +
            `> *Formato:* \`HH:MM\` (24 horas)\n` +
            `> *Ejemplo:* \`06:00\`, \`22:30\`, \`08:15\``
        );
        return;
    }
    
    const group = db.getGroup(m.chat) || {};
    const formattedTime = formatTime(parsed.hours, parsed.minutes);
    
    if (finalAction === 'open') {
        group.scheduleOpen = formattedTime;
    } else {
        group.scheduleClose = formattedTime;
    }
    
    db.setGroup(m.chat, group);
    
    const actionText = finalAction === 'open' ? 'APERTURA' : 'CIERRE';
    const emoji = finalAction === 'open' ? '🔓' : '🔒';
    
    const successMsg = `✅ *ʜᴏʀᴀʀɪᴏ ɢᴜᴀʀᴅᴀᴅᴏ*

╭┈┈⬡「 ⏰ *ᴄᴏɴꜰɪɢᴜʀᴀᴄɪᴏ́ɴ* 」
┃ ㊗ ${emoji} ᴀᴄᴄɪᴏ́ɴ: *${actionText}*
┃ ㊗ ⏱️ ʜᴏʀᴀ: *${formattedTime}*
┃ ㊗ 📡 ᴇsᴛᴀᴅᴏ: *🟢 Activo*
╰┈┈⬡

> _El grupo se ${finalAction === 'open' ? 'abrirá' : 'cerrará'} automáticamente_
> _todos los días a las *${formattedTime}* hs._

*Powered by KAORI MD*`;
    
    await m.reply(successMsg);
}

export { pluginConfig as config, handler }
