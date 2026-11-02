import assetFiles from './libraries/offline-assets.json';

const bundledAssets = new Set(assetFiles);
const documentBaseURL = () => (typeof document === 'undefined' ? null : document.baseURI);

const getOfflineAssetURL = (assetId, dataFormat, baseURL = documentBaseURL()) => {
    const extension = dataFormat ? `.${dataFormat}` : '';
    const filename = extension && !assetId.endsWith(extension) ? `${assetId}${extension}` : assetId;
    if (!bundledAssets.has(filename)) return null;
    const relativeURL = `static/assets/${filename}`;
    return baseURL ? new URL(relativeURL, baseURL).href : relativeURL;
};

export default getOfflineAssetURL;
