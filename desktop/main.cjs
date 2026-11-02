const {app, BrowserWindow, session, shell} = require('electron');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const {version} = require('./package.json');

const root = path.join(__dirname, 'build');
const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.wasm': 'application/wasm'
};
let server;
let origin;

const startServer = () => new Promise((resolve, reject) => {
    // TurboWarp fetches its bundled fonts; a loopback origin also supports those requests offline.
    server = http.createServer(async (request, response) => {
        try {
            const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
            const target = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
            const relative = path.relative(root, target);
            if (relative.startsWith('..') || path.isAbsolute(relative)) {
                response.writeHead(403).end();
                return;
            }
            const data = await fs.readFile(target);
            response.writeHead(200, {
                'Content-Type': contentTypes[path.extname(target)] || 'application/octet-stream',
                'X-Content-Type-Options': 'nosniff'
            });
            response.end(data);
        } catch (error) {
            if (error.code === 'ENOENT' || error.code === 'EISDIR') response.writeHead(404).end();
            else if (error instanceof URIError) response.writeHead(400).end();
            else {
                console.error('TurboWarp local asset request failed:', request.url, error);
                response.writeHead(500).end();
            }
        }
    });
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
        origin = `http://127.0.0.1:${server.address().port}`;
        resolve();
    });
});

const openExternal = url => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url);
};

const createWindow = () => {
    const title = `TurboWarp FA ${version}`;
    const window = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 960,
        minHeight: 640,
        show: false,
        title,
        icon: path.join(__dirname, 'icon.png'),
        webPreferences: {contextIsolation: true, nodeIntegration: false, sandbox: true}
    });
    window.setMenuBarVisibility(false);
    window.once('ready-to-show', () => window.show());
    window.webContents.on('page-title-updated', event => {
        event.preventDefault();
        window.setTitle(title);
    });
    window.webContents.setWindowOpenHandler(({url}) => {
        openExternal(url);
        return {action: 'deny'};
    });
    window.webContents.on('will-navigate', (event, url) => {
        if (!url.startsWith(`${origin}/`)) {
            event.preventDefault();
            openExternal(url);
        }
    });
    window.loadURL(`${origin}/index.html`);
};

app.setName('TurboWarp FA');
app.setAppUserModelId('ir.behnamapps.turbowarp.fa');
app.whenReady().then(async () => {
    await startServer();
    session.defaultSession.on('will-download', (_event, item) => {
        item.setSaveDialogOptions({defaultPath: item.getFilename()});
    });
    createWindow();
}).catch(error => {
    console.error('Unable to start TurboWarp FA:', error);
    app.quit();
});
app.on('window-all-closed', () => app.quit());
app.on('before-quit', () => {
    if (server) server.close();
});
