/* Local read-only browser regression. No event signup, external navigation or publication. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require('playwright');
const AxeBuilder=require('@axe-core/playwright').default;
const root=path.resolve(__dirname,'..'),output=path.join(root,'test-results');
const {historicalManifest,historicalFile}=require('./historical-events-fixture');
// These source-reviewed November/December examples are explicit historical
// fixtures; exact-checkout source rendering is covered by page-polish checks.
const audit=JSON.parse(historicalFile('docs/nov-dec-source-review-2026-11-04.json'));
const events=audit.events;
const engine=process.env.BROWSER||'chromium';
const initial='2026-11-05T00:45:00Z';
const results=[],failures=[];
const card=(page,e,current=true)=>page.locator(`[data-event-id="${e.id}"][data-current="${current}"]`);
const iso=value=>new Date(value).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.ico':'image/x-icon'};
const server=http.createServer((req,res)=>{
 try{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return;}
  let requested=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(requested==='/')requested='/index.html';
  const target=path.resolve(root,'.'+requested);
  if(!target.startsWith(root+path.sep)||requested.split('/').some(p=>p.startsWith('.'))){res.writeHead(404).end();return;}
  res.setHeader('Content-Type',mime[path.extname(target)]||'application/octet-stream');res.end(fs.readFileSync(target));
 }catch(_){res.writeHead(404).end();}
});
async function check(name,fn){try{await fn();results.push(name);console.log('PASS',name);}catch(e){failures.push({name,error:e.stack});console.error('FAIL',name,e.stack);}}
async function ids(page){return page.locator('[data-current="true"]:visible').evaluateAll(es=>es.map(e=>e.dataset.eventId).sort());}
(async()=>{
 fs.mkdirSync(output,{recursive:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const origin=`http://127.0.0.1:${server.address().port}`;
 let browser;
 try{
  browser=await({chromium,webkit})[engine].launch({headless:true});
  for(const width of [320,390,1440]){
   const context=await browser.newContext({viewport:{width,height:900},timezoneId:width===1440?'Asia/Tokyo':width===390?'America/Los_Angeles':'America/Denver'});
   const page=await context.newPage();page.setDefaultTimeout(10000);
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.clock.install({time:new Date(initial)});
   await context.route('**/*',route=>{
    const r=route.request(),url=new URL(r.url());
    if(url.origin===origin&&url.pathname==='/data/events/events-manifest.js')return route.fulfill({contentType:'text/javascript',body:historicalManifest});
    if(url.origin===origin&&['GET','HEAD'].includes(r.method()))return route.continue();
    return route.fulfill({status:200,contentType:r.resourceType()==='stylesheet'?'text/css':'text/javascript',body:''});
   });
   await check(`historical ${width}: all ten cards, qualified costs, safe links and one-occasion calendars`,async()=>{
    await page.goto(origin+'/events.html');
    assert.deepEqual(await ids(page),events.map(e=>e.id).sort());
    for(const e of events){
     const c=card(page,e);assert.equal(await c.count(),1,e.id);
     const copy=await c.textContent();
     for(const field of ['title','dateLabel','timeLabel','locationLabel','costLabel','registrationLabel','availabilityLabel']) assert.ok(copy.includes(e[field]),e.id+': '+field);
     assert.equal(await c.locator('.before-you-go a').getAttribute('href'),e.href);
     assert.equal(await c.locator('a:has-text("Registration")').count(),e.registrationUrl?1:0);
     if(e.registrationUrl)assert.equal(await c.locator('a:has-text("Registration")').getAttribute('href'),e.registrationUrl);
     const calendar=new URL(await c.locator('a[href*="calendar.google"]').getAttribute('href'));
     assert.equal(calendar.searchParams.get('ctz'),'America/Denver');
     assert.equal(calendar.searchParams.get('dates'),`${iso(e.dateStart)}/${iso(e.dateEnd)}`);
     assert.equal(calendar.searchParams.get('text'),e.title);
     const box=await c.evaluate(el=>({left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right,scroll:el.scrollWidth,client:el.clientWidth}));
     assert.ok(box.left>=-1&&box.right<=width+1&&box.scroll<=box.client+1,e.id+': card bounds');
     await c.screenshot({path:path.join(output,`${engine}-nov-dec-${e.id}-${width}.png`)});
    }
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    const axe=await new AxeBuilder({page}).include('[data-current="true"]').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    fs.writeFileSync(path.join(output,`${engine}-nov-dec-axe-${width}.json`),JSON.stringify(axe.violations,null,2));
    assert.deepEqual(axe.violations.map(v=>({id:v.id,nodes:v.nodes.length})),[]);
   });
   await check(`historical ${width}: city filters, legacy category normalization, reset and history preserve exact IDs`,async()=>{
    await page.goto(origin+'/events.html?utm_source=nov-dec#review');
    for(const city of ['aurora','denver','parker']){
     await page.locator(`.event-filter-pill[data-city="${city}"]`).click();
     assert.deepEqual(await ids(page),events.filter(e=>e.city===city).map(e=>e.id).sort());
    }
    await page.goBack();assert.deepEqual(await ids(page),events.filter(e=>e.city==='denver').map(e=>e.id).sort());
    await page.goForward();assert.deepEqual(await ids(page),events.filter(e=>e.city==='parker').map(e=>e.id).sort());
    assert.equal(await page.locator('.event-category-pill[data-category="pumpkin-patches"]').count(),0);
    await page.goto(origin+'/events.html?city=parker&category=pumpkin-patches&utm_source=nov-dec#review');
    assert.deepEqual(await ids(page),events.filter(e=>e.city==='parker').map(e=>e.id).sort());
    assert.equal(new URL(page.url()).searchParams.has('category'),false);
    assert.equal(await page.locator('[data-current="false"]').count(),56,'Historical events with known ends stay archived');
    const pumpkins=await page.evaluate(()=>window.EVENTS_DATA.events.filter(e=>e.pumpkin).map(e=>({id:e.id,seasonEndUnknown:!!e.seasonEndUnknown})));
    assert.equal(pumpkins.length,6,'All six pumpkin data records remain');
    const archivedPumpkinIds=pumpkins.filter(e=>!e.seasonEndUnknown).map(e=>e.id).sort();
    assert.equal(archivedPumpkinIds.length,5);
    for(const id of archivedPumpkinIds)assert.equal(await page.locator(`[data-current="false"][data-event-id="${id}"]`).count(),1,id);
    for(const e of pumpkins.filter(e=>e.seasonEndUnknown))assert.equal(await page.locator(`[data-current="false"][data-event-id="${e.id}"]`).count(),0,'Unknown season end must not be falsely archived');
    await page.locator('.event-category-pill[data-category=""]').click();assert.deepEqual(await ids(page),events.map(e=>e.id).sort());
    assert.equal(new URL(page.url()).searchParams.get('utm_source'),'nov-dec');assert.equal(new URL(page.url()).hash,'#review');
   });
   await check(`historical ${width}: each exact end moves only expired occurrences to archive in an open tab`,async()=>{
    for(const e of events){
     const end=Date.parse(e.dateEnd);
     await page.clock.setFixedTime(new Date(end-1));await page.goto(origin+'/events.html');assert.equal(await card(page,e).count(),1);
     await page.clock.setFixedTime(new Date(end));
     // Trigger existing refresh without advancing the fixed wall-clock beyond the exact boundary.
     await page.clock.fastForward('01:00');
     assert.equal(await card(page,e).count(),0,e.id);assert.equal(await card(page,e,false).count(),1,e.id);
     assert.deepEqual(await ids(page),events.filter(item=>Date.parse(item.dateEnd)>end).map(e=>e.id).sort());
     await page.locator('summary.section-summary').click();assert.ok(await card(page,e,false).isVisible());
     if(/Four Mile|DeLaney|Plains/.test(e.title)){
      const later=events.find(item=>item.title===e.title&&Date.parse(item.dateStart)>end);
      if(later)assert.ok(await card(page,later).isVisible(),'later occurrence remains independently current');
     }
    }
   });
   await check(`historical ${width}: actual homepage and city previews preserve caveats and remove each expired occurrence`,async()=>{
    const pattern='**/data/events/events-manifest.js*';
    const manifest=historicalManifest;
    for(const e of events){
     // Isolate one approved occurrence to test both real capped renderers, not ranking assumptions.
     await page.route(pattern,r=>r.fulfill({contentType:'text/javascript',body:manifest+'\nwindow.EVENTS_DATA.events=window.EVENTS_DATA.events.filter(e=>e.id==='+JSON.stringify(e.id)+');'}));
     await page.clock.setFixedTime(new Date(initial));
     for(const [url,prefix] of [[`/index.html?city=${e.city}`,'home'],[`/best-parks-${e.city}.html`,'city']]){
      await page.goto(origin+url);const preview=page.locator(`.${prefix}-event-card`);assert.equal(await preview.count(),1,e.id+' '+prefix);
      const expected=e.description.length>118?e.description.slice(0,115).replace(/\s+\S*$/,'')+'…':e.description;
      assert.equal(await preview.locator(`.${prefix}-event-desc`).textContent(),expected);
      await preview.screenshot({path:path.join(output,`${engine}-nov-dec-preview-${prefix}-${e.id}-${width}.png`)});
      await page.clock.setFixedTime(new Date(e.dateEnd));await page.reload();assert.equal(await page.locator(`.${prefix}-event-card`).count(),0,e.id+' '+prefix+' expired');
      await page.clock.setFixedTime(new Date(initial));
     }
     await page.unroute(pattern);
    }
   });
   await check(`historical ${width}: separated dates retain only the later occurrence in both previews`,async()=>{
    const pattern='**/data/events/events-manifest.js*';
    const manifest=historicalManifest;
    for(const title of [/Four Mile/,/DeLaney/,/Plains/]){
     const pair=events.filter(e=>title.test(e.title)).sort((a,b)=>a.dateStart.localeCompare(b.dateStart));
     assert.equal(pair.length,2);
     await page.route(pattern,r=>r.fulfill({contentType:'text/javascript',body:manifest+'\nwindow.EVENTS_DATA.events=window.EVENTS_DATA.events.filter(e=>'+JSON.stringify(pair.map(e=>e.id))+'.includes(e.id));'}));
     for(const [url,prefix] of [[`/index.html?city=${pair[0].city}`,'home'],[`/best-parks-${pair[0].city}.html`,'city']]){
      await page.clock.setFixedTime(new Date(initial));await page.goto(origin+url);
      assert.equal(await page.locator(`.${prefix}-event-card`).count(),2);
      await page.clock.setFixedTime(new Date(pair[0].dateEnd));await page.reload();
      const remaining=page.locator(`.${prefix}-event-card`);assert.equal(await remaining.count(),1);
      assert.equal(await remaining.locator(`.${prefix}-event-date`).textContent(),pair[1].dateLabel);
      assert.ok(!(await remaining.textContent()).includes(pair[0].dateLabel));
     }
     await page.unroute(pattern);
    }
   });
   await check(`historical ${width}: no JavaScript exceptions`,async()=>assert.deepEqual(errors,[]));
   await context.close();
  }
 }finally{if(browser)await browser.close();server.close();fs.writeFileSync(path.join(output,`${engine}-nov-dec-results.json`),JSON.stringify({engine,results,failures},null,2));}
 console.log(`${results.length} passed, ${failures.length} failed`);if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
