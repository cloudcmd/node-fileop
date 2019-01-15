'use strict';

const test = require('supertape');
const operator = require('../../client/operator');
const {EventEmitter} = require('events');

test('client: operator: abort', (t) => {
    const id = 1;
    const socket = new EventEmitter();
    const op = operator(id, socket);
    
    const errorEvent = `${id}#error`;
    const abortEvent = `${id}#abort`;
    
    op.on('error', () => {
        op.abort();
    });
    
    socket.on(abortEvent, () => {
        t.pass('should abort');
        t.end();
    });
    
    socket.emit(errorEvent);
});

test('client: operator: continue', (t) => {
    const id = 1;
    const socket = new EventEmitter();
    const op = operator(id, socket);
    
    const errorEvent = `${id}#error`;
    const continueEvent = `${id}#continue`;
    
    op.on('error', () => {
        op.continue();
    });
    
    socket.on(continueEvent, () => {
        t.pass('should continue');
        t.end();
    });
    
    socket.emit(errorEvent);
});

test('client: operator: pause', (t) => {
    const id = 1;
    const socket = new EventEmitter();
    const op = operator(id, socket);
    
    const pauseEvent = `${id}#pause`;
    
    socket.on(pauseEvent, () => {
        t.pass('should pause');
        t.end();
    });
    
    op.pause();
});

test('client: operator: progress', (t) => {
    const id = 1;
    const socket = new EventEmitter();
    const op = operator(id, socket);
    
    op.on('progress', (n) => {
        t.equal(n, 100, 'should equal');
        t.end();
    });
    
    socket.emit(`${id}#progress`, 100);
});

test('client: operator: file', (t) => {
    const id = 1;
    const socket = new EventEmitter();
    const op = operator(id, socket);
    
    op.on('file', (name) => {
        t.equal(name, 'hello', 'should equal');
        t.end();
    });
    
    socket.emit(`${id}#file`, 'hello');
});

test('client: operator: end', (t) => {
    const id = 1;
    const socket = new EventEmitter();
    const op = operator(id, socket);
    
    op.on('end', () => {
        t.end();
    });
    
    socket.emit(`${id}#end`);
});

test('client: operator: end: off listeners', (t) => {
    const id = 1;
    const socket = new EventEmitter();
    const op = operator(id, socket);
    
    op.on('end', () => {
        t.deepEqual(socket._events, {}, 'should off listeners');
        t.end();
    });
    
    socket.emit(`${id}#end`);
});
