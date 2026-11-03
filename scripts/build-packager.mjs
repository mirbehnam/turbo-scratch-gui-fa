import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const result = spawnSync(process.execPath, [path.join(root, 'node_modules/webpack-cli/bin/cli.js'),
    '--config', 'webpack.config.js', '--bail'], {
    cwd: path.join(root, 'vendor/packager'),
    stdio: 'inherit',
    env: {...process.env, NODE_ENV: 'production', STANDALONE: '1', ENABLE_SERVICE_WORKER: ''}
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);
