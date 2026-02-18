'use strict';

const process = require('node:process');
const path = require('node:path');
const fs = require('node:fs');
const {test} = require('supertape');

const connectPath = '../lib/connect';
const connect = require(connectPath);
const clearFileop = require('../lib/clear');

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
    clearFileop();
    
    const connect = require(connectPath);
    
    const {url, done} = await connect();
    const {default: fetch} = await import('node-fetch');
    const res = await fetch(`${url}/fileop.js`);
    const text = await res.text();
    const name = getName('dist-dev');
    const file = fs.readFileSync(name, 'utf8');
    
    done();
    process.env.NODE_ENV = NODE_ENV;
    clearFileop();
    require(connectPath);
    
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
