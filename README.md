# Fileop [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL]

[NPMURL]: https://npmjs.org/package/@cloudcmd/fileop "npm"
[NPMIMGURL]: https://img.shields.io/npm/v/@cloudcmd/fileop.svg?style=flat
[LicenseURL]: https://tldrlegal.com/license/mit-license "MIT License"
[LicenseIMGURL]: https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[BuildStatusURL]: https://github.com/cloudcmd/node-fileop/actions/workflows/nodejs.yml "Build Status"
[BuildStatusIMGURL]: https://github.com/cloudcmd/node-fileop/actions/workflows/nodejs.yml/badge.svg

File operations emitter middleware.

## Install

```
npm i @cloudcmd/fileop
```

## Client

Could be loaded from url `/fileop/fileop.js`.

### fileop([options, ]): Promise

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
const operator = await fileop({
    prefix,
});

const from = '/';
const to = '/tmp';

const names = ['bin'];

const progress = (value) => {
    console.log('progress:', value);
};

const end = (op) => () => {
    console.log('end');
    op.removelistener('progress', progress);
    op.removelistener('end', end);
};

const error = (op) => (data) => {
    const msg = `${data}\n continue?`;
    const is = confirm(msg);
    
    if (is)
        return op.continue();
    
    op.abort();
};

const op = await operator.copy(from, to, names);
    
op.on('progress', progress);
op.on('end', end(op)); op.on('error', error(op));
```

## Server

```js
const fileop = require('fileop');
const http = require('node:http');
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
    // default
    prefix: '/fileop', // string or a function
    root: '/',
    auth: (accept, reject) => (username, password) => {
        if (username === 'root' && password === 'toor')
            accept();
        
        reject();
    },
});
```

## Related

- [Spero](https://github.com/cloudcmd/node-spero "Spero") - file copy emitter middleware based on `socket.io` and `copymitter`
- [Remedy](https://github.com/coderaiser/node-remedy "Remedy") - emitting middleware for file removing
- [Ishtar](https://github.com/coderaiser/node-ishtar "Ishtar") - pack and extract .tar.gz archives middleware
- [Omnes](https://github.com/cloudcmd/node-omnes "Omnes") - extract zip, gz, tar, tar.gz, tgz archives middleware
- [Salam](https://github.com/coderaiser/node-salam "Salam") - pack and extract zip archives middleware

## License

MIT
