import { games } from '../../src/lib/ourin-games.js'

games.register('caklontong', {
    alias: ['cak', 'lontong', 'absurdo'],
    emoji: '🤔',
    title: 'CAK LONTONG',
    description: 'Juego de Cak Lontong - respuestas absurdas y divertidas'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('caklontong')
export { pluginConfig as config, handler, answerHandler }
