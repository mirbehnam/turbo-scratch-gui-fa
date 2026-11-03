import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const runHeadScript = (origin, bridges = {}) => {
    const template = readFileSync(new URL('../src/playground/index.ejs', import.meta.url), 'utf8');
    const match = template.match(/<script id="android-editor-viewport">([\s\S]*?)<\/script>/);
    assert.ok(match, 'The editor must configure Android viewport before loading the UI');
    let content = 'width=device-width, initial-scale=1';
    vm.runInNewContext(match[1], {
        window: {location: {origin}, ...bridges},
        document: {querySelector: selector => {
            assert.equal(selector, 'meta[name="viewport"]');
            return {setAttribute: (name, value) => {
                assert.equal(name, 'content');
                content = value;
            }};
        }}
    });
    return content;
};

test('Android asset origin uses the original editor width without relying on the Windows user agent', () => {
    assert.equal(runHeadScript('https://appassets.androidplatform.net'), 'width=1024, user-scalable=no');
});

test('native host interfaces enable the Android viewport before editor initialization', () => {
    for (const bridge of ['AndroidProjectSaver', 'AndroidScratchTextInput']) {
        assert.equal(runHeadScript('https://example.test', {[bridge]: {}}), 'width=1024, user-scalable=no');
    }
});

test('Electron loopback and ordinary desktop browsers retain their existing viewport', () => {
    for (const origin of ['http://127.0.0.1:12345', 'https://example.test', 'null']) {
        assert.equal(runHeadScript(origin), 'width=device-width, initial-scale=1');
    }
});

test('similar hostnames do not activate the native Android layout', () => {
    assert.equal(runHeadScript('https://appassets.androidplatform.net.example.test'),
        'width=device-width, initial-scale=1');
});
