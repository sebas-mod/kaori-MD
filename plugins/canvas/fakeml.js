import * as _canvas from '@napi-rs/canvas'
import axios from "axios";
import path from "path";
import fs from "fs";

import { uploadTo0x0 } from "../../src/lib/ourin-tmpfiles.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "fakeml",
  alias: ["mlbbfake", "mlcard", "mlfake", "perfilml"],
  category: "canvas",
  description: "Crea una tarjeta de perfil falsa de Mobile Legends",
  usage: ".fakeml <nombre> (responde/envía foto)",
  example: ".fakeml Misaki",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

let fontRegistered = false;

async function handler(m, { sock }) {
  const name = m.text?.trim();
  
  if (!name) {
    return m.reply(
      `🎮 *ꜰᴀᴋᴇ ᴍʟ ᴘʀᴏꜰɪʟᴇ*\n\n` +
        `> Ingresa un nombre para el perfil\n\n` +
        `*ᴍᴏᴅᴏ ᴅᴇ ᴜsᴏ:*\n` +
        `> 1. Envía foto + descripción \`${m.prefix}fakeml <nombre>\`\n` +
        `> 2. Responde a una foto con \`${m.prefix}fakeml <nombre>\``,
    );
  }

  let buffer = null;
  if (
    m.quoted &&
    (m.quoted.type === "imageMessage" || m.quoted.mtype === "imageMessage")
  ) {
    try {
      buffer = await m.quoted.download();
    } catch (e) {
      m.reply(te(m.prefix, m.command, m.pushName));
    }
  } else if (m.isMedia && m.type === "imageMessage") {
    try {
      buffer = await m.download();
    } catch (e) {
      m.reply(te(m.prefix, m.command, m.pushName));
    }
  } else {
    try {
      let pfpUrl = await sock.profilePictureUrl(m.sender, "image");
      buffer = Buffer.from(
        (await axios.get(pfpUrl, { responseType: "arraybuffer" })).data,
      );
    } catch (error) {
      buffer = fs.readFileSync("./assets/images/pp-kosong.jpg");
    }
  }

  if (!buffer) {
    return m.reply(`❌ ¡Envía o responde a una imagen para usarla como avatar!`);
  }

  m.react("🕕");

  try {
    const gmbr = await uploadTo0x0(buffer, {
      filename: "image.jpg",
      contentType: "image/jpeg",
    });

    await sock.sendMedia(
      m.chat,
      `https://api.nexray.web.id/maker/fakelobyml?avatar=${encodeURIComponent(gmbr.directUrl)}&nickname=${encodeURIComponent(name)}`,
      null,
      m,
      {
        type: "image",
      },
    );
    m.react("✅");
  } catch (error) {
    m.react("❌");
    m.reply(`Ocurrió un error, por favor intenta de nuevo.`);
  }
}

export { pluginConfig as config, handler };
