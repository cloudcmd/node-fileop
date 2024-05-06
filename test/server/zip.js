'use strict';

const {once} = require('node:events');

const test = require('supertape');
const mock = require('mock-require');
const clear = require('clear-module');
const wait = require('@iocmd/wait');

const clearFileop = require('../lib/clear');

const {
    endEmitter,
    errorEmitter,
    progressEmitter,
    fileEmitter,
} = require('../lib/emitters');

const connectPath = '../lib/connect';
const zipPath = 'onezip';

test('operate: zip: error', async (t) => {
    clearFileop();
    clear(zipPath);
    
    const from = '/hello';
    const to = '/world';
    const names = ['abc'];
    
    mock(zipPath, {
        pack: errorEmitter,
    });
    
    const connect = require(connectPath);
    
    const {socket, done} = await connect();
    
    socket.emit('operation', 'zip', from, to, names);
    const [id] = await once(socket, 'id');
    
    socket.emit(`${id}#start`);
    const [e] = await once(socket, `${id}#error`);
    
    done();
    
    const error = 'EACCES: /hello/abc';
    
    t.equal(e, error, 'should emit error');
    t.end();
});

test('operate: zip: progress', async (t) => {
    clearFileop();
    clear(zipPath);
    
    const from = '/hello';
    const to = '/world';
    const names = ['abc'];
    
    mock(zipPath, {
        pack: progressEmitter,
    });
    
    const connect = require(connectPath);
    
    const {socket, done} = await connect();
    
    socket.emit('operation', 'zip', from, to, names);
    const [id] = await once(socket, 'id');
    
    socket.emit(`${id}#start`);
    const [percent] = await once(socket, `${id}#progress`);
    
    done();
    
    t.equal(percent, 100);
    t.end();
});

test('operate: zip: file', async (t) => {
    clearFileop();
    clear(zipPath);
    
    const from = '/hello';
    const to = '/world';
    const names = ['abc'];
    
    mock(zipPath, {
        pack: fileEmitter,
    });
    
    const connect = require(connectPath);
    
    const {socket, done} = await connect();
    
    socket.emit('operation', 'zip', from, to, names);
    const [id] = await once(socket, 'id');
    
    socket.emit(`${id}#start`);
    const [name] = await once(socket, `${id}#file`);
    
    done();
    
    t.equal(name, 'abc');
    t.end();
});

test('operate: zip: end', async (t) => {
    clearFileop();
    clear(zipPath);
    
    const from = '/hello';
    const to = '/world';
    const names = ['abc'];
    
    mock(zipPath, {
        pack: endEmitter,
    });
    
    const connect = require(connectPath);
    
    const {socket, done} = await connect();
    
    socket.emit('operation', 'zip', from, to, names);
    const [id] = await once(socket, 'id');
    
    socket.emit(`${id}#start`);
    await once(socket, `${id}#end`);
    
    done();
    
    t.pass('should emit end');
    t.end();
});

test('operate: zip: abort', async (t) => {
    clearFileop();
    clear(zipPath);
    
    const from = '/hello';
    const to = '/world';
    const names = ['abc'];
    
    mock(zipPath, {
        pack: errorEmitter,
    });
    
    const connect = require(connectPath);
    
    const {socket, done} = await connect();
    
    socket.emit('operation', 'zip', from, to, names);
    const [id] = await once(socket, 'id');
    
    const emit = socket.emit.bind(socket);
    
    await Promise.all([
        wait(500, emit, `${id}#start`),
        wait(1000, emit, `${id}#abort`),
        once(socket, `${id}#end`),
    ]);
    
    done();
    
    t.pass('should emit end');
    t.end();
});
