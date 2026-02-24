'use strict';

const currify = require('currify');

const remy = require('remy');
const {copymitter: _copymitter} = require('copymitter');
const moveFiles = require('@cloudcmd/move-files');
const {webToWin} = require('mellow');
const isString = (a) => typeof a === 'string';

const _isRootWin32 = currify(require('./is-root-win32'));

const getPaths = (from, to) => {
    if (!isString(to))
        return [from];
    
    return [from, to];
};

const getRootError = (type) => `Could not ${type} from/to root on windows!`;

const safeWebToWin = (path, root) => {
    if (!isString(path))
        return path;
    
    return webToWin(path, root);
};

module.exports = currify((type, overrides, id, root, socket, from, to, files) => {
    const {
        isRootWin32 = _isRootWin32,
    } = overrides;
    
    from = safeWebToWin(from, root);
    to = safeWebToWin(to, root);
    
    if (getPaths(from, to).some(isRootWin32(root)))
        socket.emit(`${id}#error`, getRootError(type));
    
    operate(type, id, socket, from, to, files, overrides);
});

function getOperation(type, overrides) {
    const {
        copymitter = _copymitter,
    } = overrides;
    
    if (type === 'remove')
        return remy;
    
    if (type === 'move')
        return moveFiles;
    
    return copymitter;
}

function operate(type, id, socket, from, to, files, overrides) {
    const operate = getOperation(type, overrides);
    const operator = operate(from, to, files);
    const onPause = () => operator.pause();
    const onContinue = () => operator.continue();
    const onAbort = () => operator.abort();
    
    socket.on(`${id}#continue`, onContinue);
    socket.on(`${id}#abort`, onAbort);
    socket.on(`${id}#pause`, onPause);
    
    operator.on('file', (name) => {
        socket.emit(`${id}#file`, name);
    });
    
    operator.on('progress', (percent) => {
        socket.emit(`${id}#progress`, percent);
    });
    
    operator.on('error', (error, name) => {
        const msg = `${error.code}: ${error.path}`;
        
        socket.emit(`${id}#error`, msg, name);
    });
    
    operator.on('abort', () => {
        socket.emit(`${id}#end`);
        socket.removeListener(`${id}#pause`, onPause);
        socket.removeListener(`${id}#continue`, onContinue);
        socket.removeListener(`${id}#abort`, onAbort);
    });
    
    operator.on('end', () => {
        socket.emit(`${id}#end`);
        socket.removeListener(`${id}#pause`, onPause);
        socket.removeListener(`${id}#continue`, onContinue);
        socket.removeListener(`${id}#abort`, onAbort);
    });
}
