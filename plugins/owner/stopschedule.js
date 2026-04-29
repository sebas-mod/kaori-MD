import { stopSchedulerByName, getFullSchedulerStatus } from '../../src/lib/ourin-scheduler.js'
import { stopSholatScheduler } from '../../src/lib/ourin-sholat-scheduler.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'stopschedule',
    alias: ['detenerprogramador', 'schedstop', 'pausarprogramador'],
    category: 'owner',
    description: 'Detiene un programador (scheduler) específico o todos ellos',
    usage: '.stopschedule <nombre|all>',
    example: '.stopschedule sholat',
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
            const helpText = `🛑 *ᴅᴇᴛᴇɴᴇʀ ᴘʀᴏɢʀᴀᴍᴀᴅᴏʀ*

*Uso:*
\`.stopschedule <nombre>\`

*Programadores disponibles:*
• \`limitreset\` - Reinicio diario de límites
• \`groupschedule\` - Programación de grupos
• \`sewa\` - Verificador de alquileres (Sewa)
• \`messages\` - Mensajes programados
• \`sholat\` - Programador de Oración (Sholat)
• \`all\` - Todos los programadores

*Ejemplo:*
\`.stopschedule sholat\`
\`.stopschedule all\``;
            
            await m.reply(helpText);
            return;
        }
        
        if (target === 'sholat') {
            const db = getDatabase();
            const wasEnabled = db.setting('autoSholat');
            
            if (!wasEnabled) {
                await m.reply(`ℹ️ El programador de oraciones ya se encuentra desactivado`);
                return;
            }
            
            stopSholatScheduler();
            db.setting('autoSholat', false);
            
            await m.reply(`🛑 *ᴘʀᴏɢʀᴀᴍᴀᴅᴏʀ ᴅᴇᴛᴇɴɪᴅᴏ*

> Programador: *Sholat Scheduler*
> Estado: ❌ Detenido

_Usa \`.startschedule sholat\` para activarlo de nuevo_`);
            return;
        }
        
        if (target === 'all') {
            stopSholatScheduler();
            const db = getDatabase();
            db.setting('autoSholat', false);
        }
        
        const result = stopSchedulerByName(target);
        
        if (result.stopped) {
            await m.reply(`🛑 *ᴘʀᴏɢʀᴀᴍᴀᴅᴏʀ ᴅᴇᴛᴇɴɪᴅᴏ*

> Programador: *${result.name}*
> Estado: ❌ Detenido

_Usa \`.startschedule ${target}\` para activarlo de nuevo_`);
        } else {
            await m.reply(`❌ El programador no fue encontrado o ya está desactivado

Usa \`.stopschedule\` para ver la lista de programadores`);
        }
    } catch (error) {
        console.error('[StopSchedule Error]', error);
        await m.reply(te(m.prefix, m.command, m.pushName));
    }
}

export { pluginConfig as config, handler }
