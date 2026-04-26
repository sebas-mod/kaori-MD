import axios from "axios";
import config from "../../config.js";
import { uploadTo0x0 } from "../../src/lib/ourin-tmpfiles.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "fakeffduo",
  alias: ["fakefreefireduo", "ffduo"],
  category: "canvas",
  description: "Crea una imagen de lobby de Free Fire con un dúo",
  usage: ".fakeffduo <nombre1>|<nombre2>",
  example: ".fakeffduo ProPlayer|NoviaReal",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const nombres = m.text?.split("|");
  if (!nombres || nombres.length < 2) {
    return m.reply(
      `*FAKE FF DUO*\n\n> Por favor, ingresa dos nombres separados por un "|" (pipe).\n\n> Ejemplo: ${m.prefix}fakeffduo Jugador1|Jugador2`,
    );
  }
  m.react("🕕");

  try {
    const name1 = nombres[0].trim();
    const name2 = nombres[1].trim();
    
    await sock.sendMedia(
      m.chat,
      `https://api.ourin.my.id/api/fake-ff-duo-2?name1=${encodeURIComponent(name1)}&name2=${encodeURIComponent(name2)}&bg=random`,
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
