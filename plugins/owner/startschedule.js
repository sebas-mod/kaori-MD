import { startSchedulerByName, getFullSchedulerStatus } from '../../src/lib/ourin-scheduler.js'
import { initSholatScheduler } from '../../src/lib/ourin-sholat-scheduler.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'startschedule',
    alias: ['iniciarprogramador', 'schedstart', 'resumirhorario'],
    category: 'owner',
    description: 'Reinicia un programador específico o todos los programadores del sistema',
    usage: '.startschedule <nombre|all>',
    example: '.startschedule sholat',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

async function handler(m, { sock, args }) {
    try {
        const target = args[0]?.toLowerCase();
        
        if (!target) {
            const helpText = `▶️ *ɪɴɪᴄɪᴀʀ ᴘʀᴏɢʀᴀᴍᴀᴅᴏʀ*

*Uso:*
\`.startschedule <nombre>\`

*Programadores disponibles:*
• \`limitreset\` - Reinicio diario de límites
• \`groupschedule\` - Horarios de grupos
• \`sewa\` - Verificador de alquileres
• \`messages\` - Mensajes programados
• \`sholat\` - Programador de Oración (Sholat)
• \`all\` - Todos los programadores

*Ejemplo:*
\`.startschedule sholat\`
\`.startschedule all\``;
            
            await m.reply(helpText);
            return;
        }
        
        if (target === 'sholat') {
            const db = getDatabase();
            const wasEnabled = db.setting('autoSholat');
            
            if (wasEnabled) {
                await m.reply(`ℹ️ El programador de oraciones ya se encuentra activo`);
                return;
            }
            
            initSholatScheduler(sock);
            db.setting('autoSholat', true);
            
            await m.reply(`▶️ *ᴘʀᴏɢʀᴀᴍᴀᴅᴏʀ ɪɴɪᴄɪᴀᴅᴏ*

> Programador: *Sholat Scheduler*
> Estado: ✅ Activo

_Las notificaciones de oración se enviarán a los grupos que tengan esta función activada_`);
            return;
        }
        
        if (target === 'all') {
            initSholatScheduler(sock);
            const db = getDatabase();
            db.setting('autoSholat', true);
        }
        
        const result = startSchedulerByName(target, sock);
        
        if (result.started) {
            await m.reply(`▶️ *ᴘʀᴏɢʀᴀᴍᴀᴅᴏʀ ɪɴɪᴄɪᴀᴅᴏ*

> Programador: *${result.name}*
> Estado: ✅ Activo

_El programador ha sido reiniciado correctamente_`);
        } else {
            await m.reply(`❌ El programador no existe o ya está activo

Usa \`.startschedule\` para ver la lista de programadores disponibles`);
        }
    } catch (error) {
        console.error('[StartSchedule Error]', error);
        await m.reply(te(m.prefix, m.command, m.pushName));
    }
}

export { pluginConfig as config, handler }
