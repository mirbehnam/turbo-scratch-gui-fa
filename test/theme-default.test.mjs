import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';

registerHooks({load (url, context, nextLoad) {
    if (/\.(svg|png)$/.test(url)) return {format: 'module', shortCircuit: true, source: 'export default "asset";'};
    return nextLoad(url, context);
}});

const dark = {matches: true, addEventListener () {}, removeEventListener () {}};
const highContrast = {matches: false, addEventListener () {}, removeEventListener () {}};
globalThis.window = {matchMedia: query => query.includes('contrast') ? highContrast : dark};
let saved = null;
globalThis.localStorage = {getItem: () => saved, setItem: (key, value) => { saved = value; }, removeItem: () => { saved = null; }};
const {detectTheme, persistTheme} = await import('../src/lib/themes/themePersistance.js');
const {Theme} = await import('../src/lib/themes/index.js');

test('fresh install is light even when the system uses dark mode', () => {
    saved = null;
    assert.equal(detectTheme().gui, Theme.light.gui);
    assert.equal(detectTheme().blocks, Theme.light.blocks);
});

test('explicit dark choice persists across system changes; light can be restored', () => {
    saved = null;
    persistTheme(Theme.dark);
    assert.equal(detectTheme().gui, Theme.dark.gui);
    dark.matches = false;
    assert.equal(detectTheme().gui, Theme.dark.gui);
    persistTheme(Theme.light);
    dark.matches = true;
    assert.equal(detectTheme().gui, Theme.light.gui);
});

test('legacy saved dark and light preferences remain supported', () => {
    saved = 'dark'; assert.equal(detectTheme().gui, Theme.dark.gui);
    saved = 'light'; assert.equal(detectTheme().gui, Theme.light.gui);
});
