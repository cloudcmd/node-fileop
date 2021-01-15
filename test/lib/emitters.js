'use strict';

const {EventEmitter} = require('events');
const wraptile = require('wraptile');

module.exports.rawErrorEmitter = (from) => {
    const emitter = new EventEmitter();
    
    process.nextTick(() => {
        emitter.emit('error', Error(`EACCES: ${from}`));
    });
    
    return emitter;
};

module.exports.errorEmitter = (from, to, names = to) => {
    const emitter = new EventEmitter();
    const [name] = names || ['current'];
    const path = `${from}/${name}`;
    const code = 'EACCES';
    
    emitter.abort = () => {
        emitter.emit('end');
    };
    
    emitter.continue = () => {
        emitter.emit('end');
    };
    
    process.nextTick(() => {
        emitter.emit('error', {
            code,
            path,
        });
    });
    
    return emitter;
};

module.exports.progressEmitter = () => {
    const emitter = new EventEmitter();
    
    process.nextTick(() => {
        emitter.emit('progress', 100);
    });
    
    return emitter;
};

module.exports.fileEmitter = (from, to, names) => {
    const emitter = new EventEmitter();
    const [name] = names || ['current'];
    
    process.nextTick(() => {
        emitter.emit('file', name);
    });
    
    return emitter;
};

module.exports.endEmitter = () => {
    const emitter = new EventEmitter();
    
    process.nextTick(() => {
        emitter.emit('end');
    });
    
    return emitter;
};

module.exports.customEmitter = wraptile((fns) => {
    const emitter = new EventEmitter();
    
    emitter.pause = fns.pause;
    emitter.continue = fns.continue;
    
    process.nextTick(() => {
        emitter.emit('end');
    });
    
    return emitter;
});
