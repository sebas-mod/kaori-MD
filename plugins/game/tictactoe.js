import { getDatabase } from '../../src/lib/ourin-database.js'
import { parseMention, delay } from '../../src/lib/ourin-utils.js'

const pluginConfig = {
  name: "ta-te-ti",
  alias: ["ttt", "tateti", "xo"],
  category: "game",
  description: "Jugá al Ta-Te-Ti con otro usuario",
  usage: ".tateti [nombre de sala] o .ttt",
  example: ".tateti",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const boardSymbols = {
  X: "❌",
  O: "⭕",
  1: "1️⃣",
  2: "2️⃣",
  3: "3️⃣",
  4: "4️⃣",
  5: "5️⃣",
  6: "6️⃣",
  7: "7️⃣",
  8: "8️⃣",
  9: "9️⃣",
};

class TicTacToe {
  constructor(playerX = "x", playerO = "o") {
    this.playerX = playerX;
    this.playerO = playerO;
    this._currentTurn = false;
    this._x = 0;
    this._o = 0;
    this.turns = 0;
  }

  get board() {
    return this._x | this._o;
  }

  get currentTurn() {
    return this._currentTurn ? this.playerO : this.playerX;
  }

  get enemyTurn() {
    return this._currentTurn ? this.playerX : this.playerO;
  }

  static check(state) {
    for (let combo of [7, 56, 73, 84, 146, 273, 292, 448])
      if ((state & combo) === combo) return true;
    return false;
  }

  static toBinary(x = 0, y = 0) {
    if (x < 0 || x > 2 || y < 0 || y > 2) throw new Error("invalid position");
    return 1 << (x + 3 * y);
  }

  turn(player = 0, x = 0, y) {
    if (this.board === 511) return -3;
    let pos = 0;
    if (y == null) {
      if (x < 0 || x > 8) return -1;
      pos = 1 << x;
    } else {
      if (x < 0 || x > 2 || y < 0 || y > 2) return -1;
      pos = TicTacToe.toBinary(x, y);
    }
    if (this._currentTurn ^ player) return -2;
    if (this.board & pos) return 0;
    this[this._currentTurn ? "_o" : "_x"] |= pos;
    this._currentTurn = !this._currentTurn;
    this.turns++;
    return 1;
  }

  static render(boardX = 0, boardO = 0) {
    let x = parseInt(boardX.toString(2), 4);
    let y = parseInt(boardO.toString(2), 4) * 2;
    return [...(x + y).toString(4).padStart(9, "0")]
      .reverse()
      .map((value, index) => (value == 1 ? "X" : value == 2 ? "O" : ++index));
  }

  render() {
    return TicTacToe.render(this._x, this._o);
  }

  get winner() {
    let x = TicTacToe.check(this._x);
    let o = TicTacToe.check(this._o);
    return x ? this.playerX : o ? this.playerO : false;
  }
}

if (!global.tictactoeGames) global.tictactoeGames = {};

function isRateLimitError(error) {
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("rate-overlimit") ||
    message.includes("rate overlimit") ||
    message.includes("ratelimit") ||
    message.includes("rate limit")
  );
}

function normalizeMentions(text, extraMentions = []) {
  const parsed = parseMention(text).map((number) => `${number}@s.whatsapp.net`);
  const all = [...parsed, ...(extraMentions || [])].filter(Boolean);
  return [...new Set(all)];
}

async function sendWithRetry(action) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      if (!isRateLimitError(error) || attempt === 2) {
        throw error;
      }
      await delay(1200 * Math.pow(2, attempt));
    }
  }
  throw lastError;
}

async function safeReply(m, text, options = {}) {
  const mentions = normalizeMentions(text, options.mentions || []);
  const replyOptions = { ...options, mentions };
  try {
    return await sendWithRetry(() => m.reply(text, replyOptions));
  } catch (error) {
    if (isRateLimitError(error)) return null;
    throw error;
  }
}

