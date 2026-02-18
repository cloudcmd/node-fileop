'use strict';

const {once} = require('node:events');

const {test} = require('supertape');
const {tryToCatch} = require('try-to-catch');

const connect = require('../lib/connect');

test('fileop: options: prefix', async (t) => {
    const prefix = '/hello';
    const {done} = await connect({
        prefix,
    });
    
    done();
    
    t.pass('connected with prefix');
    t.end();
});

test('fileop: options: empty object', async (t) => {
    const {done} = await connect({});
    
    done();
    
    t.pass('connect with empty options');
    t.end();
});

test('fileop: options: auth not function', async (t) => {
    const auth = {};
    const [error] = await tryToCatch(connect, {
        auth,
    });
    
    t.equal(error.message, 'auth should be function!', 'should throw when auth not function');
    t.end();
});

test('fileop: options: auth: reject', async (t) => {
    const auth = (accept, reject) => reject;
    
    const {socket, done} = await connect({
        auth,
    });
    
    socket.emit('auth');
    await once(socket, 'reject');
    
    done();
    
    t.pass('should reject');
    t.end();
});

test('fileop: options: auth: accept', async (t) => {
    const auth = (accept) => accept;
    
    const {socket, done} = await connect({
        auth,
    });
    
    socket.emit('auth', 'hello', 'world');
    
    await once(socket, 'accept');
    done();
    
    t.pass('should accept');
    t.end();
});

test('fileop: listen: wrong operation', async (t) => {
    const {socket, done} = await connect();
    
    socket.emit('operation', 'something');
    
    const [id] = await once(socket, 'id');
    socket.emit(`${id}#start`);
    
    const [e] = await once(socket, `${id}#err`);
    done();
    
    const expected = `Wrong operation: "something"`;
    
    t.equal(e, expected, 'should emit error');
    t.end();
});
