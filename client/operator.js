'use strict';

const Emitify = require('emitify');

module.exports = (id, socket) => {
    return new FileOperator(id, socket);
};

class FileOperator extends Emitify {
    constructor(id, socket) {
        super();
        
        this.socket = socket;
        this.id = id;
        
        socket.on(`${id}#error`, this.#onError);
        socket.on(`${id}#file`, this.#onFile);
        socket.on(`${id}#progress`, this.#onProgress);
        socket.on(`${id}#end`, this.#onEnd);
        
        setTimeout(() => {
            socket.emit(`${id}#start`);
        }, 0);
    }
    
    #onError = (error) => {
        this.emit('error', error);
    }
    
    #onFile = (name) => {
        this.emit('file', name);
    }
    
    #onProgress = (percent) => {
        this.emit('progress', percent);
    }
    
    #onEnd = () => {
        const {id, socket} = this;
        
        socket.off(`${id}#error`, this.#onError);
        socket.off(`${id}#file`, this.#onFile);
        socket.off(`${id}#progress`, this.#onProgress);
        socket.off(`${id}#end`, this.#onEnd);
        
        this.emit('end');
    }
    
    pause() {
        const {id, socket} = this;
        socket.emit(`${id}#pause`);
    }
    
    continue() {
        const {id, socket} = this;
        socket.emit(`${id}#continue`);
    }
    
    abort() {
        const {id, socket} = this;
        socket.emit(`${id}#abort`);
    }
}

