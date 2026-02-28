import {test} from 'supertape';
import getValue from '../../server/get-value.js';

test('get-value: function', (t) => {
    const str = 'hello';
    const value = () => str;
    
    const result = getValue(value);
    
    t.equal(result, str);
    t.end();
});

test('get-value: not function', (t) => {
    const value = 'hello';
    
    const result = getValue(value);
    
    t.equal(result, value);
    t.end();
});
