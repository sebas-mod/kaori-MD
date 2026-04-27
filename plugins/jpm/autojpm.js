import { getDatabase } from '../../src/lib/ourin-database.js'
import { getAutoJpmConfig, setAutoJpmConfig, startAutoJpmScheduler, stopAutoJpmScheduler, getAutoJpmStorageDir } from '../../src/lib/ourin-auto-jpm.js'
import { getMimeType, getExtension } from '../../src/lib/ourin-utils.js'
import * as timeHelper from '../../src/lib/ourin-time.js'
import config from '../../config.js'
import fs from 'fs'
import path from 'path'

const pluginConfig = {
  name: "autojpm",
  alias: ["autobroadcast", "autoanuncio", "jpm-auto"],
  category: "admin",
  description: "Programa anuncios automáticos (JPM) con intervalos y multimedia",
  usage: ".autojpm on <intervalo> <mensaje>",
  example: ".autojpm on 1h ¡Hola a todos!",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function parseInterval(raw) {
  if (!raw) return 0;
  const cleaned = raw.toLowerCase().replace(/\s+/g, "");
  const matches = [...cleaned.matchAll(/(\d+)([smhdw])/g)];
  if (!matches.length) return 0;
  const combined = matches.map((match) => match[0]).join("");
  if (combined !== cleaned) return 0;
  let total = 0;
  for (const match of matches) {
    const value = parseInt(match[1]);
    const unit = match[2];
    if (unit === "s") total += value * 1000;
    if (unit === "m") total += value * 60 * 1000;
    if (unit === "h") total += value * 60 * 60 * 1000;
    if (unit === "d") total += value * 24 * 60 * 60 * 1000;
    if (unit === "w") total += value * 7 * 24 * 60 * 60 * 1000;
  }
  return total;
}

function formatInterval(ms) {
  if (!ms || ms <= 0) return "0 segundos";
  const units = [
    { label: "días", value: 24 * 60 * 60 * 1000 },
    { label: "horas", value: 60 * 60 * 1000 },
    { label: "minutos", value: 60 * 1000 },
    { label: "segundos", value: 1000 },
  ];
  let remaining = ms;
  const parts = [];
  for (const unit of units) {
    const amount = Math.floor(remaining / unit.value);
    if (amount > 0) {
      parts.push(`${amount} ${unit.label}`);
      remaining -= amount * unit.value;
    }
  }
  return parts.length ? parts.join(" ") : "0 segundos";
}

function formatTimestamp(timestamp) {
  if (!timestamp) return "-";
  // Ajustado al formato local
  return `${timeHelper.fromTimestamp(timestamp)}`;
}

function previewText(text) {
  if (!text) return "-";
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 80) return cleaned;
  return `${cleaned.slice(0, 77)}...`;
}

function normalizeMessageText(text) {
  if (!text) return "";
  return text.replace(/\\n/g, "\n").trim();
}

function getMediaInfo(message) {
  if (!message) return null;
  if (message.isImage) return { type: "imagen", mimetype: message.mimetype };
  if (message.isVideo) return { type: "video", mimetype: message.mimetype };
  if (message.isAudio) return { type: "audio", mimetype: message.mimetype };
  if (message.isDocument)
    return {
      type: "documento",
      mimetype: message.mimetype,
      fileName: message.fileName || message.message?.documentMessage?.fileName,
    };
  return null;
}

