import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import IntlMessageFormat from 'intl-messageformat';
import messages from '../src/lib/tw-translations/editor-extras.json' with {type: 'json'};

test('desktop file save messages are translated with the filename in both RTL locales', () => {
    for (const locale of ['fa', 'ar']) {
        for (const id of ['tw.saveTo', 'tw.saveAs', 'tw.oldDownload']) {
            assert.ok(messages[locale][id], `${locale}: ${id}`);
            const value = new IntlMessageFormat(messages[locale][id], locale).format({file: 'game.sb3'});
            if (id === 'tw.saveTo') assert.ok(value.includes('game.sb3'));
        }
    }
});

test('duplicate advanced toolbar item and addon customization menu entry are absent', () => {
    const menu = fs.readFileSync(new URL('../src/components/menu-bar/menu-bar.jsx', import.meta.url), 'utf8');
    const blocks = fs.readFileSync(new URL('../src/components/menu-bar/tw-theme-blocks.jsx', import.meta.url), 'utf8');
    assert.ok(!menu.includes('id="tw.menuBar.advanced"'));
    assert.ok(!blocks.includes('...(onOpenCustomSettings ? [BLOCKS_CUSTOM] : [])'));
    assert.ok(menu.includes('id="tw.menuBar.moreSettings"'));
});
