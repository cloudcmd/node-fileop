import process from 'node:process';
import {test} from 'supertape';

test('fileop: isRootWin32', async (t) => {
    const path = '/';
    const root = '/';
    
    const {platform} = process;
    
    Object.defineProperty(process, 'platform', {
        value: 'win32',
        writable: false,
    });
    
    const {default: isRootWin32} = await import('../../server/is-root-win32.js');
    const result = isRootWin32(path, root);
    
    Object.defineProperty(process, 'platform', {
        value: platform,
    });
    
    t.ok(result, 'should return true');
    t.end();
});
