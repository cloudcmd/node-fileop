export default async () => {
    const {io} = globalThis;
    
    if (io)
        return io;
    
    return await import('socket.io-client');
};
