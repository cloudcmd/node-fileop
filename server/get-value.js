const isFn = (a) => typeof a === 'function';

export default (a) => isFn(a) ? a() : a;
