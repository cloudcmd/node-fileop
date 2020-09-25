'use strict';

const {
    once,
    EventEmitter,
} = require('events');

const test = require('supertape');
const mock = require('mock-require');
const clear = require('clear-module');
const wait = require('@iocmd/wait');
const stub = require('@cloudcmd/stub');
const readify = require('readify');

const clearFileop = require('../lib/clear');

const connectPath = '../lib/connect';
const readPath = '../../server/read';

test('operate: read: error', async (t) => {
    clearFileop();
    clear(readPath);
    
    const watch = stub(() => {
        const emitter = new EventEmitter();
        
        process.nextTick(() => {
            emitter.emit('all');
        });
        
        return emitter;
    });
    
    mock('chokidar', {watch});
    
    const connect = require(connectPath);
    
    const {
        socket,
        done,
    } = await connect();
    
    const error = `EACCES: permission denied, scandir '/root'`;
    socket.emit('operation', 'read', '/root');
    
    const emit = socket.emit.bind(socket);
    
    const [id] = await once(socket, 'id');
    const [[e]] = await Promise.all([
        once(socket, `${id}#error`),
        emit(`${id}#start`),
    ]);
    
    done();
    
    t.equal(e, error, 'should emit error');
    t.end();
});

test('operate: read: chokidar', async (t) => {
    clearFileop();
    clear(readPath);
    
    const watch = stub(() => {
        const emitter = new EventEmitter();
        
        process.nextTick(() => {
            emitter.emit('all');
        });
        
        return emitter;
    });
    
    mock('chokidar', {watch});
    
    const connect = require(connectPath);
    
    const {
        socket,
        done,
    } = await connect();
    
    const path = '/';
    socket.emit('operation', 'read', path);
    
    const emit = socket.emit.bind(socket);
    
    const [id] = await once(socket, 'id');
    const [[info]] = await Promise.all([
        once(socket, `${id}#directory`),
        wait(emit, `${id}#start`),
    ]);
    
    done();
    
    const expected = [
        path, {
            persistent: false,
        },
    ];
    
    t.ok(watch.calledWith(...expected));
    t.end();
});

test('operate: read change: directory', async (t) => {
    clearFileop();
    clear(readPath);
    
    const watch = stub(() => {
        const emitter = new EventEmitter();
        
        process.nextTick(() => {
            emitter.emit('all');
        });
        
        return emitter;
    });
    
    mock('chokidar', {watch});
    
    const connect = require(connectPath);
    
    const {
        socket,
        done,
    } = await connect();
    
    const path = '/';
    socket.emit('operation', 'read', path);
    
    const emit = socket.emit.bind(socket);
    const [id] = await once(socket, 'id');
    
    await Promise.all([
        once(socket, `${id}#directory`),
        once(socket, `${id}#directory`),
        wait(emit, `${id}#start`),
        wait(emit, `${id}#change-directory`, '/root'),
    ]);
    
    done();
    
    const expected = [
        '/root', {
            persistent: false,
        },
    ];
    
    t.ok(watch.calledWith(...expected));
    t.end();
});

test('operate: read: chagne-directory: error', async (t) => {
    clearFileop();
    clear(readPath);
    
    const watch = stub(() => {
        const emitter = new EventEmitter();
        
        process.nextTick(() => {
            emitter.emit('all');
        });
        
        return emitter;
    });
    
    mock('chokidar', {watch});
    
    const connect = require(connectPath);
    
    const {
        socket,
        done,
    } = await connect();
    
    const path = '/';
    socket.emit('operation', 'read', path);
    
    const emit = socket.emit.bind(socket);
    
    const [id] = await once(socket, 'id');
    
    await Promise.all([
        once(socket, `${id}#directory`),
        wait(emit, `${id}#start`),
    ]);
    
    const [[error]] = await Promise.all([
        once(socket, `${id}#error`),
        wait(emit, `${id}#change-directory`, '/root'),
    ]);
    
    done();
    
    t.equal(error, 'EACCES: permission denied, scandir \'/root\'');
    t.end();
});

test('operate: read: chagne-directory: info', async (t) => {
    clearFileop();
    clear(readPath);
    
    const watch = stub(() => {
        const emitter = new EventEmitter();
        
        process.nextTick(() => {
            emitter.emit('all');
        });
        
        return emitter;
    });
    
    mock('chokidar', {watch});
    
    const connect = require(connectPath);
    
    const {
        socket,
        done,
    } = await connect();
    
    const path = '/root';
    socket.emit('operation', 'read', path);
    
    const emit = socket.emit.bind(socket);
    
    const [id] = await once(socket, 'id');
    
    await Promise.all([
        once(socket, `${id}#error`),
        wait(emit, `${id}#start`),
    ]);
    
    const [[info]] = await Promise.all([
        once(socket, `${id}#directory`),
        wait(emit, `${id}#change-directory`, '/'),
    ]);
    
    const expected = await readify('/');
    done();
    
    t.deepEqual(info, expected);
    t.end();
});

