const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),base='02b53163f800b409a92a258cf44862887baa35c8';
const git=args=>execFileSync('git',args,{cwd:root,encoding:'utf8'});
try{git(['cat-file','-e',base+'^{commit}']);}catch(_){git(['fetch','--no-tags','--depth=1','origin',base]);}
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const plain=v=>JSON.parse(JSON.stringify(v));
function data(source){const c={window:{}};vm.runInNewContext(source,c);return plain(c.window.EVENTS_DATA);}
const before=data(git(['show',base+':data/events/events-manifest.js'])),after=data(read('data/events/events-manifest.js'));
const html=read('events.html');
function functionSource(name){const match=html.match(new RegExp('  function '+name+'\\(value\\) \\{[\\s\\S]*?\\n  \\}'));assert.ok(match,name);return match[0];}
const context={eventRules:{timeZone:'America/Denver'}};vm.createContext(context);
vm.runInContext(functionSource('formatDisplayDate')+'\n'+functionSource('eventContentUpdateLabel'),context);
test('all 68 records, verification dates, city metadata and six pumpkin records match released main exactly',()=>{
 assert.equal(after.events.length,68);assert.equal(new Set(after.events.map(e=>e.id)).size,68);
 assert.deepEqual(after.events,before.events);assert.deepEqual(after.cities,before.cities);
 assert.equal(after.events.filter(e=>e.pumpkin).length,6);
 assert.deepEqual(after.events.reduce((m,e)=>(m[e.verifiedAt||'missing']=(m[e.verifiedAt||'missing']||0)+1,m),{}),{'2026-10-21':27,missing:31,'2026-11-04':10});
});
test('editorial metadata records the November 4 content batch without rewriting historical checks',()=>{
 assert.equal(after.contentUpdatedAt,'2026-11-04');assert.equal(after.updatedLabel,undefined);
 assert.deepEqual(Object.keys(after).sort(),['cities','contentUpdatedAt','events']);
 assert.equal(context.eventContentUpdateLabel(after.contentUpdatedAt),'Event listings updated November 4, 2026');
 assert.match(html,/Verification dates appear on listings when available\./);
 assert.match(html,/eventContentUpdateLabel\(eventsData\.contentUpdatedAt\)/);
 assert.doesNotMatch(html,/eventsData\.updatedLabel|max.*verifiedAt/);
});
test('missing or invalid editorial metadata has an honest undated fallback',()=>{
 for(const value of [undefined,null,'','not-a-date','2026-02-31','2026-13-01','2026-11-04T12:00:00Z'])assert.equal(context.eventContentUpdateLabel(value),'Curated event listings',String(value));
 assert.equal(context.eventContentUpdateLabel('2024-02-29'),'Event listings updated February 29, 2024');
});
test('editorial date formatting is independent of visitor time zone',()=>{
 const script=`const vm=require('vm'),assert=require('assert/strict');const c={eventRules:{timeZone:'America/Denver'}};vm.createContext(c);vm.runInContext(${JSON.stringify(functionSource('formatDisplayDate')+'\n'+functionSource('eventContentUpdateLabel'))},c);assert.equal(c.eventContentUpdateLabel('2026-11-04'),'Event listings updated November 4, 2026');`;
 for(const TZ of ['UTC','America/Denver','America/Los_Angeles','Asia/Tokyo'])execFileSync(process.execPath,['-e',script],{env:{...process.env,TZ}});
});
test('removed category cannot leave hidden filtering and All events still resets the city',()=>{
 assert.doesNotMatch(html,/activeCategory/);assert.doesNotMatch(html,/\['pumpkin-patches', 'Pumpkin Patches'\]/);
 assert.match(html,/\[\['', 'All events'\]\]/);assert.match(html,/applyFilter\('', true\)/);
 assert.match(html,/history\.replaceState\(history\.state, '', url\)/);
 assert.match(html,/url\.searchParams\.delete\('category'\)/);
});
test('all other runtime, park data, GPS and dependency lockfile remain byte-exact',()=>{
 const files=git(['ls-tree','-rz','--name-only',base]).split('\0').filter(f=>f&&((/\.(?:html|js|css)$/.test(f)&&!f.startsWith('tests/')&&!f.startsWith('docs/'))||f==='package-lock.json')&&!['events.html','data/events/events-manifest.js'].includes(f));
 assert.ok(files.includes('gps-availability.js'));assert.ok(files.includes('parks.html'));assert.ok(files.includes('near-me.js'));
 for(const f of files)assert.equal(read(f),git(['show',base+':'+f]),f);
});
