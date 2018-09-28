'use strict';

const currify = require('currify');
const onezip = require('onezip');
const jaguar = require('jaguar');
const mellow = require('mellow');

const isRootWin32 = currify(require('./is-root-win32'));
const WIN32_ROOT_MSG = 'Could not pack from/to root on windows!';

module.exports = (type, id, root, socket, from, to, files) => {
    from = mellow.pathToWin(from, root);
    to = mellow.pathToWin(to, root);
    
    if (![from, to].some(isRootWin32(root)))
        return operate(type, id, socket, from, to, files);
    
    socket.emit(`${id}#error`, WIN32_ROOT_MSG);
};

function getOperation(type) {
    if (type === 'tar')
        return jaguar.pack;
    
    return onezip.pack;
}

function operate(type, id, socket, from, to, files) {
    const operate = getOperation(type);
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

