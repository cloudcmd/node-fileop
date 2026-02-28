'use strict';

const currify = require('currify');
const {onezip} = require('onezip');
const jaguar = require('jaguar');
const {webToWin} = require('mellow');

const _isRootWin32 = currify(require('./is-root-win32'));
const WIN32_ROOT_MSG = 'Could not pack from/to root on windows!';

module.exports = (type, id, root, socket, from, to, files, overrides) => {
    const {
        isRootWin32 = _isRootWin32,
    } = overrides;
    
    from = webToWin(from, root);
    to = webToWin(to, root);
    
    if (![from, to].some(isRootWin32(root)))
        return operate(type, id, socket, from, to, files, overrides);
    
    socket.emit(`${id}#error`, WIN32_ROOT_MSG);
};

function getOperation(type, overrides = {}) {
    const {pack} = overrides;
    
    if (type === 'tar')
        return (pack || jaguar.pack);
    
    return (pack || onezip.pack);
}

function operate(type, id, socket, from, to, files, overrides) {
    const operate = getOperation(type, overrides);
    const operator = operate(from, to, files);
    
    operator.on('file', (name) => {
        socket.emit(`${id}#file`, name);
    });
    
    operator.on('progress', (percent) => {
        socket.emit(`${id}#progress`, percent);
    });
    
    operator.on('error', (error, name) => {
        const msg = error.code + ': ' + error.path;
        const onAbort = () => {
            operator.abort();
            socket.removeListener(`${id}#abort`, onAbort);
        };
        
        socket.emit(`${id}#error`, msg, name);
        socket.on(`${id}#abort`, onAbort);
    });
    
    operator.on('end', () => {
        socket.emit(`${id}#end`);
    });
}
