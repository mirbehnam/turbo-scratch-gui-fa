import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readFile, readdir, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import {exportPackagedFile, isPackagerMessage, sanitizeExportName} from '../src/lib/packager-export.js';
const {createPackagerExporter} = createRequire(import.meta.url)('../desktop/packager-export.cjs');

test('packager rejects messages from another frame or origin', () => {
    const frame = {contentWindow: {}};
    const event = {source: frame.contentWindow, origin: 'https://editor', data: {p4: {type: 'export-ready'}}};
    assert.equal(isPackagerMessage(event, frame, event.origin), true);
    assert.equal(isPackagerMessage({...event, source: {}}, frame, event.origin), false);
    assert.equal(isPackagerMessage({...event, origin: 'https://other'}, frame, event.origin), false);
    assert.equal(sanitizeExportName('CON.html'), '_CON.html');
    assert.equal(sanitizeExportName('پروژه: من.html'), 'پروژه_ من.html');
});

test('native HTML chunks are acknowledged, saved completely and never overwrite', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'packager-test-'));
    const downloads = path.join(root, 'Downloads');
    const exporter = createPackagerExporter({downloads, cache: path.join(root, 'cache'), shareFile: async () => {}});
    const messages = [];
    globalThis.window = {desktopPackager: {request: async message => {
        messages.push(message.op);
        return exporter.request(message);
    }}};
    try {
        const text = '<!doctype html>فارسی\n' + 'a'.repeat(500000);
        const blob = new Blob([text], {type: 'text/html'});
        assert.equal((await exportPackagedFile(blob, 'test.html', 'save', 'fa')).name, 'test.html');
        assert.deepEqual(messages, ['begin', 'append', 'append', 'append', 'save']);
        assert.equal(await readFile(path.join(downloads, 'test.html'), 'utf8'), text);
        assert.equal((await exportPackagedFile(blob, 'test.html', 'save', 'en')).name, 'test (1).html');
        const {transfer} = await exporter.request({op: 'begin', name: 'incomplete.html', mime: 'text/html', bytes: 10});
        await assert.rejects(exporter.request({op: 'save', transfer}), /Incomplete/);
        assert.equal((await readdir(downloads)).length, 2);
        await exporter.request({op: 'cancel', transfer});
        await assert.rejects(exporter.request({op: 'begin', name: '../escape.html', mime: 'text/html', bytes: 1}), /Invalid/);
    } finally {
        await exporter.dispose();
        delete globalThis.window;
        await rm(root, {recursive: true, force: true});
    }
});

test('failed native sharing rejects and cancels the private transfer', async () => {
    const operations = [];
    globalThis.window = {desktopPackager: {request: async message => {
        operations.push(message.op);
        if (message.op === 'share') throw new Error('Share unavailable');
        return {transfer: 'test'};
    }}};
    try {
        await assert.rejects(exportPackagedFile(new Blob(['html']), 'test.html', 'share', 'en'), /Share unavailable/);
        assert.deepEqual(operations, ['begin', 'append', 'share', 'cancel']);
    } finally { delete globalThis.window; }
});

test('Android transport waits for native acknowledgements and propagates errors', async () => {
    const operations = [];
    const bridge = {postMessage: json => {
        const message = JSON.parse(json);
        operations.push(message.op);
        queueMicrotask(() => bridge.onmessage({data: JSON.stringify({id: message.id, ok: message.op !== 'save',
            transfer: 'android', error: 'Storage unavailable'})}));
    }};
    globalThis.window = {AndroidPackagedExport: bridge};
    try {
        await assert.rejects(exportPackagedFile(new Blob(['html']), 'test.html', 'save', 'fa'), /Storage unavailable/);
        assert.deepEqual(operations, ['begin', 'append', 'save', 'cancel']);
    } finally { delete globalThis.window; }
});

test('Android direct play streams HTML to the isolated player without saving or sharing', async () => {
    const operations = [];
    const bridge = {postMessage: json => {
        const message = JSON.parse(json);
        operations.push(message);
        queueMicrotask(() => bridge.onmessage({data: JSON.stringify({id: message.id, ok: true, transfer: 'player'})}));
    }};
    globalThis.window = {AndroidPackagedExport: bridge};
    try {
        await exportPackagedFile(new Blob(['<html>test</html>'], {type: 'text/html'}), 'test.html',
            'preview', 'fa', {dark: true});
        assert.deepEqual(operations.map(message => message.op), ['begin', 'append', 'preview']);
        assert.equal(operations.at(-1).locale, 'fa');
        assert.equal(operations.at(-1).dark, true);
    } finally { delete globalThis.window; }
});

test('cancelled HTML playback transfer never sends a preview operation', async () => {
    const controller = new AbortController();
    const calls = [];
    globalThis.window = {desktopPackager: {request: async message => {
        calls.push(message.op);
        if (message.op === 'begin') return {transfer: 'cancel-test'};
        if (message.op === 'append') controller.abort();
        return {};
    }}};
    try {
        await assert.rejects(exportPackagedFile(new Blob(['html'], {type: 'text/html'}), 'project.html', 'preview', 'fa',
            {signal: controller.signal}), {name: 'AbortError'});
        assert.deepEqual(calls, ['begin', 'append', 'cancel']);
    } finally { delete globalThis.window; }
});
