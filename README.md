# Fileop [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL]

File operations emitter middleware.

## Install

```
npm i @cloudcmd/fileop
```

## Client

Could be loaded from url `/fileop/fileop.js`.

### fileop([options, ] callback)

Initialize `operator`.

- `options`:
  - `prefix` - prefix of `fileop` (`/fileop` by default)
  - `socketPrefix` - prefix of `socket.io` (`` by default)

Returns `operator` in callback.

### operator

It is `EventEmitter` from the inide produce next types of `events`:

- `error`
- `progress`
- `file`
- `end`

Supports next types of operations:

 - `operator.copy(from, to, names)`
 - `operator.move(from, to, names)`
 - `opreator.remove(from, names)`
 - `opreator.extract(from, to)`
 - `operator.zip(from, to)`
 - `operator.tar(from, to)`

```js
const prefix = '/fileop';

fileop((error, operator) => {
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
    prefix: '/fileop', /* default */
}));

fileop.listen(socket, {
    prefix: '/fileop',   /* default              */
    root: '/',           /* string or a function */
    auth: (accept, reject) => (username, password) => {
        if (username === 'root' && password === 'toor')
            accept();
        
        reject();
    },
});
```

## License

MIT

## Related

- [Spero](https://github.com/cloudcmd/node-spero "Spero") - file copy emitter middleware based on `socket.io` and `copymitter`
- [Remedy](https://github.com/coderaiser/node-remedy "Remedy") - emitting middleware for file removing
- [Ishtar](https://github.com/coderaiser/node-ishtar "Ishtar") - pack and extract .tar.gz archives middleware
- [Omnes](https://github.com/cloudcmd/node-omnes "Omnes") - extract zip, gz, tar, tar.gz, tgz archives middleware
- [Salam](https://github.com/coderaiser/node-salam  "Salam") - pack and extract zip archives middleware

[NPMIMGURL]:                https://img.shields.io/npm/v/@cloudcmd/fileop.svg?style=flat
[DependencyStatusIMGURL]:   https://img.shields.io/david/cloudcmd/node-fileop.svg?style=flat
[LicenseIMGURL]:            https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[BuildStatusIMGURL]:        https://img.shields.io/travis/cloudcmd/node-fileop/master.svg?style=flat
[NPMURL]:                   https://npmjs.org/package/@cloudcmd/fileop "npm"
[DependencyStatusURL]:      https://david-dm.org/cloudcmd/node-fileop "Dependency Status"
[LicenseURL]:               https://tldrlegal.com/license/mit-license "MIT License"
[BuildStatusURL]:           https://travis-ci.org/cloudcmd/node-fileop  "Build Status"

