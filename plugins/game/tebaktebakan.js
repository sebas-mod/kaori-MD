import { games } from '../../src/lib/ourin-games.js'

games.register('tebaktebakan', {
    alias: ['tbt', 'chiste', 'tebak2an', 'receh'],
    emoji: '😄',
    title: 'ADIVINANZAS GRACIOSAS',
    description: 'Adivinanzas simples y chistes para pasar el rato'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebaktebakan')
export { pluginConfig as config, handler, answerHandler }
