import {copyFile, readdir, readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {verifyOfflineAssets} from './verify-offline-assets.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
await verifyOfflineAssets(root, path.join(root, 'static', 'assets'));
const result = spawnSync(process.execPath, [process.env.npm_execpath, 'run', 'build'], {
    cwd: root,
    stdio: 'inherit',
    env: {...process.env, CI: 'true', NODE_ENV: 'production', ROOT: './', ENABLE_SERVICE_WORKER: ''}
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);

// The Android host opens assets/build/index.html; TurboWarp's editor is editor.html.
await copyFile(path.join(root, 'build', 'editor.html'), path.join(root, 'build', 'index.html'));
const walk = async directory => {
    const entries = await readdir(directory, {withFileTypes: true});
    const nested = await Promise.all(entries.map(entry => entry.isDirectory() ?
        walk(path.join(directory, entry.name)) : path.join(directory, entry.name)));
    return nested.flat();
};
const files = await walk(path.join(root, 'build'));
if (files.some(file => file.endsWith('.map'))) throw new Error('Android build contains source maps');
const scripts = await Promise.all(files.filter(file => file.endsWith('.js')).map(file => readFile(file, 'utf8')));
for (const contract of ['AndroidScratchLoadProjectUrl', 'AndroidScratchLoadProject',
    'projectLoaderReady', 'projectLoadStarted', 'beginSpriteSave', 'appendSpriteChunk', 'finishSpriteSave']) {
    if (!scripts.some(script => script.includes(contract))) throw new Error(`Missing Android bridge: ${contract}`);
}
console.log(`Android editor build verified: ${files.length} files in ${path.join(root, 'build')}`);
console.log(`Offline media verified: ${await verifyOfflineAssets(root)} files with original content hashes.`);
