import config from "../../config.js";
import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "checkban",
  alias: ["verban", "estadoban"],
  category: "owner",
  description: "Verifica el estado actual de baneo de un número",
  usage: ".checkban",
  isOwner: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const target = "628979985621@s.whatsapp.net";

  // Lógica de limpieza idéntica a la original para testeo
  const cleanNumber = target
    .split(":")[0]
    .split("@")[0]
    .replace(/[^0-9]/g, "");
    
  let bannedList = config.bannedUsers || [];
  const savedBanned = db.setting("bannedUsers") || [];

  const combined = [...new Set([...bannedList, ...savedBanned])];

  const isBannedDirect = combined.some((banned) => {
    const cleanBanned = banned
      .split(":")[0]
      .split("@")[0]
      .replace(/[^0-9]/g, "");
    return (
      cleanNumber === cleanBanned ||
      cleanNumber.endsWith(cleanBanned) ||
      cleanBanned.endsWith(cleanNumber)
    );
  });

  // Evaluación completa usando las funciones del sistema
  const finalResult = config.isBanned(target);
  let dbStatus = db.setting("bannedUsers");

  await m.reply(`DEBUG DE BANEO (${target})
Número limpio: ${cleanNumber}
Lista baneo (config): ${JSON.stringify(bannedList)}
Baneos guardados (db): ${JSON.stringify(savedBanned)}
Baneado directamente: ${isBannedDirect ? 'SÍ' : 'NO'}
Resultado config.isBanned(): ${finalResult ? 'BANEADO' : 'LIBRE'}
¿Es Propietario (Owner)?: ${config.isOwner(target) ? 'SÍ' : 'NO'}`);
}

export { pluginConfig as config, handler };
