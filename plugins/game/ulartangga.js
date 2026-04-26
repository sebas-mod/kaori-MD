import { getDatabase } from '../../src/lib/ourin-database.js'
/**
 * 🐍🎲 JUEGO SERPIENTES Y ESCALERAS
 * Juego clásico con tablero visual
 *
 * Basado en referencia: RTXZY-MD-pro/plugins/game-ulartangga.js
 * Adaptado para OurinAI con tablero visual y contextInfo completo
 */
import { drawBoard, getRandomMap, DICE_STICKERS } from '../../src/lib/ourin-game-ulartangga.js'
import config from '../../config.js'
import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
  name: "serpientesyescaleras",
  alias: ["se", "syv", "serpientes", "escaleras"],
  category: "game",
  description: "Jugá al serpientes y escaleras con otros usuarios (tablero visual)",
  usage: ".serpientes <create|join|start|info|exit|delete>",
  example: ".serpientes create",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

if (!global.ulartanggaGames) global.ulartanggaGames = {};

const PLAYER_COLORS = ["🔴", "🟡", "🟢", "🔵"];
const PLAYER_NAMES = ["Rojo", "Amarillo", "Verde", "Azul"];

const WIN_REWARD = { koin: 2000, exp: 1000, energi: 5 };

function uniqueMentions(mentions = []) {
  return [...new Set((mentions || []).filter(Boolean))];
}

let thumbUT = null;
try {
  const thumbPath = path.join(
    process.cwd(),
    "assets",
    "images",
    "ourin-games.jpg",
  );
  if (fs.existsSync(thumbPath)) {
    thumbUT = fs.readFileSync(thumbPath);
  }
} catch (e) {}

