import { getDatabase } from "../../src/lib/ourin-database.js";
import ms from "ms";

const pluginConfig = {
  name: "acceso",
  alias: [
    "addacceso",
    "delacceso",
    "listacceso",
    "addaccess",
    "delaccess",
    "listaccess",
  ],
  category: "owner",
  description: "Otorga acceso temporal o permanente a comandos específicos para usuarios",
  usage: ".addacceso <cmd> <duración> <usuario>",
  example: ".addacceso addowner 30d @usuario",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, plugins }) {
  const db = getDatabase();
  const cmd = m.command.toLowerCase();
  const isAdd = ["addacceso", "addaccess"].includes(cmd);
  const isDel = ["delacceso", "delaccess"].includes(cmd);
  const isList = ["listacceso", "listaccess"].includes(cmd);

  let target = m.mentionedJid?.[0];
  if (!target && m.quoted) target = m.quoted.sender;
  if (!target && m.args.length > 0) {
    for (const arg of m.args) {
      if (/^\d{5,15}$/.test(arg)) {
        target = arg + "@s.whatsapp.net";
        break;
      } else if (/^@\d+/.test(arg)) {
        target = arg.replace("@", "") + "@s.whatsapp.net";
        break;
      }
    }
  }

  let commandTarget = null;
  let durationTarget = null;

  if (isAdd) {
    if (!target)
      return m.reply(
        `❌ *Objetivo Inválido*\n\nEtiqueta a un usuario / Responde a un mensaje / Escribe el número del objetivo`,
      );
    const cleanArgs = m.args.filter(
      (a) => !a.includes("@") && !/^\d{10,}$/.test(a),
    );
    if (cleanArgs.length < 2) {
      return m.reply(
        `⚠️ *Formato Incorrecto*\n\n` +
          `Formato: \`${m.prefix}addacceso <comando> <duración> <objetivo>\`\n\n` +
          `*Ejemplos:*\n` +
          `> \`${m.prefix}addacceso addowner 30d @usuario\` (30 Días)\n` +
          `> \`${m.prefix}addacceso unban permanent @usuario\` (Siempre)\n\n` +
          `*Duraciones soportadas:* 1h, 1d, 30d, 1y`,
      );
    }
    commandTarget = cleanArgs[0].toLowerCase();
    durationTarget = cleanArgs[1].toLowerCase();
  }

  const user = db.getUser(target) || {};
  if (!user.access) user.access = [];

  if (isList) {
    if (!target) target = m.sender;
    const targetData = db.getUser(target) || {};
    const accessList = targetData.access || [];
    const now = Date.now();
    const activeAccess = accessList.filter(
      (a) => a.expired === null || a.expired > now,
    );
    if (activeAccess.length !== accessList.length) {
      targetData.access = activeAccess;
      db.setUser(target, targetData);
    }

    if (activeAccess.length === 0) {
      return m.reply(
        `📊 *ACCESO DE USUARIO*\n\nObjetivo: @${target.split("@")[0]}\nStatus: *Sin accesos especiales*`,
        {
          mentions: [target],
        },
      );
    }

    let txt = `📊 *ACCESO DE USUARIO*\n\n`;
    txt += `Objetivo: @${target.split("@")[0]}\n`;
    txt += `Total: *${activeAccess.length}* comandos\n`;
    txt += `━━━━━━━━━━━━━━━\n\n`;

    activeAccess.forEach((acc, i) => {
      let expiredTxt = "♾️ Permanente";
      if (acc.expired) {
        const timeLeft = acc.expired - now;
        if (timeLeft > 0) {
          expiredTxt = "🕕 " + ms(timeLeft, { long: true });
        } else {
          expiredTxt = "🔴 Expirado";
        }
      }

      txt += `${i + 1}. *${acc.cmd}*\n`;
      txt += `    └ ${expiredTxt}\n`;
    });

    return m.reply(txt, { mentions: [target] });
  }

  if (isAdd) {
    let expiredTime = null;
    if (durationTarget !== "permanent" && durationTarget !== "perm" && durationTarget !== "permanente") {
      try {
        const durationMs = ms(durationTarget);
        if (!durationMs)
          return m.reply(`❌ ¡Formato de duración incorrecto! Usa: 1h, 1d, 30d`);
        expiredTime = Date.now() + durationMs;
      } catch {
        return m.reply(`❌ ¡Formato de duración no reconocido!`);
      }
    }

    const existingIdx = user.access.findIndex((a) => a.cmd === commandTarget);
    if (existingIdx !== -1) {
      user.access[existingIdx].expired = expiredTime;
      db.setUser(target, user);
      return m.reply(
        `✅ *ACCESO ACTUALIZADO*\n\n` +
          `Comando: \`${commandTarget}\`\n` +
          `Duración: *${durationTarget}*\n` +
          `Objetivo: @${target.split("@")[0]}`,
      );
    }
    user.access.push({
      cmd: commandTarget,
      expired: expiredTime,
    });

    db.setUser(target, user);

    await m.reply(
      `✅ *ACCESO OTORGADO*\n\n` +
        `┃ 🔑 ᴄᴍᴅ: \`${commandTarget}\`\n` +
        `┃ ⏱️ ᴅᴜʀᴀᴄɪóɴ: *${durationTarget}*\n` +
        `┃ 👤 ᴏʙᴊᴇᴛɪᴠᴏ: @${target.split("@")[0]}\n`,
      { mentions: [target] },
    );
  }

  if (isDel) {
    if (!target) return m.reply(`❌ ¡Etiqueta al usuario al que quieres quitarle el acceso!`);
    const now = Date.now();
    const activeAccess = user.access.filter(
      (a) => a.expired === null || a.expired > now,
    );
    let specificCmd = m.args.find((a) => !a.includes("@") && !/^\d+$/.test(a));
    
    if (specificCmd) {
      specificCmd = specificCmd.toLowerCase();
      const idx = user.access.findIndex((a) => a.cmd === specificCmd);
      if (idx === -1)
        return m.reply(`❌ El usuario no tiene acceso al comando \`${specificCmd}\``);

      user.access.splice(idx, 1);
      db.setUser(target, user);
      return m.reply(
        `✅ El acceso a \`${specificCmd}\` fue revocado de @${target.split("@")[0]}`,
      );
    }

    if (activeAccess.length === 0) {
      return m.reply(`⚠️ Este usuario no tiene acceso a ningún comando.`);
    }

    const rows = activeAccess.map((acc) => {
      const exp = acc.expired ? ms(acc.expired - now) : "Permanente";
      return {
        title: `Eliminar: ${acc.cmd}`,
        description: `Tiempo restante: ${exp}`,
        id: `${m.prefix}delacceso ${acc.cmd} ${target}`,
      };
    });

    const listMessage = {
      text: `🔓 *REVOCAR ACCESO*\n\nSelecciona el acceso que deseas eliminar de @${target.split("@")[0]}`,
      title: "Gestionar Acceso",
      buttonText: "VER COMANDOS",
      sections: [
        {
          title: "Lista de Accesos Activos",
          rows: rows,
        },
      ],
    };

    return sock.sendMessage(m.chat, listMessage, { quoted: m });
  }
}

export { pluginConfig as config, handler };
