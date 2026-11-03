import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import translate from '../src/lib/libraries/translate-library-name.js';
import matches, {normalizeSearchText} from '../src/lib/libraries/library-item-search.js';

test('every built-in sprite, backdrop and sound has a Persian display name', () => {
    for (const library of ['sprites', 'backdrops', 'sounds']) {
        const items = JSON.parse(readFileSync(new URL(`../src/lib/libraries/${library}.json`, import.meta.url), 'utf8'));
        for (const item of items) {
            const name = translate(library, item.name, 'fa');
            assert.match(name, /[\u0600-\u06ff]/, `${library}: ${item.name}`);
            assert.equal(translate(library, item.name, 'en'), item.name);
            assert.equal(translate(library, item.name, 'ar'), item.name);
            assert.equal(matches(item, item.name, name), true);
            assert.equal(matches(item, name, name), true);
        }
    }
});

test('Persian library search normalizes letters, vowel marks and digits', () => {
    assert.equal(normalizeSearchText('كِي ۱۲'), normalizeSearchText('کی 12'));
    assert.equal(translate('sprites', 'Kiran', 'fa'), 'کایرن');
    assert.equal(translate(undefined, 'Bear', 'fa'), 'Bear');
    const original = {name: 'Bear', tags: ['animals']};
    assert.equal(matches(original, 'خرس', translate('sprites', original.name, 'fa')), true);
    assert.equal(matches(original, 'ANIMALS', 'خرس'), true);
    assert.equal(original.name, 'Bear');
});
