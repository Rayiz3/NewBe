const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { createStore } = require('zustand/vanilla');
function setup({ fetchImpl, signOutFails = false } = {}) {
    let options, callback, listener;
    const removedKeys = [];
    const storage = { async removeItem(key) { removedKeys.push(key); } };
    const feed = createStore(() => ({ feed: ['default'], setFeed: feed => feedStore.setState({ feed }) }));
    const feedStore = feed;
    const session = { user: { id: 'user', user_metadata: { full_name: 'Name' } } };
    let starts = 0, stops = 0, removed = 0;
    const auth = {
        onAuthStateChange: cb => { callback = cb; return { data: { subscription: { unsubscribe() { removed++; } } } }; },
        getSession: async () => ({ data: { session }, error: null }),
        startAutoRefresh() { starts++; }, stopAutoRefresh() { stops++; },
        signOut: async args => { assert.equal(args.scope, 'local'); if (signOutFails) throw new Error('offline'); callback('SIGNED_OUT', null); return { error: null }; },
    };
    const modules = {
        '@/constants/data': { GOOGLE_WEB_CLIENT_ID: 'web' },
        'react-native': { Alert: { alert() {} }, Platform: { OS: 'android' }, AppState: {
            currentState: 'active', addEventListener: (_, cb) => { listener = cb; return { remove() { removed++; } }; },
        } },
        '@react-native-google-signin/google-signin': { GoogleSignin: { configure() {}, async signOut() {} } },
        '@supabase/supabase-js': { processLock() {}, createClient: (_, __, config) => { options = config; return {
            auth, from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { feed: ['saved'] } }) }) }) }),
        }; } },
        '@react-native-async-storage/async-storage': { default: storage },
        zustand: { create: createStore }, './persona': { usePersonaStore: feed },
    };
    const exports = {};
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(require.resolve('../systems/account.tsx'), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText, { exports, require: x => modules[x], process: { env: {} }, setTimeout, clearTimeout, AbortController, fetch: fetchImpl, console });
    return { exports, feed, options, storage, removedKeys, event: (event, value) => callback(event, value),
        background: () => listener('background'), counts: () => ({ starts, stops, removed }), session };
}
const settle = () => new Promise(resolve => setTimeout(resolve, 10));
test('native session uses durable storage and restores account and feed', async () => {
    const h = setup();
    assert.equal(h.options.auth.storage, h.storage);
    assert.equal(h.options.auth.persistSession, true);
    assert.equal(h.options.auth.autoRefreshToken, true);
    const cleanup = h.exports.initializeAccountSession();
    await settle();
    assert.equal(h.exports.useAccountStore.getState().userId, 'user');
    assert.equal(h.exports.useAccountStore.getState().isLogin, true);
    assert.equal(h.feed.getState().feed[0], 'saved');
    h.feed.getState().setFeed(['edited']);
    h.event('TOKEN_REFRESHED', h.session);
    await settle();
    assert.equal(h.feed.getState().feed[0], 'edited');
    h.background();
    assert.equal(h.counts().stops, 1);
    cleanup();
    assert.equal(h.counts().removed, 2);
});
test('explicit logout removes session and resets account and feed', async () => {
    const h = setup(); const cleanup = h.exports.initializeAccountSession();
    await settle();
    await h.exports.useAccountStore.getState().logout();
    assert.equal(h.exports.useAccountStore.getState().isLogin, false);
    assert.equal(h.exports.useAccountStore.getState().userId, null);
    assert.equal(h.feed.getState().feed[0], 'default');
    cleanup();
});
test('signed-out event wins over pending startup session read', async () => {
    const h = setup(); const cleanup = h.exports.initializeAccountSession();
    h.event('SIGNED_OUT', null);
    await settle();
    assert.equal(h.exports.useAccountStore.getState().isLogin, false);
    cleanup();
});

test('failed deletion preserves account and feed and releases busy state', async () => {
    const h = setup({ fetchImpl: async () => ({ ok: false, status: 503 }) });
    const cleanup = h.exports.initializeAccountSession(); await settle();
    await h.exports.useAccountStore.getState().deleteAccount();
    assert.equal(h.exports.useAccountStore.getState().isLogin, true);
    assert.equal(h.feed.getState().feed[0], 'saved');
    assert.equal(h.exports.useAccountStore.getState().isLoading, false);
    assert.equal(h.removedKeys.length, 0);
    cleanup();
});

test('confirmed deletion clears local storage even if signout fails and ignores late auth events', async () => {
    let requests = 0;
    const h = setup({ signOutFails: true, fetchImpl: async (_url, options) => {
        requests++;
        assert.equal(options.method, 'DELETE');
        assert.equal(options.body, undefined);
        return { ok: true };
    } });
    const cleanup = h.exports.initializeAccountSession(); await settle();
    await Promise.all([h.exports.useAccountStore.getState().deleteAccount(), h.exports.useAccountStore.getState().deleteAccount()]);
    assert.equal(requests, 1);
    assert.equal(h.exports.useAccountStore.getState().isLogin, false);
    assert.equal(h.feed.getState().feed[0], 'default');
    assert.equal(h.removedKeys.length, 3);
    h.event('TOKEN_REFRESHED', h.session);
    assert.equal(h.exports.useAccountStore.getState().isLogin, false);
    cleanup();
});
