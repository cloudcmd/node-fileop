import process from 'node:process';
import path, {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import currify from 'currify';
import {Router} from 'express';
import listen from './listen.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DIR_ROOT = `${__dirname}/..`;

const fileopFn = currify(_fileopFn);
const isDev = () => process.env.NODE_ENV === 'development';

export const fileop = (options) => {
    options = options || {};
    const router = Router();
    const {prefix = '/fileop'} = options;
    
    router
        .route(`${prefix}/*path`)
        .get(fileopFn(prefix))
        .get(staticFn);
    
    return router;
};

fileop.listen = listen;

function _fileopFn(prefix, req, res, next) {
    req.url = req.url.replace(prefix, '');
    
    if (/^\/(fileop|0|1)\.js(\.map)?$/.test(req.url))
        req.url = '/dist' + req.url;
    
    if (isDev())
        req.url = req.url.replace(/^\/dist\//, '/dist-dev/');
    
    next();
}

function staticFn(req, res) {
    const file = path.normalize(DIR_ROOT + req.url);
    res.sendFile(file);
}
