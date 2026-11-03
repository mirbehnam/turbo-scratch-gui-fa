import {readFile, writeFile, readdir, unlink, lstat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const codes = JSON.parse(await readFile(path.join(root, 'src/lib/supported-locale-codes.json'), 'utf8'));
const dictionaries = ['src/lib/tw-translations/generated-translations.json', 'src/addons/settings/translations.json'];
for (const relative of dictionaries) {
    const filename = path.join(root, relative);
    const source = JSON.parse(await readFile(filename, 'utf8'));
    const selected = {};
    for (const code of codes) {
        if (source[code]) {
            selected[code] = source[code];
            delete selected[code]['tw.feedbackButton'];
            delete selected[code]['tw.feedback'];
        }
    }
    await writeFile(filename, `${JSON.stringify(selected, null, 4)}\n`);
}
const removed = [];
for (const relative of ['src/addons/addons-l10n', 'src/addons/addons-l10n-settings']) {
    const directory = path.resolve(root, relative);
    if (!directory.startsWith(`${root}${path.sep}`)) throw new Error('Locale directory is outside this repository');
    for (const name of await readdir(directory)) {
        if (!name.endsWith('.json') || codes.includes(name.slice(0, -5))) continue;
        const filename = path.join(directory, name);
        if (!(await lstat(filename)).isFile()) throw new Error(`Locale path is not a regular file: ${filename}`);
        await unlink(filename);
        removed.push(`${relative}/${name}`);
    }
}
for (const name of ['l10n-entries.js', 'l10n-settings-entries.js']) {
    const filename = path.join(root, 'src/addons/generated', name);
    const source = await readFile(filename, 'utf8');
    await writeFile(filename, source.split('\n').filter(line => {
        const entry = line.match(/^\s*"([^"]+)":/);
        return !entry || codes.includes(entry[1]);
    })
        .join('\n'));
}
console.log(`Supported interface languages: ${codes.join(', ')}. Removed ${removed.length} addon translation files.`);
for (const filename of removed) console.log(filename);
