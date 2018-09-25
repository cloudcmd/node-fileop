'use strict';

const Emitify = require('emitify/legacy');

module.exports = (id, socket) => {
    return new FileOperator(id, socket);
};

class FileOperator extends Emitify {
    constructor(id, socket) {
        super();
        
        this.socket = socket;
        this.id = id;
        
        this._onError = this._onError.bind(this);
        this._onFile = this._onFile.bind(this);
        this._onProgress = this._onProgress.bind(this);
        this._onEnd = this._onEnd.bind(this);
        
        socket.on(`${id}#error`, this._onError);
        socket.on(`${id}#file`, this._onFile);
        socket.on(`${id}#progress`, this._onProgress);
        socket.on(`${id}#end`, this._onEnd);
        
        setTimeout(() => {
            socket.emit(`${id}#start`);
        }, 0);
    }
    
    _onError(error) {
        this.emit('error', error);
    }
    
    _onFile(name) {
        this.emit('file', name);
    }
    
    _onProgress(percent) {
        this.emit('progress', percent);
    }
    
    _onEnd() {
        const {id, socket} = this;
        
        socket.off(`${id}#error`, this._onError);
        socket.off(`${id}#file`, this._onFile);
        socket.off(`${id}#progress`, this._onProgress);
        socket.off(`${id}#end`, this._onEnd);
        
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

