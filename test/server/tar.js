'use strict';

const {once} = require('node:events');

const {test, stub} = require('supertape');

const {errorEmitter} = require('../lib/emitters');

const connect = require('../lib/connect');

test('operate: tar: error', async (t) => {
    const from = '/hello';
    const to = '/world';
    const names = ['abc'];
    
    const {socket, done} = await connect({
        pack: errorEmitter,
    });
    
    socket.emit('operation', 'tar', from, to, names);
    const [id] = await once(socket, 'id');
    
    socket.emit(`${id}#start`);
    const [e] = await once(socket, `${id}#error`);
    
    done();
    
    const error = 'EACCES: /hello/abc';
    
    t.equal(e, error, 'should emit error');
    t.end();
});

test('operate: tar: error: root', async (t) => {
    const from = '/hello';
    const to = '/world';
    const names = ['abc'];
    const truth = stub().returns(true);
    const isRootWin32 = stub().returns(truth);
    
    const {socket, done} = await connect({
        isRootWin32,
    });
    
    socket.emit('operation', 'tar', from, to, names);
    const [id] = await once(socket, 'id');
    
    socket.emit(`${id}#start`);
    const [e] = await once(socket, `${id}#error`);
    
    done();
    
    const error = 'Could not pack from/to root on windows!';
    
    t.equal(e, error, 'should emit error');
    t.end();
});
