import {run} from 'madrun';

export default {
    'test': () => `tape 'test/**/*.js'`,
    'lint': () => 'putout .',
    'fresh:lint': () => run('lint', '--fresh'),
    'lint:fresh': () => run('lint', '--fresh'),
    'fix:lint': () => run('lint', '--fix'),
    'coverage': async () => `nyc ${await run('test')}`,
    'report': () => `nyc report --reporter=text-lcov | coveralls`,
    'build': () => run(['rmdir', 'build:*']),
    'build-progress': () => 'BABEL_ENV=client webpack --progress',
    'build:client': () => run('build-progress', '--mode production'),
    'build:client:dev': async () => `NODE_ENV=development ${await run('build-progress', '--mode development')}`,
    'watcher': () => 'nodemon -w client -w server -w test --exec',
    'watch:test': () => run('watcher', '\'npm test\''),
    'watch:coverage': () => run('watcher', '\'npm run coverage\''),
    'watch:lint': () => run('watcher', '\'npm run lint\''),
    'watch:client': () => run('build:client', '--watch'),
    'watch:client:dev': () => run('build:client:dev', '--watch'),
    'wisdom': () => run('build'),
    'rmdir': () => 'rimraf dist dist-dev',
};
