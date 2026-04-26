import { games } from '../../src/lib/ourin-games.js'

games.register('tebakdrakor', {
    alias: ['drakor', 'kdrama', 'drama'],
    emoji: '🇰🇷',
    title: 'ADIVINA EL KDRAMA',
    description: 'Adivina el título del drama coreano',
    hasImage: true
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebakdrakor')
export { pluginConfig as config, handler, answerHandler }
