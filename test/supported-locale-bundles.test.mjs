import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import filterLocales from '../scripts/loaders/supported-locales.cjs';
import filterBlocksLocales from '../scripts/loaders/blocks-locales.cjs';
import locales, {isRtl, pickSupportedMessages} from '../src/lib/supported-locales.js';

test('the interface exposes exactly Arabic, English and Persian', () => {
    assert.deepEqual(Object.keys(locales), ['ar', 'en', 'fa']);
    assert.equal(isRtl('fa'), true);
    assert.equal(isRtl('ar'), true);
    assert.equal(isRtl('en'), false);
    assert.deepEqual(Object.keys(pickSupportedMessages({de: {}, en: {}, fa: {}, ar: {}})), ['ar', 'en', 'fa']);
});

test('every installed translation dictionary is pruned before webpack bundles it', () => {
    for (const family of ['editor', 'blocks', 'extensions', 'interface', 'paint-editor']) {
        const filename = new URL(`../node_modules/@turbowarp/scratch-l10n/locales/${family}-msgs.js`, import.meta.url);
        const filtered = filterLocales.call({resourcePath: filename.pathname}, readFileSync(filename, 'utf8'));
        const messages = JSON.parse(filtered.replace(/^export default /, '').replace(/;$/, ''));
        assert.deepEqual(Object.keys(messages), ['ar', 'en', 'fa'], family);
        if (family !== 'blocks') assert.ok(Object.keys(messages.fa).length > 0, family);
    }
});

test('the actual Scratch Blocks bundle keeps Persian, Arabic and English messages intact', () => {
    const source = readFileSync(new URL('../node_modules/scratch-blocks/msg/scratch_msgs.js', import.meta.url), 'utf8');
    const filtered = filterBlocksLocales.call({resourcePath: 'scratch_msgs.js'}, source);
    const codes = [...filtered.matchAll(/ScratchMsgs\.locales\["([^"]+)"\]/g)].map(match => match[1]);
    assert.deepEqual(codes.sort(), ['ar', 'en', 'fa']);
});

test('unsupported addon language files and custom dictionary entries are absent', () => {
    for (const directory of ['addons-l10n', 'addons-l10n-settings']) {
        const names = readdirSync(new URL(`../src/addons/${directory}/`, import.meta.url));
        assert.ok(names.every(name => ['ar.json', 'en.json', 'fa.json'].includes(name)), directory);
    }
    for (const filename of ['../src/lib/tw-translations/generated-translations.json', '../src/addons/settings/translations.json']) {
        const data = JSON.parse(readFileSync(new URL(filename, import.meta.url), 'utf8'));
        assert.ok(Object.keys(data).every(code => Object.hasOwn(locales, code)));
    }
});
