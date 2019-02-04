'use strict';

const test = require('supertape');
const mock = require('mock-require');
const clear = require('clear-module');

const {
    endEmitter,
    errorEmitter,
    progressEmitter,
    fileEmitter,
} = require('../lib/emitters');

const clearFileop = require('../lib/clear');

const connectPath = '../lib/connect';
const copyPath = 'copymitter';
const isRootPath = '../../server/is-root-win32';

test('operate: copy: error', async (t) => {
    clearFileop();
    clear(copyPath);
    
    const from = '/hello';
    const to = '/world';
    const names = [
        'abc',
    ];
    
    mock(copyPath, errorEmitter);
    
    const connect = require(connectPath);
    const {socket, done} = await connect();
    
    const error = 'EACCES: /hello/abc';
    
    socket.emit('operation', 'copy', from, to, names);
    socket.on('id', (id) => {
        socket.emit(`${id}#start`);
        socket.on(`${id}#error`, (e) => {
            t.equal(e, error, 'should emit error');
            done();
            t.end();
        });
    });
});

test('operate: copy: file', async (t) => {
    clearFileop();
    clear(copyPath);
    
    const from = '/hello';
    const to = '/world';
    const names = [
        'abc',
    ];
    
    mock(copyPath, fileEmitter);
    const connect = require(connectPath);
    
    const root = '/';
    const {socket, done} = await connect({root});
    
    socket.emit('operation', 'copy', from, to, names);
    socket.on('id', (id) => {
        socket.emit(`${id}#start`);
        socket.on(`${id}#file`, (name) => {
            t.equal(name, 'abc', 'should equal');
            done();
            t.end();
        });
    });
});

test('operate: copy: progress', async (t) => {
    clearFileop();
    clear(copyPath);
    
    const from = '/hello';
    const to = '/world';
    const names = [
        'abc',
    ];
    
    mock(copyPath, progressEmitter);
    const connect = require(connectPath);
    
    const root = '/';
    const {socket, done} = await connect({root});
    
    socket.emit('operation', 'copy', from, to, names);
    socket.on('id', (id) => {
        socket.emit(`${id}#start`);
        socket.on(`${id}#progress`, (n) => {
            t.equal(n, 100, 'should equal');
            done();
            t.end();
        });
    });
});

test('operate: copy: end', async (t) => {
    clearFileop();
    clear(copyPath);
    
    const from = '/hello';
    const to = '/world';
    const names = [
        'abc',
    ];
    
    mock(copyPath, endEmitter);
    const connect = require(connectPath);
    
    const root = '/';
    const {socket, done} = await connect({root});
    
    socket.emit('operation', 'copy', from, to, names);
    socket.on('id', (id) => {
        socket.emit(`${id}#start`);
        socket.on(`${id}#end`, () => {
            t.pass('should emit end');
            done();
            t.end();
        });
    });
});

test('operate: copy: abort', async (t) => {
    clearFileop();
    clear(copyPath);
    
    const from = '/hello';
    const to = '/world';
    const names = [
        'abc',
    ];
    
    mock(copyPath, errorEmitter);
    const connect = require(connectPath);
    
    const root = '/';
    const {socket, done} = await connect({root});
    
    socket.emit('operation', 'copy', from, to, names);
    socket.on('id', (id) => {
        socket.emit(`${id}#start`);
        
        socket.on(`${id}#error`, () => {
            socket.emit(`${id}#abort`);
        });
        
        socket.on(`${id}#end`, () => {
            t.pass('should emit abort');
            done();
            t.end();
        });
    });
});

test('operate: copy: continue', async (t) => {
    clearFileop();
    clear(copyPath);
    
    const from = '/';
    const to = '/world';
    const names = [
        'abc',
    ];
    
    mock(copyPath, errorEmitter);
    const connect = require(connectPath);
    
    const {socket, done} = await connect();
    
    socket.emit('operation', 'copy', from, to, names);
    socket.on('id', (id) => {
        socket.emit(`${id}#start`);
        
        socket.on(`${id}#error`, () => {
            socket.emit(`${id}#continue`);
        });
        
        socket.on(`${id}#end`, () => {
            t.pass('should emit continue');
            done();
            t.end();
        });
    });
});

test('operate: copy: error: root', async (t) => {
    clearFileop();
    clear(isRootPath);
    
    const from = '/hello';
    const to = '/world';
    const names = [
        'abc',
    ];
    
    const truth = () => true;
    Object.defineProperty(truth, 'length', {
        value: 2,
    });
    
    const isRoot = require(isRootPath);
    mock(isRootPath, truth);
    
    const connect = require(connectPath);
    mock(isRootPath, isRoot);
    
    const {socket, done} = await connect();
    
    socket.emit('operation', 'copy', from, to, names);
    socket.on('id', (id) => {
        socket.emit(`${id}#start`);
        
        const error = 'Could not copy from/to root on windows!';
        
        socket.on(`${id}#error`, (e) => {
            done();
            clear(isRootPath);
            
            t.equal(e, error, 'should emit error');
            t.end();
        });
    });
});

