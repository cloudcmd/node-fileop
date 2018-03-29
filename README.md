# Spero [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL]

File copy emitter middleware based on [socket.io](http://socket.io "Socket.io") and [copymitter](https://github.com/coderaiser/node-copymitter "Copymitter").

## Install

```
npm i fileop --save
```

## Client

Could be loaded from url `/fileop/fileop.js`.

### fileop([options, ] callback)

Initialize `operator`.

- `options`:
  - `prefix` - prefix of `fileop` (`/fileop` by default)
  - `socketPrefix` - prefix of `socket.io` (`` by default)

```js
const prefix = '/fileop';

fileop((operator) => {
    const from = '/';
    const to = '/tmp';
    const names = [
        'bin'
    ];
    const progress = (value) => {
        console.log('progress:', value);
    };
    
    const end = (op) => () => {
        console.log('end');
        op.removeListener('progress', progress);
        op.removeListener('end', end);
    };
    
    const error = (op) => (data) => {
        const msg = data + '\n Continue?';
        const is = confirm(msg);
        
        if (is)
            return op.continue();
        
        op.abort();
    };
    
    operator.copy(from, to, names).then((op) => {
        op.on('progress', progress);
        op.on('end', end(op));
        op.on('error', error(op));
    });
});
```

## Server

```js
const fileop = require('fileop');
const http = require('http');
const express = require('express');
const io = require('socket.io');
const app = express();
const port = 1337;
const server = http.createServer(app);
const socket = io.listen(server);

server.listen(port);

app.use(fileop({
    authCheck: (username, password, accept, reject) => {
        if (username === 'root' && password === 'toor')
            accept();
        
        reject();
    }
});

fileop.listen(socket, {
    prefix: '/fileop',   /* default              */
    root: '/',          /* string or function   */
});
```

## License

MIT

[NPMIMGURL]:                https://img.shields.io/npm/v/fileop.svg?style=flat
[DependencyStatusIMGURL]:   https://img.shields.io/gemnasium/coderaiser/node-fileop.svg?style=flat
[LicenseIMGURL]:            https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[BuildStatusIMGURL]:        https://img.shields.io/travis/coderaiser/node-fileop/master.svg?style=flat
[NPMURL]:                   https://npmjs.org/package/fileop "npm"
[DependencyStatusURL]:      https://gemnasium.com/coderaiser/node-fileop "Dependency Status"
[LicenseURL]:               https://tldrlegal.com/license/mit-license "MIT License"
[BuildStatusURL]:           https://travis-ci.org/coderaiser/node-fileop  "Build Status"

