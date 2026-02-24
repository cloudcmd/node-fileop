'use strict';

const currify = require('currify');
const wraptile = require('wraptile');
const {fullstore} = require('fullstore');

const operate = require('./operate');
const extract = require('./extract');
const getValue = require('./get-value');
const isFn = (a) => typeof a === 'function';
const pack = currify(require('./pack'));

const connectionWrapped = wraptile(connection);
const wrongOperation = currify(_wrongOperation);

const id = fullstore(0);
const inc = (a) => a(a() + 1);

module.exports = listen;

function check(auth) {
    if (auth && !isFn(auth))
        throw Error('auth should be function!');
}

function listen(socket, options) {
    options = options || {};
    
    const {
        auth,
        prefix = '/fileop',
        root = '/',
        ...overrides
    } = options;
    
    check(auth);
    
    socket
        .of(prefix)
        .on('connection', (socket) => {
            if (!auth)
                return connection(root, socket, overrides);
            
            const reject = () => socket.emit('reject');
            const onConnect = connectionWrapped(root, socket, overrides);
            
            const onAuth = auth(onConnect, reject);
            
            socket.on('auth', onAuth);
        });
}

function connection(rootRaw, socket, overrides) {
    socket.emit('accept');
    socket.on('operation', (name, from, to, files) => {
        socket.emit('id', inc(id));
        
        socket.once(`${id()}#start`, () => {
            socket.emit(`${id()}started`);
            
            const operation = getOperation(name, overrides);
            
            const root = getValue(rootRaw);
            
            operation(id(), root, socket, from, to, files);
        });
    });
}

function getOperation(name, overrides = {}) {
    if (name === 'remove')
        return operate('remove', overrides);
    
    if (name === 'extract')
        return extract;
    
    if (name === 'copy')
        return operate('copy', overrides);
    
    if (name === 'move')
        return operate('move', overrides);
    
    if (name === 'tar')
        return pack('tar');
    
    if (name === 'zip')
        return pack('zip');
    
    return wrongOperation(name);
}

function _wrongOperation(name, id, root, socket) {
    socket.emit(`${id}#err`, `Wrong operation: "${name}"`);
}
