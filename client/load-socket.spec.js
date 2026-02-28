import {test} from 'supertape';
import loadSocket from './load-socket.js';

test('fileop: client: load-socket: no io', async (t) => {
    globalThis.io = 'x';
    const io = await loadSocket();
    delete globalThis.io;

    t.equal(io, 'x');
    t.end();
})
