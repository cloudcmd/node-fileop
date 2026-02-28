import process from 'node:process';
import path, {dirname} from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {test} from 'supertape';
import connect from '../lib/connect.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getName = (dist) => path.join(__dirname, '../../', dist, 'fileop.js');

test('fileop: static', async (t) => {
    const {url, done} = await connect();
    const {default: fetch} = await import('node-fetch');
    const res = await fetch(`${url}/fileop.js`);
    const text = await res.text();
    const name = getName('dist');
    
    const file = fs.readFileSync(name, 'utf8');
    
    done();
    
    t.equal(text, file);
    t.end();
});

test('fileop: static: dev', async (t) => {
    const {NODE_ENV} = process.env;
    
    process.env.NODE_ENV = 'development';
    
    const {url, done} = await connect();
    const {default: fetch} = await import('node-fetch');
    const res = await fetch(`${url}/fileop.js`);
    const text = await res.text();
    const name = getName('dist-dev');
    const file = fs.readFileSync(name, 'utf8');
    
    done();
    process.env.NODE_ENV = NODE_ENV;
    
    t.equal(text, file);
    t.end();
});

test('fileop: static: 404', async (t) => {
    const {url, done} = await connect();
    const {default: fetch} = await import('node-fetch');
    const {status} = await fetch(`${url}/hello.txt`);
    
    done();
    
    t.equal(status, 404);
    t.end();
});
