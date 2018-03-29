'use strict';

const test = require('tape');
const tryToCatch = require('try-to-catch');
const currify = require('currify');

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

test('fileop: options: auth not function', async (t) => {
    const auth = {};
    const [error] = await tryToCatch(connect, {auth});
    
    t.equal(error.message, 'auth should be function!', 'should throw when auth not function');
    t.end();
});

test('fileop: options: auth: reject', async (t) => {
    const auth = (accept, reject) => () => {
        reject();
    };
    
    const {socket, done} = await connect({auth});
    
    socket.emit('auth');
    socket.on('reject', () => {
        done();
        
        t.pass('should reject');
        t.end();
    });
});

test('fileop: options: auth: accept', async (t) => {
    const auth = (accept) => () => {
        accept();
    };
    
    const {socket, done} = await connect({auth});
    
    socket.emit('auth', 'hello', 'world');
    
    socket.on('accept', () => {
        done();
        
        t.pass('should accept');
        t.end();
    });
});

test('fileop: options: auth: accept', async (t) => {
    const user = 'bill';
    const pass = 'world';
    
    const auth = currify((accept, reject, username, password) => {
        done();
        
        t.equal(username, user, 'should pass username');
        t.equal(password, pass, 'should pass password');
        t.end();
    });
    
    const {socket, done} = await connect({auth});
    
    socket.emit('auth', user, pass);
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

