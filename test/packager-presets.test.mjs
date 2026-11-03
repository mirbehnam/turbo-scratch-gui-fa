import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createQualityPreset, identifyQualityPreset} from '../vendor/packager/src/p4/quality-presets.js';
import {waitForMinimumBuildTime, MINIMUM_BUILD_TIME} from '../vendor/packager/src/p4/build-timing.js';

const defaults = {app: {windowTitle: 'My project'}, controls: {}, cursor: {type: 'none'},
    compiler: {enabled: true}, packagedRuntime: true, interpolation: false, highQualityPen: false};

test('quality presets set exact requested playback controls without mutating project defaults', () => {
    for (const quality of ['high', 'medium']) {
        const result = createQualityPreset(defaults, quality);
        assert.equal(result.target, 'html');
        assert.equal(result.interpolation, quality === 'high');
        assert.equal(result.highQualityPen, quality === 'high');
        assert.equal(result.resizeMode, 'preserve-ratio');
        assert.equal(result.autoplay, true);
        assert.equal(result.cursor.type, 'auto');
        assert.deepEqual(result.controls, {greenFlag: {enabled: false}, stopAll: {enabled: true},
            pause: {enabled: true}, fullscreen: {enabled: true}});
        assert.equal(result.compiler.enabled, true);
        assert.equal(result.app.windowTitle, 'My project');
        assert.equal(identifyQualityPreset(result, defaults), quality);
        result.autoplay = false;
        assert.equal(identifyQualityPreset(result, defaults), null);
    }
    assert.equal(defaults.cursor.type, 'none');
    assert.deepEqual(defaults.controls, {});
});

test('build delay only waits for the remainder of the five-second display and supports cancellation', async () => {
    assert.equal(MINIMUM_BUILD_TIME, 5000);
    let delay;
    let finish;
    let cleared = false;
    const timers = {setTimeout: (callback, milliseconds) => { delay = milliseconds; finish = callback; return 1; },
        clearTimeout: () => { cleared = true; }};
    const controller = new AbortController();
    const wait = waitForMinimumBuildTime(100, controller.signal, () => 800, timers);
    assert.equal(delay, 4300);
    finish();
    await wait;
    delay = null;
    await waitForMinimumBuildTime(0, controller.signal, () => 6000, timers);
    assert.equal(delay, null, 'a slow build must not wait another five seconds');
    const cancelled = waitForMinimumBuildTime(100, controller.signal, () => 800, timers);
    controller.abort();
    await assert.rejects(cancelled, {name: 'AbortError'});
    assert.equal(cleared, true);
});
