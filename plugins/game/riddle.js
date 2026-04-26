import { games } from '../../src/lib/ourin-games.js'

games.register('riddle', {
    alias: ['rd', 'adivinanza', 'riddles', 'enigma'],
    emoji: '❓',
    title: 'ADIVINANZAS',
    description: 'Juego de adivinanzas y enigmas'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('riddle')
export { pluginConfig as config, handler, answerHandler }
