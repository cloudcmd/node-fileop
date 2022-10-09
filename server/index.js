'use strict';

const path = require('path');
const currify = require('currify');

const {Router} = require('express');
const listen = require('./listen');

const DIR_ROOT = __dirname + '/..';

const fileopFn = currify(_fileopFn);
const isDev = process.env.NODE_ENV === 'development';

module.exports = (options) => {
    options = options || {};
    const router = Router();
    const {
        prefix = '/fileop',
    } = options;
    
    router.route(prefix + '/*')
        .get(fileopFn(prefix))
        .get(staticFn);
    
    return router;
};

module.exports.listen = listen;

function _fileopFn(prefix, req, res, next) {
    req.url = req.url.replace(prefix, '');
    
    if (/^\/(fileop|0|1)\.js(\.map)?$/.test(req.url))
        req.url = '/dist' + req.url;
    
    if (isDev)
        req.url = req.url.replace(/^\/dist\//, '/dist-dev/');
    
    next();
}

function staticFn(req, res) {
    const file = path.normalize(DIR_ROOT + req.url);
    res.sendFile(file);
}

