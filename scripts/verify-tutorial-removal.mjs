import {access, readFile, readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const verifyTutorialRemoval = async (root, buildDirectory = null) => {
    const audit = JSON.parse(await readFile(path.join(root, 'scripts/tutorial-removal-audit.json'), 'utf8'));
    for (const file of audit.files) {
        let exists = true;
        try {
            await access(path.join(root, file.path));
        } catch (error) {
            if (error.code !== 'ENOENT') throw error;
            exists = false;
        }
        if (exists) throw new Error(`Removed tutorial source was restored: ${file.path}`);
    }
    if (buildDirectory) {
        const removedImageHashes = new Set(audit.files
            .filter(file => /\.(svg|png|gif|jpe?g|webp)$/i.test(file.path))
            .map(file => file.sha256));
        const scan = async directory => {
            for (const entry of await readdir(directory, {withFileTypes: true})) {
                const filename = path.join(directory, entry.name);
                if (entry.isDirectory()) await scan(filename);
                else if (/\.(svg|png|gif|jpe?g|webp)$/i.test(entry.name)) {
                    const hash = createHash('sha256').update(await readFile(filename)).digest('hex');
                    if (removedImageHashes.has(hash)) throw new Error(`Build contains a removed tutorial image: ${filename}`);
                }
            }
        };
        await scan(buildDirectory);
    }
    return audit.files.length;
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
    console.log(`Tutorial removal verified: ${await verifyTutorialRemoval(root, path.join(root, 'build'))} files absent.`);
}
