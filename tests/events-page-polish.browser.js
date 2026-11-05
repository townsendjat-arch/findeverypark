/* Exact-checkout UI checks. All external traffic is stubbed; no live changes. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require('playwright'),AxeBuilder=require('@axe-core/playwright').default;
const root=path.resolve(__dirname,'..'),out=path.join(root,'test-results'),engine=process.env.BROWSER||'chromium';
const {historicalManifest:manifest}=require('./historical-events-fixture');
const {loadSources}=require('../scripts/generate-community-feed');
const candidateManifest=fs.readFileSync(path.join(root,'data/events/events-manifest.js'),'utf8');
const candidate=loadSources();
const candidateNow='2026-11-05T01:54:00Z';
const plain=value=>JSON.parse(JSON.stringify(value));
candidate.data=plain(candidate.data);
const currentIds=(data,now=candidateNow)=>data.events.filter(e=>candidate.rules.isCurrent(e,new Date(now))).map(e=>e.id).sort();
const archivedIds=(data,now=candidateNow)=>data.events.filter(e=>candidate.rules.isPublishable(e)&&!candidate.rules.isCurrent(e,new Date(now))&&!e.seasonEndUnknown).map(e=>e.id).sort();
async function withManifest(page, source, callback) {
 const pattern='**/data/events/events-manifest.js*';
 const handler=route=>route.fulfill({contentType:'text/javascript',body:source});
 await page.route(pattern,handler);
 try { return await callback(); } finally { await page.unroute(pattern,handler); }
}
function contentLabel(value) {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return 'Curated event listings';
 const date=new Date(value+'T12:00:00Z');
 if(Number.isNaN(date.getTime())||date.toISOString().slice(0,10)!==value)return 'Curated event listings';
 return 'Event listings updated '+date.toLocaleDateString('en-US',{timeZone:'America/Denver',month:'long',day:'numeric',year:'numeric'});
}
const evolutionEvent={
 id:'synthetic-maintenance-evolution',city:'aurora',section:'featured',featured:true,
 title:'Synthetic source maintenance example',description:'Test-only source evolution fixture, never published.',
 dateStart:'2026-11-06T10:00:00-07:00',dateEnd:'2026-11-06T11:00:00-07:00',
 dateLabel:'November 6, 2026',timeLabel:'10–11 a.m. Mountain',locationLabel:'Test-only location',
 costLabel:'Free',costType:'free',audienceLabel:'Families',status:'approved',recurring:false,
 timezone:'America/Denver',verifiedAt:'2026-11-05',sourceType:'official',
 href:'https://example.com/test-only-source',sourceUrls:['https://example.com/test-only-source'],
 registrationLabel:'Test-only qualification',availabilityLabel:'Test-only availability'
};
const results=[],failures=[];
const server=http.createServer((req,res)=>{try{if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return;}const u=new URL(req.url,'http://localhost'),p=path.resolve(root,'.'+u.pathname);if(!p.startsWith(root+path.sep)||u.pathname.split('/').some(v=>v.startsWith('.')))throw Error();res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css'})[path.extname(p)]||'application/octet-stream');res.end(fs.readFileSync(p));}catch(_){res.writeHead(404).end();}});
async function check(name,fn){try{await fn();results.push(name);console.log('PASS',name);}catch(e){failures.push({name,error:e.stack});console.error('FAIL',name,e.stack);}}
const all=p=>p.locator('.event-category-pill[data-category=""]');
const city=(p,key)=>p.locator(`.event-filter-pill[data-city="${key}"]`);
const ids=p=>p.locator('[data-current="true"]:visible').evaluateAll(es=>es.map(e=>e.dataset.eventId).sort());
(async()=>{fs.mkdirSync(out,{recursive:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;let browser;
try{browser=await({chromium,webkit})[engine].launch({headless:true});for(const width of [320,390,1440]){
 const context=await browser.newContext({viewport:{width,height:900},timezoneId:width===1440?'Asia/Tokyo':'America/Denver'}),page=await context.newPage(),errors=[];
 page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));await page.clock.install({time:new Date('2026-11-05T01:54:00Z')});
 await context.route('**/*',r=>{const url=new URL(r.request().url());if(url.origin===origin&&url.pathname==='/data/events/events-manifest.js')return r.fulfill({contentType:'text/javascript',body:manifest});return url.origin===origin?r.continue():r.fulfill({status:200,contentType:r.request().resourceType()==='stylesheet'?'text/css':'text/javascript',body:''});});
 await check(`historical ${width}: truthful content header, original per-listing checks and preserved archive`,async()=>{
  await page.goto(origin+'/events.html');assert.equal(await page.locator('#updated-label').textContent(),'Event listings updated November 4, 2026');
  assert.equal(await page.locator('#verification-note').textContent(),'Verification dates appear on listings when available.');
  assert.equal(await page.getByRole('button',{name:'Pumpkin Patches',exact:true}).count(),0);assert.equal(await all(page).count(),1);assert.equal(await all(page).getAttribute('aria-pressed'),'true');
  assert.equal(await page.evaluate(()=>window.EVENTS_DATA.events.length),68);assert.equal((await ids(page)).length,10);
  for(const card of await page.locator('[data-current="true"]').all())assert.match(await card.textContent(),/Details checked November 4, 2026/);
  assert.equal(await page.locator('[data-current="false"]').count(),56);await page.locator('summary.section-summary').click();
  const historical=page.locator('[data-event-id="aurora-nicks-fall-fest-2026"]');assert.equal(await historical.count(),1);assert.ok(await historical.isVisible());
  assert.equal(await page.evaluate(()=>window.EVENTS_DATA.events.find(e=>e.id==='aurora-nicks-fall-fest-2026').verifiedAt),'2026-10-21');
  const archivedPumpkins=await page.evaluate(()=>window.EVENTS_DATA.events.filter(e=>e.pumpkin&&!e.seasonEndUnknown).map(e=>e.id));assert.equal(archivedPumpkins.length,5);
  for(const id of archivedPumpkins)assert.equal(await page.locator(`[data-current="false"][data-event-id="${id}"]`).count(),1,id);
  assert.equal(await page.evaluate(()=>window.EVENTS_DATA.events.filter(e=>e.pumpkin).length),6);
  assert.equal(await page.locator('[data-event-id="platteville-miller-farms-fall-harvest-2026"]').count(),0,'Unknown season end is not falsely archived');
  const axe=await new AxeBuilder({page}).include('.page-header').include('.event-category-pills').include('.event-filter-pills').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(axe.violations.map(v=>v.id),[]);
  fs.writeFileSync(path.join(out,`${engine}-events-page-polish-axe-${width}.json`),JSON.stringify(axe.violations,null,2));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:path.join(out,`${engine}-events-page-polish-${width}.png`),fullPage:false});
 });
 await check(`historical ${width}: retired links preserve city and search parameters without extra history`,async()=>{
  await page.goto(origin+'/events.html?city=denver&q=family&tag=one&tag=two&utm_source=review#pumpkin-patches');const sentinel=page.url();
  await page.goto(origin+'/events.html?city=aurora&category=pumpkin-patches&q=family&tag=one&tag=two&utm_source=review#pumpkin-patches');
  let u=new URL(page.url());assert.equal(u.searchParams.has('category'),false);assert.equal(u.searchParams.get('city'),'aurora');assert.equal(u.searchParams.get('q'),'family');assert.deepEqual(u.searchParams.getAll('tag'),['one','two']);assert.equal(u.hash,'#pumpkin-patches');assert.equal((await ids(page)).length,7);
  await page.goBack();assert.equal(page.url(),sentinel,'Normalization adds no history entry');await page.goForward();assert.equal((await ids(page)).length,7);
  await city(page,'parker').click();assert.equal((await ids(page)).length,1);await all(page).click();assert.equal((await ids(page)).length,10);
  u=new URL(page.url());assert.equal(u.searchParams.has('city'),false);assert.equal(u.searchParams.get('q'),'family');assert.equal(u.hash,'#pumpkin-patches');
  await page.goBack();assert.equal((await ids(page)).length,1);await page.goBack();assert.equal((await ids(page)).length,7);await page.goForward();assert.equal((await ids(page)).length,1);
  await city(page,'arvada').click();assert.equal((await ids(page)).length,0);assert.ok(await page.locator('#empty-city').isVisible());await all(page).focus();await page.keyboard.press('Enter');assert.equal((await ids(page)).length,10);
 });
 await check(`historical ${width}: historical card check dates stay original and do not drive the content header`,async()=>{
  await page.clock.setFixedTime(new Date('2026-10-22T16:00:00Z'));await page.goto(origin+'/events.html');
  assert.match(await page.locator('[data-event-id="aurora-nicks-fall-fest-2026"]').textContent(),/Details checked October 21, 2026/);
  assert.equal(await page.locator('#updated-label').textContent(),'Event listings updated November 4, 2026');
  await page.clock.setFixedTime(new Date('2026-11-05T01:54:00Z'));
 });
 await check(`historical ${width}: missing and invalid content dates never fabricate verification`,async()=>{
  const pattern='**/data/events/events-manifest.js*';
  for(const value of [null,'2026-02-31','not-a-date']){
   await page.route(pattern,r=>r.fulfill({contentType:'text/javascript',body:manifest+'\nwindow.EVENTS_DATA.contentUpdatedAt='+JSON.stringify(value)+';'}));
   await page.goto(origin+'/events.html');assert.equal(await page.locator('#updated-label').textContent(),'Curated event listings');assert.match(await page.locator('[data-current="true"]').first().textContent(),/Details checked November 4, 2026/);await page.unroute(pattern);
  }
 });
 // Unlike the historical scenarios above, these use this exact checkout's
 // source. No expected event counts, IDs or verification dates are frozen.
 await check(`${width}: exact-checkout source renders canonical current/archive IDs and per-listing dates`,async()=>{
  await page.clock.setFixedTime(new Date(candidateNow));
  await withManifest(page,candidateManifest,async()=>{
   await page.goto(origin+'/events.html');
   assert.deepEqual(await page.evaluate(()=>window.EVENTS_DATA),plain(candidate.data));
   assert.deepEqual(await ids(page),currentIds(candidate.data));
   assert.deepEqual(await page.locator('[data-current="false"]').evaluateAll(nodes=>nodes.map(node=>node.dataset.eventId).sort()),archivedIds(candidate.data));
   assert.equal(await page.locator('#updated-label').textContent(),contentLabel(candidate.data.contentUpdatedAt));
   for(const item of candidate.data.events.filter(e=>candidate.rules.isCurrent(e,new Date(candidateNow)))) {
    const card=page.locator('[data-current="true"][data-event-id='+JSON.stringify(item.id)+']');
    assert.equal(await card.count(),1,item.id);assert.ok((await card.textContent()).includes(item.title),item.id);
    if(item.verifiedAt) {
     const verified=new Date(String(item.verifiedAt).length===10?item.verifiedAt+'T12:00:00Z':item.verifiedAt);
     const label=Number.isNaN(verified.getTime())?item.verifiedAt:verified.toLocaleDateString('en-US',{timeZone:'America/Denver',month:'long',day:'numeric',year:'numeric'});
     assert.ok((await card.textContent()).includes('Details checked '+label),item.id+': original per-listing verification');
    }
   }
   for(const key of await page.locator('.event-filter-pill').evaluateAll(nodes=>nodes.map(node=>node.dataset.city))) {
    await city(page,key).click();
    const expected=candidate.data.events.filter(e=>candidate.rules.isCurrent(e,new Date(candidateNow))&&(!key||candidate.rules.normCity(e.city)===key)).map(e=>e.id).sort();
    assert.deepEqual(await ids(page),expected,key||'all cities');
   }
   await all(page).click();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   const axe=await new AxeBuilder({page}).include('main').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   assert.deepEqual(axe.violations.map(v=>v.id),[]);
   fs.writeFileSync(path.join(out,`${engine}-current-source-axe-${width}.json`),JSON.stringify(axe.violations,null,2));
   await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
   await page.screenshot({path:path.join(out,`${engine}-current-source-${width}.png`),fullPage:false});
  });
 });
 await check(`${width}: exact-checkout homepage/city previews follow current canonical recommendations`,async()=>{
  await withManifest(page,candidateManifest,async()=>{
   const current=candidate.data.events.filter(e=>candidate.rules.isRecommendable(e,new Date(candidateNow)));
   await page.goto(origin+'/index.html');
   assert.equal(await page.locator('.home-event-card').count(),Math.min(3,current.length));
   for(const title of await page.locator('.home-event-title').allTextContents())assert.ok(current.some(e=>e.title===title),title);
   const keys=[...new Set(current.map(e=>candidate.rules.normCity(e.city)))].filter(key=>fs.existsSync(path.join(root,'best-parks-'+key.replace(/_/g,'-')+'.html')));
   for(const key of keys.length?keys:['aurora']) {
    await page.goto(origin+'/best-parks-'+key.replace(/_/g,'-')+'.html');
    const expected=current.filter(e=>candidate.rules.normCity(e.city)===key).sort((a,b)=>Boolean(a.featured)!==Boolean(b.featured)?(a.featured?-1:1):candidate.rules.startValue(a).localeCompare(candidate.rules.startValue(b))).slice(0,3);
    assert.deepEqual(await page.locator('.city-event-title').allTextContents(),expected.map(e=>e.title),key);
   }
  });
 });
 for(const change of ['add','update','cancel','remove']) {
  await check(`${width}: source-derived rendering accepts a future valid ${change}`,async()=>{
   const evolving=plain(candidate.data);evolving.contentUpdatedAt='2026-11-05';
   let item={...evolutionEvent};
   if(change==='update')item={...item,title:'Updated synthetic source example',description:'Updated test-only source copy.',dateStart:'2026-11-07T10:00:00-07:00',dateEnd:'2026-11-07T12:00:00-07:00',dateLabel:'November 7, 2026',timeLabel:'10 a.m.–noon Mountain'};
   if(change==='cancel')item={...item,status:'cancelled'};
   evolving.events.push(item);
   if(change==='remove')evolving.events=evolving.events.filter(e=>e.id!==item.id);
   await withManifest(page,'window.EVENTS_DATA = '+JSON.stringify(evolving)+';',async()=>{
    await page.goto(origin+'/events.html');assert.deepEqual(await ids(page),currentIds(evolving));
    const card=page.locator('[data-event-id="'+item.id+'"]');
    assert.equal(await card.count(),change==='cancel'||change==='remove'?0:1);
    if(change==='add'||change==='update') {
     assert.ok((await card.textContent()).includes(item.title));assert.ok((await card.textContent()).includes(item.dateLabel));
     await page.clock.setFixedTime(new Date(item.dateEnd));await page.clock.fastForward('01:00');
     assert.equal(await page.locator('[data-current="true"][data-event-id="'+item.id+'"]').count(),0);
     assert.equal(await page.locator('[data-current="false"][data-event-id="'+item.id+'"]').count(),1);
     await page.clock.setFixedTime(new Date(candidateNow));
    }
   });
   assert.equal(fs.readFileSync(path.join(root,'data/events/events-manifest.js'),'utf8'),candidateManifest,'Browser source variants never modify the actual manifest');
  });
 }
 await check(`historical ${width}: no JavaScript exceptions`,async()=>assert.deepEqual(errors,[]));await context.close();
}}finally{if(browser)await browser.close();server.close();fs.writeFileSync(path.join(out,`${engine}-events-page-polish-results.json`),JSON.stringify({engine,results,failures},null,2));}console.log(`${results.length} passed, ${failures.length} failed`);if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
