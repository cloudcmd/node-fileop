'use strict';

const {once} = require('events');

const {test, stub} = require('supertape');
const mock = require('mock-require');
const clear = require('clear-module');

const {
    endEmitter,
    errorEmitter,
    progressEmitter,
    fileEmitter,
    customEmitter,
} = require('../lib/emitters');

const clearFileop = require('../lib/clear');

const connectPath = '../lib/connect';
const copyPath = 'copymitter';
const isRootPath = '../../server/is-root-win32';

test('operate: copy: error', async (t) => {
    clearFileop();
    clear(copyPath);
    const from = '/hello';
    const to = '/world';
    const names = ['abc'];
    mock(copyPath, errorEmitter);
    const connect = require(connectPath);
    
    const {
        socket,
        done,
    } = await connect();
    
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
    clearFileop();
    clear(copyPath);
    const from = '/hello';
    const to = '/world';
    const names = ['abc'];
    mock(copyPath, fileEmitter);
    const connect = require(connectPath);
    const root = '/';
    
    const {
        socket,
        done,
    } = await connect({
        root,
    });
    
    socket.emit('operation', 'copy', from, to, names);
    const [id] = await once(socket, 'id');
    socket.emit(`${id}#start`);
    const [name] = await once(socket, `${id}#file`);
    done();
    t.equal(name, 'abc', 'should equal');
    t.end();
});

test('operate: copy: progress', async (t) => {
    clearFileop();
    clear(copyPath);
    const from = '/hello';
    const to = '/world';
    const names = ['abc'];
    mock(copyPath, progressEmitter);
    const connect = require(connectPath);
    const root = '/';
    
    const {
        socket,
        done,
    } = await connect({
        root,
    });
    
    socket.emit('operation', 'copy', from, to, names);
    const [id] = await once(socket, 'id');
    socket.emit(`${id}#start`);
    const [n] = await once(socket, `${id}#progress`);
    t.equal(n, 100, 'should equal');
    done();
    t.end();
});

test('operate: copy: end', async (t) => {
    clearFileop();
    clear(copyPath);
    const from = '/hello';
    const to = '/world';
    const names = ['abc'];
    mock(copyPath, endEmitter);
    const connect = require(connectPath);
    const root = '/';
    
    const {
        socket,
        done,
    } = await connect({
        root,
    });
    
    socket.emit('operation', 'copy', from, to, names);
    const [id] = await once(socket, 'id');
    socket.emit(`${id}#start`);
    await once(socket, `${id}#end`);
    t.pass('should emit end');
    done();
    t.end();
});

test('operate: copy: abort', async (t) => {
    clearFileop();
    clear(copyPath);
    const from = '/hello';
    const to = '/world';
    const names = ['abc'];
    mock(copyPath, errorEmitter);
    const connect = require(connectPath);
    const root = '/';
    
    const {
        socket,
        done,
    } = await connect({
        root,
    });
    
    socket.emit('operation', 'copy', from, to, names);
    const [id] = await once(socket, 'id');
    socket.emit(`${id}#start`);
    await once(socket, `${id}#error`);
    socket.emit(`${id}#abort`);
    await once(socket, `${id}#end`);
    t.pass('should emit abort');
    done();
    t.end();
});

test('operate: copy: continue', async (t) => {
    clearFileop();
    clear(copyPath);
    const from = '/';
    const to = '/world';
    const names = ['abc'];
    mock(copyPath, errorEmitter);
    const connect = require(connectPath);
    
    const {
        socket,
        done,
    } = await connect();
    
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
    clearFileop();
    clear(copyPath);
    
    const from = '/';
    const to = '/world';
    const names = ['abc'];
    
    const pause = stub();
    mock(copyPath, customEmitter({
        pause,
        continue: stub(),
    }));
    
    const connect = require(connectPath);
    
    const {
        socket,
        done,
    } = await connect();
    
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
    clearFileop();
    clear(isRootPath);
    
    const from = '/hello';
    const to = '/world';
    const names = ['abc'];
    const truth = () => true;
    
    Object.defineProperty(truth, 'length', {
        value: 2,
    });
    
    const isRoot = require(isRootPath);
    mock(isRootPath, truth);
    
    const connect = require(connectPath);
    mock(isRootPath, isRoot);
    
    const {
        socket,
        done,
    } = await connect();
    
    socket.emit('operation', 'copy', from, to, names);
    const [id] = await once(socket, 'id');
    
    socket.emit(`${id}#start`);
    const error = 'Could not copy from/to root on windows!';
    const [e] = await once(socket, `${id}#error`);
    done();
    clear(isRootPath);
    
    t.equal(e, error, 'should emit error');
    t.end();
});

