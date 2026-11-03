import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {runInNewContext} from 'node:vm';
import * as androidBridge from '../src/lib/android-bridge.js';

const require = createRequire(import.meta.url);
const {transformSync} = require('@babel/core');
const source = readFileSync(new URL('../src/lib/sb-file-uploader-hoc.jsx', import.meta.url), 'utf8');
const compiled = transformSync(source, {babelrc: false, configFile: false,
    plugins: ['@babel/plugin-transform-modules-commonjs', '@babel/plugin-transform-react-jsx']}).code;

test('Android startup commands queue until a showing project state and upload only once', async () => {
    const previousWindow = globalThis.window;
    const previousReader = globalThis.FileReader;
    globalThis.FileReader = class { readAsArrayBuffer () {} };
    let ready = 0;
    let reads = 0;
    const requestedStates = [];
    globalThis.window = {AndroidProjectSaver: {projectLoaderReady: () => ready++}};
    let Uploader;
    const pass = component => component;
    const modules = {
        react: {Component: class { constructor (props) { this.props = props; } }},
        'react-redux': {connect: () => component => { Uploader = component; return component; }},
        'react-intl': {injectIntl: pass, intlShape: require('prop-types').object},
        'lodash.bindall': (object, names) => names.forEach(name => { object[name] = object[name].bind(object); }),
        './android-bridge': {...androidBridge, readAndroidProject: async () => { reads++; return {}; }},
        '../reducers/project-state': {LoadingStates: []},
        '../lib/log': {},
        './shared-messages': {},
        '../reducers/tw': {},
        '../reducers/project-title': {},
        '../reducers/modals': {},
        '../reducers/menus': {}
    };
    const result = {exports: {}};
    runInNewContext(compiled, {module: result, exports: result.exports, window, FileReader: globalThis.FileReader,
        require: name => modules[name] || require(name)});
    result.exports.default(() => null);
    const loading = {isShowingProject: false, isLoadingUpload: false, loadingState: 'LOADING_VM_NEW_DEFAULT',
        onSetFileHandle: () => {}, requestProjectUpload: state => requestedStates.push(state)};
    const instance = new Uploader(loading);
    try {
        instance.componentDidMount();
        assert.equal(ready, 1);
        await window.AndroidScratchLoadProjectUrl('https://appassets.androidplatform.net/projects/a.sb3', 'a.sb3');
        assert.equal(reads, 0, 'an early command must not fetch or dispatch into an initializing VM');
        instance.props = {...loading, isShowingProject: true, loadingState: 'SHOWING_WITHOUT_ID'};
        instance.componentDidUpdate(loading);
        await new Promise(resolve => setImmediate(resolve));
        assert.equal(reads, 1);
        assert.deepEqual(requestedStates, ['SHOWING_WITHOUT_ID']);
        const showing = instance.props;
        instance.props = {...loading, isLoadingUpload: true, loadingState: 'LOADING_VM_FILE_UPLOAD'};
        instance.componentDidUpdate(showing);
        await window.AndroidScratchLoadProjectUrl('https://appassets.androidplatform.net/projects/b.sb3', 'b.sb3');
        assert.equal(reads, 1, 'a request during an upload waits instead of overlapping VM loads');
        const uploading = instance.props;
        instance.props = showing;
        instance.componentDidUpdate(uploading);
        await new Promise(resolve => setImmediate(resolve));
        assert.equal(reads, 2);
        assert.deepEqual(requestedStates, ['SHOWING_WITHOUT_ID', 'SHOWING_WITHOUT_ID']);
        instance.componentDidUpdate(showing);
        assert.equal(reads, 2, 'rendering again must not replay the queued request');
    } finally {
        instance.componentWillUnmount();
        globalThis.window = previousWindow;
        globalThis.FileReader = previousReader;
    }
});
