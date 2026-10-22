/* November draft data checks. No network, booking, geolocation or production writes. */
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const context = {window:{},document:{readyState:'loading',addEventListener(){}}};
vm.createContext(context);
for (const file of ['city-events.js','data/events/events-manifest.js']) vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
const data = JSON.parse(JSON.stringify(context.window.EVENTS_DATA));
const rules = context.window.FEP_EVENTS;
const audit = JSON.parse(fs.readFileSync(path.join(root,'docs/november-source-review-2026-10-22.json'),'utf8'));
const ids = audit.events.map(e=>e.id), idSet = new Set(ids);
const events = data.events.filter(e=>idSet.has(e.id));
const digest = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const event = id => events.find(e=>e.id===id);
const at = value => new Date(value);
const preview = e => e.description.length > 118 ? e.description.slice(0,115).replace(/\s+\S*$/,'')+'…' : e.description;

test('exact approved eight plus cryptographically unchanged main58, metadata and six pumpkins',()=>{
  assert.equal(audit.baseline.commit,'0620e051dd0e765c32b2a548fc962ebc035b66d7');
  assert.equal(audit.baseline.manifestBlob,'a05ce81641f25f17bc2d4f3663d785a99bfa4157');
  assert.equal(events.length,8); assert.equal(data.events.length,66);
  assert.deepEqual(events,audit.events);
  const inherited=data.events.filter(e=>!idSet.has(e.id));
  assert.equal(inherited.length,58);
  assert.equal(digest(inherited),'821fe82ccdf1d9020c458640b63436a209648f9873979a0694f056542b7ecd5d');
  assert.equal(digest(data.cities),'894d21c38aece8833bd221cc37b72f3d6dc7b2886f66b8282e29ced6fa15540f');
  const pumpkins=data.events.filter(e=>e.pumpkin);
  assert.equal(pumpkins.length,6);
  assert.equal(digest(pumpkins),'b1db362fa2b3f1aad060c1039aef1cfbc476f9b7aa04a1a6a029f1e34cf8f9e9');
  assert.equal(new Set(data.events.map(e=>e.id)).size,66);
  const signatures=data.events.map(e=>[e.city,e.title.toLowerCase().replace(/[^a-z0-9]/g,''),e.dateStart].join('|'));
  assert.equal(new Set(signatures).size,66,'No duplicate city/title/start signatures');
  assert.equal(data.events.filter(e=>e.id==='louisville-7th-generation-farm-pumpkin-patch-2026').length,1);
});
test('all eight have verified free-entry qualifications, official HTTPS provenance and complete card fields',()=>{
  const counts={};
  for(const e of events){
    for(const key of ['id','city','title','section','description','dateStart','dateEnd','dateLabel','timeLabel','locationLabel','costLabel','costType','audienceLabel','href','sourceType','verifiedAt','status','registrationLabel','availabilityLabel']) assert.ok(e[key],e.id+': '+key);
    assert.equal(e.status,'approved'); assert.equal(e.verifiedAt,'2026-10-22'); assert.equal(e.costType,'free'); assert.equal(e.timezone,'America/Denver');
    assert.ok(['onetime','holiday'].includes(e.section),'Full-card renderer must expose booking requirements');
    for(const value of [e.dateStart,e.dateEnd]) {assert.match(value,/^2026-11-\d{2}T\d{2}:\d{2}:00-07:00$/);assert.ok(rules.validDate(value));}
    assert.ok(new Date(e.dateEnd)>new Date(e.dateStart)); assert.ok(data.cities[e.city]);
    for(const url of [e.href,...e.sourceUrls,...(e.registrationUrl?[e.registrationUrl]:[])]) assert.equal(new URL(url).protocol,'https:');
    assert.ok(audit.evidence.find(item=>item.id===e.id).sources.length);
    assert.doesNotMatch(JSON.stringify(e),/\b\d+ (?:openings|seats|places) (?:left|remaining|available)/i);
    counts[e.city]=(counts[e.city]||0)+1;
  }
  assert.deepEqual(counts,{aurora:2,denver:2,castle_rock:1,parker:2,centennial:1});
});
test('only20 actual November occurrences; separate DMNS sessions and month-scoped seasonal identities',()=>{
  assert.equal(events.reduce((n,e)=>n+(e.schedule?.length||1),0),20);
  const expected={
    'denver-dmns-free-admission-2026':['2026-11-07','2026-11-16'],
    'denver-mile-high-tree-2026':Array.from({length:11},(_,i)=>`2026-11-${20+i}`),
    'parker-hometown-holidays-2026':['2026-11-28','2026-11-29']
  };
  for(const [id,dates] of Object.entries(expected)){
    const e=event(id); assert.equal(e.recurring,true);assert.equal(e.calendarDisabled,true);
    assert.deepEqual(e.schedule.map(s=>s.date),dates); assert.equal(new Set(dates).size,dates.length);
    assert.equal(e.dateStart,e.schedule[0].dateStart);assert.equal(e.dateEnd,e.schedule.at(-1).dateEnd);
    assert.equal(e.series_start,dates[0]);assert.equal(e.series_end,dates.at(-1));
    assert.match(e.title,/November/);assert.match(e.dateLabel,/November/);
    for(const s of e.schedule){assert.match(s.time,/MST/);assert.ok(s.location);assert.match(s.dateStart,/-07:00$/);assert.match(s.dateEnd,/-07:00$/);assert.ok(new Date(s.dateEnd)>new Date(s.dateStart));}
  }
  assert.doesNotMatch(event('denver-dmns-free-admission-2026').recurrence_label,/7[–-]16/);
  assert.match(event('denver-mile-high-tree-2026').availabilityLabel,/Only November nights/);
  assert.match(event('parker-hometown-holidays-2026').availabilityLabel,/two November character dates only/);
});
test('required booking deadlines and age restrictions survive short preview truncation',()=>{
  const bird=event('aurora-fall-bird-walk-2026');
  assert.match(preview(bird),/ages 8\+/);assert.match(preview(bird),/Register by Nov\. 5/);assert.match(preview(bird),/registered adult/);
  assert.match(bird.registrationLabel,/November 5, 2026/);assert.match(bird.registrationLabel,/Closing hour is not published/);
  assert.match(bird.audienceLabel,/every minor.*registered adult/);assert.match(bird.audienceLabel,/Not a drop-off/);
  const care=event('aurora-stewardship-saturdays-2026');
  assert.match(preview(care),/all ages/);assert.match(preview(care),/Registration required by Nov\. 12/);assert.match(care.registrationLabel,/Closing hour is not published/);
  const game=event('centennial-family-tabletop-game-night-2026-11-02');
  assert.match(preview(game),/ages 5–teen/);assert.match(preview(game),/Registration required by Nov\. 2 at 5 p\.m\. MST/);
  assert.match(game.registrationLabel,/November 2, 2026 at 5 p\.m\. MST/);
  for(const e of [bird,care,game]){assert.equal(e.registrationUrl,e.href);assert.match(e.availabilityLabel,/Limited registration/);assert.match(e.availabilityLabel,/check/i);}
  assert.equal(new URL(bird.registrationUrl).pathname,'/auroracolorado/activity/search/detail/4215');
  assert.equal(new URL(care.registrationUrl).pathname,'/auroracolorado/activity/search/detail/4271');
  assert.equal(game.registrationUrl,'https://arapahoelibraries.bibliocommons.com/v2/events/6abdc93696ec3a003ad76eb0');
  for(const e of [bird,care]) {assert.ok(e.sourceUrls.includes(e.registrationUrl));assert.ok(e.sourceUrls.includes('https://www.auroragov.org/news/whats_new/aurora_fall_activities'));}
  assert.ok(event('denver-dmns-free-admission-2026').sourceUrls.includes('https://www.dmns.org/programs-and-events/freedays/'));
  assert.ok(event('denver-dmns-free-admission-2026').sourceUrls.every(url=>new URL(url).hostname.endsWith('dmns.org')));
});
test('admission extras and public-attendance uncertainties stay visible rather than in hidden notes',()=>{
  const museum=event('denver-dmns-free-admission-2026');assert.match(museum.costLabel,/temporary exhibitions, planetarium and theater.*not included/);assert.match(museum.registrationLabel,/No general-admission ticket or reservation/);
  const star=event('castle-rock-starlighting-2026');assert.match(star.availabilityLabel,/fireworks depend on weather/);assert.doesNotMatch(JSON.stringify(star),/shuttle|parking|road closure|Santa.*2/i);
  assert.match(preview(star),/weather and fire danger/);
  assert.match(star.timeLabel,/5:30/);assert.match(star.locationLabel,/300 Second Street/);
  const lighting=event('parker-mayors-holiday-lighting-2026');assert.match(lighting.costLabel,/first 1,000 guests only/);
  assert.match(preview(lighting),/first 1,000 guests only/);
  const hometown=event('parker-hometown-holidays-2026');assert.match(hometown.costLabel,/ice skating.*not included/);assert.match(hometown.registrationLabel,/not guaranteed/);
  assert.match(preview(hometown),/encounters not guaranteed/);assert.match(preview(hometown),/if operating/);
});
test('exact MST expiry preserves both separate sessions, then hides every November record at its own end',()=>{
  for(const e of events){const end=new Date(e.dateEnd).getTime();assert.equal(rules.isCurrent(e,new Date(end-1)),true,e.id);assert.equal(rules.isCurrent(e,new Date(end)),false,e.id);assert.equal(rules.isRecommendable(e,new Date(end)),false,e.id);}
  assert.equal(rules.isCurrent(event('denver-dmns-free-admission-2026'),at('2026-11-08T05:00:00Z')),true);
  assert.equal(rules.isCurrent(event('denver-dmns-free-admission-2026'),at('2026-11-17T00:00:00Z')),false);
  assert.equal(rules.isCurrent(event('denver-mile-high-tree-2026'),at('2026-12-01T05:00:00Z')),false);
  assert.equal(events.some(e=>rules.isCurrent(e,at('2026-12-01T07:00:00Z'))),false);
  assert.equal(rules.localStamp(at('2026-11-01T07:30:00Z')),'2026-11-01T01:30:00');
  assert.equal(rules.localStamp(at('2026-11-01T08:30:00Z')),'2026-11-01T01:30:00');
  assert.equal(rules.localStamp(at('2026-11-02T00:00:00Z')),'2026-11-01T17:00:00');
});
test('November park links resolve only to existing city records and add no new park dataset',()=>{
  for(const city of ['aurora','parker']){
    const c={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,city+'-parks-data.js'),'utf8'),c);
    for(const e of events.filter(e=>e.city===city)) for(const p of e.nearbyParks||[]) assert.ok(c.window.PARKS.some(park=>park.id===p.id),e.id+': '+p.id);
  }
  for(const id of ['denver-dmns-free-admission-2026','denver-mile-high-tree-2026','centennial-family-tabletop-game-night-2026-11-02']) assert.equal(event(id).nearbyParks,undefined);
});
