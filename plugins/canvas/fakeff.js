import axios from "axios";
import config from "../../config.js";
import { uploadTo0x0 } from "../../src/lib/ourin-tmpfiles.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "fakeff",
  alias: ["fakefreefire", "lobbyff"],
  category: "canvas",
  description: "Crea una imagen de lobby de Free Fire personalizada",
  usage: ".fakeff <nombre>",
  example: ".fakeff ElPro_99",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const nombre = m.text?.trim();
  
  if (!nombre) {
    return m.reply(`*FAKE FREE FIRE*\n\n> Por favor, ingresa un nombre para el lobby.\n\n> Ejemplo: ${m.prefix}fakeff MiNombre`);
  }
  
  m.react("🕕");

  try {
    await sock.sendMedia(
      m.chat,
      `https://api.nexray.web.id/maker/fakelobyff?nickname=${encodeURIComponent(nombre)}`,
      null,
      m,
      {
        type: "image",
      },
    );

    m.react("✅");
  } catch (error) {
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
