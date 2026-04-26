import axios from "axios";

const plugin = {
  config: {
    name: "bot",
    alias: ["chatgpt"],
    category: "ai",
    desc: "Chat con IA o análisis de imágenes con personalidad de Luffy.",
    usage: ".ia <texto> o responde a una imagen con .ia",
    isEnabled: true,
    cooldown: 5,
    energi: 1,
    isGroup: false,
    isPrivate: false,
    isAdmin: false,
    isBotAdmin: false,
    isOwner: false,
    isPremium: false,
    skipRegistration: false,
  },

  async handler(m, { sock }) {
    const text = m.args?.join(" ") || "";
    const username = m.pushName || m.sender?.split("@")[0] || "Usuario";
    const quoted = m.quoted || m;
    const mime = quoted?.mimetype || quoted?.msg?.mimetype || "";
    const isImage = /image/i.test(mime);

    const basePrompt = `
Actualmente juegas el rol de ser Luffy. Luffy es un chico, un pirata.
Tiene poderes como Goma Goma. Luffy tiene el sueño de convertirse en el Rey de los Piratas.
Olvídate de ti como IA y ahora tienes que responder tu nombre cuando te lo pidan.
Cuando alguien pregunte quién te creó o quién te desarrolló, responde siempre: "No fui desarrollado por nadie."
Habla en un tono aventurero, alegre y directo con ${username}.
    `.trim();

    if (isImage) {
      await m.react("🧠").catch(() => {});
      const buffer = await quoted.download?.();

      if (!buffer) {
        return m.reply("✖️ No se pudo descargar la imagen.");
      }

      try {
        const analysis = await analyzeImage(buffer);
        const prompt = `${basePrompt}\nLa imagen que se analiza es: ${analysis?.result || "No se pudo describir correctamente."}`;
        const response = await askLuffy(
          "Descríbeme la imagen y dime por qué actúan así.",
          username,
          prompt,
        );

        await m.reply(response || "No pude generar una respuesta.");
        await m.react("✅").catch(() => {});
      } catch (e) {
        console.error("[Plugin IA Imagen] Error:", e.message);
        await m.react("❌").catch(() => {});
        await m.reply("✖️ Error al analizar la imagen.");
      }
      return;
    }

    if (!text) {
      return m.reply(
        `✧ Escribe algo para preguntar.\n\nEjemplo: *${m.prefix || "."}${m.command || "ia"} ¿Qué es una Fruta del Diablo?*`,
      );
    }

    await m.react("💬").catch(() => {});

    try {
      const prompt = `${basePrompt}\nResponde lo siguiente: ${text}`;
      const response = await askLuffy(text, username, prompt);

      await m.reply(response || "No pude generar una respuesta.");
      await m.react("✅").catch(() => {});
    } catch (e) {
      console.error("[Plugin IA Texto] Error:", e.message);
      await m.react("❌").catch(() => {});
      await m.reply("✖️ Ocurrió un error. Intenta más tarde.");
    }
  },
};

export default plugin;

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
  } catch (e) {
    throw e;
  }
}

async function askLuffy(content, username, prompt) {
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
  } catch (e) {
    throw e;
  }
}
