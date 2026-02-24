'use strict';

const {once} = require('node:events');
const {test, stub} = require('supertape');

const {
    endEmitter,
    errorEmitter,
    progressEmitter,
    fileEmitter,
    customEmitter,
} = require('../lib/emitters');

const connect = require('../lib/connect');

const connectPath = '../lib/connect';

test('operate: copy: error', async (t) => {
    const from = '/hello';
    const to = '/world';
    const names = ['abc'];
    
    const {socket, done} = await connect({
        copymitter: errorEmitter,
    });
    
    const error = 'EACCES: /hello/abc';
    
    socket.emit('operation', 'copy', from, to, names);
    const [id] = await once(socket, 'id');
    
    socket.emit(`${id}#start`);
    const [e] = await once(socket, `${id}#error`);
    
    done();
    
    t.equal(e, error, 'should emit error');
    t.end();
});

test('operate: copy: file', async (t) => {
    const from = '/hello';
    const to = '/world';
    const names = ['abc'];
    const root = '/';
    
    const {socket, done} = await connect({
        root,
        copymitter: fileEmitter,
    });
    
    socket.emit('operation', 'copy', from, to, names);
    const [id] = await once(socket, 'id');
    
    socket.emit(`${id}#start`);
    const [name] = await once(socket, `${id}#file`);
    
    done();
    
    t.equal(name, 'abc');
    t.end();
});

test('operate: copy: progress', async (t) => {
    const from = '/hello';
    const to = '/world';
    const names = ['abc'];
    
    const root = '/';
    
    const {socket, done} = await connect({
        root,
        copymitter: progressEmitter,
    });
    
    socket.emit('operation', 'copy', from, to, names);
    const [id] = await once(socket, 'id');
    
    socket.emit(`${id}#start`);
    const [n] = await once(socket, `${id}#progress`);
    
    done();
    
    t.equal(n, 100);
    t.end();
});

test('operate: copy: end', async (t) => {
    const from = '/hello';
    const to = '/world';
    const names = ['abc'];
    
    const root = '/';
    
    const {socket, done} = await connect({
        root,
        copymitter: endEmitter,
    });
    
    socket.emit('operation', 'copy', from, to, names);
    const [id] = await once(socket, 'id');
    
    socket.emit(`${id}#start`);
    await once(socket, `${id}#end`);
    done();
    
    t.pass('should emit end');
    t.end();
});

test('operate: copy: abort', async (t) => {
    const from = '/hello';
    const to = '/world';
    const names = ['abc'];
    
    const connect = require(connectPath);
    const root = '/';
    
    const {socket, done} = await connect({
        root,
        copymitter: errorEmitter,
    });
    
    socket.emit('operation', 'copy', from, to, names);
    const [id] = await once(socket, 'id');
    
    socket.emit(`${id}#start`);
    await once(socket, `${id}#error`);
    socket.emit(`${id}#abort`);
    await once(socket, `${id}#end`);
    done();
    
    t.pass('should emit abort');
    t.end();
});

test('operate: copy: continue', async (t) => {
    const from = '/';
    const to = '/world';
    const names = ['abc'];
    
    const {socket, done} = await connect({
        copymitter: errorEmitter,
    });
    
    socket.emit('operation', 'copy', from, to, names);
    const [id] = await once(socket, 'id');
    
    socket.emit(`${id}#start`);
    await once(socket, `${id}#error`);
    socket.emit(`${id}#continue`);
    await once(socket, `${id}#end`);
    done();
    
    t.pass('should emit continue');
    t.end();
});

test('operate: copy: pause', async (t) => {
    const from = '/';
    const to = '/world';
    const names = ['abc'];
    
    const pause = stub();
    const copymitter = customEmitter({
        pause,
        continue: stub(),
    });
    
    const {socket, done} = await connect({
        copymitter,
    });
    
    socket.emit('operation', 'copy', from, to, names);
    
    const [id] = await once(socket, 'id');
    
    socket.emit(`${id}#start`);
    socket.emit(`${id}#pause`);
    socket.emit(`${id}#continue`);
    
    await once(socket, `${id}#end`);
    
    done();
    
    t.calledWithNoArgs(pause);
    t.end();
});

test('operate: copy: error: root', async (t) => {
    const from = '/hello';
    const to = '/world';
    const names = ['abc'];
    const success = stub().returns(true);
    const isRootWin32 = stub().returns(success);
    
    const {socket, done} = await connect({
        isRootWin32,
    });
    
    socket.emit('operation', 'copy', from, to, names);
    const [id] = await once(socket, 'id');
    
    socket.emit(`${id}#start`);
    const error = 'Could not copy from/to root on windows!';
    const [e] = await once(socket, `${id}#error`);
    
    done();
    
    t.equal(e, error, 'should emit error');
    t.end();
});
