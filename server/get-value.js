'use strict';

const isFn = (a) => typeof a === 'function';
const getValue = (a) => isFn(a) ? a() : a;

module.exports = getValue;

