import axios from "axios";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "ai4chat",
  alias: ["ai", "chatgpt"],
  category: "ai",
  description: "Chatea con IA o analiza imágenes con personalidad personalizada",
  usage: ".ai4chat <pregunta> o responde una imagen con .ai4chat",
  example: ".ai4chat ¿Qué ves en esta imagen?",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function handler(m) {
  const text = m.text?.trim() || "";
  const username = m.pushName || m.sender?.split("@")[0] || "Usuario";
  const quoted = m.quoted || m;
  const mime = quoted?.mimetype || quoted?.msg?.mimetype || "";
  const isImage = /image/i.test(mime);

  const basePrompt = `
Ahora actúas como ᴋᴀᴏʀɪ ᴍᴅ.
Debes responder siempre como un asistente amistoso, claro y directo.
Si te preguntan tu nombre, responde siempre: "Mi nombre es ᴋᴀᴏʀɪ ᴍᴅ."
Si te preguntan quién te creó o quién te desarrolló, responde siempre: "Fui desarrollado como ᴋᴀᴏʀɪ ᴍᴅ."
Habla en español, con un tono natural, útil y cercano con ${username}.
`.trim();

  if (isImage) {
    await m.react("🧠").catch(() => {});
    const buffer = await quoted.download?.();

    if (!buffer) {
      return m.reply("✖️ No se pudo descargar la imagen.");
    }

    try {
      const analysis = await analyzeImage(buffer);
      const prompt = `${basePrompt}\nLa imagen analizada contiene: ${analysis?.result || "No se pudo obtener una descripción precisa."}`;
      const response = await askKaori(
        "Describe la imagen y explica lo que está ocurriendo.",
        username,
        prompt,
      );

      await m.react("✅").catch(() => {});
      return m.reply(response || "No pude generar una respuesta.");
    } catch (error) {
      console.error("[AI4Chat Imagen] Error:", error.message);
      await m.react("☢").catch(() => {});
      return m.reply("✖️ Error al analizar la imagen.");
    }
  }

  if (!text) {
    return m.reply(
      `🤖 *ᴀɪ4ᴄʜᴀᴛ*\n\n> Ingresa una pregunta o responde una imagen con el comando.\n\n\`Ejemplo: ${m.prefix}ai4chat ¿Qué es JavaScript?\``,
    );
  }

  await m.react("🕕").catch(() => {});

  try {
    const prompt = `${basePrompt}\nResponde lo siguiente: ${text}`;
    const response = await askKaori(text, username, prompt);

    await m.react("✅").catch(() => {});
    await m.reply(response || "No pude generar una respuesta.");
  } catch (error) {
    console.error("[AI4Chat Texto] Error:", error.message);
    await m.react("☢").catch(() => {});
    await m.reply(te(m.prefix, m.command, m.pushName));
  }
}

async function analyzeImage(imageBuffer) {
  try {
    const imageBase64 = imageBuffer.toString("base64");

    const res = await axios.post(
      "https://luminai.my.id",
      {
        content: "¿Qué se observa en la imagen?",
        imageBuffer: imageBase64,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      },
    );

    return res.data;
  } catch (error) {
    throw error;
  }
}

async function askKaori(content, username, prompt) {
  try {
    const res = await axios.post(
      "https://luminai.my.id",
      {
        content,
        user: username,
        prompt,
        webSearchMode: false,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      },
    );

    return res.data?.result;
  } catch (error) {
    throw error;
  }
}

export { pluginConfig as config, handler };
