'use strict';

const test = require('supertape');
const isRootPath = '../../server/is-root-win32';

test('fileop: isRootWin32', (t) => {
    const path = '/';
    const root = '/';
    
    const {platform} = process;
    
    Object.defineProperty(process, 'platform', {
        value: 'win32',
        writable: false,
    });
    
    const isRootWin32 = require(isRootPath);
    const result = isRootWin32(path, root);
    
    Object.defineProperty(process, 'platform', {
        value: platform,
    });
    
    t.ok(result, 'should return true');
    t.end();
});
