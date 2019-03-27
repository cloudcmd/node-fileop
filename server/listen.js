'use strict';

const currify = require('currify');
const wraptile = require('wraptile');
const fullstore = require('fullstore');

const operate = require('./operate');
const extract = require('./extract');
const pack = currify(require('./pack'));
const getValue = require('./get-value');

const connectionWraped = wraptile(connection);
const wrongOperation = currify(_wrongOperation);

const id = fullstore(0);
const inc = (a) => a(a() + 1);

module.exports = listen;

function check(auth) {
    if (auth && typeof auth !== 'function')
        throw Error('auth should be function!');
}

function listen(socket, options) {
    options = options || {};
    
    const {auth} = options;
    const prefix = options.prefix || '/fileop';
    const root = options.root || '/';
    
    check(auth);
    
    socket.of(prefix)
        .on('connection', (socket) => {
            if (!auth)
                return connection(root, socket);
            
            const reject = () => socket.emit('reject');
            socket.on('auth', auth(connectionWraped(root, socket), reject));
        });
}

function connection(rootRaw, socket) {
    socket.emit('accept');
    socket.on('operation', (name, from, to, files) => {
        socket.emit('id', inc(id));
        
        socket.once(`${id()}#start`, () => {
            socket.emit(`${id()}started`);
            
            const operation = getOperation(name);
            const root = getValue(rootRaw);
            
            operation(id(), root, socket, from, to, files);
        });
    });
}

function getOperation(name) {
    if (name === 'remove')
        return operate('remove');
    
    if (name === 'extract')
        return extract;
    
    if (name === 'copy')
        return operate('copy');
    
    if (name === 'move')
        return operate('move');
    
    if (name === 'tar')
        return pack('tar');
    
    if (name === 'zip')
        return pack('zip');
    
    return wrongOperation(name);
}

function _wrongOperation(name, id, root, socket) {
    socket.emit(`${id}#err`, `Wrong operation: "${name}"`);
}

