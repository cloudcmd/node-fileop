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
        
        socket.on(`${id}#error`, (error) => {
            this.emit('error', error);
        });
        
        socket.on(`${id}#file`, (name) => {
            this.emit('file', name);
        });
        
        socket.on(`${id}#progress`, (percent) => {
            this.emit('progress', percent);
        });
        
        socket.on(`${id}#end`, () => {
            this.emit('end');
        });
        
        setTimeout(() => {
            socket.emit(`${id}#start`);
        }, 0);
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

