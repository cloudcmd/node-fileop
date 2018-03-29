'use strict';

const test = require('tape');
const tryToCatch = require('try-to-catch');

const connect = require('../lib/connect');

test('fileop: options: prefix', async (t) => {
    const prefix = '/hello';
    const {done} = await connect({prefix});
    
    done();
    
    t.pass('connected with prefix');
    t.end();
});

test('fileop: options: empty object', async (t) => {
    const {done} = await connect({});
    
    done();
    
    t.pass('conect with empty options');
    t.end();
});

test('fileop: options: authCheck not function', async (t) => {
    const authCheck = {};
    const [error] = await tryToCatch(connect, {authCheck});
    
    t.equal(error.message, 'authCheck should be function!', 'should throw when authCheck not function');
    t.end();
});

test('fileop: options: authCheck: reject', async (t) => {
    const authCheck = (username, password, accept, reject) => {
        reject();
    };
    
    const {socket, done} = await connect({authCheck});
    
    socket.emit('auth');
    socket.on('reject', () => {
        done();
        
        t.pass('should reject');
        t.end();
    });
});

test('fileop: options: authCheck: accept', async (t) => {
    const authCheck = (username, password, accept) => {
        accept();
    };
    
    const {socket, done} = await connect({authCheck});
    
    socket.emit('auth', 'hello', 'world');
    
    socket.on('accept', () => {
        done();
        
        t.pass('should accept');
        t.end();
    });
});

test('fileop: listen: wrong operation', async (t) => {
    const {socket, done} = await connect();
    
    socket.emit('operation', 'something');
    socket.on('id', (id) => {
        const expected = `Wrong operation: "something"`;
        
        socket.on(`${id}#err`, (e) => {
            done();
            
            t.equal(e, expected, 'should emit error');
            t.end();
        });
        
        socket.emit(`${id}#start`);
    });
});

