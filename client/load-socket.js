'use strict';

module.exports = (fn) => {
    const {io} = window;
    
    if (io)
        return fn(io);
    
    import('socket.io-client').then(fn);
};

