import config from "../../config.js";
import { getDatabase } from "../../src/lib/ourin-database.js";
import pkg from "ourin";
const { generateWAMessageFromContent, proto } = pkg;

const pluginConfig = {
  name: "setmenu",
  alias: ["variantemenu", "estilomenu", "configmenu"],
  category: "owner",
  description: "Configura el estilo visual del menú",
  usage: ".setmenu <v1-v15>",
  example: ".setmenu v8",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

const VARIANTS = {
  v1: { id: 1, name: "Simple", desc: "Imagen normal sin información de contexto" },
  v2: { id: 2, name: "Estándar", desc: "Imagen + contextInfo completo (por defecto)" },
  v3: {
    id: 3,
    name: "Documento",
    desc: "Documento + miniatura JPEG + citado verificado",
  },
  v4: { id: 4, name: "Video", desc: "Video + contextInfo + citado verificado" },
  v5: {
    id: 5,
    name: "Botón",
    desc: "Imagen + botones (selección única y respuesta rápida)",
  },
  v6: {
    id: 6,
    name: "Documento Premium",
    desc: "Documento + miniatura 1280x450 + contextInfo completo",
  },
  v7: {
    id: 7,
    name: "Carrusel",
    desc: "Tarjetas deslizables por categoría (estilo moderno)",
  },
  v8: {
    id: 8,
    name: "Minimalista",
    desc: "Imagen + citado estilo carrito + diseño fresco",
  },
  v9: {
    id: 9,
    name: "Flujo Nativo",
    desc: "Interactivo + oferta limitada + hoja inferior + selección única",
  },
  v10: { id: 10, name: "Flujo Nativo", desc: "ESTILO OURINNN" },
  v11: {
    id: 11,
    name: "Documento Interactivo",
    desc: "Documento + mensaje de flujo nativo + oferta limitada + botones CTA",
  },
  v12: { id: 12, name: "MENÚ VERSIÓN 12", desc: "Diseño experimental X" },
  v13: {
    id: 13,
    name: "Miniatura Canvas",
    desc: "Estilo Documento V6 + Banner de miniatura Canvas",
  },
  v14: { id: 14, name: "MENÚ VERSIÓN 14", desc: "Diseño experimental Y" },
  v15: { id: 15, name: "MENÚ VERSIÓN 15", desc: "Diseño experimental Z" },
};

async function handler(m, { sock, db }) {
  const args = m.args || [];
  const variant = args[0]?.toLowerCase();

  if (variant) {
    const selected = VARIANTS[variant];
    if (!selected) {
      await m.reply(`❌ ¡Variante no válida!\n\nUsa: v1 hasta v15`);
      return;
    }

    db.setting("menuVariant", selected.id);
    await db.save();

    await m.reply(
      `✅ Variante de menú cambiada a *V${selected.id}*\n\n` +
        `> *${selected.name}*\n` +
        `> _${selected.desc}_`,
    );
    return;
  }

  const current = db.setting("menuVariant") || config.ui?.menuVariant || 2;

  const rows = Object.entries(VARIANTS).map(([key, val]) => ({
    title: `${key.toUpperCase()}${val.id === current ? " ✓" : ""} — ${val.name}`,
    description: val.desc,
    id: `${m.prefix}setmenu ${key}`,
  }));

  const bodyText =
    `🎨 *ᴄᴏɴғɪɢᴜʀᴀʀ ᴠᴀʀɪᴀɴᴛᴇ ᴅᴇ ᴍᴇɴᴜ́*\n\n` +
    `> Variante activa: *V${current}*\n` +
    `> _${VARIANTS[`v${current}`]?.name || "Desconocido"}_\n\n` +
    `> Elige una variante de la lista de abajo:`;

  try {
    const interactiveButtons = [
      {
        name: "single_select",
        buttonParamsJson: JSON.stringify({
          title: "🎨 ᴇʟᴇɢɪʀ ᴠᴀʀɪᴀɴᴛᴇ",
          sections: [
            {
              title: "ʟɪsᴛᴀ ᴅᴇ ᴠᴀʀɪᴀɴᴛᴇs ᴅɪsᴘᴏɴɪʙʟᴇs",
              rows,
            },
          ],
        }),
      },
    ];

    const msg = generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2,
            },
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
              body: proto.Message.InteractiveMessage.Body.fromObject({
                text: bodyText,
              }),
              footer: proto.Message.InteractiveMessage.Footer.fromObject({
                text: config.bot?.name || "Ourin-AI",
              }),
              header: proto.Message.InteractiveMessage.Header.fromObject({
                title: "🎨 Variante de Menú",
                subtitle: `${Object.keys(VARIANTS).length} variantes disponibles`,
                hasMediaAttachment: false,
              }),
              nativeFlowMessage:
                proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                  buttons: interactiveButtons,
                }),
              contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 9999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                  newsletterJid:
                    config.saluran?.id || "120363208449943317@newsletter",
                  newsletterName:
                    config.saluran?.name || config.bot?.name || "Ourin-AI",
                  serverMessageId: 127,
                },
              },
            }),
          },
        },
      },
      { userJid: m.sender, quoted: m },
    );

    await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
  } catch {
    let txt = `🎨 *ᴄᴏɴғɪɢᴜʀᴀʀ ᴠᴀʀɪᴀɴᴛᴇ ᴅᴇ ᴍᴇɴᴜ́*\n\n`;
    txt += `> Variante actual: *V${current}*\n\n`;
    for (const [key, val] of Object.entries(VARIANTS)) {
      const mark = val.id === current ? " ✓" : "";
      txt += `> *${key.toUpperCase()}*${mark} — _${val.desc}_\n`;
    }
    txt += `\n_Usa: \`.setmenu v1\`, etc._`;
    await m.reply(txt);
  }
}

export { pluginConfig as config, handler };
