'use strict';

const Emitify = require('emitify/legacy');
const getHost = require('./get-host');
const loadSocket = require('./load-socket');
/*eslint no-unused-vars: 0 */
const operator = require('./operator');

const {promisify} = require('es6-promisify');

module.exports = (options, callback) => {
    if (!callback) {
        callback = options;
        options = {};
    }
    
    const prefix = options.prefix || '/fileop';
    const socketPrefix = options.socketPrefix || '';
    
    const socketPath = `${socketPrefix}/socket.io`;
    
    loadSocket((io) => {
        const fileop = new Fileop(io, prefix, socketPath);
        
        callback(null, fileop);
    });
};

class Fileop extends Emitify {
    constructor(io, room, socketPath) {
        super();
         
        const href = getHost();
        const FIVE_SECONDS = 5000;
        
        const socket = io.connect(href + room, {
            'max reconnection attempts' : Math.pow(2, 32),
            'reconnection limit'        : FIVE_SECONDS,
            path: socketPath,
        });
        
        this.#setListeners(socket);
        this.operate = promisify(this.#operate);
        this.socket = socket;
    }
    
    copy(from, to, files) {
        return this.operate('copy', from, to, files);
    }
    
    move(from, to, files) {
        return this.operate('move', from, to, files);
    }
    
    zip(from, to, files) {
        return this.operate('zip', from, to, files);
    }
    
    tar(from, to, files) {
        return this.operate('tar', from, to, files);
    }
    
    extract(from, to) {
        return this.operate('extract', from, to);
    }
    
    remove(from, files) {
        return this.operate('remove', from, files);
    }
    
    /*eslint no-undef: 0 */
    #operate(name, from, to, files, fn = files) {
        const {socket} = this;
        
        socket.emit('operation', name, from, to, files);
        socket.once('id', (id) => {
            fn(null, operator(id, socket));
        });
    }
    
    /*eslint no-undef: 0 */
    #setListeners(socket) {
        this.on('auth', (username, password) => {
            socket.emit('auth', username, password);
        });
        
        socket.on('accept', () => {
            this.emit('accept');
        });
        
        socket.on('reject', () => {
            this.emit('reject');
        });
        
        socket.on('connect', () => {
            this.emit('connect');
        });
        
        socket.on('disconnect', () => {
            this.emit('disconnect');
        });
    }
}

