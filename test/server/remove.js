'use strict';

const {once} = require('events');

const test = require('supertape');
const mock = require('mock-require');
const clear = require('clear-module');
const wait = require('@iocmd/wait');

const {errorEmitter, abortEmitter} = require('../lib/emitters');

const clearFileop = require('../lib/clear');

const connectPath = '../lib/connect';
const removePath = 'remy';

test('operate: remove: error', async (t) => {
    clearFileop();
    clear(removePath);
    
    const from = '/hello';
    const names = ['abc'];
    
    mock(removePath, errorEmitter);
    const connect = require(connectPath);
    
    const {
        socket,
        done,
    } = await connect();
    
    socket.emit('operation', 'remove', from, names);
    const [id] = await once(socket, 'id');
    
    socket.emit(`${id}#start`);
    
    const [e] = await once(socket, `${id}#error`);
    
    done();
    
    const error = 'EACCES: /hello/abc';
    
    t.equal(e, error, 'should emit error');
    t.end();
});

test('operate: remove: abort', async (t) => {
    clearFileop();
    clear(removePath);
    
    const from = '/hello';
    const names = ['abc'];
    
    mock(removePath, abortEmitter);
    const connect = require(connectPath);
    
    const {
        socket,
        done,
    } = await connect();
    
    socket.emit('operation', 'remove', from, names);
    const [id] = await once(socket, 'id');
    
    socket.emit(`${id}#start`);
    const emit = socket.emit.bind(socket);
    
    await Promise.all([
        once(socket, `${id}#end`),
        wait(emit, `${id}#abort`),
    ]);
    
    done();
    
    t.pass('abort');
    t.end();
});
