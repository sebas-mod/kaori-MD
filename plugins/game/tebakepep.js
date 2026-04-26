import { games } from '../../src/lib/ourin-games.js'

games.register('tebakepep', {
    alias: ['tebakff', 'tebakfreefire', 'freefire', 'personajeff'],
    emoji: '🔫',
    title: 'ADIVINA EL PERSONAJE DE FF',
    description: 'Adiviná el personaje de Free Fire',
    hasImage: true
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebakepep')
export { pluginConfig as config, handler, answerHandler }
