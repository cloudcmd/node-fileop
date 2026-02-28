import currify from 'currify';
import _inly from 'inly';
import {webToWin} from 'mellow';
import __isRootWin32 from './is-root-win32.js';

const _isRootWin32 = currify(__isRootWin32);
const WIN32_ROOT_MSG = 'Could not extract from root on windows!';

export default (id, root, socket, from, to, files, overrides = {}) => {
    const {
        isRootWin32 = _isRootWin32,
    } = overrides;
    
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
