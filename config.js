import { getDatabase } from "./src/lib/ourin-database.js";
import * as ownerPremiumDb from "./src/lib/ourin-premium-db.js";

//  lee todo el objeto config hasta abajo
const config = {
  info: {
    website: "https://sc.ourin.my.id",
    grupwa: "https://chat.whatsapp.com/C8pzXYhMJMyKbHMdehT9Yt",
  },

  owner: {
    name: "sebas",
    number: ["5491138403093"],
  },

  session: {
    pairingNumber: "5491140951814",
    usePairingCode: true,
  },

  bot: {
    name: "ᴋᴀᴏʀɪ ᴍᴅ",
    version: "2.4.5",
    developer: "Zann",
  },

  mode: "public",

  command: {
    prefix: ".",
  },

  vercel: {
    token: "",
  },

  store: {
    payment: [
      { name: "Dana", number: "62xxxxxxxxx", holder: "Nombre del titular" },
      { name: "OVO", number: "62xxxxxxxxx", holder: "Nombre del titular" },
      { name: "GoPay", number: "62xxxxxxxxx", holder: "Nombre del titular" },
      { name: "ShopeePay", number: "62xxxxxxxxx", holder: "Nombre del titular" },
    ],
    qris: "https://files.cloudkuimages.guru/images/51a2c5186302.jpg",
  },

  donasi: {
    payment: [
      { name: "Dana", number: "08xxxxxxxxxx", holder: "Nombre del owner" },
      { name: "GoPay", number: "08xxxxxxxxxx", holder: "Nombre del owner" },
      { name: "OVO", number: "08xxxxxxxxxx", holder: "Nombre del owner" },
    ],
    links: [
      { name: "Saweria", url: "saweria.co/usuario" },
      { name: "Trakteer", url: "trakteer.id/usuario" },
    ],
    benefits: [
      "Apoyar el desarrollo",
      "Servidor más estable",
      "Funciones nuevas más rápidas",
      "Soporte prioritario",
    ],
    qris: "https://files.cloudkuimages.guru/images/51a2c5186302.jpg",
  },

  energi: {
    enabled: true,
    default: 99999,
    premium: 99999999,
    owner: -1,
  },

  sticker: {
    packname: "ᴋᴀᴏʀɪ ᴍᴅ",
    author: "Nombre",
  },

  saluran: {
    id: "-@newsletter",
    name: "BOT WHATSAPP MULTIDISPOSITIVO",
    link: "https://whatsapp.com/channel/0029VbB37bgBfxoAmAlsgE0t",
  },

  groupProtection: {
    antilink: "⚠ *Antilink* — @%user% envió un enlace.\nMensaje eliminado.",
    antilinkKick: "⚠ *Antilink* — @%user% fue expulsado por enviar enlace.",
    antilinkGc: "⚠ *Antilink WA* — @%user% envió un enlace de WhatsApp.\nMensaje eliminado.",
    antilinkGcKick:
      "⚠ *Antilink WA* — @%user% fue expulsado por enviar enlace de WhatsApp.",
    antilinkAll: "⚠ *Antilink* — @%user% envió un enlace.\nMensaje eliminado.",
    antilinkAllKick: "⚠ *Antilink* — @%user% fue expulsado por enviar enlace.",
    antitagsw: "⚠ *AntiTagSW* — estado eliminado de @%user%.",
    antiviewonce: "👁️ *VerUnaVez* — de @%user%",
    antiremove: "🗑️ *AntiEliminar* — @%user% eliminó un mensaje:",
    antihidetag: "⚠ *AntiHidetag* — mensaje oculto eliminado.",
    antitoxicWarn:
      "⚠ @%user% dijo algo ofensivo.\nAdvertencia %warn% de %max%, el siguiente puede ser %method%.",
    antitoxicAction: "🚫 @%user% fue %method% por toxicidad. (%warn%/%max%)",
    antidocument: "⚠ Documento eliminado de @%user%.",
    antisticker: "⚠ Sticker eliminado de @%user%.",
    antimedia: "⚠ Media eliminada de @%user%.",
    antibot: "🤖 @%user% detectado como bot y expulsado.",
    notAdmin: "⚠ El bot no es admin, no puede eliminar mensajes.",
  },

  errorTemplate: `☢ El comando \`{prefix}{command}\` tiene un problema\nIntenta de nuevo más tarde, {pushName}\n\n_Si continúa, contacta al owner_`,

  features: {
    antiSpam: true,
    antiSpamInterval: 3000,
    antiCall: true,
    blockIfCall: true,
    autoTyping: true,
    autoRead: false,
    logMessage: true,
    dailyLimitReset: true,
    smartTriggers: false,
  },

  registration: {
    enabled: false,
    rewards: {
      koin: 30000,
      energi: 300,
      exp: 300000,
    },
  },

  welcome: { defaultEnabled: false },
  goodbye: { defaultEnabled: false },

  ui: {
    menuVariant: 3,
  },

  messages: {
    wait: "🕕 *Procesando...* Espera un momento.",
    success: "✅ *Listo!* Operación completada.",
    error: "❌ *Error!* Intenta más tarde.",

    ownerOnly: "*Acceso denegado!* Solo para el owner.",
    premiumOnly: "💎 *Solo Premium!* Usa *.benefitpremium* para más info.",

    groupOnly: "👥 *Solo grupos!*",
    privateOnly: "👤 *Solo privado!*",

    adminOnly: "🛡️ *Solo admins!*",
    botAdminOnly: "🤖 *El bot necesita ser admin!*",

    cooldown: "🕕 Espera %time% segundos.",
    energiExceeded: "⚡ Energía agotada. Espera o compra premium.",

    banned: "🚫 Estás baneado por incumplir reglas.",

    rejectCall: "🚫 NO LLAMES A ESTE NÚMERO",
  },

  database: { path: "./database/main" },
  backup: { enabled: false, intervalHours: 24, retainDays: 7 },
  scheduler: { resetHour: 0, resetMinute: 0 },

  dev: {
    enabled: process.env.NODE_ENV === "development",
    watchPlugins: true,
    watchSrc: false,
    debugLog: false,
  },

  pterodactyl: {
    server1: { domain: "", apikey: "", capikey: "", egg: "15", nestid: "5", location: "1" },
    server2: { domain: "", apikey: "", capikey: "", egg: "15", nestid: "5", location: "1" },
    server3: { domain: "", apikey: "", capikey: "", egg: "15", nestid: "5", location: "1" },
    server4: { domain: "", apikey: "", capikey: "", egg: "15", nestid: "5", location: "1" },
    server5: { domain: "", apikey: "", capikey: "", egg: "15", nestid: "5", location: "1" },
  },

  digitalocean: {
    token: "",
    region: "sgp1",
    sellers: [],
    ownerPanels: [],
  },

  pakasir: {
    enabled: true,
    slug: "",
    apiKey: "",
    defaultMethod: "qris",
    sandbox: false,
    pollingInterval: 5000,
  },

  jasaotp: {
    apiKey: "",
    markup: 2000,
    timeout: 300,
  },

  geminiApiKey: "",

  APIkey: {
    lolhuman: "APIKey-Milik-Bot-OurinMD(Zann,HyuuSATANN,Keisya,Danzz)",
    neoxr: "Milik-Bot-OurinMD",
    fgsi: "fgsiapi-20c1605c-6d",
    google: "AIzaSyAS-KiW0SrwiYKwexeBcGPijBVHFg2R_vo",
    groq: "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",
    betabotz: "Btz-67YfP",
    covenant: "cov_live_bb660c9e5f735e46d808b7ae362914cfe35c2936739ee2b2",
  },
};

