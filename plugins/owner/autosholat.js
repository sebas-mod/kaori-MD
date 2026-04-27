import * as timeHelper from '../../src/lib/ourin-time.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'
import { getTodaySchedule, extractPrayerTimes, searchKota } from '../../src/lib/ourin-sholat-api.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'autoshola',
    alias: ['sholat', 'autoadzan', 'autooracion'],
    category: 'owner',
    description: 'Activa el recordatorio automático de oraciones con audio de Adzan y cierre de grupos',
    usage: '.autoshola on/off/status/ciudad <nombre>',
    example: '.autoshola on',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
};

const AUDIO_ADZAN = 'https://media.vocaroo.com/mp3/1ofLT2YUJAjQ';

async function handler(m, { sock, db }) {
    const args = m.args[0]?.toLowerCase();
    const database = getDatabase();

    if (!args || args === 'status') {
        const status = database.setting('autoSholat') ? '✅ Activo' : '❌ Desactivado';
        const closeGroup = database.setting('autoSholatCloseGroup') ? '✅ Sí' : '❌ No';
        const duration = database.setting('autoSholatDuration') || 5;
        const kotaSetting = database.setting('autoSholatKota') || { id: '1301', nama: 'CIUDAD DE YAKARTA' };
        
        let jadwalText = '';
        try {
            const jadwalData = await getTodaySchedule(kotaSetting.id);
            const times = extractPrayerTimes(jadwalData);
            // Mapeo de nombres de oraciones al español
            const nombresEsp = {
                subuh: 'Alba (Subuh)',
                dzuhur: 'Mediodía (Dzuhur)',
                ashar: 'Tarde (Ashar)',
                maghrib: 'Ocaso (Maghrib)',
                isya: 'Noche (Isya)'
            };

            for (const [nama, waktu] of Object.entries(times)) {
                const nombreMostrar = nombresEsp[nama.toLowerCase()] || nama;
                jadwalText += `┃ ${nombreMostrar}: \`${waktu}\`\n`;
            }
        } catch {
            jadwalText = '┃ _Error al cargar el horario_\n';
        }

        return m.reply(
            `🕌 *AUTO ORACIÓN (SHOLAT)*\n\n` +
            `╭┈┈⬡「 📋 *ESTADO* 」\n` +
            `┃ 🔔 Auto Oración: ${status}\n` +
            `┃ 🔒 Cerrar Grupos: ${closeGroup}\n` +
            `┃ ⏱️ Duración: \`${duration}\` minutos\n` +
            `┃ 📍 Ciudad: \`${kotaSetting.nama}\`\n` +
            `╰┈┈⬡\n\n` +
            `╭┈┈⬡「 🕐 *HORARIO DE HOY* 」\n` +
            jadwalText +
            `╰┈┈⬡\n\n` +
            `> *Uso:*\n` +
            `> \`${m.prefix}autoshola on\` - Activar\n` +
            `> \`${m.prefix}autoshola off\` - Desactivar\n` +
            `> \`${m.prefix}autoshola close on/off\` - Alternar cierre de grupos\n` +
            `> \`${m.prefix}autoshola duration <minutos>\` - Tiempo de cierre\n` +
            `> \`${m.prefix}autoshola ciudad <nombre>\` - Cambiar ubicación\n\n` +
            `> _Fuente: myquran.com (tiempo real)_`
        );
    }

    if (args === 'on') {
        database.setting('autoSholat', true);
        await m.react('✅');
        const ciudad = database.setting('autoSholatKota') || { nama: 'CIUDAD DE YAKARTA' };
        return m.reply(
            `✅ *AUTO ORACIÓN ACTIVADO*\n\n` +
            `> Recordatorio de oración activo\n` +
            `> Se enviará el audio de Adzan a todos los grupos\n` +
            `> Ubicación: ${ciudad.nama}`
        );
    }

    if (args === 'off') {
        database.setting('autoSholat', false);
        await m.react('❌');
        return m.reply(`❌ *AUTO ORACIÓN DESACTIVADO*`);
    }

    if (args === 'close') {
        const subArg = m.args[1]?.toLowerCase();
        if (subArg === 'on') {
            database.setting('autoSholatCloseGroup', true);
            await m.react('🔒');
            return m.reply(`🔒 *CIERRE DE GRUPOS ACTIVADO*\n\n> Los grupos se cerrarán durante el tiempo de oración.`);
        }
        if (subArg === 'off') {
            database.setting('autoSholatCloseGroup', false);
            await m.react('🔓');
            return m.reply(`🔓 *CIERRE DE GRUPOS DESACTIVADO*\n\n> Los grupos permanecerán abiertos durante la oración.`);
        }
        return m.reply(`❌ *ERROR*\n\n> Usa: \`${m.prefix}autoshola close on/off\``);
    }

    if (args === 'duration') {
        const duration = parseInt(m.args[1]);
        if (isNaN(duration) || duration < 1 || duration > 60) {
            return m.reply(`❌ *ERROR*\n\n> La duración debe ser entre 1 y 60 minutos`);
        }
        database.setting('autoSholatDuration', duration);
        await m.react('⏱️');
        return m.reply(`⏱️ *DURACIÓN CONFIGURADA*\n\n> Los grupos se cerrarán por \`${duration}\` minutos durante la oración.`);
    }

    if (args === 'ciudad' || args === 'kota') {
        const ciudadNombre = m.args.slice(1).join(' ').trim();
        if (!ciudadNombre) {
            return m.reply(`❌ *ERROR*\n\n> Usa: \`${m.prefix}autoshola ciudad Madrid\``);
        }
        await m.react('🔍');
        try {
            const result = await searchKota(ciudadNombre);
            if (!result) {
                return m.reply(`❌ La ciudad "${ciudadNombre}" no fue encontrada.`);
            }
            database.setting('autoSholatKota', {
                id: result.id,
                nama: result.lokasi
            });
            await m.react('📍');
            return m.reply(
                `📍 *UBICACIÓN CONFIGURADA*\n\n` +
                `> Ciudad: *${result.lokasi}*\n\n` +
                `> Los horarios de oración seguirán esta ubicación.`
            );
        } catch (e) {
            await m.reply(te(m.prefix, m.command, m.pushName));
        }
    }

    return m.reply(`❌ *ACCIÓN NO VÁLIDA*\n\n> Usa: \`on\`, \`off\`, \`close on/off\`, \`duration <minutos>\`, \`ciudad <nombre>\``);
}

