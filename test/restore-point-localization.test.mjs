import {rebrandInterfaceMessages} from '../src/lib/interface-branding.js';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {messageOverrides} from '../src/lib/supported-locales.js';
const ids = ['tw.menuBar.restorePoints', 'tw.restorePoints.title', 'tw.restorePoints.description',
    'tw.restorePoints.never', 'tw.restorePoints.1minute', 'tw.restorePoints.minutes', 'tw.restorePoints.intervalOption',
    'tw.restorePoints.off', 'tw.restorePoints.loading', 'tw.restorePoints.empty', 'tw.restorePoints.size',
    'tw.restorePoints.size2', 'tw.restorePoints.deleteAll', 'tw.restorePoints.assets', 'tw.restorePoints.confirmLoad',
    'tw.restorePoints.confirmDelete', 'tw.restorePoints.confirmDeleteAll', 'tw.restorePoints.error',
    'tw.restorePoints.loadError', 'tw.restorePoints.exportError', 'tw.restorePoints.export', 'tw.restorePoints.delete',
    'tw.menuBar.60on', 'tw.menuBar.60off', 'tw.menuBar.moreSettings'];
test('Persian and Arabic cover restore-point UI and edit-menu settings without upstream app branding', () => {
    for (const locale of ['fa', 'ar']) {
        for (const id of ids) {
            assert.equal(typeof messageOverrides[locale][id], 'string', `${locale}: ${id}`);
            assert.ok(!messageOverrides[locale][id].includes('TurboWarp'), `${locale}: ${id}`);
        }
    }
});

test('interface branding replaces visible names while preserving upstream URLs', () => {
    const result = rebrandInterfaceMessages({help: 'TurboWarp opens projects.', link: 'https://github.com/TurboWarp/scratch-gui'}, 'fa');
    assert.equal(result.help, 'اسکرچ فارسی opens projects.');
    assert.equal(result.link, 'https://github.com/TurboWarp/scratch-gui');
});
