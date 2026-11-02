import {test, beforeEach, afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {
    registerAndroidProjectLoader,
    readAndroidProject,
    saveAndroidBlob,
    installAndroidNumberInput
} from '../src/lib/android-bridge.js';

const originalWindow = globalThis.window;
const originalReader = globalThis.FileReader;
const originalFetch = globalThis.fetch;

beforeEach(() => {
    globalThis.window = {};
    globalThis.FileReader = class {
        readAsDataURL (blob) {
            blob.arrayBuffer().then(buffer => {
                this.result = `data:application/octet-stream;base64,${Buffer.from(buffer).toString('base64')}`;
                this.onload();
            });
        }
    };
});
afterEach(() => {
    globalThis.window = originalWindow;
    globalThis.FileReader = originalReader;
    globalThis.fetch = originalFetch;
});

test('multiple uploaders expose one native entry point and survive another uploader unmounting', () => {
    const calls = [];
    window.AndroidProjectSaver = {projectLoaderReady: () => calls.push('ready')};
    const first = registerAndroidProjectLoader(() => calls.push('first'), () => {});
    const second = registerAndroidProjectLoader(() => calls.push('second'), (...args) => calls.push(args));
    window.AndroidScratchLoadProject();
    window.AndroidScratchLoadProjectUrl('https://appassets.androidplatform.net/projects/test.sb3', 'test.sb3');
    second();
    window.AndroidScratchLoadProject();
    first();
    assert.deepEqual(calls, ['ready', 'second',
        ['https://appassets.androidplatform.net/projects/test.sb3', 'test.sb3'], 'first']);
    assert.equal(window.AndroidScratchLoadProject, undefined);
    assert.equal(window.AndroidScratchLoadProjectUrl, undefined);
});

test('host project URL keeps its filename and binary content and notifies Android', async () => {
    let started = 0;
    window.AndroidProjectSaver = {projectLoadStarted: () => started++};
    globalThis.fetch = async url => {
        assert.equal(url, 'https://appassets.androidplatform.net/projects/a.sb3');
        return new Response(new Uint8Array([0, 255, 80, 75]));
    };
    const file = await readAndroidProject('https://appassets.androidplatform.net/projects/a.sb3', 'آزمایش.sb3');
    assert.equal(file.name, 'آزمایش.sb3');
    assert.deepEqual([...new Uint8Array(await file.arrayBuffer())], [0, 255, 80, 75]);
    assert.equal(started, 1);
});

test('failed native project requests report the HTTP error', async () => {
    globalThis.fetch = async () => new Response('', {status: 404, statusText: 'Not Found'});
    await assert.rejects(readAndroidProject('https://appassets.androidplatform.net/projects/missing.sb3', 'missing.sb3'),
        /404 Not Found/);
});

test('project saving sends ordered bounded base64 chunks with unchanged bytes', async () => {
    const data = new Uint8Array(600000).map((_, i) => i % 256);
    const calls = [];
    window.AndroidProjectSaver = {
        beginSave: name => calls.push(['begin', name]),
        appendChunk: chunk => calls.push(['chunk', chunk]),
        finishSave: () => calls.push(['finish'])
    };
    await saveAndroidBlob('پروژه.sb3', new Blob([data]));
    assert.deepEqual(calls[0], ['begin', 'پروژه.sb3']);
    assert.deepEqual(calls.at(-1), ['finish']);
    const chunks = calls.slice(1, -1).map(call => call[1]);
    assert.equal(chunks.length, 4);
    assert.ok(chunks.every(chunk => chunk.length <= 262144));
    assert.deepEqual(Buffer.from(chunks.join(''), 'base64'), Buffer.from(data));
});

test('sprite saving sends the expected byte size', async () => {
    const calls = [];
    window.AndroidProjectSaver = {
        beginSpriteSave: (...args) => calls.push(args),
        appendSpriteChunk: chunk => calls.push(chunk),
        finishSpriteSave: () => calls.push('finished')
    };
    await saveAndroidBlob('Cat.sprite3', new Blob(['abc']));
    assert.deepEqual(calls, [['Cat.sprite3', 3], 'YWJj', 'finished']);
});

test('browser downloads and unrelated file types are left to the existing downloader', () => {
    assert.equal(saveAndroidBlob('test.sb3', new Blob()), null);
    window.AndroidProjectSaver = {beginSave () {}};
    assert.equal(saveAndroidBlob('test.sb3', new Blob()), null);
    assert.equal(saveAndroidBlob('costume.svg', new Blob()), null);
});

test('native transfer exceptions reject without finishing or pretending to save successfully', async () => {
    let finished = false;
    window.AndroidProjectSaver = {
        beginSave () {},
        appendChunk () { throw new Error('Native transfer failed'); },
        finishSave () { finished = true; }
    };
    await assert.rejects(saveAndroidBlob('test.sb3', new Blob(['abc'])), /Native transfer failed/);
    assert.equal(finished, false);
});

test('number fields use the native text bridge while desktop behavior stays intact', () => {
    const calls = [];
    const blocks = {
        FieldNumber: function () {},
        FieldTextInput: {
            prototype: {showEditor_ (...args) { calls.push(['text', ...args]); }},
            htmlInput_: {setAttribute: (...args) => calls.push(args)}
        }
    };
    blocks.FieldNumber.prototype.showEditor_ = (...args) => calls.push(['number', ...args]);
    installAndroidNumberInput(blocks);
    installAndroidNumberInput(blocks);
    const field = new blocks.FieldNumber();
    field.showEditor_('touch');
    window.AndroidScratchTextInput = {};
    field.showEditor_('touch');
    assert.deepEqual(calls, [['number', 'touch'], ['text', false, false], ['inputmode', 'decimal']]);
    assert.equal(blocks.FieldNumber.activeField_, field);
});
