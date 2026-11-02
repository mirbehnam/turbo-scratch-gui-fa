const projectLoaders = [];
const installedBlocks = new WeakSet();

const selectProject = () => projectLoaders[projectLoaders.length - 1].selectFile();
const loadProject = (url, filename) => projectLoaders[projectLoaders.length - 1].loadUrl(url, filename);

export const registerAndroidProjectLoader = (selectFile, loadUrl) => {
    const loader = {selectFile, loadUrl};
    projectLoaders.push(loader);
    window.AndroidScratchLoadProject = selectProject;
    window.AndroidScratchLoadProjectUrl = loadProject;
    const saver = window.AndroidProjectSaver;
    if (projectLoaders.length === 1 && saver && typeof saver.projectLoaderReady === 'function') {
        saver.projectLoaderReady();
    }
    return () => {
        projectLoaders.splice(projectLoaders.indexOf(loader), 1);
        if (projectLoaders.length === 0) {
            delete window.AndroidScratchLoadProject;
            delete window.AndroidScratchLoadProjectUrl;
        }
    };
};

export const readAndroidProject = async (url, filename) => {
    const saver = window.AndroidProjectSaver;
    if (saver && typeof saver.projectLoadStarted === 'function') saver.projectLoadStarted();
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load Android project: ${response.status} ${response.statusText}`);
    }
    return new File([await response.arrayBuffer()], filename, {type: 'application/x.scratch.sb3'});
};

export const saveAndroidBlob = (filename, blob) => {
    const saver = window.AndroidProjectSaver;
    if (!saver) return null;
    let methods;
    if (/\.sb3$/i.test(filename)) {
        methods = ['beginSave', 'appendChunk', 'finishSave'];
    } else if (/\.sprite3$/i.test(filename)) {
        methods = ['beginSpriteSave', 'appendSpriteChunk', 'finishSpriteSave'];
    } else {
        return null;
    }
    if (!methods.every(method => typeof saver[method] === 'function')) return null;
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(reader.error);
        reader.onabort = () => reject(new Error('Android file transfer was aborted'));
        reader.onload = () => {
            try {
                const encoded = reader.result.split(',')[1];
                if (methods[0] === 'beginSpriteSave') saver[methods[0]](filename, blob.size);
                else saver[methods[0]](filename);
                const chunkSize = 262144;
                for (let offset = 0; offset < encoded.length; offset += chunkSize) {
                    saver[methods[1]](encoded.slice(offset, offset + chunkSize));
                }
                saver[methods[2]]();
                resolve();
            } catch (error) {
                reject(error);
            }
        };
        reader.readAsDataURL(blob);
    });
};

export const installAndroidNumberInput = scratchBlocks => {
    if (installedBlocks.has(scratchBlocks)) return;
    installedBlocks.add(scratchBlocks);
    const originalShowEditor = scratchBlocks.FieldNumber.prototype.showEditor_;
    scratchBlocks.FieldNumber.prototype.showEditor_ = function (...args) {
        if (!window.AndroidScratchTextInput) return originalShowEditor.apply(this, args);
        scratchBlocks.FieldNumber.activeField_ = this;
        scratchBlocks.FieldTextInput.prototype.showEditor_.call(this, false, false);
        scratchBlocks.FieldTextInput.htmlInput_.setAttribute('inputmode', 'decimal');
    };
};
