'use strict';

const test = require('tape');
const mock = require('mock-require');
const clear = require('clear-module');

const {
    errorEmitter,
} = require('../lib/emitters');

const clearFileop = require('../lib/clear');

const connectPath = '../lib/connect';
const tarPath = 'jaguar';
const isRootPath = '../../server/is-root-win32';

test('operate: tar: error', async (t) => {
    clearFileop();
    clear(tarPath);
    
    const from = '/hello';
    const to = '/world';
    const names = [
        'abc'
    ];
    
    mock(tarPath, {
        pack: errorEmitter
    });
    
    const connect = require(connectPath);
    
    const {socket, done} = await connect();
    
    socket.emit('operation', 'tar', from, to, names);
    socket.on('id', (id) => {
        const error = 'EACCES: /hello/abc';
        
        socket.on(`${id}#error`, (e) => {
            t.equal(e, error, 'should emit error');
            done();
            t.end();
        });
        
        socket.emit(`${id}#start`);
    });
});

test('operate: tar: error: root', async (t) => {
    clearFileop();
    clear(tarPath);
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
    
    socket.emit('operation', 'tar', from, to, names);
    socket.on('id', (id) => {
        const error = 'Could not pack from/to root on windows!';
        
        socket.on(`${id}#error`, (e) => {
            t.equal(e, error, 'should emit error');
            done();
            clear(isRootPath);
            t.end();
        });
        
        socket.emit(`${id}#start`);
    });
});

