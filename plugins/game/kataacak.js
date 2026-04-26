import { games } from '../../src/lib/ourin-games.js'

games.register('kataacak', {
    alias: ['ka', 'acakkata', 'palabras', 'desorden'],
    emoji: '🔤',
    title: 'PALABRAS DESORDENADAS',
    description: 'Ordena las letras para formar la palabra correcta'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('kataacak')
export { pluginConfig as config, handler, answerHandler }
