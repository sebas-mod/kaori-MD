/**
 * Nama Plugin: PlayCh (Saluran)
 * Pembuat Code: Zann
 * API: api.zenzxz.my.id
 * Convert: ffmpeg mp3 → ogg/opus (support saluran)
 */
import crypto from "crypto";
import axios from "axios";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import yts from "yt-search";
import config from "../../config.js";
import te from "../../src/lib/ourin-error.js";

const run = promisify(exec);
const pluginConfig = {
  name: "playch",
  alias: ["pch", "playsaluran"],
  category: "search",
  description: "Reproducir música en un canal (convertir a opus)",
  usage: ".playch <query> o .playch --idch <id> <query>",
  example: ".playch komang",
  cooldown: 15,
  energi: 1,
  isEnabled: true,
};

function pickVideo(search) {
  const v = search?.videos || [];
  return v.find((x) => x.seconds && x.seconds < 900) || v[0] || null;
}

function formatViews(n) {
  if (!n) return "0";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toString();
}

async function toOggOpus(mp3Buf) {
  const tmp = path.join(process.cwd(), "temp");
  if (!fs.existsSync(tmp)) fs.mkdirSync(tmp, { recursive: true });
  const id = crypto.randomBytes(6).toString("hex");
  const inp = path.join(tmp, `in_${id}.mp3`);
  const out = path.join(tmp, `out_${id}.ogg`);
  fs.writeFileSync(inp, mp3Buf);
  await run(
    `ffmpeg -y -i "${inp}" -vn -map_metadata -1 -ac 1 -ar 48000 -c:a libopus -b:a 96k -vbr on -application audio -f ogg "${out}"`,
  );
  const buf = fs.readFileSync(out);
  try {
    fs.unlinkSync(inp);
  } catch {}
  try {
    fs.unlinkSync(out);
  } catch {}
  return buf;
}

async function handler(m, { sock }) {
  const raw = m.text?.trim() || "";
  let chId = config?.saluran?.id;
  let chName = config?.saluran?.name || config?.bot?.name || "Ourin-AI";
  let q = raw;

  const idchMatch = raw.match(/--idch\s+(\S+)/);
  if (idchMatch) {
    chId = idchMatch[1];
    chName = chId;
    q = raw.replace(/--idch\s+\S+/, "").trim();
  }

  if (!q)
    return m.reply(
      `🎵 *PLAY CANAL*\n\n\`${m.prefix}playch <título de la canción>\`\n\`${m.prefix}playch --idch <id_del_canal> <título de la canción>\``,
    );
  if (!chId)
    return m.reply(
      `❌ El canal no ha sido configurado. Usá \`--idch <id>\` o configuralo en config.js`,
    );

  m.react("🔎");
  try {
    const { videos } = await yts(q);
    const video = pickVideo({ videos });
    if (!video) return m.reply(`❌ Video no encontrado`);

    const ytChannel = video.author?.name || video.author?.username || "Desconocido";

    let info = `🎵 *REPRODUCIENDO AHORA (CANAL)*\n\n`;
    info += `📌 *Título:* ${video.title}\n\n`;
    info += `*DETALLES*\n`;
    info += `👤 Canal: *${ytChannel}*\n`;
    info += `⏱️ Duración: *${video.duration.timestamp}*\n`;
    info += `👀 Vistas: *${formatViews(video.views)}*\n`;
    info += `📅 Subido: *${video.ago}*\n`;
    info += `🆔 ID: \`${video.videoId}\`\n\n`;
    if (video.description) {
      const desc = video.description.substring(0, 150).replace(/\n/g, " ");
      info += `*Descripción:*\n_${desc}${video.description.length > 150 ? "..." : ""}_\n\n`;
    }
    info += `📡 Canal ID: \`${chId}\`\n`;
    info += `🔗 ${video.url}\n\n`;
    info += `_⏳ enviando audio al canal, por favor esperá..._`;

    await sock.sendMedia(m.chat, video.thumbnail, info, m, { type: "image" });

    const { data } = await axios.get(
      `https://api.zenzxz.my.id/download/youtube?url=${video.url}`,
    );
    if (!data?.result?.download) throw new Error("Falla en la API, URL vacía");

    m.react("🎵");
    const audioRes = await axios.get(data.result.download, {
      responseType: "arraybuffer",
      timeout: 60000,
    });
    const mp3Buf = Buffer.from(audioRes.data);
    if (mp3Buf.length < 50000) throw new Error("El audio es demasiado pequeño");
    const opusBuf = await toOggOpus(mp3Buf);
    if (opusBuf.length < 10000) throw new Error("La conversión a opus falló");
    const title = video.title;

    await sock.sendMessage(chId, {
      audio: opusBuf,
      mimetype: "audio/ogg; codecs=opus",
      ptt: true,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: chId,
          serverMessageId: 100,
          newsletterName: chName,
        },
        externalAdReply: {
          title,
          body: `Canal • ${ytChannel}`,
          thumbnailUrl: video.thumbnail,
          sourceUrl: video.url,
          mediaType: 1,
          renderLargerThumbnail: true,
        },
      },
    });
    m.react("✅");
    m.reply(`✅ *${title}* fue enviado con éxito al canal`);
  } catch (e) {
    console.error("[PlayCh]", e);
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
