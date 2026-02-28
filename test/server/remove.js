import {once} from 'node:events';
import {test} from 'supertape';
import wait from '@iocmd/wait';
import {errorEmitter, abortEmitter} from '../lib/emitters.js';
import connect from '../lib/connect.js';

test('operate: remove: error', async (t) => {
    const from = '/hello';
    const names = ['abc'];
    
    const {socket, done} = await connect({
        remy: errorEmitter,
    });
    
    socket.emit('operation', 'remove', from, names);
    const [id] = await once(socket, 'id');
    
    socket.emit(`${id}#start`);
    
    const [e] = await once(socket, `${id}#error`);
    
    done();
    
    const error = 'EACCES: /hello/abc';
    
    t.equal(e, error, 'should emit error');
    t.end();
});

test('operate: remove: abort', async (t) => {
    const from = '/hello';
    const names = ['abc'];
    
    const {socket, done} = await connect({
        remy: abortEmitter,
    });
    
    socket.emit('operation', 'remove', from, names);
    const [id] = await once(socket, 'id');
    
    socket.emit(`${id}#start`);
    const emit = socket.emit.bind(socket);
    
    await Promise.all([
        once(socket, `${id}#end`),
        wait(emit, `${id}#abort`),
    ]);
    
    done();
    
    t.pass('abort');
    t.end();
});
