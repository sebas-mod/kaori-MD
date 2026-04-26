import { games } from '../../src/lib/ourin-games.js'

games.register('tebakkata', {
    alias: ['tk', 'palabra', 'guessword'],
    emoji: '📝',
    title: 'ADIVINA LA PALABRA',
    description: 'Adiviná la palabra a través de las pistas'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebakkata')
export { pluginConfig as config, handler, answerHandler }