function cleanNumber(value = "") {
  return String(value).replace(/[^0-9]/g, "");
}

function matchNumber(a = "", b = "") {
  const x = cleanNumber(a);
  const y = cleanNumber(b);
  if (!x || !y) return false;
  return x === y || x.endsWith(y) || y.endsWith(x);
}

function isOwner(number) {
  const target = cleanNumber(number);
  if (!target) return false;

  const ownerNumbers = config.owner?.number || [];
  if (ownerNumbers.some((owner) => matchNumber(target, owner))) return true;

  try {
    return ownerPremiumDb.isOwner(target);
  } catch {
    return false;
  }
}

function isPremium(number) {
  const target = cleanNumber(number);
  if (!target) return false;
  if (isOwner(target)) return true;

  try {
    return ownerPremiumDb.isPremium(target);
  } catch {
    return false;
  }
}

function isPartner(number) {
  const target = cleanNumber(number);
  if (!target) return false;
  if (isOwner(target)) return true;

  try {
    return ownerPremiumDb.isPartner(target);
  } catch {
    return false;
  }
}

function isBanned(number) {
  const target = cleanNumber(number);
  if (!target) return false;
  if (isOwner(target)) return false;

  try {
    const db = getDatabase();
    const bannedUsers = db.setting("bannedUsers") || [];
    return bannedUsers.some((user) => matchNumber(target, user));
  } catch {
    return false;
  }
}

function setBotNumber(number) {
  if (number) config.bot.number = cleanNumber(number);
}

function isSelf(number) {
  return matchNumber(number, config.bot?.number || "");
}

function getConfig() {
  return config;
}

config.isOwner = isOwner;
config.isPremium = isPremium;
config.isPartner = isPartner;
config.isBanned = isBanned;
config.setBotNumber = setBotNumber;
config.isSelf = isSelf;

export default config;
export {
  config,
  getConfig,
  isOwner,
  isPartner,
  isPremium,
  isBanned,
  setBotNumber,
  isSelf,
};
