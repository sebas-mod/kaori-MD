const pluginConfig = {
    name: 'stop',
    alias: ['shutdown', 'kill', 'apagar', 'detener'],
    category: 'owner',
    description: 'Detiene el proceso del bot',
    usage: '.stop',
    example: '.stop',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    await m.reply('🛑 *Deteniendo el Bot...*\n\n> El bot se ha apagado. Debe iniciarse manualmente desde la terminal.')
    console.log('Deteniendo mediante comando...')
    
    // Permitir que el mensaje se envíe antes de salir
    setTimeout(() => {
        process.exit(1) // El código de salida 1 suele detener el auto-reinicio en bucles simples
    }, 1000)
}

export { pluginConfig as config, handler }
