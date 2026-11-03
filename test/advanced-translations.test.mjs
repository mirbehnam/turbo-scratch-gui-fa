import {test} from 'node:test';
import assert from 'node:assert/strict';
import {messageOverrides} from '../src/lib/supported-locales.js';

test('Advanced has Persian and Arabic translations instead of the English fallback', () => {
    assert.equal(messageOverrides.fa['tw.menuBar.advanced'], 'پیشرفته');
    assert.equal(messageOverrides.ar['tw.menuBar.advanced'], 'متقدم');
});
