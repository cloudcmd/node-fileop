'use strict';

const {
    run,
    series,
    parallel,
} = require('madrun');

module.exports = {
    'test': () => `tape 'test/**/*.js'`,
    'watch:test': () => `nodemon -w lib -w test -x ${run('test')}`,
    "lint:client": () => "eslint --env browser --rule 'no-console:0' client",
    "lint:server": () => "eslint server -c .eslintrc.server",
    "lint:test": () => "eslint test",
    'lint': () => series(['putout', 'lint:*']),
    'fix:lint': () => series(['putout', 'lint:*'], '--fix'),
    'putout': () => `putout client server test`,
    'coverage': () => `nyc ${run('test')}`,
    'report': () => `nyc report --reporter=text-lcov | coveralls || true`,
};

