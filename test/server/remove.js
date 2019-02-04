'use strict';

const test = require('supertape');
const mock = require('mock-require');
const clear = require('clear-module');

const {errorEmitter} = require('../lib/emitters');

const clearFileop = require('../lib/clear');

const connectPath = '../lib/connect';
const removePath = 'remy';

test('operate: remove: error', async (t) => {
    clearFileop();
    clear(removePath);
    
    const from = '/hello';
    const names = [
        'abc',
    ];
    
    mock(removePath, errorEmitter);
    const connect = require(connectPath);
    
    const {socket, done} = await connect();
    
    socket.emit('operation', 'remove', from, names);
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

