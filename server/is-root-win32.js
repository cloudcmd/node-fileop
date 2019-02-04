'use strict';

module.exports = (path, root) => {
    const isRoot = path === '/';
    const isWin32 = process.platform === 'win32';
    const isConfig = root === '/';
    
    return isWin32 && isRoot && isConfig;
};

