'use strict';

const currify = require('currify/legacy');

const remy = require('remy');
const copymitter = require('copymitter');
const mellow = require('mellow');
const isString = (a) => typeof a === 'string';

const isRootWin32 = currify(require('./is-root-win32'));

const getPaths = (from, to) => {
    if (!isString(to))
        return [from];
    
    return [from, to];
};

const getRootError = (type) => `Could not ${type} from/to root on windows!`;
const pathToWin = (path, root) => {
    if (!isString(path))
        return path;
    
    return mellow.pathToWin(path, root);
};

module.exports = currify((type, id, root, socket, from, to, files) => {
    from = pathToWin(from, root);
    to = pathToWin(to, root);
    
    if (getPaths(from, to).some(isRootWin32(root)))
        socket.emit(`${id}#error`,  getRootError(type));
    
    operate(type, id, socket, from, to, files);
});

function getOperation(type) {
    if (type === 'remove')
        return remy;
    
    return copymitter;
}

function operate(type, id, socket, from, to, files) {
    const operate = getOperation(type);
    const operator = operate(from, to, files);
    const pause = () => operator.pause();
    
    socket.on(`${id}#pause`, pause);
    
    operator.on('file', (name) => {
        socket.emit(`${id}#file`, name);
    });
    
    operator.on('progress', (percent) => {
        socket.emit(`${id}#progress`, percent);
    });
    
    operator.on('error', (error, name) => {
        const msg = `${error.code}: ${error.path}`;
        const rmListeners = () => {
            socket.removeListener(`${id}#continue`, onContinue);
            socket.removeListener(`${id}#abort`, onAbort);
        };
        
        const onAbort = () => {
            operator.abort();
            rmListeners();
        };
        
       const onContinue  = () => {
            operator.continue();
            rmListeners();
        };
        
        socket.emit(`${id}#error`, msg, name);
        socket.on(`${id}#continue`, onContinue);
        socket.on(`${id}#abort`,  onAbort);
    });
    
    operator.on('end', () => {
        socket.emit(`${id}#end`);
        socket.removeListener(`${id}#pause`, pause);
    });
}

