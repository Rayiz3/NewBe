// Exercise the real store actions with isolated native/auth/network boundaries.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { createStore } = require('zustand/vanilla');

function setup(fetch) {
    const messages = [];
    const account = createStore(() => ({ userId: 'a', isLogin: true }));
    const summary = { summaryId: 'news', personaId: 'persona', content: 'text' };
    const modules = {
        react: { useCallback: x => x }, 'expo-router': { useFocusEffect() {} },
        zustand: { create: createStore },
        'react-native': { Linking: {}, AppState: {} },
        './request': { isNewsUrlValid: () => true,
            useRequestStore: createStore(() => ({ summaries: { persona: summary } })) },
        '@/constants/data': { LINK_SERVER: 'https://test' },
        './account': { useAccountStore: account, getAccountAccessToken: async () => 'token' },
        './toast': { useToastStore: { getState: () => ({ show() {}, showLoading() {}, finishLoading(id, message) { if (message) messages.push(message); } }) } },
    };
    const exports = {};
    const source = ts.transpileModule(fs.readFileSync(require.resolve('../systems/scrap.tsx'), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    vm.runInNewContext(source, { exports, require: name => modules[name], fetch,
        AbortController, setTimeout, clearTimeout, console });
    return { store: exports.useScrapStore, account, summary, messages };
}
const response = body => ({ ok: true, json: async () => body });
const row = { id: 'saved', summaryId: 'news', savedAt: '2026-10-14T00:00:00Z' };


test('no lookup until click; saved item only shows toast', async () => {
    const calls = [];
    const { store, summary, messages } = setup(async (url, options) => {
        calls.push({ url, body: JSON.parse(options.body) });
        return response({ items: [{ summaryId: 'news', scrapId: 'saved' }] });
    });
    assert.equal(calls.length, 0);
    await store.getState().save(summary);
    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0].body, { summaryIds: ['news'] });
    assert.equal(messages.at(-1), '이미 스크랩한 뉴스예요.');
    assert.equal(store.getState().isSaving, false);
});

test('unsaved item is checked then saved; each click rechecks', async () => {
    let saved = false;
    const calls = [];
    const { store, summary } = setup(async url => {
        calls.push(url);
        if (url.endsWith('/status')) return response({ items: saved ? [{ summaryId: 'news', scrapId: 'saved' }] : [] });
        saved = true;
        return response(row);
    });
    await store.getState().save(summary);
    await store.getState().save(summary);
    assert.deepEqual(calls.map(url => url.split('/').at(-1)), ['status', 'scraps', 'status']);
    assert.equal(store.getState().items.length, 1);
});

test('lookup failure does not save and releases button for retry', async () => {
    let calls = 0;
    const { store, summary, messages } = setup(async () => { calls++; return { ok: false, status: 503 }; });
    await store.getState().save(summary);
    assert.equal(store.getState().isSaving, false);
    assert.equal(calls, 1);
    assert.ok(messages.at(-1).includes('확인하지 못했어요'));
});

test('account change during lookup prevents save and stale toast', async () => {
    let resolve;
    let calls = 0;
    const { store, account, summary, messages } = setup(() => { calls++; return new Promise(r => { resolve = r; }); });
    const pending = store.getState().save(summary);
    await new Promise(setImmediate);
    account.setState({ userId: 'b' });
    resolve(response({ items: [] }));
    await pending;
    assert.equal(calls, 1);
    assert.equal(messages.length, 0);
    assert.equal(store.getState().isSaving, false);
});

test('rapid double click issues only one check and one save', async () => {
    let resolve, calls = 0;
    const { store, summary } = setup(url => {
        calls++;
        if (url.endsWith('/status')) return new Promise(r => { resolve = r; });
        return Promise.resolve(response(row));
    });
    const pending = store.getState().save(summary);
    await new Promise(setImmediate);
    await store.getState().save(summary);
    resolve(response({ items: [] }));
    await pending;
    assert.equal(calls, 2);
});
