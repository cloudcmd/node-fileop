'use strict';

const currify = require('currify');

const _inly = require('inly');
const {webToWin} = require('mellow');

const _isRootWin32 = currify(require('./is-root-win32'));
const WIN32_ROOT_MSG = 'Could not extract from root on windows!';

module.exports = (id, root, socket, from, to, files, overrides = {}) => {
    const {isRootWin32 = _isRootWin32} = overrides;
    
    from = webToWin(from, root);
    to = webToWin(to, root);
    
    if (!isRootWin32(root, from))
        return operate(id, socket, from, to, overrides);
    
    socket.emit(`${id}#error`, WIN32_ROOT_MSG);
};

function operate(id, socket, from, to, overrides) {
    const {inly = _inly} = overrides;
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
