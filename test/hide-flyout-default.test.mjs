import {test} from 'node:test';
import assert from 'node:assert/strict';
import manifest from '../src/addons/addons/hide-flyout/_manifest_entry.js';
test('auto-hiding palette defaults to category click', () => {
    assert.equal(manifest.settings.find(setting => setting.id === 'toggle').default, 'category');
});
