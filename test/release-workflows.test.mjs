import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, writeFileSync, mkdtempSync, rmSync} from 'node:fs';
import {execFileSync, spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import path from 'node:path';
import {tmpdir} from 'node:os';

const require = createRequire(import.meta.url);
const yaml = require('js-yaml');
const readWorkflow = name => yaml.load(readFileSync(new URL(`../.github/workflows/${name}.yml`, import.meta.url), 'utf8'));

test('general CI is manual; custom releases and server restore points are explicit exceptions', () => {
    assert.deepEqual(Object.keys(readWorkflow('node.js').on).sort(), ['workflow_call', 'workflow_dispatch']);
    const release = readWorkflow('custom-release');
    assert.deepEqual(release.on.push.branches, ['my-develop']);
    assert.deepEqual(release.on.push.paths, ['package.json']);
    assert.equal(release.jobs.release.permissions.contents, 'write');
    const restore = readWorkflow('restore-point');
    assert.deepEqual(restore.on.push.branches, ['my-develop']);
    assert.equal(restore.jobs['restore-point'].permissions.contents, 'write');
});

test('release planner builds only version upgrades and rejects mismatched release tags', () => {
    const directory = mkdtempSync(path.join(tmpdir(), 'turbo-release-test-'));
    const git = (...args) => execFileSync('git', args, {cwd: directory, encoding: 'utf8'}).trim();
    try {
        git('init', '-q');
        const commit = version => {
            writeFileSync(path.join(directory, 'package.json'), JSON.stringify({version}));
            git('add', 'package.json');
            git('-c', 'user.name=Workflow Test', '-c', 'user.email=test@example.invalid', 'commit', '-qm', version);
            return git('rev-parse', 'HEAD');
        };
        const before = commit('3.2.37');
        commit('3.2.38');
        git('update-ref', 'refs/remotes/origin/my-develop', 'HEAD');
        const run = readWorkflow('custom-release').jobs.plan.steps.find(step => step.id === 'plan').run;
        const script = run.slice(run.indexOf('\n') + 1, run.lastIndexOf('\nNODE'));
        const filename = path.join(directory, 'plan.mjs');
        const output = path.join(directory, 'output');
        writeFileSync(filename, script);
        const plan = overrides => {
            writeFileSync(output, '');
            const result = spawnSync(process.execPath, [filename], {
                cwd: directory,
                encoding: 'utf8',
                env: {...process.env, EVENT_NAME: 'push', BEFORE_SHA: before,
                    RELEASE_TAG: '', GITHUB_REF: 'refs/heads/my-develop', GITHUB_OUTPUT: output, ...overrides}
            });
            return {...result, output: readFileSync(output, 'utf8')};
        };
        const upgrade = plan({});
        assert.equal(upgrade.status, 0, upgrade.stderr);
        assert.match(upgrade.output, /build=true/);
        assert.match(upgrade.output, /tag=v3\.2\.38-fa\.1/);
        assert.match(plan({BEFORE_SHA: git('rev-parse', 'HEAD')}).output, /build=false/);
        writeFileSync(path.join(directory, 'package.json'), JSON.stringify({version: '3.2.36'}));
        assert.match(plan({}).output, /build=false/);
        writeFileSync(path.join(directory, 'package.json'), JSON.stringify({version: '3.2.38'}));
        assert.notEqual(plan({EVENT_NAME: 'workflow_dispatch', RELEASE_TAG: 'v3.2.37-fa.1'}).status, 0);
        assert.match(plan({EVENT_NAME: 'release', RELEASE_TAG: 'restore-point-my-develop-abc'}).output, /build=false/);
    } finally {
        assert.equal(path.dirname(directory), path.resolve(tmpdir()));
        assert.ok(path.basename(directory).startsWith('turbo-release-test-'));
        rmSync(directory, {recursive: true, force: true});
    }
});

test('restore workflow uses only GitHub APIs, is idempotent and never moves a restore tag', async () => {
    const script = readWorkflow('restore-point').jobs['restore-point'].steps[0].with.script;
    const run = new (Object.getPrototypeOf(async () => {}).constructor)('github', 'context', 'core', script);
    let ref;
    let release;
    const calls = [];
    const missing = () => { throw Object.assign(new Error('Not found'), {status: 404}); };
    const github = {rest: {
        git: {
            getRef: async () => ref ? {data: ref} : missing(),
            createRef: async args => {
                calls.push(args);
                ref = {object: {type: 'commit', sha: args.sha}};
            }
        },
        repos: {
            getReleaseByTag: async () => release ? {data: release} : missing(),
            createRelease: async args => {
                calls.push(args);
                release = {...args, html_url: 'https://example.invalid/restore'};
                return {data: release};
            }
        }
    }};
    const context = {repo: {owner: 'test', repo: 'turbo'}, sha: 'a'.repeat(40), serverUrl: 'https://github.com', runId: 1};
    const summary = {addHeading: () => summary, addLink: () => summary, addRaw: () => summary, write: async () => {}};
    const core = {info: () => {}, summary};
    await run(github, context, core);
    assert.equal(calls.length, 2);
    assert.equal(release.prerelease, true);
    assert.equal(release.make_latest, 'false');
    assert.equal(ref.object.sha, context.sha);
    await run(github, context, core);
    assert.equal(calls.length, 2);
    ref.object.sha = 'b'.repeat(40);
    await assert.rejects(run(github, context, core), /must point to commit/);
});
