'use strict';

const test = require('supertape');
const mock = require('mock-require');
const clear = require('clear-module');

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
    const names = [
        'abc',
    ];
    
    mock(zipPath, {
        pack: errorEmitter,
    });
    
    const connect = require(connectPath);
    const {socket, done} = await connect();
    
    socket.emit('operation', 'zip', from, to, names);
    socket.on('id', (id) => {
        const error = 'EACCES: /hello/abc';
        
        socket.on(`${id}#error`, (e) => {
            done();
            
            t.equal(e, error, 'should emit error');
            t.end();
        });
        
        socket.emit(`${id}#start`);
    });
});

test('operate: zip: progress', async (t) => {
    clearFileop();
    clear(zipPath);
    
    const from = '/hello';
    const to = '/world';
    const names = [
        'abc',
    ];
    
    mock(zipPath, {
        pack: progressEmitter,
    });
    
    const connect = require(connectPath);
    const {socket, done} = await connect();
    
    socket.emit('operation', 'zip', from, to, names);
    socket.on('id', (id) => {
        socket.on(`${id}#progress`, (percent) => {
            done();
            
            t.equal(percent, 100, 'should equal');
            t.end();
        });
        
        socket.emit(`${id}#start`);
    });
});

test('operate: zip: file', async (t) => {
    clearFileop();
    clear(zipPath);
    
    const from = '/hello';
    const to = '/world';
    const names = [
        'abc',
    ];
    
    mock(zipPath, {
        pack: fileEmitter,
    });
    
    const connect = require(connectPath);
    const {socket, done} = await connect();
    
    socket.emit('operation', 'zip', from, to, names);
    socket.on('id', (id) => {
        socket.on(`${id}#file`, (name) => {
            done();
            
            t.equal(name, 'abc', 'should equal');
            t.end();
        });
        
        socket.emit(`${id}#start`);
    });
});

test('operate: zip: end', async (t) => {
    clearFileop();
    clear(zipPath);
    
    const from = '/hello';
    const to = '/world';
    const names = [
        'abc',
    ];
    
    mock(zipPath, {
        pack: endEmitter,
    });
    
    const connect = require(connectPath);
    const {socket, done} = await connect();
    
    socket.emit('operation', 'zip', from, to, names);
    socket.on('id', (id) => {
        socket.on(`${id}#end`, () => {
            done();
            
            t.pass('should emit end');
            t.end();
        });
        
        socket.emit(`${id}#start`);
    });
});

test('operate: zip: abort', async (t) => {
    clearFileop();
    clear(zipPath);
    
    const from = '/hello';
    const to = '/world';
    const names = [
        'abc',
    ];
    
    mock(zipPath, {
        pack: errorEmitter,
    });
    
    const connect = require(connectPath);
    const {socket, done} = await connect();
    
    socket.emit('operation', 'zip', from, to, names);
    socket.on('id', (id) => {
        socket.on(`${id}#error`, () => {
            socket.emit(`${id}#abort`);
        });
        
        socket.on(`${id}#end`, () => {
            done();
            
            t.pass('should emit end');
            t.end();
        });
        
        socket.emit(`${id}#start`);
    });
});

