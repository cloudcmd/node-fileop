'use strict';

const test = require('tape');
const mock = require('mock-require');
const clear = require('clear-module');

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
    socket.on('id', (id) => {
        socket.on(`${id}#error`, (e) => {
            t.equal(e, error, 'should emit error');
            done();
            t.end();
        });
        
        socket.emit(`${id}#start`);
    });
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
    socket.on('id', (id) => {
        socket.on(`${id}#progress`, (n) => {
            done();
            
            t.equal(n, 100, 'should equal');
            t.end();
        });
        
        socket.emit(`${id}#start`);
    });
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
    socket.on('id', (id) => {
        socket.on(`${id}#file`, (name) => {
            done();
            
            t.equal(name, 'current', 'should equal');
            t.end();
        });
        
        socket.emit(`${id}#start`);
    });
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
    socket.on('id', (id) => {
        socket.on(`${id}#end`, () => {
            t.pass('should emit end');
            done();
            t.end();
        });
        
        socket.emit(`${id}#start`);
    });
});

test('operate: extract: error: root', async (t) => {
    clearFileop();
    clear(isRootPath);
    
    const from = '/hello';
    const to = '/world';
    const names = [
        'abc'
    ];
    
    const truth = () => true;
    Object.defineProperty(truth, 'length', {
        value: 2
    });
    
    const isRoot = require(isRootPath);
    mock(isRootPath, truth);
    
    const connect = require(connectPath);
    mock(isRootPath, isRoot);
    
    const {socket, done} = await connect();
    
    socket.emit('operation', 'extract', from, to, names);
    socket.on('id', (id) => {
        const error = 'Could not extract from root on windows!';
        
        socket.on(`${id}#error`, (e) => {
            t.equal(e, error, 'should emit error');
            done();
            clear(isRootPath);
            t.end();
        });
       
        socket.emit(`${id}#start`);
    });
});

