'use strict';

process.env.NODE_ENV = 'test';

require('babel-register');

const test = require('tape');
const {promisify} = require('es6-promisify');
const socketIO = require('socket.io-client');

const connect = require('../lib/connect');
const fileop = promisify(require('../../client/fileop'));

const getDestroy = ({socket}) => socket.destroy.bind(socket);

function before({origin, host, io = socketIO}) {
    global.window = {
        io
    };
    global.location = {
        origin,
        protocol: 'http:',
        host,
    };
}

function after() {
    delete global.window;
    delete global.location;
    delete global.io;
}

test('client: copy: error', async (t) => {
    const from = '/hello';
    const to = '/world';
    const files = [
        'abc'
    ];
    
    const {done, origin} = await connect();
    
    before({origin});
    
    const operator = await fileop();
    const op = await operator.copy(from, to, files);
    const destroy = getDestroy(op);
    
    op.on('error', (e) => {
        done();
        after();
        destroy();
        
        t.equal(e, 'ENOENT: /hello/abc', 'should equal');
        t.end();
    });
});

test('client: remove: error', async (t) => {
    const from = '/hello';
    const files = [
        'abc'
    ];
    
    const {done, origin} = await connect();
    
    before({origin});
    
    const operator = await fileop();
    const op = await operator.remove(from, files);
    const destroy = getDestroy(op);
    
    op.on('error', (e) => {
        done();
        after();
        destroy();
        
        t.equal(e, 'ENOENT: /hello/abc', 'should equal');
        t.end();
    });
});

test('client: tar: error', async (t) => {
    const from = '/hello';
    const to = '/world';
    const files = [
        'abc'
    ];
    
    const {done, origin} = await connect();
    
    before({origin});
    
    const operator = await fileop();
    const op = await operator.tar(from, to, files);
    const destroy = getDestroy(op);
    
    op.on('error', (e) => {
        done();
        after();
        destroy();
        
        t.equal(e, 'ENOENT: /hello/abc', 'should equal');
        t.end();
    });
});

test('client: zip: error', async (t) => {
    const from = '/hello';
    const to = '/world';
    const files = [
        'abc'
    ];
    
    const {done, origin} = await connect();
    
    before({origin});
    
    const operator = await fileop();
    const op = await operator.zip(from, to, files);
    const destroy = getDestroy(op);
    
    op.on('error', (e) => {
        destroy();
        done();
        after();
        
        t.equal(e, 'ENOENT: /hello/abc', 'should equal');
        t.end();
    });
});

test('client: extract: error', async (t) => {
    const from = '/hello';
    const to = '/world';
    
    const {done, origin} = await connect();
    
    before({origin});
    
    const operator = await fileop();
    const op = await operator.extract(from, to);
    const destroy = getDestroy(op);
    
    op.on('error', (e) => {
        done();
        after();
        destroy();
        
        const expected = 'Not supported archive type: ""';
        t.equal(e, expected, 'should equal');
        t.end();
    });
});

test('client: dynamic load socket.io', async (t) => {
    const from = '/hello';
    const to = '/world';
    const {done, origin} = await connect();
    
    const io = null;
    before({origin, io});
    
    const operator = await fileop();
    const op = await operator.extract(from, to);
    const destroy = getDestroy(op);
    
    op.on('error', (e) => {
        done();
        after();
        destroy();
        
        const expected = 'Not supported archive type: ""';
        t.equal(e, expected, 'should equal');
        t.end();
    });
});

test('client: get-host: no origin', async (t) => {
    const from = '/hello';
    const to = '/world';
    const {done, host} = await connect();
    
    before({host});
    
    const operator = await fileop();
    const op = await operator.extract(from, to);
    const destroy = getDestroy(op);
    
    op.on('error', (e) => {
        done();
        after();
        destroy();
        
        const expected = 'Not supported archive type: ""';
        t.equal(e, expected, 'should equal');
        t.end();
    });
});

test('client: disconnect', async (t) => {
    const from = '/hello';
    const to = '/world';
    const files = [
        'abc'
    ];
    
    const {done, origin} = await connect();
    
    const io = null;
    before({io, origin});
    
    const operator = await fileop();
    const op = await operator.zip(from, to, files);
    const destroy = getDestroy(op);
    
    done();
    
    op.on('error', (e) => {
        t.equal(e, 'ENOENT: /hello/abc', 'should equal');
    });
    
    operator.on('disconnect', () => {
        after();
        destroy();
        t.pass('should disconnect');
        
        t.end();
    });
});

test('client: auth', async (t) => {
    const authCheck = (username, password, accept, reject) => {
        reject();
    };
    
    const {done, origin} = await connect({authCheck});
    
    before({origin});
    
    const operator = await fileop();
    const destroy = getDestroy(operator);
    
    operator.emit('auth');
    operator.on('reject', () => {
        after();
        done();
        destroy();
        
        t.pass('shoud reject');
        t.end();
    });
});

test('client: options', async (t) => {
    const authCheck = (username, password, accept, reject) => {
        reject();
    };
    
    const prefix = '/hello';
    const {done, origin} = await connect({
        prefix,
        authCheck,
    });
    
    before({origin});
    
    const operator = await fileop({prefix});
    const destroy = getDestroy(operator);
    
    operator.emit('auth');
    operator.on('reject', () => {
        after();
        done();
        destroy();
        
        t.pass('shoud reject');
        t.end();
    });
});
