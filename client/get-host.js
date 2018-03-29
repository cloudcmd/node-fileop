'use strict';

module.exports = () => {
    const {
        origin,
        protocol,
        host,
    } = location;
    
    return origin || `${protocol}//${host}`;
};

