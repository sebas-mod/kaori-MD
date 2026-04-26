import { games } from '../../src/lib/ourin-games.js'

games.register('tebakjkt48', {
    alias: ['jkt48', 'jkt', 'idol'],
    emoji: '🎀',
    title: 'ADIVINA JKT48',
    description: 'Adiviná quién es la integrante de JKT48',
    hasImage: true
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebakjkt48')
export { pluginConfig as config, handler, answerHandler }