function getUTContextInfo(
  title = "🐍🎲 SERPIENTES Y ESCALERAS",
  body = "¡Un juego clásico!",
  mentions = [],
) {
  const saluranId = config.saluran?.id || "120363208449943317@newsletter";
  const saluranName = config.saluran?.name || config.bot?.name || "Ourin-AI";

  const contextInfo = {
    forwardingScore: 9999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: saluranId,
      newsletterName: saluranName,
      serverMessageId: 127,
    },
  };

  if (thumbUT) {
    contextInfo.externalAdReply = {
      title: title,
      body: body,
      thumbnail: thumbUT,
      mediaType: 1,
      renderLargerThumbnail: true,
      sourceUrl: config.saluran?.link || "",
    };
  }

  const normalizedMentions = uniqueMentions(mentions);
  if (normalizedMentions.length) {
    contextInfo.mentionedJid = normalizedMentions;
  }
  return contextInfo;
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.args || [];
  const action = args[0]?.toLowerCase();
  const ut = global.ulartanggaGames;
  const prefix = m.prefix || config.command?.prefix || ".";

  const commands = {
    create: async () => {
      if (ut[m.chat]) {
        return sock.sendMessage(
          m.chat,
          {
            text:
              `❌ *SALA YA EXISTENTE*\n\n` +
              `> ¡Ya hay una partida en este grupo!\n` +
              `> Host: @${ut[m.chat].host.split("@")[0]}\n` +
              `> Estado: ${ut[m.chat].status}`,
            contextInfo: getUTContextInfo(
              "🐍🎲 SERPIENTES Y ESCALERAS",
              "¡Juego clásico!",
              [ut[m.chat].host],
            ),
          },
          { quoted: m },
        );
      }

      const mapConfig = getRandomMap();

      ut[m.chat] = {
        date: Date.now(),
        status: "WAITING",
        host: m.sender,
        players: {},
        turn: 0,
        map: mapConfig.map,
        mapName: mapConfig.name,
        snakesLadders: mapConfig.snakesLadders,
        stabil_x: mapConfig.stabil_x,
        stabil_y: mapConfig.stabil_y,
      };
      ut[m.chat].players[m.sender] = { rank: "HOST", position: 1 };

      await m.react("🎲");
      await sock.sendMessage(
        m.chat,
        {
          text:
            `🐍🎲 *SERPIENTES Y ESCALERAS*\n\n` +
            `¡Sala creada con éxito!\n\n` +
            `╭┈┈⬡「 📋 *INFO SALA* 」\n` +
            `┃ 👑 Host: @${m.sender.split("@")[0]}\n` +
            `┃ 👥 Jugadores: 1/4\n` +
            `┃ 🗺️ Mapa: ${mapConfig.name}\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `╭┈┈⬡「 🎮 *COMANDOS* 」\n` +
            `┃ ➕ \`${prefix}se join\` - Unirse\n` +
            `┃ ▶️ \`${prefix}se start\` - Empezar\n` +
            `┃ ℹ️ \`${prefix}se info\` - Información\n` +
            `┃ 🚪 \`${prefix}se exit\` - Salir\n` +
            `╰┈┈┈┈┈┈┈┈⬡`,
          contextInfo: getUTContextInfo("🎲 SALA CREADA", "¡Sumate a la partida!", [
            m.sender,
          ]),
        },
        { quoted: m },
      );
    },

    join: async () => {
      if (!ut[m.chat]) {
        return m.reply(
          `❌ ¡No hay ninguna partida activa!\n> Escribí \`${prefix}se create\` para crear una sala.`,
        );
      }

      if (ut[m.chat].players[m.sender]) {
        return m.reply(`❌ ¡Ya estás en la sala!`);
      }

      const playerCount = Object.keys(ut[m.chat].players).length;
      if (playerCount >= 4) {
        return m.reply(`❌ ¡La sala está llena! (Máx. 4 jugadores)`);
      }

      if (ut[m.chat].status === "PLAYING") {
        return m.reply(`❌ La partida ya empezó, no podés unirte ahora.`);
      }

      ut[m.chat].players[m.sender] = { rank: "MEMBER", position: 1 };

      const players = Object.keys(ut[m.chat].players);
      const playerList = players
        .map(
          (p, i) =>
            `${PLAYER_COLORS[i]} ${PLAYER_NAMES[i]}: @${p.split("@")[0]}`,
        )
        .join("\n");

      await m.react("✅");
      await sock.sendMessage(
        m.chat,
        {
          text:
            `✅ *JUGADOR UNIDO*\n\n` +
            `@${m.sender.split("@")[0]} entró a la partida.\n\n` +
            `╭┈┈⬡「 👥 *JUGADORES* 」\n` +
            `${playerList
              .split("\n")
              .map((l) => `┃ ${l}`)
              .join("\n")}\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `> Total: ${players.length}/4\n` +
            `> ${players.length >= 2 ? `✅ ¡Ya pueden empezar! \`${prefix}se start\`` : "🕕 Falta al menos 1 jugador más"}`,
          contextInfo: getUTContextInfo(
            "👥 JUGADOR UNIDO",
            `${players.length}/4 jugadores`,
            players,
          ),
        },
        { quoted: m },
      );
    },

    start: async () => {
      if (!ut[m.chat]) {
        return m.reply(`❌ ¡No hay ninguna partida activa!`);
      }

      if (ut[m.chat].status === "PLAYING") {
        return m.reply(`❌ ¡La partida ya empezó!`);
      }

      if (ut[m.chat].host !== m.sender && !config.isOwner?.(m.sender)) {
        return m.reply(`❌ ¡Solo el creador de la sala puede empezar el juego!`);
      }

      const players = Object.keys(ut[m.chat].players);
      if (players.length < 2) {
        return m.reply(`❌ ¡Hacen falta al menos 2 jugadores para jugar!`);
      }

      ut[m.chat].status = "PLAYING";
      ut[m.chat].turn = 0;

      const playerList = players
        .map(
          (p, i) =>
            `${PLAYER_COLORS[i]} ${PLAYER_NAMES[i]}: @${p.split("@")[0]}`,
        )
        .join("\n");

      const positions = players.map((p) => ut[m.chat].players[p].position);
      const boardImage = await drawBoard(
        ut[m.chat].map,
        positions[0] || null,
        positions[1] || null,
        positions[2] || null,
        positions[3] || null,
        ut[m.chat].stabil_x,
        ut[m.chat].stabil_y,
      );

      await m.react("🎮");

      const caption = 
        `🐍🎲 *¡EMPEZÓ EL JUEGO!*\n\n` +
        `╭┈┈⬡「 👥 *JUGADORES* 」\n` +
        `${playerList
          .split("\n")
          .map((l) => `┃ ${l}`)
          .join("\n")}\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `> 🎯 Turno de: @${players[0].split("@")[0]}\n` +
        `> ¡Escribí *girar* para lanzar el dado!`;

      const msgOptions = boardImage ? { image: boardImage, caption } : { text: caption };
      
      await sock.sendMessage(
        m.chat,
        {
          ...msgOptions,
          contextInfo: getUTContextInfo(
            "🎮 PARTIDA INICIADA",
            "¡Tirá los dados!",
            players,
          ),
        },
        { quoted: m },
      );
    },

    info: async () => {
      if (!ut[m.chat]) {
        return m.reply(`❌ ¡No hay ninguna partida activa!`);
      }

      const players = Object.keys(ut[m.chat].players);
      const playerList = players
        .map((p, i) => {
          const pos = ut[m.chat].players[p].position;
          return `${PLAYER_COLORS[i]} ${PLAYER_NAMES[i]}: @${p.split("@")[0]} - Pos: ${pos}`;
        })
        .join("\n");

      const currentTurn =
        ut[m.chat].status === "PLAYING"
          ? players[ut[m.chat].turn % players.length]
          : null;

      await sock.sendMessage(
        m.chat,
        {
          text:
            `🐍🎲 *INFO DE LA SALA*\n\n` +
            `╭┈┈⬡「 📋 *SALA* 」\n` +
            `┃ 👑 Host: @${ut[m.chat].host.split("@")[0]}\n` +
            `┃ 📍 Estado: ${ut[m.chat].status}\n` +
            `┃ 🗺️ Mapa: ${ut[m.chat].mapName}\n` +
            `┃ 👥 Jugadores: ${players.length}/4\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `╭┈┈⬡「 👥 *JUGADORES* 」\n` +
            `${playerList
              .split("\n")
              .map((l) => `┃ ${l}`)
              .join("\n")}\n` +
            `╰┈┈┈┈┈┈┈┈⬡` +
            (currentTurn
              ? `\n\n> 🎯 Turno de: @${currentTurn.split("@")[0]}`
              : ""),
          contextInfo: getUTContextInfo(
            "📋 INFO SALA",
            `${players.length} jugadores`,
            players,
          ),
        },
        { quoted: m },
      );
    },

    exit: async () => {
      if (!ut[m.chat]) {
        return m.reply(`❌ ¡No hay ninguna partida activa!`);
      }

      if (!ut[m.chat].players[m.sender]) {
        return m.reply(`❌ ¡No estás en esta partida!`);
      }

      delete ut[m.chat].players[m.sender];
      await sock.sendMessage(
        m.chat,
        {
          text: `👋 @${m.sender.split("@")[0]} abandonó la partida.`,
          contextInfo: getUTContextInfo(
            "🐍🎲 SERPIENTES Y ESCALERAS",
            "¡Un juego clásico!",
            [m.sender],
          ),
        },
        { quoted: m },
      );

      if (Object.keys(ut[m.chat].players).length === 0) {
        delete ut[m.chat];
        return m.reply(`🗑️ Se eliminó la sala porque no quedaron jugadores.`);
      }

      if (!ut[m.chat].players[ut[m.chat].host]) {
        const newHost = Object.keys(ut[m.chat].players)[0];
        ut[m.chat].host = newHost;
        ut[m.chat].players[newHost].rank = "HOST";
        await sock.sendMessage(
          m.chat,
          {
            text: `👑 Ahora @${newHost.split("@")[0]} es el nuevo host.`,
            contextInfo: getUTContextInfo(
              "🐍🎲 SERPIENTES Y ESCALERAS",
              "¡Un juego clásico!",
              [newHost],
            ),
          },
          { quoted: m },
        );
      }

      if (ut[m.chat].status === "PLAYING") {
        const players = Object.keys(ut[m.chat].players);
        ut[m.chat].turn = ut[m.chat].turn % players.length;
        await sock.sendMessage(m.chat, {
          text: `> Turno de: @${players[ut[m.chat].turn].split("@")[0]}\n> ¡Escribí *girar*!`,
          contextInfo: getUTContextInfo(
            "🐍🎲 SERPIENTES Y ESCALERAS",
            "¡Un juego clásico!",
            [players[ut[m.chat].turn]],
          ),
        });
      }
    },

    delete: async () => {
      if (!ut[m.chat]) {
        return m.reply(`❌ ¡No hay ninguna partida activa!`);
      }

      if (ut[m.chat].host !== m.sender && !config.isOwner?.(m.sender)) {
        return m.reply(`❌ ¡Solo el host puede eliminar la sala!`);
      }

      delete ut[m.chat];
      await m.react("🗑️");
      await m.reply(`🗑️ ¡Sala eliminada con éxito!`);
    },
  };

  if (!action || !commands[action]) {
    return sock.sendMessage(
      m.chat,
      {
        text:
          `🐍🎲 *SERPIENTES Y ESCALERAS*\n\n` +
          `¡Un juego clásico lleno de aventuras!\n` +
          `¡Subí por las escaleras, esquivá las serpientes y llegá al 100!\n\n` +
          `╭┈┈⬡「 🎮 *COMANDOS* 」\n` +
          `┃ 🎲 \`${prefix}se create\` - Crear sala\n` +
          `┃ ➕ \`${prefix}se join\` - Unirse\n` +
          `┃ ▶️ \`${prefix}se start\` - Empezar\n` +
          `┃ ℹ️ \`${prefix}se info\` - Ver info\n` +
          `┃ 🚪 \`${prefix}se exit\` - Salir\n` +
          `┃ 🗑️ \`${prefix}se delete\` - Eliminar sala\n` +
          `╰┈┈┈┈┈┈┈┈⬡\n\n` +
          `╭┈┈⬡「 🏆 *PREMIOS* 」\n` +
          `┃ 💰 +${WIN_REWARD.koin.toLocaleString()} Koin\n` +
          `┃ ⭐ +${WIN_REWARD.exp.toLocaleString()} EXP\n` +
          `┃ ⚡ +${WIN_REWARD.energi} Energía\n` +
          `╰┈┈┈┈┈┈┈┈⬡\n\n` +
          `> Mín. 2 jugadores, Máx. 4.`,
        contextInfo: getUTContextInfo("🐍🎲 SERPIENTES Y ESCALERAS", "¡Vamos a jugar!"),
      },
      { quoted: m },
    );
  }

  try {
    await commands[action]();
  } catch (error) {
    console.error("[ULARTANGGA ERROR]", error);
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

// ==================== Answer Handler (para "girar") ====================
async function answerHandler(m, sock) {
  if (!m.body) return false;

  const text = m.body.trim().toLowerCase();
  if (text !== "girar" && text !== "tira" && text !== "kocok") return false;

  const ut = global.ulartanggaGames;
  if (!ut[m.chat]) return false;
  if (ut[m.chat].status !== "PLAYING") return false;

  const players = Object.keys(ut[m.chat].players);
  if (!players.includes(m.sender)) return false;

  const currentTurn = ut[m.chat].turn % players.length;
  if (players.indexOf(m.sender) !== currentTurn) {
    await m.reply(
      `❌ ¡Todavía no es tu turno!\n> Turno de: @${players[currentTurn].split("@")[0]}`,
      {
        mentions: [players[currentTurn]],
      },
    );
    return true;
  }

  const db = getDatabase();

  const dadu = Math.floor(Math.random() * 6) + 1;
  const DICE_EMOJI = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

  try {
    const diceUrl = DICE_STICKERS[dadu - 1];
    await sock.sendMessage(
      m.chat,
      {
        sticker: { url: diceUrl },
        contextInfo: getUTContextInfo(
          `🎲 DADO: ${dadu}`,
          PLAYER_NAMES[players.indexOf(m.sender)],
        ),
      },
      { quoted: m },
    );
  } catch (e) {
    await m.react(DICE_EMOJI[dadu - 1]);
  }

  const oldPos = ut[m.chat].players[m.sender].position;
  let newPos = oldPos + dadu;

  if (newPos > 100) {
    newPos = 100 - (newPos - 100);
  }

  let event = "";
  const snakesLadders = ut[m.chat].snakesLadders;
  if (snakesLadders[newPos]) {
    const destination = snakesLadders[newPos];
    if (destination > newPos) {
      event = `\n🪜 *¡Subiste por una escalera!*`;
    } else {
      event = `\n🐍 *¡Te tragó una serpiente!*`;
    }
    newPos = destination;
  }

  ut[m.chat].players[m.sender].position = newPos;

  const playerIdx = players.indexOf(m.sender);
  const color = PLAYER_COLORS[playerIdx];
  const name = PLAYER_NAMES[playerIdx];

  if (newPos === 100) {
    try {
      db.updateKoin(m.sender, WIN_REWARD.koin);
      db.updateEnergi(m.sender, WIN_REWARD.energi);
      const userData = db.getUser(m.sender) || {};
      userData.exp = (userData.exp || 0) + WIN_REWARD.exp;
      db.setUser(m.sender, userData);
    } catch (e) {
      console.log("[UT] Reward failed:", e.message);
    }

    const positions = players.map(
      (p) => ut[m.chat].players[p]?.position || null,
    );
    const boardImage = await drawBoard(
      ut[m.chat].map,
      positions[0] || null,
      positions[1] || null,
      positions[2] || null,
      positions[3] || null,
      ut[m.chat].stabil_x,
      ut[m.chat].stabil_y,
    );

    await m.react("🎉");

    const winCaption = 
      `🎉 *¡TENEMOS UN GANADOR!*\n\n` +
      `${color} @${m.sender.split("@")[0]} llegó al 100!\n\n` +
      `╭┈┈⬡「 🎁 *PREMIOS* 」\n` +
      `┃ 💰 +${WIN_REWARD.koin.toLocaleString()} Koin\n` +
      `┃ ⭐ +${WIN_REWARD.exp.toLocaleString()} EXP\n` +
      `┃ ⚡ +${WIN_REWARD.energi} Energía\n` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `> ¡GG! ¿Otra partida? \`.se create\``;

    const winOptions = boardImage ? { image: boardImage, caption: winCaption } : { text: winCaption };

    await sock.sendMessage(m.chat, {
      ...winOptions,
      contextInfo: getUTContextInfo("🏆 ¡GANADOR!", `¡${name} ganó la partida!`, [
        m.sender,
      ]),
    });

    delete ut[m.chat];
    return true;
  }

  ut[m.chat].turn++;
  const nextTurn = ut[m.chat].turn % players.length;
  const nextPlayer = players[nextTurn];

  const positions = players.map((p) => ut[m.chat].players[p]?.position || null);
  const boardImage = await drawBoard(
    ut[m.chat].map,
    positions[0] || null,
    positions[1] || null,
    positions[2] || null,
    positions[3] || null,
    ut[m.chat].stabil_x,
    ut[m.chat].stabil_y,
  );

  const turnCaption = 
    `🎲 *DADO: ${dadu}* ${DICE_EMOJI[dadu - 1]}\n\n` +
    `${color} ${name}: *${oldPos}* → *${newPos}*${event}\n\n` +
    `> 🎯 Turno de: @${nextPlayer.split("@")[0]}\n` +
    `> ¡Escribí *girar*!`;

  const turnOptions = boardImage ? { image: boardImage, caption: turnCaption } : { text: turnCaption };

  await sock.sendMessage(m.chat, {
    ...turnOptions,
    contextInfo: getUTContextInfo("🎲 TURNO", PLAYER_NAMES[nextTurn], [
      nextPlayer,
    ]),
  });

  return true;
}

export { pluginConfig as config, handler, answerHandler }
