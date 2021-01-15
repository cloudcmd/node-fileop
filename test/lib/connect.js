'use strict';

const http = require('http');
const express = require('express');
const io = require('socket.io');
const ioClient = require('socket.io-client');
const {promisify} = require('es6-promisify');

const fileop = require('../..');

module.exports = promisify(connect);
const getPrefix = (a) => a?.prefix;

function connect(config, callback) {
    const {options, fn} = whenNoFn(config, callback);
    const app = express();
    const server = http.createServer(app);
    
    app.use(fileop(options));
    fileop.listen(io(server), options);
    
    const ip = '127.0.0.1';
    const anyPort = 0;
    
    server.listen(anyPort, ip, () => {
        const {port} = server.address();
        const prefix = getPrefix(options) || '/fileop';
        
        const host = `${ip}:${port}`;
        const origin = `http://${host}`;
        const url = `${origin}${prefix}`;
        const socket = ioClient(url);
        
        const done = () => {
            socket.destroy();
            server.close();
        };
        
        socket.on('connect', () => {
            fn(null, {
                url,
                origin,
                host,
                socket,
                done,
            });
        });
    });
}

function whenNoFn(options, fn) {
    if (!fn) {
        fn = options;
        options = null;
    }
    
    return {
        options,
        fn,
    };
}

