import { getFullSchedulerStatus, formatTimeRemaining, getMsUntilTime } from '../../src/lib/ourin-scheduler.js'
import { initSholatScheduler, stopSholatScheduler } from '../../src/lib/ourin-sholat-scheduler.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
import { getTodaySchedule, extractPrayerTimes } from '../../src/lib/ourin-sholat-api.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'cekschedule',
    alias: ['cekscheduler', 'estadoprogramador', 'schedstatus'],
    category: 'owner',
    description: 'Muestra el estado de todos los programadores (schedulers) del bot',
    usage: '.cekschedule',
    example: '.cekschedule',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

async function handler(m, { sock }) {
    try {
        const status = getFullSchedulerStatus();
        const db = getDatabase();
        const sholatEnabled = db.setting('autoSholat') || false;

        let text = `📊 *ESTADO DE PROGRAMADORES*\n\n`;

        for (const sched of status.schedulers) {
            const statusIcon = sched.running ? '✅' : '❌';
            text += `${statusIcon} *${sched.name}*\n`;
            text += `   └ Clave: \`${sched.key}\`\n`;
            text += `   └ ${sched.description}\n`;

            if (sched.lastRun && sched.lastRun !== '-' && sched.lastRun !== 'Never') {
                text += `   └ Último: ${sched.lastRun}\n`;
            }

            if (sched.stats) {
                if (sched.stats.totalResets) {
                    text += `   └ Reinicios Totales: ${sched.stats.totalResets}\n`;
                }
                if (sched.stats.activeMessages !== undefined) {
                    text += `   └ Activos: ${sched.stats.activeMessages} | Enviados: ${sched.stats.totalSent}\n`;
                }
            }
            text += `\n`;
        }

        const sholatIcon = sholatEnabled ? '✅' : '❌';
        text += `${sholatIcon} *Programador de Oraciones*\n`;
        text += `   └ Clave: \`sholat\`\n`;
        text += `   └ Notificación de tiempo de oración (tiempo real)\n`;

        if (sholatEnabled) {
            const kotaSetting = db.setting('autoSholatKota') || { id: '1301', nama: 'CIUDAD DE YAKARTA' };
            text += `   └ Ubicación: ${kotaSetting.nama}\n`;

            try {
                const { schedule } = await getTodaySchedule(kotaSetting.id);
                const times = extractPrayerTimes(schedule);
                
                // Ajustar a la zona horaria del bot o servidor
                const now = new Date();
                const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

                let nextSholat = null;
                let nextTime = null;

                const nombresEsp = {
                    subuh: 'Alba (Subuh)',
                    dzuhur: 'Mediodía (Dzuhur)',
                    ashar: 'Tarde (Ashar)',
                    maghrib: 'Ocaso (Maghrib)',
                    isya: 'Noche (Isya)',
                    imsak: 'Imsak'
                };

                for (const [name, time] of Object.entries(times)) {
                    if (time > currentTime && time !== '-') {
                        nextSholat = nombresEsp[name.toLowerCase()] || (name.charAt(0).toUpperCase() + name.slice(1));
                        nextTime = time;
                        break;
                    }
                }

                if (!nextSholat) {
                    nextSholat = 'Imsak (Mañana)';
                    nextTime = times.imsak;
                }

                text += `   └ Próximo: ${nextSholat} (${nextTime})\n`;
            } catch {
                text += `   └ _Error al cargar horario_\n`;
            }
        }

        text += `\n`;
        text += `━━━━━━━━━━━━━━━━━━━\n`;
        text += `✅ Activos: ${status.summary.totalActive + (sholatEnabled ? 1 : 0)}\n`;
        text += `❌ Inactivos: ${status.summary.totalInactive + (!sholatEnabled ? 1 : 0)}\n\n`;

        text += `> Usa \`.stopschedule <clave>\` para detener\n`;
        text += `> Usa \`.startschedule <clave>\` para iniciar`;

        await m.reply(text);
    } catch (error) {
        console.error('[CekSchedule Error]', error);
        await m.reply(te(m.prefix, m.command, m.pushName));
    }
}

export { pluginConfig as config, handler }
