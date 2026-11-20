import {once} from 'node:events';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import express from 'express';
import {test} from 'supertape';
import {fileop} from '../../server/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR_ROOT = path.resolve(__dirname, '../..');

const get = (port, url) => new Promise((resolve, reject) => {
    http
        .get({host: '127.0.0.1', port, path: url}, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve({
                status: res.statusCode,
                body,
            }));
        })
        .on('error', reject);
});

const start = async () => {
    const app = express();
    app.use(fileop());
    const server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    
    return {
        server,
        port: server.address().port,
    };
};

const withSecret = async (makeUrl) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fileop-'));
    const secret = path.join(dir, 'secret.txt');
    
    fs.writeFileSync(secret, 'outside-secret');
    
    const up = path
        .relative(DIR_ROOT, secret)
        .split(path.sep)
        .join('/');
    const {server, port} = await start();
    const result = await get(port, makeUrl(up));
    
    server.close();
    fs.rmSync(dir, {
        recursive: true,
    });
    
    return result;
};

test('fileop: static: literal ../ outside package dir', async (t) => {
    const {body} = await withSecret((up) => `/fileop/../${up}`);
    
    t.notEqual(body, 'outside-secret', 'should not serve file outside root');
    t.end();
});

test('fileop: static: encoded ../ outside package dir', async (t) => {
    const {body} = await withSecret((up) => `/fileop/%2e%2e/${up}`);
    
    t.notEqual(body, 'outside-secret', 'should not serve file outside root');
    t.end();
});

test('fileop: static: traversal deeper than root', async (t) => {
    const {status} = await withSecret(() => `/fileop/${'../'.repeat(50)}etc/hostname`);
    
    t.notEqual(status, 200, 'should not return 200');
    t.end();
});

test('fileop: static: legitimate asset in package dir', async (t) => {
    const {server, port} = await start();
    const result = await get(port, '/fileop/package.json');
    
    server.close();
    
    t.equal(result.status, 200, 'should serve file inside package dir');
    t.end();
});
