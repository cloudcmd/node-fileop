'use strict';

const {
    once,
    EventEmitter,
} = require('events');

const test = require('supertape');
const wait = require('@iocmd/wait');

const operator = require('../../client/operator');

const {keys} = Object;

test('client: operator: abort', async (t) => {
    const id = 1;
    const socket = new EventEmitter();
    const op = operator(id, socket);
    const errorEvent = `${id}#error`;
    const abortEvent = `${id}#abort`;
    
    const emit = socket.emit.bind(socket);
    const abort = op.abort.bind(op);
    
    await Promise.all([
        wait(emit, errorEvent),
        once(op, 'error'),
    ]);
    
    await Promise.all([
        once(socket, abortEvent),
        wait(abort),
    ]);
    
    t.pass('should abort');
    t.end();
});

test('client: operator: continue', async (t) => {
    const id = 1;
    const socket = new EventEmitter();
    const op = operator(id, socket);
    const errorEvent = `${id}#error`;
    const continueEvent = `${id}#continue`;
    
    const emit = socket.emit.bind(socket);
    op.continue = op.continue.bind(op);
    
    await Promise.all([
        wait(emit, errorEvent),
        once(op, 'error'),
    ]);
    
    await Promise.all([
        once(socket, continueEvent),
        wait(op.continue),
    ]);
    
    t.pass('should continue');
    t.end();
});

test('client: operator: pause', async (t) => {
    const id = 1;
    const socket = new EventEmitter();
    const op = operator(id, socket);
    const pauseEvent = `${id}#pause`;
    
    const pause = op.pause.bind(op);
    await Promise.all([
        once(socket, pauseEvent),
        wait(pause),
    ]);
    
    t.pass('should pause');
    t.end();
});

test('client: operator: progress', async (t) => {
    const id = 1;
    const socket = new EventEmitter();
    const op = operator(id, socket);
    
    const emit = socket.emit.bind(socket);
    
    const [[n]] = await Promise.all([
        once(op, 'progress'),
        wait(emit, `${id}#progress`, 100),
    ]);
    
    t.equal(n, 100);
    t.end();
});

test('client: operator: file', async (t) => {
    const id = 1;
    const socket = new EventEmitter();
    const op = operator(id, socket);
    const emit = socket.emit.bind(socket);
    
    const [[name]] = await Promise.all([
        once(op, `file`),
        wait(emit, `${id}#file`, 'hello'),
    ]);
    
    t.equal(name, 'hello');
    t.end();
});

test('client: operator: end: off listeners', async (t) => {
    const id = 1;
    const socket = new EventEmitter();
    const op = operator(id, socket);
    
    const emit = socket.emit.bind(socket);
    
    const [[name]] = await Promise.all([
        once(op, 'end'),
        wait(emit, `${id}#end`),
    ]);
    
    t.deepEqual(keys(socket._events), [], 'should off listeners');
    t.end();
});

