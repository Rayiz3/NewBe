const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const {createStore}=require('zustand/vanilla');
function load(file,modules={},extra={}) {
 const exports={};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(require.resolve('../systems/'+file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,
 {exports,require:name=>modules[name],Date,AbortController,setTimeout,clearTimeout,console,...extra});
 return exports;
}
const policy=load('newsRefreshPolicy.tsx');
test('KST refresh boundary is 02:00 regardless of UTC date',()=>{
 assert.equal(policy.newsRefreshWindow(Date.parse('2026-10-16T16:59:00Z')).afterRefresh,false);
 const after=policy.newsRefreshWindow(Date.parse('2026-10-16T17:00:00Z'));
 assert.equal(after.afterRefresh,true);assert.equal(after.day,'2026-10-17');
 assert.equal(after.nextRefreshAt,Date.parse('2026-10-17T17:00:00Z'));
});
test('empty and mixed-day responses remain stale',()=>{
 assert.equal(policy.hasCurrentNews({},'2026-10-17'),false);
 assert.equal(policy.hasCurrentNews({a:{published:'2026-10-17'},b:{published:'2026-10-16'}},'2026-10-17'),false);
 assert.equal(policy.hasCurrentNews({a:{published:'2026-10-17'}},'2026-10-17'),true);
});
function setup(fetch){
 class Clock extends Date { static now(){return Date.parse('2026-10-17T03:00:00Z');} }
 return load('request.tsx',{'zustand':{create:createStore},'react-native':{},'@/constants/data':{LINK_SERVER:'https://test'},'./newsRefreshPolicy':policy,'./date':{useDateStore:{getState:()=>({refreshDate(){}})}}},{fetch,Date:Clock,console:{error(){}}}).useRequestStore;
}
const news=published=>({a:{personaId:'a',published,content:'summary'}});
test('stale response sets retry flag; current response clears it',async()=>{
 let date='2026-10-16';const s=setup(async()=>({ok:true,json:async()=>news(date)}));
 await s.getState().getSummaries();assert.equal(s.getState().refreshAttemptedDay,'2026-10-17');assert.equal(s.getState().needsRefresh,true);
 assert.ok(s.getState().nextRetryAt>Date.parse('2026-10-17T03:00:00Z'));
 date='2026-10-17';await s.getState().getSummaries();assert.equal(s.getState().needsRefresh,false);assert.equal(s.getState().retryCount,0);
});
test('refresh failure retains existing news and unlocks loading',async()=>{
 const s=setup(async()=>({ok:false,status:503}));s.setState({summaries:news('2026-10-16')});
 await s.getState().getSummaries();assert.equal(s.getState().summaries.a.content,'summary');assert.equal(s.getState().isLoading,false);assert.equal(s.getState().needsRefresh,true);
});
