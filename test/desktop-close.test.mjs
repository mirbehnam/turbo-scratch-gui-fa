import {test} from 'node:test';
import assert from 'node:assert/strict';
import config from '../desktop/window-config.cjs';

test('exit confirmation follows Persian, Arabic and English and defaults to Cancel', () => {
    for (const [locale, exit] of [['fa', 'خروج'], ['ar', 'خروج'], ['en', 'Exit']]) {
        const options = config.getCloseDialogOptions(locale);
        assert.equal(options.buttons[0], exit);
        assert.equal(options.defaultId, 1);
        assert.equal(options.cancelId, 1);
        assert.ok(options.title.includes('TurboWarp FA'));
    }
});

const fixture = response => {
    const calls = [];
    const mainWindow = {
        webContents: {executeJavaScript: async script => {
            assert.equal(script, 'document.documentElement.lang');
            return 'fa';
        }},
        isDestroyed: () => false,
        destroy: () => calls.push('destroy')
    };
    const handler = config.createCloseHandler({
        mainWindow,
        app: {quit: () => calls.push('quit')},
        dialog: {showMessageBox: async (_window, options) => {
            calls.push(options.buttons[0]);
            return {response};
        }},
        logger: {error: (...args) => calls.push(args)}
    });
    return {calls, handler, event: {preventDefault: () => calls.push('prevent')}};
};

test('Cancel keeps the window alive; confirmation destroys it and quits exactly once', async () => {
    const cancel = fixture(1);
    await cancel.handler(cancel.event);
    assert.deepEqual(cancel.calls, ['prevent', 'خروج']);
    const exit = fixture(0);
    await exit.handler(exit.event);
    await exit.handler(exit.event);
    assert.deepEqual(exit.calls, ['prevent', 'خروج', 'destroy', 'quit']);
});

test('repeated close clicks show only one confirmation at a time', async () => {
    const {handler, event, calls} = fixture(1);
    await Promise.all([handler(event), handler(event), handler(event)]);
    assert.deepEqual(calls, ['prevent', 'prevent', 'prevent', 'خروج']);
});

test('a failed confirmation preserves the window, logs the failure and permits another attempt', async () => {
    const error = new Error('Dialog failed');
    const errors = [];
    let attempts = 0;
    const handler = config.createCloseHandler({
        mainWindow: {webContents: {executeJavaScript: async () => 'fa'}, isDestroyed: () => false},
        app: {quit: () => assert.fail('Must not quit after an error')},
        dialog: {showMessageBox: async () => {
            if (++attempts === 1) throw error;
            return {response: 1};
        }},
        logger: {error: (...args) => errors.push(args)}
    });
    const event = {preventDefault: () => {}};
    await handler(event);
    await handler(event);
    assert.equal(attempts, 2);
    assert.equal(errors.length, 1);
    assert.equal(errors[0][1], error);
});
