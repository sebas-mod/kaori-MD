import { games } from '../../src/lib/ourin-games.js'

games.register('tebaklirik', {
    alias: ['lirik', 'letra', 'letracancion'],
    emoji: '🎤',
    title: 'ADIVINA LA LETRA',
    description: 'Adiviná la letra de la canción'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebaklirik')
export { pluginConfig as config, handler, answerHandler }
