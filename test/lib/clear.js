'use strict';

const clear = require('clear-module');

module.exports = () => {
    clear('../lib/connect');
    clear('../..');
    clear('../../server/listen');
    clear('../../server/operate');
    clear('../../server/pack');
    clear('../../server/extract');
    clear('../../server/read');
    clear('../../server/is-root-win32');
};

