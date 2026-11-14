const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), vm = require('node:vm'), ts = require('typescript');
const exports_ = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(require.resolve('../systems/responsiveLayout.ts'), 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: exports_ });
const { newsLayout } = exports_;
test('phone and tablet windows retain space for reading without scaling controls', () => {
    for (const [width, height] of [[320, 400], [360, 640], [430, 760], [800, 1100], [1280, 650], [740, 220]]) {
        const layout = newsLayout(width, height);
        assert.ok(layout.pageHeight - layout.bottomPadding >= 300);
        assert.ok(layout.figureSize <= width && layout.figureSize <= 480);
        assert.equal(layout.split, width >= 600);
    }
});
test('large fonts on a short split-screen window grow the scrollable page', () => {
    const normal = newsLayout(360, 250);
    const large = newsLayout(360, 250, 2);
    assert.ok(large.pageHeight >= normal.pageHeight * 2);
    assert.ok(large.figureSize < 32);
});
function loadSystem(file) {
    const exports = {};
    const { createStore } = require('zustand/vanilla');
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(require.resolve('../systems/' + file), 'utf8'),
        { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText,
    { exports, require: name => name === 'zustand' ? { create: createStore } : {} });
    return exports;
}
test('paging uses the measured viewport after rotation, not startup dimensions', () => {
    const { handlePageScroll, useScrollStore } = loadSystem('scroll.tsx');
    for (const width of [360, 1184, 700]) {
        handlePageScroll({ nativeEvent: { contentOffset: { x: width * 2 }, layoutMeasurement: { width } } });
        assert.equal(useScrollStore.getState().curPage, 2);
    }
});
test('button editing supports add, remove and reorder without dragging across offscreen zones', () => {
    const { usePersonaStore, moveSelectedPersona, toggleSelectedPersona } = loadSystem('persona.tsx');
    usePersonaStore.setState({ feed: ['a', 'b', 'c'], curPersona: 'b' });
    moveSelectedPersona(-1);
    assert.equal(usePersonaStore.getState().feed.join(','), 'b,a,c');
    moveSelectedPersona(-1);
    assert.equal(usePersonaStore.getState().feed.join(','), 'b,a,c');
    toggleSelectedPersona();
    assert.equal(usePersonaStore.getState().feed.join(','), 'a,c');
    toggleSelectedPersona();
    assert.equal(usePersonaStore.getState().feed.join(','), 'a,c,b');
});
