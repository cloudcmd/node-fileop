import http from 'node:http';
import express from 'express';
import {Server} from 'socket.io';
import ioClient from 'socket.io-client';
import {promisify} from 'es6-promisify';
import {fileop} from '../../server/index.js';

export default promisify(connect);

const getPrefix = (a) => a?.prefix;

function connect(config, callback) {
    const {options, fn} = whenNoFn(config, callback);
    const app = express();
    const server = http.createServer(app);
    
    app.use(fileop(options));
    fileop.listen(new Server(server), options);
    
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
