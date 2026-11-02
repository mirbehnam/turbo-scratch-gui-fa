import {test} from 'node:test';
import assert from 'node:assert/strict';
import modalsReducer, * as modals from '../src/reducers/modals.js';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {verifyTutorialRemoval} from '../scripts/verify-tutorial-removal.mjs';

test('editor modal state does not include a tutorial library', () => {
    assert.equal(Object.hasOwn(modalsReducer(undefined, {}), 'tipsLibrary'), false);
});

test('tutorial modal actions are no longer exposed', () => {
    assert.equal(modals.openTipsLibrary, undefined);
    assert.equal(modals.closeTipsLibrary, undefined);
});

test('sprite, costume, backdrop and sound libraries remain usable', () => {
    for (const [open, close, key] of [
        [modals.openSpriteLibrary, modals.closeSpriteLibrary, 'spriteLibrary'],
        [modals.openCostumeLibrary, modals.closeCostumeLibrary, 'costumeLibrary'],
        [modals.openBackdropLibrary, modals.closeBackdropLibrary, 'backdropLibrary'],
        [modals.openSoundLibrary, modals.closeSoundLibrary, 'soundLibrary']
    ]) {
        const opened = modalsReducer(undefined, open());
        assert.equal(opened[key], true);
        assert.equal(modalsReducer(opened, close())[key], false);
    }
});

test('all audited tutorial files remain absent from source', async () => {
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
    assert.equal(await verifyTutorialRemoval(root), 1500);
});
