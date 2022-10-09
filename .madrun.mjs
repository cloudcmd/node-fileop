import {run} from 'madrun';

export default {
    'test': () => `tape 'test/**/*.js'`,
    'lint': () => 'putout .',
    'fresh:lint': () => run('lint', '--fresh'),
    'lint:fresh': () => run('lint', '--fresh'),
    'fix:lint': () => run('lint', '--fix'),
    'coverage': async () => `c8 ${await run('test')}`,
    'report': () => 'c8 report --reporter=lcov',
    'build': () => run(['rmdir', 'build:*']),
    'build-progress': () => 'BABEL_ENV=client webpack --progress',
    'build:client': () => run('build-progress', '--mode production'),
    'build:client:dev': async () => `NODE_ENV=development ${await run('build-progress', '--mode development')}`,
    'watcher': () => 'nodemon -w client -w server -w test --exec',
    'watch:test': async () => await run('watcher', `'npm test'`),
    'watch:coverage': async () => await run('watcher', `'npm run coverage'`),
    'watch:lint': async () => await run('watcher', `'npm run lint'`),
    'watch:client': () => run('build:client', '--watch'),
    'watch:client:dev': () => run('build:client:dev', '--watch'),
    'wisdom': () => run('build'),
    'rmdir': () => 'rimraf dist dist-dev',
};

