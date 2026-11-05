/* Exact-checkout UI checks. All external traffic is stubbed; no live changes. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require('playwright'),AxeBuilder=require('@axe-core/playwright').default;
const root=path.resolve(__dirname,'..'),out=path.join(root,'test-results'),engine=process.env.BROWSER||'chromium';
const manifest=fs.readFileSync(path.join(root,'data/events/events-manifest.js'),'utf8');
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
 await context.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.fulfill({status:200,contentType:r.request().resourceType()==='stylesheet'?'text/css':'text/javascript',body:''}));
 await check(`${width}: truthful content header, original per-listing checks and preserved archive`,async()=>{
  await page.goto(origin+'/events.html');assert.equal(await page.locator('#updated-label').innerText(),'Event listings updated November 4, 2026');
  assert.equal(await page.locator('#verification-note').textContent(),'Verification dates appear on listings when available.');
  assert.equal(await page.getByRole('button',{name:'Pumpkin Patches',exact:true}).count(),0);assert.equal(await all(page).count(),1);assert.equal(await all(page).getAttribute('aria-pressed'),'true');
  assert.equal(await page.evaluate(()=>window.EVENTS_DATA.events.length),68);assert.equal((await ids(page)).length,10);
  for(const card of await page.locator('[data-current="true"]').all())assert.match(await card.textContent(),/Details checked November 4, 2026/);
  assert.equal(await page.locator('[data-current="false"]').count(),56);await page.locator('summary.section-summary').click();
  const historical=page.locator('[data-event-id="aurora-nicks-fall-fest-2026"]');assert.equal(await historical.count(),1);assert.match(await historical.textContent(),/Details checked October 21, 2026/);
  assert.equal(await page.locator('.pumpkin-card[data-current="false"]').count(),5);
  assert.equal(await page.evaluate(()=>window.EVENTS_DATA.events.filter(e=>e.pumpkin).length),6);
  assert.equal(await page.locator('[data-event-id="platteville-miller-farms-fall-harvest-2026"]').count(),0,'Unknown season end is not falsely archived');
  const axe=await new AxeBuilder({page}).include('.page-header').include('.event-category-pills').include('.event-filter-pills').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(axe.violations.map(v=>v.id),[]);
  fs.writeFileSync(path.join(out,`${engine}-events-page-polish-axe-${width}.json`),JSON.stringify(axe.violations,null,2));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:path.join(out,`${engine}-events-page-polish-${width}.png`),fullPage:false});
 });
 await check(`${width}: retired links preserve city and search parameters without extra history`,async()=>{
  await page.goto(origin+'/events.html?city=denver&q=family&tag=one&tag=two&utm_source=review#pumpkin-patches');const sentinel=page.url();
  await page.goto(origin+'/events.html?city=aurora&category=pumpkin-patches&q=family&tag=one&tag=two&utm_source=review#pumpkin-patches');
  let u=new URL(page.url());assert.equal(u.searchParams.has('category'),false);assert.equal(u.searchParams.get('city'),'aurora');assert.equal(u.searchParams.get('q'),'family');assert.deepEqual(u.searchParams.getAll('tag'),['one','two']);assert.equal(u.hash,'#pumpkin-patches');assert.equal((await ids(page)).length,7);
  await page.goBack();assert.equal(page.url(),sentinel,'Normalization adds no history entry');await page.goForward();assert.equal((await ids(page)).length,7);
  await city(page,'parker').click();assert.equal((await ids(page)).length,1);await all(page).click();assert.equal((await ids(page)).length,10);
  u=new URL(page.url());assert.equal(u.searchParams.has('city'),false);assert.equal(u.searchParams.get('q'),'family');assert.equal(u.hash,'#pumpkin-patches');
  await page.goBack();assert.equal((await ids(page)).length,1);await page.goBack();assert.equal((await ids(page)).length,7);await page.goForward();assert.equal((await ids(page)).length,1);
  await city(page,'arvada').click();assert.equal((await ids(page)).length,0);assert.ok(await page.locator('#empty-city').isVisible());await all(page).focus();await page.keyboard.press('Enter');assert.equal((await ids(page)).length,10);
 });
 await check(`${width}: missing and invalid content dates never fabricate verification`,async()=>{
  const pattern='**/data/events/events-manifest.js*';
  for(const value of [null,'2026-02-31','not-a-date']){
   await page.route(pattern,r=>r.fulfill({contentType:'text/javascript',body:manifest+'\nwindow.EVENTS_DATA.contentUpdatedAt='+JSON.stringify(value)+';'}));
   await page.goto(origin+'/events.html');assert.equal(await page.locator('#updated-label').textContent(),'Curated event listings');assert.match(await page.locator('[data-current="true"]').first().textContent(),/Details checked November 4, 2026/);await page.unroute(pattern);
  }
 });
 await check(`${width}: no JavaScript exceptions`,async()=>assert.deepEqual(errors,[]));await context.close();
}}finally{if(browser)await browser.close();server.close();fs.writeFileSync(path.join(out,`${engine}-events-page-polish-results.json`),JSON.stringify({engine,results,failures},null,2));}console.log(`${results.length} passed, ${failures.length} failed`);if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