async function safeReact(m, emoji) {
  try {
    await sendWithRetry(() => m.react(emoji));
  } catch (error) {}
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.args || [];
  const roomName = args.join(" ").trim();

  const existingRoom = Object.values(global.tictactoeGames).find(
    (room) =>
      room.id.startsWith("ttt_") &&
      [room.game.playerX, room.game.playerO].filter(Boolean).includes(m.sender),
  );

  if (existingRoom) {
    return safeReply(
      m,
      `❌ ¡Todavía estás en una partida!\n\n` +
        `> Terminá tu juego o escribí *rendirse* para abandonar.`,
    );
  }

  let room = Object.values(global.tictactoeGames).find(
    (r) =>
      r.state === "WAITING" &&
      r.chat === m.chat &&
      (roomName ? r.name === roomName : true),
  );

  if (room) {
    room.game.playerO = m.sender;
    room.state = "PLAYING";

    const board = renderBoard(room.game.render());

    const txt =
      `🎮 *ᴛᴀ-ᴛᴇ-ᴛɪ*\n\n` +
      `¡Rival encontrado!\n\n` +
      `❌ @${room.game.playerX.split("@")[0]}\n` +
      `⭕ @${room.game.playerO.split("@")[0]}\n\n` +
      `${board}\n\n` +
      `> Turno de: @${room.game.currentTurn.split("@")[0]}\n` +
      `> Respondé este mensaje con un número del 1 al 9\n` +
      `> Escribí *rendirse* para abandonar`;

    await safeReact(m, "🎮");
    await safeReply(m, txt, {
      mentions: [room.game.playerX, room.game.playerO],
    });
  } else {
    const roomId = "ttt_" + Date.now();

    global.tictactoeGames[roomId] = {
      id: roomId,
      chat: m.chat,
      name: roomName || null,
      game: new TicTacToe(m.sender, null),
      state: "WAITING",
      createdAt: Date.now(),
    };

    await safeReact(m, "🕕");
    await safeReply(
      m,
      `🎮 *ᴛᴀ-ᴛᴇ-ᴛɪ*\n\n` +
        `¡Sala creada! Esperando un rival...\n\n` +
        `> Escribí \`.tateti${roomName ? " " + roomName : ""}\` para unirte\n` +
        `> La sala expirará en 5 minutos`,
    );

    setTimeout(() => {
      if (global.tictactoeGames[roomId]?.state === "WAITING") {
        delete global.tictactoeGames[roomId];
      }
    }, 300000);
  }
}

async function answerHandler(m, sock) {
  if (!m.body) return false;

  const text = m.body.trim().toLowerCase();

  const room = Object.values(global.tictactoeGames).find(
    (r) =>
      r.state === "PLAYING" &&
      r.chat === m.chat &&
      [r.game.playerX, r.game.playerO].filter(Boolean).includes(m.sender),
  );

  if (!room) return false;

  const db = getDatabase();

  if (text === "rendirse" || text === "nyerah" || text === "surrender" || text === "abandonar") {
    const winner =
      m.sender === room.game.playerX ? room.game.playerO : room.game.playerX;
    const loser = m.sender;

    const winnerData = db.getUser(winner) || {};
    winnerData.koin = (winnerData.koin || 0) + 500;
    db.setUser(winner, winnerData);

    await safeReact(m, "🏳️");
    await safeReply(
      m,
      `🏳️ *¡SE RINDIÓ!*\n\n` +
        `@${loser.split("@")[0]} abandonó la partida.\n` +
        `@${winner.split("@")[0]} gana! +$500`,
      { mentions: [winner, loser] },
    );

    delete global.tictactoeGames[room.id];
    return true;
  }

  const move = parseInt(text);
  if (isNaN(move) || move < 1 || move > 9) return false;

  if (room.game.currentTurn !== m.sender) {
    await safeReply(m, "❌ ¡No es tu turno!");
    return true;
  }

  const player = room.game.playerX === m.sender ? 0 : 1;
  const result = room.game.turn(player, move - 1);

  if (result === 0) {
    await safeReply(m, "❌ ¡Esa posición ya está ocupada!");
    return true;
  }

  if (result === -1) {
    await safeReply(m, "❌ ¡Posición inválida!");
    return true;
  }

  const board = renderBoard(room.game.render());
  const winner = room.game.winner;
  const isTie = room.game.board === 511 && !winner;

  if (winner) {
    const loser =
      winner === room.game.playerX ? room.game.playerO : room.game.playerX;

    const winnerData = db.getUser(winner) || {};
    winnerData.koin = (winnerData.koin || 0) + 1000;
    db.setUser(winner, winnerData);

    await safeReact(m, "🎉");
    await safeReply(
      m,
      `🎉 *¡FIN DEL JUEGO!*\n\n` +
        `${board}\n\n` +
        `🏆 @${winner.split("@")[0]} ganó la partida! +$1.000`,
      { mentions: [winner, loser] },
    );

    delete global.tictactoeGames[room.id];
    return true;
  }

  if (isTie) {
    await safeReact(m, "🤝");
    await safeReply(
      m,
      `🤝 *¡EMPATE!*\n\n` + `${board}\n\n` + `> ¡No hay ganadores!`,
      { mentions: [room.game.playerX, room.game.playerO] },
    );

    delete global.tictactoeGames[room.id];
    return true;
  }

  await safeReply(
    m,
    `🎮 *ᴛᴀ-ᴛᴇ-ᴛɪ*\n\n` +
      `${board}\n\n` +
      `> Turno de: @${room.game.currentTurn.split("@")[0]}`,
    { mentions: [room.game.currentTurn] },
  );

  return true;
}

function renderBoard(arr) {
  const cells = arr.map((cell) => boardSymbols[String(cell)] || cell);
  return `┌───┬───┬───┐
│ ${cells[0]} │ ${cells[1]} │ ${cells[2]} │
├───┼───┼───┤
│ ${cells[3]} │ ${cells[4]} │ ${cells[5]} │
├───┼───┼───┤
│ ${cells[6]} │ ${cells[7]} │ ${cells[8]} │
└───┴───┴───┘`;
}

export { pluginConfig as config, handler, answerHandler }
