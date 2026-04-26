import { games } from '../../src/lib/ourin-games.js'

games.register('tebaklagu', {
    alias: ['tl', 'cancion', 'guesssong', 'musica'],
    emoji: '🎵',
    title: 'ADIVINA LA CANCIÓN',
    description: 'Adiviná el título de la canción'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebaklagu')
export { pluginConfig as config, handler, answerHandler }
