const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const ref = 'ea3c6d26236748aa090be7efe89cb57a3d6a70d0';
const git = args => execFileSync('git', args, {cwd:root, encoding:'utf8'});
// Shallow CI checkouts need the immutable released baseline object.
try { git(['cat-file','-e',ref+'^{commit}']); }
catch (_) { git(['fetch','--no-tags','--depth=1','origin',ref]); }
const plain = value => JSON.parse(JSON.stringify(value));
const ctx = {window:{}, document:{readyState:'loading',addEventListener(){}}};
vm.createContext(ctx);
for (const file of ['city-events.js','data/events/events-manifest.js']) vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
const {EVENTS_DATA:data,FEP_EVENTS:rules} = ctx.window;
const before = {window:{}};
vm.runInNewContext(git(['show', ref + ':data/events/events-manifest.js']),before);
const baseline = plain(before.window.EVENTS_DATA);
const ids = new Set(baseline.events.map(e=>e.id));
const audit = JSON.parse(fs.readFileSync(path.join(root,'docs/nov-dec-source-review-2026-11-04.json'),'utf8'));
const additions = plain(data.events.filter(e=>!ids.has(e.id)));
const expectedDates = [
 ['2026-11-14T10:00:00-07:00','2026-11-14T15:00:00-07:00'],
 ['2026-12-17T10:00:00-07:00','2026-12-17T15:00:00-07:00'],
 ['2026-11-14T09:00:00-07:00','2026-11-14T11:00:00-07:00'],
 ['2026-11-20T10:00:00-07:00','2026-11-20T16:00:00-07:00'],
 ['2026-11-20T17:00:00-07:00','2026-11-20T19:00:00-07:00'],
 ['2026-11-27T17:00:00-07:00','2026-11-27T19:00:00-07:00'],
 ['2026-12-05T11:00:00-07:00','2026-12-05T14:00:00-07:00'],
 ['2026-12-13T11:00:00-07:00','2026-12-13T14:00:00-07:00'],
 ['2026-12-18T10:00:00-07:00','2026-12-18T16:00:00-07:00'],
 ['2026-12-20T13:00:00-07:00','2026-12-20T16:00:00-07:00']
];
test('ten approved occurrences are additive; all 58 prior objects and city metadata stay exact',()=>{
 assert.equal(baseline.events.length,58); assert.equal(data.events.length,68);
 assert.deepEqual(plain(data.events.filter(e=>ids.has(e.id))),baseline.events);
 assert.deepEqual(plain(data.cities),baseline.cities);
 assert.equal(new Set(data.events.map(e=>e.id)).size,68);
 assert.deepEqual(additions,audit.events);
 assert.equal(additions.length,10);
 assert.deepEqual(additions.map(e=>[e.dateStart,e.dateEnd]).sort(),expectedDates.sort());
 assert.deepEqual(additions.reduce((a,e)=>(a[e.city]=(a[e.city]||0)+1,a),{}),{aurora:7,denver:2,parker:1});
});
test('every new occurrence has approved, explicit, safe provenance and single-day calendar data',()=>{
 for(const e of additions){
  for(const key of ['id','city','title','dateStart','dateEnd','dateLabel','timeLabel','locationLabel','costLabel','audienceLabel','description','href','sourceType','verifiedAt','registrationLabel','availabilityLabel']) assert.ok(e[key],e.id+': '+key);
  assert.equal(e.status,'approved'); assert.equal(e.costType,'free');
  assert.equal(e.timezone,'America/Denver'); assert.equal(e.recurring,false);
  assert.equal(e.dateStart.slice(0,10),e.dateEnd.slice(0,10));
  assert.ok(new Date(e.dateEnd)>new Date(e.dateStart));
  assert.ok(e.verifiedAt>='2026-11-04');
  assert.ok(e.sourceUrls.length); assert.ok(e.sourceUrls.includes(e.href));
  for(const url of [e.href,e.registrationUrl,...e.sourceUrls].filter(Boolean)){
   const u=new URL(url);assert.equal(u.protocol,'https:');assert.equal(u.username,'');assert.equal(u.password,'');
  }
  assert.equal(e.schedule,undefined);assert.equal(e.series_start,undefined);assert.equal(e.series_end,undefined);
  assert.doesNotMatch(e.availabilityLabel,/guaranteed (?:entry|tickets)|tickets available now|reserved for you/i);
 }
});
test('only the ten specifically approved occurrence IDs enter the manifest',()=>{
 assert.deepEqual(audit.heldBackEvents,[]);
 assert.deepEqual(additions.map(e=>e.id).sort(),[
 'aurora-stewardship-saturdays-2026','denver-four-mile-free-day-2026-11-20',
 'aurora-santas-grand-arrival-2026','parker-mayors-holiday-lighting-2026',
 'aurora-delaney-holiday-open-day-2026-12-05','aurora-delaney-holiday-open-day-2026-12-13',
 'denver-four-mile-free-day-2026-12-18','aurora-camp-gingerbread-grinch-2026',
 'aurora-plains-free-day-2026-11-14','aurora-plains-free-day-2026-12-17'
 ].sort());
});
test('each occurrence expires at its own exact end in Denver, Tokyo, Los Angeles and UTC',()=>{
 const script=`const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const c={window:{},document:{readyState:'loading',addEventListener(){}}};vm.createContext(c);vm.runInContext(fs.readFileSync('city-events.js','utf8'),c);const a=JSON.parse(fs.readFileSync('docs/nov-dec-source-review-2026-11-04.json','utf8')).events;for(const e of a){const end=Date.parse(e.dateEnd);assert.equal(c.window.FEP_EVENTS.isCurrent(e,new Date(end-1)),true,e.id);assert.equal(c.window.FEP_EVENTS.isCurrent(e,new Date(end)),false,e.id);assert.equal(c.window.FEP_EVENTS.isCurrent(e,new Date(end+86400000)),false,e.id);}for(const prefix of [/Four Mile/i,/DeLaney/i,/Plains/i]){const es=a.filter(e=>prefix.test(e.title)).sort((a,b)=>a.dateStart.localeCompare(b.dateStart));assert.equal(es.length,2);assert.equal(c.window.FEP_EVENTS.isCurrent(es[0],new Date(es[0].dateEnd)),false);assert.equal(c.window.FEP_EVENTS.isCurrent(es[1],new Date(es[0].dateEnd)),true);}`;
 for(const TZ of ['America/Denver','Asia/Tokyo','America/Los_Angeles','UTC'])execFileSync(process.execPath,['-e',script],{cwd:root,env:{...process.env,TZ}});
});
test('event draft changes no runtime, GPS, park data or page code',()=>{
 const files=git(['ls-tree','-r','--name-only',ref]).trim().split('\n').filter(f=>/\.(?:js|html|css)$/.test(f)&&!f.startsWith('tests/')&&!f.startsWith('docs/')&&f!=='data/events/events-manifest.js');
 assert.ok(files.includes('gps-availability.js'));assert.ok(files.includes('events.html'));
 for(const file of files)assert.equal(fs.readFileSync(path.join(root,file),'utf8'),git(['show',ref+':'+file]),file);
});
test('fresh source evidence maps every approved occurrence to its own start and end',()=>{
 assert.equal(audit.baseCommit,ref); assert.equal(audit.sourceEvidence.length,10);
 for(const e of additions){
  const evidence=audit.sourceEvidence.find(item=>item.id===e.id);assert.ok(evidence,e.id);
  assert.ok(Date.parse(evidence.checkedAtUtc)>=Date.parse('2026-11-05T00:45:00Z'));
  assert.equal(evidence.occurrence.starts_at,e.dateStart);assert.equal(evidence.occurrence.ends_at,e.dateEnd);
  assert.equal(evidence.occurrence.expires_at,e.dateEnd);
  assert.deepEqual(evidence.sources,e.sourceUrls);
 }
});
test('free-entry qualifications, signup deadlines and short-preview warnings stay explicit',()=>{
 const preview=e=>e.description.length>118?e.description.slice(0,115).replace(/\s+\S*$/,'')+'…':e.description;
 const find=id=>additions.find(e=>e.id===id);
 const stewardship=find('aurora-stewardship-saturdays-2026');
 assert.match(preview(stewardship),/Register by Nov\. 12/);
 assert.match(stewardship.registrationLabel,/required.*November 12.*closing hour.*not published/i);
 assert.match(stewardship.registrationUrl,/detail\/4271\?/);
 assert.doesNotMatch([stewardship.description,stewardship.costLabel,stewardship.registrationLabel,stewardship.availabilityLabel].join(' '),/\b(?:6|six) (?:places|spaces|spots|tickets|seats) (?:left|remaining|available)|\b(?:remaining|available) (?:capacity|places|spaces|spots|tickets|seats)\s*(?::|of|is)?\s*6\b/iu);
 for(const e of additions.filter(e=>e.id.includes('plains-free-day'))){
  assert.match(preview(e),/registration required/i);assert.match(e.costLabel,/\$0/);
  assert.match(e.registrationLabel,/required.*Eventbrite.*no closing hour/i);
  assert.match(e.availabilityLabel,/Capacity can change/);
  assert.ok(e.registrationLabel.includes(e.id.endsWith('11-14') ? 'Ticket sales end November 14, 2026' : 'Ticket sales end December 17, 2026'));
  assert.doesNotMatch([e.description,e.costLabel,e.registrationLabel,e.availabilityLabel].join(' '),/\b(?:6|six) (?:places|spaces|spots|tickets|seats) (?:left|remaining|available)|\b(?:remaining|available) (?:capacity|places|spaces|spots|tickets|seats)\s*(?::|of|is)?\s*6\b|1\s*[–—-]\s*10|capacity (?:of|is|:) ?10/iu);
  assert.match(e.timeLabel,/10 a\.m.–3 p\.m\. MST/);
 }
 for(const e of additions.filter(e=>e.id.includes('four-mile'))){
  assert.match(preview(e),/last entry 3:30 p\.m\./);
  assert.match(e.costLabel,/special events and programs excluded/);
  assert.match(e.registrationLabel,/groups.*without advance notice/);
  assert.match(e.availabilityLabel,/did not expose live capacity.*about 10 people/);
  assert.match(e.dateEnd,/T16:00:00-07:00$/);
 }
 for(const id of ['aurora-santas-grand-arrival-2026','aurora-camp-gingerbread-grinch-2026']){
  const e=find(id);assert.match(preview(e),/photo.*separate/i);
  assert.match(e.costLabel,/photo prices unverified/i);
  assert.equal(e.registrationUrl,undefined,'photo reservation must not become an admission signup');
 }
 const parker=find('parker-mayors-holiday-lighting-2026');
 assert.match(preview(parker),/food costs extra.*first 1,000/);
 assert.match(parker.availabilityLabel,/parking lot is closed.*3:30–8 p\.m\./);
 assert.match(parker.timeLabel,/lighting at 6 p\.m\./);
 for(const e of additions.filter(e=>e.id.includes('delaney'))){
  assert.match(e.registrationLabel,/No registration requirement.*stated/);
  assert.equal(e.registrationUrl,undefined);
 }
});
