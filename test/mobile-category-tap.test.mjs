import {test} from 'node:test';
import assert from 'node:assert/strict';
import {installTouchCategoryTap} from '../src/addons/mobile-category-tap.js';

test('a short touch opens hover palettes, toggles the same category and leaves mouse handling alone', () => {
    const listeners = {};
    const element = {addEventListener: (type, callback) => { listeners[type] = callback; }};
    const categoryNode = {};
    const item = {item_: {contains: node => node === categoryNode}};
    const otherNode = {};
    const other = {item_: {contains: node => node === otherNode}};
    let opened = false;
    let selected = 0;
    let cleared = 0;
    let mode = 'cathover';
    let disabled = false;
    let dragging = false;
    const toolbox = {categoryMenu_: {categories_: [item, other]}, selectedItem_: item,
        setSelectedItem: value => { toolbox.selectedItem_ = value; selected++; }};
    const Blockly = {getMainWorkspace: () => ({getToolbox: () => toolbox, isDragging: () => dragging}),
        Touch: {clearTouchIdentifier: () => cleared++}};
    installTouchCategoryTap(element, Blockly, () => disabled, () => mode,
        () => opened, value => { opened = value; });
    const tap = node => listeners.touchend({target: node, touches: [], changedTouches: [{}],
        preventDefault () {}, stopImmediatePropagation () {}});
    assert.deepEqual(Object.keys(listeners), ['touchend']);
    tap(categoryNode); assert.equal(opened, true);
    tap(categoryNode); assert.equal(opened, false);
    tap(otherNode); assert.equal(opened, true);
    assert.equal(selected, 3); assert.equal(cleared, 3);
    mode = 'category'; tap(categoryNode); assert.equal(selected, 3);
    mode = 'hover'; disabled = true; tap(categoryNode); assert.equal(selected, 3);
    disabled = false; dragging = true; tap(categoryNode); assert.equal(selected, 3);
});
