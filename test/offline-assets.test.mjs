import {test} from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import getOfflineAssetURL from '../src/lib/offline-asset-url.js';
import {verifyOfflineAssets} from '../scripts/verify-offline-assets.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const costume = '809d9b47347a6af2860e7a3a35bce057.svg';
const sound = 'c04ebf21e5e19342fa1535e4efcdb43b.wav';

test('library previews resolve directly to files under the Android asset origin', () => {
    assert.equal(getOfflineAssetURL(costume, undefined,
        'https://appassets.androidplatform.net/assets/build/index.html'),
    `https://appassets.androidplatform.net/assets/build/static/assets/${costume}`);
});

test('storage ids and thumbnail filenames resolve to the same local asset', () => {
    const base = 'http://127.0.0.1:12345/index.html';
    assert.equal(getOfflineAssetURL(sound.slice(0, 32), 'wav', base),
        `http://127.0.0.1:12345/static/assets/${sound}`);
    assert.equal(getOfflineAssetURL(sound, 'wav', base),
        getOfflineAssetURL(sound.slice(0, 32), 'wav', base));
});

test('file URLs and paths containing spaces preserve their parent directory', () => {
    assert.equal(getOfflineAssetURL(costume, undefined, 'file:///C:/My%20App/build/editor.html'),
        `file:///C:/My%20App/build/static/assets/${costume}`);
});

test('unbundled project assets and custom fonts keep the existing online source', () => {
    assert.equal(getOfflineAssetURL('00000000000000000000000000000000', 'svg', 'https://example.test/'), null);
    assert.equal(getOfflineAssetURL('custom-font', 'woff2', 'https://example.test/'), null);
});

test('all four media catalogs have local files with their original content hashes', async () => {
    const count = await verifyOfflineAssets(root, path.join(root, 'static', 'assets'));
    assert.ok(count > 1000);
});
