import {test, beforeEach, afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {detectLocale, LANGUAGE_KEY} from '../src/lib/detect-locale.js';
import projectData from '../src/lib/default-project/project-data.js';

const previous = {window: globalThis.window, location: globalThis.location, localStorage: globalThis.localStorage};
beforeEach(() => {
    globalThis.window = {navigator: {language: 'en-US'}};
    globalThis.location = {search: ''};
    const data = new Map();
    globalThis.localStorage = {getItem: key => data.get(key), setItem: (key, value) => data.set(key, value)};
});
afterEach(() => Object.assign(globalThis, previous));

test('fresh installations default to Persian even when the browser is English', () => {
    assert.equal(detectLocale(['ar', 'en', 'fa']), 'fa');
});
test('a saved supported language survives reopening the application', () => {
    localStorage.setItem(LANGUAGE_KEY, 'en');
    assert.equal(detectLocale(['ar', 'en', 'fa']), 'en');
});
test('an unsupported saved language falls back to Persian', () => {
    localStorage.setItem(LANGUAGE_KEY, 'de');
    assert.equal(detectLocale(['ar', 'en', 'fa']), 'fa');
});
test('an explicit supported URL language takes precedence over the saved preference', () => {
    localStorage.setItem(LANGUAGE_KEY, 'en');
    location.search = '?lang=ar';
    assert.equal(detectLocale(['ar', 'en', 'fa']), 'ar');
});
test('unsupported URL locales cannot enable another interface language', () => {
    location.search = '?locale=de';
    assert.equal(detectLocale(['ar', 'en', 'fa']), 'fa');
});
test('the default sprite is the Scratch cat with both costumes and its meow sound', () => {
    const sprite = projectData().targets.find(target => !target.isStage);
    assert.deepEqual(sprite.costumes.map(costume => costume.assetId), [
        'bcf454acf82e4504149f7ffe07081dbc', '0fb9be3e8397c983338cb71dc84d0b25'
    ]);
    assert.equal(sprite.sounds[0].assetId, '83c36d806dc92327b9e7049a565c6bff');
    assert.equal(sprite.x, 0);
    assert.equal(sprite.y, 0);
    assert.equal(sprite.size, 100);
});
