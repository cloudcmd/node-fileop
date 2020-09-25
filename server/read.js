'use strict';

const readify = require('readify');
const {watch} = require('chokidar');
const tryToCatch = require('try-to-catch');

const mellow = require('mellow');

module.exports = (id, root, socket, path) => {
    path = mellow.pathToWin(path, root);
    operate(id, socket, path);
};

async function operate(id, socket, path) {
    socket.once(`${id}#change-directory`, (path) => {
        operate(id, socket, path);
    });
    
    const [error] = await tryToCatch(Promise.all.bind(Promise), [
        readDirectory(id, socket, path),
        watchDirectory(id, socket, path),
    ]);
    
    if (error)
        return socket.emit(`${id}#error`, error.message);
}

async function readDirectory(id, socket, path) {
    const info = await readify(path);
    socket.emit(`${id}#directory`, info);
}

async function watchDirectory(id, socket, path) {
    const watcher = watch(path, {
        persistent: false
    });
    
    watcher.on('all', async () => {
        const [error, info] = await tryToCatch(readDirectory, id, socket, path);
        
        if (error)
            return socket.emit(`${id}#error`, error.message);
    
        socket.emit(`${id}#directory`, info);
    });
}

