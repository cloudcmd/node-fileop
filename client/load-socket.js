'use strict';

module.exports = async () => {
    const {io} = window;
    
    if (io)
        return io;
    
    return await import('socket.io-client');
};

