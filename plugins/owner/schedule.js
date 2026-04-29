import te from '../../src/lib/ourin-error.js'
/**
 * @file plugins/owner/schedule.js
 * @description Comando para gestionar mensajes programados
 * @author Lucky Archz, Keisya, hyuuSATAN
 * @version 1.1.0
 */

import { scheduleMessage, cancelScheduledMessage, getScheduledMessages, getSchedulerStatus, formatTimeRemaining, getMsUntilTime } from '../../src/lib/ourin-scheduler.js'

/**
 * Configuración del plugin
 */
const pluginConfig = {
    name: 'schedule',
    alias: ['programar', 'horario', 'timer', 'sched'],
    category: 'owner',
    description: 'Gestionar mensajes programados',
    usage: '.schedule <add/list/del/status> [opciones]',
    example: '.schedule add 08:00 346xxx ¡Hola!',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

/**
 * Handler para el comando schedule
 */
async function handler(m, { sock, args }) {
    const subCommand = args[0]?.toLowerCase();
    
    if (!subCommand) {
        const helpText = `📅 *Gestor de Horarios*

*Uso:*
• \`.schedule add <HH:MM> <jid> <mensaje>\`
  Añadir un mensaje programado
  
• \`.schedule list\`
  Ver todos los horarios programados
  
• \`.schedule del <id>\`
  Eliminar un horario
  
• \`.schedule status\`
  Ver el estado del programador

*Ejemplo:*
\`.schedule add 08:00 34612345678@s.whatsapp.net ¡Buenos días!\`
\`.schedule add 12:00 ${m.chat} repeat ¡Ya es mediodía!\``;
        
        await m.reply(helpText);
        return;
    }
    
    switch (subCommand) {
        case 'add':
        case 'añadir': {
            // Formato: .schedule add HH:MM jid mensaje
            // o: .schedule add HH:MM jid repeat mensaje
            const timeStr = args[1];
            let jid = args[2];
            let repeat = false;
            let messageText;
            
            if (!timeStr || !jid) {
                await m.reply('❌ Formato: `.schedule add <HH:MM> <jid> [repeat] <mensaje>`');
                return;
            }
            
            // Parsear tiempo
            const timeParts = timeStr.split(':');
            if (timeParts.length !== 2) {
                await m.reply('❌ Formato de hora incorrecto. Usa HH:MM (ejemplo: 08:00)');
                return;
            }
            
            const hour = parseInt(timeParts[0]);
            const minute = parseInt(timeParts[1]);
            
            if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
                await m.reply('❌ Hora no válida. Hora: 0-23, Minuto: 0-59');
                return;
            }
            
            // Comprobar si es repetitivo
            if (args[3]?.toLowerCase() === 'repeat' || args[3]?.toLowerCase() === 'repetir') {
                repeat = true;
                messageText = args.slice(4).join(' ');
            } else {
                messageText = args.slice(3).join(' ');
            }
            
            // Manejar valores especiales de JID
            if (jid === 'me' || jid === 'yo' || jid === 'self') {
                jid = m.sender;
            } else if (jid === 'here' || jid === 'aquí' || jid === 'this') {
                jid = m.chat;
            } else if (!jid.includes('@')) {
                jid = jid.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            }
            
            if (!messageText) {
                await m.reply('❌ El mensaje no puede estar vacío');
                return;
            }
            
            // Generar ID único
            const id = `sched_${Date.now()}`;
            
            try {
                const task = scheduleMessage({
                    id,
                    jid,
                    message: { text: messageText },
                    hour,
                    minute,
                    repeat
                }, sock);
                
                const msUntil = getMsUntilTime(hour, minute);
                
                await m.reply(`✅ *Mensaje Programado Añadido*

📝 ID: \`${id}\`
⏰ Hora: ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}
📍 Destino: ${jid}
🔄 Repetir: ${repeat ? 'Sí (diario)' : 'No (una vez)'}
🕕 Próxima ejecución en: ${formatTimeRemaining(msUntil)}

Mensaje: ${messageText.substring(0, 100)}${messageText.length > 100 ? '...' : ''}`);
            } catch (error) {
                await m.reply(te(m.prefix, m.command, m.pushName));
            }
            break;
        }
        
        case 'list':
        case 'lista': {
            const tasks = getScheduledMessages();
            
            if (tasks.length === 0) {
                await m.reply('📅 No hay mensajes programados');
                return;
            }
            
            let text = `📅 *Mensajes Programados (${tasks.length})*\n\n`;
            
            for (const task of tasks) {
                const msUntil = getMsUntilTime(task.hour, task.minute);
                text += `• *${task.id}*\n`;
                text += `  ⏰ ${String(task.hour).padStart(2, '0')}:${String(task.minute).padStart(2, '0')}\n`;
                text += `  📍 ${task.jid.split('@')[0]}\n`;
                text += `  🔄 ${task.repeat ? 'Diario' : 'Una vez'}\n`;
                text += `  🕕 En ${formatTimeRemaining(msUntil)}\n\n`;
            }
            
            await m.reply(text.trim());
            break;
        }
        
        case 'del':
        case 'delete':
        case 'borrar':
        case 'eliminar':
        case 'remove': {
            const taskId = args[1];
            
            if (!taskId) {
                await m.reply('❌ Formato: `.schedule del <id>`');
                return;
            }
            
            const cancelled = cancelScheduledMessage(taskId);
            
            if (cancelled) {
                await m.reply(`✅ Mensaje programado \`${taskId}\` eliminado`);
            } else {
                await m.reply(`❌ Tarea \`${taskId}\` no encontrada`);
            }
            break;
        }
        
        case 'status':
        case 'estado': {
            const status = getSchedulerStatus();
            
            const text = `📊 *Estado del Programador*

🔄 Reinicio de límite diario: ${status.dailyResetEnabled ? '✅ Activo' : '❌ Inactivo'}
📅 Último reinicio: ${status.lastLimitReset}
📝 Mensajes programados: ${status.scheduledMessagesCount}

📈 *Estadísticas*
• Total de reinicios: ${status.totalResets}
• Mensajes enviados: ${status.totalMessagesSent}`;
            
            await m.reply(text);
            break;
        }
        
        default:
            await m.reply('❌ Subcomando no reconocido. Usa: add, list, del, status');
    }
}

export { pluginConfig as config, handler }