async function runAutoSholat(sock) {
    const db = getDatabase();
    if (!db.setting('autoSholat')) return;

    const ciudadSetting = db.setting('autoSholatKota') || { id: '1301', nama: 'CIUDAD DE YAKARTA' };
    let times;
    try {
        const jadwalData = await getTodaySchedule(ciudadSetting.id);
        times = extractPrayerTimes(jadwalData);
    } catch {
        return;
    }

    const JADWAL = {
        subuh: times.subuh,
        dzuhur: times.dzuhur,
        ashar: times.ashar,
        maghrib: times.maghrib,
        isya: times.isya
    };

    const timeNow = timeHelper.getCurrentTimeString();
    if (!global.autoSholatLock) global.autoSholatLock = {};

    for (const [sholat, waktu] of Object.entries(JADWAL)) {
        if (waktu === '-') continue;
        if (timeNow === waktu && !global.autoSholatLock[sholat]) {
            global.autoSholatLock[sholat] = true;
            try {
                global.isFetchingGroups = true;
                const groupsObj = await sock.groupFetchAllParticipating();
                global.isFetchingGroups = false;
                const groupList = Object.keys(groupsObj);

                const closeGroup = db.setting('autoSholatCloseGroup') || false;
                const duration = db.setting('autoSholatDuration') || 5;

                const Imagenes = {
                    subuh: '
