'use strict';

const {once} = require('events');

const test = require('supertape');
const mock = require('mock-require');
const clear = require('clear-module');
const wait = require('@iocmd/wait');

const clearFileop = require('../lib/clear');

const {
    rawErrorEmitter,
    progressEmitter,
    fileEmitter,
    endEmitter,
} = require('../lib/emitters');

const connectPath = '../lib/connect';
const extractPath = 'inly';
const isRootPath = '../../server/is-root-win32';

test('operate: extract: error', async (t) => {
    clearFileop();
    clear(extractPath);
    mock(extractPath, rawErrorEmitter);
    const connect = require(connectPath);
    
    const {socket, done} = await connect();
    
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
    clearFileop();
    clear(extractPath);
    mock(extractPath, progressEmitter);
    
    const connect = require(connectPath);
    
    const {socket, done} = await connect();
    
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
    clearFileop();
    clear(extractPath);
    mock(extractPath, fileEmitter);
    
    const connect = require(connectPath);
    
    const {socket, done} = await connect();
    
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
    clearFileop();
    clear(extractPath);
    mock(extractPath, endEmitter);
    
    const connect = require(connectPath);
    
    const {socket, done} = await connect();
    
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
    clearFileop();
    clear(isRootPath);
    
    const from = '/hello';
    const to = '/world';
    const names = ['abc'];
    const truth = () => true;
    
    Object.defineProperty(truth, 'length', {
        value: 2,
    });
    
    const isRoot = require(isRootPath);
    mock(isRootPath, truth);
    
    const connect = require(connectPath);
    
    mock(isRootPath, isRoot);
    
    const {socket, done} = await connect();
    
    socket.emit('operation', 'extract', from, to, names);
    const [id] = await once(socket, 'id');
    
    socket.emit(`${id}#start`);
    const [e] = await once(socket, `${id}#error`);
    
    done();
    clear(isRootPath);
    
    const error = 'Could not extract from root on windows!';
    
    t.equal(e, error, 'should emit error');
    t.end();
});
