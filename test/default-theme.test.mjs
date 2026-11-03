import {test} from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';

registerHooks({
    load (url, context, nextLoad) {
        if (url.endsWith('.svg')) {
            return {format: 'module', source: `export default ${JSON.stringify(url)};`, shortCircuit: true};
        }
        return nextLoad(url, context);
    }
});
const {Theme, ACCENT_BLUE, ACCENT_PURPLE, ACCENT_RED} = await import('../src/lib/themes/index.js');

test('fresh and fallback themes use blue in light, dark and high contrast modes', () => {
    for (const theme of [Theme.light, Theme.dark, Theme.highContrast, new Theme(), new Theme('invalid')]) {
        assert.equal(theme.accent, ACCENT_BLUE);
    }
});

test('explicit accent choices are preserved when changing other theme options', () => {
    for (const accent of [ACCENT_RED, ACCENT_PURPLE]) {
        const theme = new Theme(accent, 'light', 'three');
        assert.equal(theme.set('gui', 'dark').accent, accent);
        assert.equal(theme.set('blocks', 'high-contrast').accent, accent);
    }
});