function cleanupStoredMedia(mediaPath, currentPath) {
  if (!mediaPath || mediaPath === currentPath) return;
  try {
    const baseDir = getAutoJpmStorageDir();
    const resolvedBase = path.resolve(baseDir);
    const resolvedPath = path.resolve(mediaPath);
    if (resolvedPath.startsWith(resolvedBase) && fs.existsSync(resolvedPath)) {
      fs.unlinkSync(resolvedPath);
    }
  } catch (e) {}
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const prefix = m.prefix
  const input = (m.text || "").trim();

  if (!input) {
    const helpText =
      `📢 *AUTO JPM (ANUNCIO PROGRAMADO)*\n\n` +
      `Sistema automático para enviar anuncios a todos los grupos basándose en un intervalo.\n\n` +
      `*MODO DE USO:*\n` +
      `• *${prefix}autojpm on <intervalo> <mensaje>* — Activa el programa\n` +
      `• *${prefix}autojpm off* — Desactiva el anuncio automático\n` +
      `• *${prefix}autojpm status* — Ver configuración actual\n\n` +
      `*FORMATO DE INTERVALO:*\n` +
      `• \`10m\` (10 Minutos) | \`1h\` (1 Hora)\n` +
      `• \`2h30m\` (2 Horas 30 Minutos) | \`1d\` (1 Día)\n\n` +
      `*EJEMPLO:*\n` +
      `> \`${prefix}autojpm on 1h ¡Hola a todos, que tengan un gran día!\`\n\n` +
      `_(Puedes responder a una imagen/video para incluir multimedia en el anuncio)_`;
    return m.reply(helpText);
  }

  const match = input.match(/^(\S+)(?:\s+(\S+))?(?:\s+([\s\S]*))?$/);
  const action = match?.[1]?.toLowerCase() || "";
  const intervalRaw = match?.[2];
  const messageRaw = match?.[3];

  if (["off", "stop", "disable"].includes(action)) {
    const current = getAutoJpmConfig();
    if (!current.enabled) {
      return m.reply(`ℹ️ El AutoJPM ya se encuentra desactivado.`);
    }
    setAutoJpmConfig({ ...current, enabled: false });
    stopAutoJpmScheduler();
    return m.reply(`✅ AutoJPM desactivado correctamente.`);
  }

  if (["status", "info"].includes(action)) {
    const current = getAutoJpmConfig();
    if (!current?.message) {
      return m.reply(`ℹ️ AutoJPM aún no ha sido configurado.`);
    }
    const statusText =
      `📢 *CONFIGURACIÓN AUTO JPM*\n\n` +
      `Estado: *${current.enabled ? "✅ ACTIVO" : "❌ INACTIVO"}*\n` +
      `Intervalo: *${formatInterval(current.intervalMs || 0)}*\n\n` +
      `*CRONOGRAMA:* \n` +
      `• Último envío: ${formatTimestamp(current.lastRun)}\n` +
      `• Próximo envío: ${formatTimestamp(current.nextRun)}\n\n` +
      `*CONTENIDO:* \n` +
      `• Texto: \`${previewText(current.message?.text)}\`\n` +
      `• Multimedia: *${current.message?.media?.type ? current.message.media.type.toUpperCase() : "NINGUNO"}*`;
    return m.reply(statusText);
  }

  if (!["on", "start", "enable"].includes(action)) {
    return m.reply(`❌ Formato incorrecto. Usa ${prefix}autojpm on/off/status.`);
  }

  if (!intervalRaw) {
    return m.reply(`❌ Debes especificar un intervalo. Ejemplo: ${prefix}autojpm on 1h Mensaje.`);
  }

  const intervalMs = parseInterval(intervalRaw);
  if (!intervalMs) {
    return m.reply(`❌ Intervalo inválido. Usa formatos como: 10m, 1h, 2h30m, 1d.`);
  }

  if (intervalMs < 15 * 60 * 1000) {
    return m.reply(`❌ El intervalo mínimo es de 15 minutos para evitar ser detectado como spam.`);
  }

  const existing = getAutoJpmConfig();
  const quoted = m.quoted || m;
  const mediaInfo = getMediaInfo(quoted);
  let messageText = normalizeMessageText(messageRaw);

  if (!messageText && mediaInfo) {
    messageText = normalizeMessageText(quoted.body || "");
  }

  let mediaData = existing?.message?.media || null;
  if (mediaInfo) {
    const buffer = await quoted.download();
    if (!buffer) {
      return m.reply(`❌ Error al descargar el archivo multimedia.`);
    }
    const mimetype = mediaInfo.mimetype || getMimeType(buffer);
    const extension = getExtension(mimetype);
    const fileName = mediaInfo.fileName || `autojpm_${Date.now()}.${extension}`;
    const storageDir = getAutoJpmStorageDir();
    const filePath = path.join(storageDir, fileName);
    fs.writeFileSync(filePath, buffer);
    cleanupStoredMedia(existing?.message?.media?.path, filePath);
    mediaData = {
      type: mediaInfo.type,
      path: filePath,
      mimetype,
      fileName,
    };
  }

  if (!messageText && !mediaData && !existing?.message?.text && !existing?.message?.media) {
    return m.reply(`❌ Debes incluir un mensaje de texto o un archivo multimedia.`);
  }

  const updatedConfig = {
    enabled: true,
    intervalMs,
    message: {
      text: messageText || existing?.message?.text || "",
      media: mediaData,
    },
    lastRun: 0,
    nextRun: Date.now() + intervalMs,
  };

  setAutoJpmConfig(updatedConfig);
  startAutoJpmScheduler(sock);

  const detailText =
    `✅ *AUTO JPM ACTIVADO*\n\n` +
    `╭┈┈⬡「 📋 *DETALLES* 」\n` +
    `┃ ⏱️ Intervalo: ${formatInterval(intervalMs)}\n` +
    `┃ 🕒 Próximo envío: ${formatTimestamp(updatedConfig.nextRun)}\n` +
    `┃ 📷 Multimedia: ${updatedConfig.message.media?.type || "No"}\n` +
    `┃ 📝 Mensaje: ${previewText(updatedConfig.message.text)}\n` +
    `╰┈┈┈┈┈┈┈┈⬡`;

  return m.reply(detailText);
}

export { pluginConfig as config, handler }
