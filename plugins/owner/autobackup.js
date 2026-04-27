import { enableAutoBackup, disableAutoBackup, getBackupStatus, triggerManualBackup, formatInterval } from '../../src/lib/ourin-auto-backup.js'
import * as timeHelper from '../../src/lib/ourin-time.js'
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
  name: "autobackup",
  alias: ["backup", "ab"],
  category: "owner",
  description: "Gestionar el sistema de auto backup",
  usage: ".autobackup <on/off/status/now> [intervalo]",
  example: ".autobackup on 5h",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const args = m.text?.trim().split(/\s+/) || [];
  const action = args[0]?.toLowerCase();

  if (!action) {
    const status = getBackupStatus();
    const ownerNum = config.owner?.number?.[0] || "No configurado";

    let txt = `🗂️ *SISTEMA DE AUTO BACKUP*\n\n`;
    txt += `╭┈┈⬡「 📊 *ESTADO* 」\n`;
    txt += `┃ 🔘 Estado: ${status.enabled ? "✅ *ON*" : "❌ *OFF*"}\n`;
    txt += `┃ ⏱️ Intervalo: ${status.interval}\n`;
    txt += `┃ 📅 Último Backup: ${status.lastBackup ? timeHelper.fromTimestamp(status.lastBackup, "DD [de] MMMM [de] YYYY HH:mm:ss") : "-"}\n`;
    txt += `┃ #️⃣ Total: ${status.backupCount} backups\n`;
    txt += `┃ 📤 Enviado a: ${ownerNum}\n`;
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;

    txt += `*MODO DE USO:*\n`;
    txt += `> \`${m.prefix}autobackup on <intervalo>\`\n`;
    txt += `> \`${m.prefix}autobackup off\`\n`;
    txt += `> \`${m.prefix}autobackup status\`\n`;
    txt += `> \`${m.prefix}autobackup now\`\n\n`;

    txt += `*FORMATO DE INTERVALO:*\n`;
    txt += `> • \`5m\` = 5 minutos\n`;
    txt += `> • \`1h\` = 1 hora\n`;
    txt += `> • \`6h\` = 6 horas\n`;
    txt += `> • \`1d\` = 1 día\n\n`;

    txt += `*EJEMPLO:*\n`;
    txt += `> \`${m.prefix}autobackup on 6h\` - backup cada 6 horas`;

    return m.reply(txt);
  }

  switch (action) {
    case "on":
    case "enable":
    case "start": {
      const interval = args[1];

      if (!interval) {
        return m.reply(
          `⚠️ *INTERVALO REQUERIDO*\n\n` +
            `> \`${m.prefix}autobackup on <intervalo>\`\n\n` +
            `*EJEMPLOS:*\n` +
            `> \`${m.prefix}autobackup on 30m\` - cada 30 min\n` +
            `> \`${m.prefix}autobackup on 6h\` - cada 6 horas\n` +
            `> \`${m.prefix}autobackup on 1d\` - cada 1 día`,
        );
      }

      const result = enableAutoBackup(interval, sock);

      if (!result.success) {
        return m.reply(`❌ *ERROR*\n\n> ${result.error}`);
      }

      const ownerNum = config.owner?.number?.[0] || "Owner #1";

      await m.react("✅");
      return m.reply(
        `✅ *AUTO BACKUP ACTIVADO*\n\n` +
          `╭┈┈⬡「 ⚙️ *AJUSTES* 」\n` +
          `┃ ⏱️ Intervalo: ${result.interval}\n` +
          `┃ 📤 Enviado a: ${ownerNum}\n` +
          `┃ 📦 Excluidos: node_modules, .git, storages, etc\n` +
          `╰┈┈┈┈┈┈┈┈⬡\n\n` +
          `> El primer backup se enviará en ${result.interval}`,
      );
    }

    case "off":
    case "disable":
    case "stop": {
      disableAutoBackup();

      await m.react("✅");
      return m.reply(
        `❌ *AUTO BACKUP DESACTIVADO*\n\n` +
          `> El respaldo automático se ha detenido.\n` +
          `> Usa \`${m.prefix}autobackup on <intervalo>\` para reactivarlo.`,
      );
    }

    case "status":
    case "info": {
      const status = getBackupStatus();
      const ownerNum = config.owner?.number?.[0] || "No configurado";

      let txt = `🗂️ *ESTADO DE AUTO BACKUP*\n\n`;
      txt += `╭┈┈⬡「 📊 *INFO* 」\n`;
      txt += `┃ 🔘 Activado: ${status.enabled ? "✅ Sí" : "❌ No"}\n`;
      txt += `┃ ⏱️ Intervalo: ${status.interval}\n`;
      txt += `┃ 🔄 Ejecutándose: ${status.isRunning ? "✅ Sí" : "❌ No"}\n`;
      txt += `┃ 📅 Último: ${status.lastBackup ? timeHelper.fromTimestamp(status.lastBackup, "DD [de] MMMM [de] YYYY HH:mm:ss") : "-"}\n`;
      txt += `┃ #️⃣ Total: ${status.backupCount} backups\n`;
      txt += `┃ 📤 Objetivo: ${ownerNum}\n`;
      txt += `╰┈┈┈┈┈┈┈┈⬡`;

      return m.reply(txt);
    }

    case "now":
    case "manual":
    case "trigger": {
      await m.react("🕕");
      await m.reply(
        `🕕 *CREANDO BACKUP...*\n\n> Por favor espera, generando archivo de respaldo...`,
      );

      try {
        await triggerManualBackup(sock);
        await m.react("✅");
        return m.reply(
          `✅ *BACKUP COMPLETADO*\n\n> ¡El respaldo ha sido enviado al owner!`,
        );
      } catch (error) {
        await m.react('☢');
        await m.reply(te(m.prefix, m.command, m.pushName));
      }
    }

    default:
      return m.reply(
        `⚠️ *ACCIÓN NO VÁLIDA*\n\n` +
          `> Elige: \`on\`, \`off\`, \`status\`, o \`now\`\n` +
          `> Ejemplo: \`${m.prefix}autobackup on 6h\``,
      );
  }
}

export { pluginConfig as config, handler }
