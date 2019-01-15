'use strict';

const test = require('supertape');
const getValue = require('../../server/get-value');

test('get-value: function', (t) => {
    const str = 'hello';
    const value = () => str;
    
    const result = getValue(value);
    
    t.equal(result, str, 'should equal');
    t.end();
});

test('get-value: not function', (t) => {
    const value = 'hello';
    
    const result = getValue(value);
    
    t.equal(result, value, 'should equal');
    t.end();
});
