import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {messageOverrides} from '../src/lib/supported-locales.js';

test('Advanced has Persian and Arabic translations instead of the English fallback', () => {
    assert.equal(messageOverrides.fa['tw.menuBar.advanced'], 'پیشرفته');
    assert.equal(messageOverrides.ar['tw.menuBar.advanced'], 'متقدم');
});

test('theme settings and every submenu option have Persian and Arabic translations', () => {
    const files = ['tw-theme-gui.jsx', 'tw-theme-blocks.jsx', 'tw-theme-accent.jsx', 'tw-desktop-settings.jsx'];
    for (const file of files) {
        const source = readFileSync(new URL(`../src/components/menu-bar/${file}`, import.meta.url), 'utf8');
        const ids = [...source.matchAll(/\bid(?:=|:)\s*["'](tw\.[^"']+)["']/g)].map(match => match[1]);
        for (const locale of ['fa', 'ar']) {
            for (const id of ids) assert.ok(messageOverrides[locale][id], `${locale}: ${id}`);
        }
    }
});

test('every Advanced dialog message has both Persian and Arabic translations', () => {
    const source = readFileSync(new URL('../src/components/tw-settings-modal/settings-modal.jsx', import.meta.url), 'utf8');
    const ids = [...source.matchAll(/\bid(?:=|:)\s*["']((?:tw|gui)\.[^"']+)["']/g)].map(match => match[1]);
    ids.push('tw.menuBar.newFramerate');
    for (const locale of ['fa', 'ar']) {
        for (const id of ids) assert.ok(messageOverrides[locale][id], `${locale}: ${id}`);
        assert.match(messageOverrides[locale]['tw.settingsModal.fpsHelp'], /\{customFramerate\}/);
        assert.match(messageOverrides[locale]['tw.settingsModal.disableCompilerHelp'], /\{APP_NAME\}/);
    }
});
