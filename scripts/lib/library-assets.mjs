import {readFile} from 'node:fs/promises';
import path from 'node:path';

export const getLibraryAssetFiles = async root => {
    const files = new Set();
    for (const name of ['sprites', 'backdrops', 'costumes', 'sounds']) {
        const contents = await readFile(path.join(root, 'src', 'lib', 'libraries', `${name}.json`), 'utf8');
        for (const filename of contents.match(/[a-f0-9]{32}\.[a-z0-9]+/g) || []) files.add(filename);
    }
    return [...files].sort();
};
