'use strict';

const {once} = require('node:events');

const {test, stub} = require('supertape');

const wait = require('@iocmd/wait');

const {
    rawErrorEmitter,
    progressEmitter,
    fileEmitter,
    endEmitter,
} = require('../lib/emitters');

const connect = require('../lib/connect');
const connectPath = '../lib/connect';

test('operate: extract: error', async (t) => {
    const {socket, done} = await connect({
        inly: rawErrorEmitter,
    });
    
    const error = 'EACCES: /hello/abc';
    const from = '/hello/abc';
    const to = '/world/abc';
    
    socket.emit('operation', 'extract', from, to);
    
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

test('operate: extract: progress', async (t) => {
    const {socket, done} = await connect({
        inly: progressEmitter,
    });
    
    const from = '/hello/abc';
    const to = '/world/abc';
    
    socket.emit('operation', 'extract', from, to);
    
    const emit = socket.emit.bind(socket);
    
    const [id] = await once(socket, 'id');
    const [[n]] = await Promise.all([
        once(socket, `${id}#progress`),
        wait(emit, `${id}#start`),
    ]);
    
    done();
    
    t.equal(n, 100);
    t.end();
});

test('operate: extract: file', async (t) => {
    const connect = require(connectPath);
    
    const {socket, done} = await connect({
        inly: fileEmitter,
    });
    
    const from = '/hello/abc';
    const to = '/world/abc';
    
    socket.emit('operation', 'extract', from, to);
    
    const emit = socket.emit.bind(socket);
    
    const [id] = await once(socket, 'id');
    const [[name]] = await Promise.all([
        once(socket, `${id}#file`),
        wait(emit, `${id}#start`),
    ]);
    
    done();
    
    t.equal(name, 'current');
    t.end();
});

test('operate: extract: end', async (t) => {
    const connect = require(connectPath);
    
    const {socket, done} = await connect({
        inly: endEmitter,
    });
    
    const from = '/hello/abc';
    const to = '/world/abc';
    
    socket.emit('operation', 'extract', from, to);
    const [id] = await once(socket, 'id');
    
    socket.emit(`${id}#start`);
    await once(socket, `${id}#end`);
    
    done();
    
    t.pass('should emit end');
    t.end();
});

test('operate: extract: error: root', async (t) => {
    const from = '/hello';
    const to = '/world';
    const names = ['abc'];
    const truth = stub().returns(true);
    const isRootWin32 = stub().returns(truth);
    
    const {socket, done} = await connect({
        isRootWin32,
    });
    
    socket.emit('operation', 'extract', from, to, names);
    const [id] = await once(socket, 'id');
    
    socket.emit(`${id}#start`);
    const [e] = await once(socket, `${id}#error`);
    
    done();
    
    const error = 'Could not extract from root on windows!';
    
    t.equal(e, error, 'should emit error');
    t.end();
});
