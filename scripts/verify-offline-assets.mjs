import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {getLibraryAssetFiles} from './lib/library-assets.mjs';

export const verifyOfflineAssets = async (root, directory = path.join(root, 'build', 'static', 'assets')) => {
    const required = await getLibraryAssetFiles(root);
    const manifest = JSON.parse(await readFile(path.join(root, 'src/lib/libraries/offline-assets.json'), 'utf8'));
    if (JSON.stringify(manifest) !== JSON.stringify(required)) {
        throw new Error('Offline asset catalog is out of date. Run npm run assets:download.');
    }
    const invalid = [];
    for (const filename of required) {
        try {
            const data = await readFile(path.join(directory, filename));
            const hash = createHash('md5').update(data).digest('hex');
            if (hash !== filename.slice(0, 32)) invalid.push(`${filename} (incorrect content hash)`);
        } catch (error) {
            if (error.code !== 'ENOENT') throw error;
            invalid.push(`${filename} (missing)`);
        }
    }
    if (invalid.length) throw new Error(`Invalid offline library assets: ${invalid.length}\n${invalid.join('\n')}`);
    return required.length;
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
    console.log(`Offline assets verified: ${await verifyOfflineAssets(root)} original files.`);
}
