import {mkdir, readFile, writeFile, rename, rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {setTimeout} from 'node:timers/promises';
import {getLibraryAssetFiles} from './lib/library-assets.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== '--source-dir')) {
    throw new Error('Usage: npm run assets:download -- [--source-dir path/to/existing/assets]');
}
const source = args.length ? path.resolve(args[1]) : null;
const destination = path.join(root, 'static', 'assets');
const files = await getLibraryAssetFiles(root);
const valid = (data, filename) => createHash('md5').update(data).digest('hex') === filename.slice(0, 32);
const readExisting = async filename => {
    try {
        return await readFile(filename);
    } catch (error) {
        if (error.code === 'ENOENT') return null;
        throw error;
    }
};

await mkdir(destination, {recursive: true});
let copied = 0;
let downloaded = 0;
let skipped = 0;
for (const filename of files) {
    const target = path.join(destination, filename);
    const existing = await readExisting(target);
    if (existing && valid(existing, filename)) {
        skipped++;
        continue;
    }
    let data = source ? await readExisting(path.join(source, filename)) : null;
    if (data && valid(data, filename)) {
        copied++;
    } else {
        const url = `https://cdn.assets.scratch.mit.edu/internalapi/asset/${filename}/get/`;
        for (let attempt = 1; ; attempt++) {
            try {
                console.log(`Downloading ${filename} (attempt ${attempt})`);
                const response = await fetch(url, {signal: AbortSignal.timeout(30000)});
                if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
                data = Buffer.from(await response.arrayBuffer());
                if (!valid(data, filename)) throw new Error(`Asset content hash mismatch: ${filename}`);
                downloaded++;
                break;
            } catch (error) {
                if (attempt === 4) throw error;
                console.warn(error.message);
                await setTimeout(attempt * 1000);
            }
        }
    }
    const temporary = `${target}.part`;
    try {
        await writeFile(temporary, data);
        await rename(temporary, target);
    } finally {
        await rm(temporary, {force: true});
    }
}
await writeFile(path.join(root, 'src/lib/libraries/offline-assets.json'), `${JSON.stringify(files, null, 2)}\n`);
console.log(`Offline media ready: ${files.length} files; ${copied} copied, ${downloaded} downloaded, ${skipped} reused.`);
