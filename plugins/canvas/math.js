import {
  renderLatexToPng,
  createMediaUploadFn,
} from "../../src/lib/ourin-latex.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "math",
  alias: ["latex", "matematica", "formula"],
  category: "canvas",
  description: "Renderiza fórmulas matemáticas (LaTeX) en una imagen",
  usage: ".math <latex>",
  example: ".math E = mc^2 | \\frac{a}{b}",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const input = m.text;

  if (!input) {
    return m.reply(
      `*RENDERIZADO MATEMÁTICO*\n\n` +
        `Ejemplos:\n` +
        `• ${m.prefix}math E = mc^2\n` +
        `• ${m.prefix}math \\frac{a}{b}\n` +
        `• ${m.prefix}math E = mc^2 | \\frac{a}{b}`,
    );
  }

  m.react("🕕");

  try {
    // 🔥 Soporte para múltiples fórmulas usando "|"
    const expressions = input
      .split("|")
      .map((v) => v.trim())
      .filter((v) => v.length > 0)
      .map((v) => ({
        latexExpression: v,
      }));

    const uploadFn = await createMediaUploadFn(sock);

    await sock.sendLatexInlineImage(
      m.chat,
      m.quoted,
      {
        text: "📐 " + input,
        expressions,
        headerText: "Fórmulas Matemáticas",
        footer: "Potenciado por Ourin",
      },
      renderLatexToPng,
      uploadFn,
    );

    m.react("✅");
  } catch (error) {
    console.error(error);
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
