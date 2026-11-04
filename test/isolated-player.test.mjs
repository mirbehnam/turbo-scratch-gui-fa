import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {isolatedPlayerBootstrap} from '../src/lib/isolated-player.js';

test('isolated player accepts a Blob only from its parent and navigates to its own blob URL', () => {
    const html = decodeURIComponent(isolatedPlayerBootstrap.split(',')[1]);
    const script = html.replace(/^<script>\s*/, '').replace(/\s*<\/script>$/, '');
    let listener;
    let destination;
    const parent = {};
    const window = {
        parent,
        addEventListener: (name, callback) => { assert.equal(name, 'message'); listener = callback; },
        removeEventListener: (name, callback) => { assert.equal(name, 'message'); assert.equal(callback, listener); },
        location: {replace: value => { destination = value; }}
    };
    const URL = {createObjectURL: blob => { assert.ok(blob instanceof Blob); return 'blob:null/player'; }};
    vm.runInNewContext(script, {window, Blob, URL});
    listener({source: {}, data: new Blob(['untrusted'])});
    listener({source: parent, data: 'not a blob'});
    assert.equal(destination, undefined);
    listener({source: parent, data: new Blob(['player'])});
    assert.equal(destination, 'blob:null/player');
});
