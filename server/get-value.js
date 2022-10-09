'use strict';

const isFn = (a) => typeof a === 'function';

module.exports = (a) => isFn(a) ? a() : a;

