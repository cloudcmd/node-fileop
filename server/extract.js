'use strict';

const currify = require('currify');

const inly = require('inly');
const mellow = require('mellow');

const isRootWin32 = currify(require('./is-root-win32'));
const WIN32_ROOT_MSG = 'Could not extract from root on windows!';

module.exports = (id, root, socket, from, to) => {
    from = mellow.pathToWin(from, root);
    to = mellow.pathToWin(to, root);
    
    if (!isRootWin32(root, from))
        return operate(id, socket, from, to);
    
    socket.emit(`${id}#error`, WIN32_ROOT_MSG);
};

function operate(id, socket, from, to) {
    const extractor = inly(from, to);
    
    extractor.on('file', (name) => {
        socket.emit(`${id}#file`, name);
    });
    
    extractor.on('progress', (percent) => {
        socket.emit(`${id}#progress`, percent);
    });
    
    extractor.on('error', (error) => {
        socket.emit(`${id}#error`, error.message);
    });
    
    extractor.on('end', () => {
        socket.emit(`${id}#end`);
    });
}

