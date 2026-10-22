/* Real renderers with local synthetic time only. No public navigation or submissions. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require('playwright');
const AxeBuilder=require('@axe-core/playwright').default;
const root=path.resolve(__dirname,'..'),output=path.join(root,'test-results');
const audit=JSON.parse(fs.readFileSync(path.join(root,'docs/november-source-review-2026-10-22.json'),'utf8'));
const events=audit.events, engine=process.env.BROWSER||'chromium';
fs.mkdirSync(output,{recursive:true});
const results=[],failures=[];
const server=http.createServer((req,res)=>{
  try{
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return;}
    const requested=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=path.resolve(root,'.'+(requested==='/'?'/index.html':requested));
    if(!file.startsWith(root+path.sep)||requested.split('/').some(p=>p.startsWith('.'))){res.writeHead(404).end();return;}
    res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');
    res.end(fs.readFileSync(file));
  }catch(_){res.writeHead(404).end();}
});
async function check(name,fn){try{await fn();results.push({name,passed:true});console.log('PASS',name);}catch(e){failures.push({name,message:e.stack});console.error('FAIL',name,e.stack);}}
async function bounds(locator,width){
  for(const b of await locator.evaluateAll(nodes=>nodes.map(n=>({left:n.getBoundingClientRect().left,right:n.getBoundingClientRect().right,scroll:n.scrollWidth,client:n.clientWidth})))){
    assert.ok(b.left>=-1&&b.right<=width+1,JSON.stringify(b));assert.ok(b.scroll<=b.client+1,JSON.stringify(b));
  }
}
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin=`http://127.0.0.1:${server.address().port}`;
  const browser=await({chromium,webkit})[engine].launch({headless:true});
  for(const [label,viewport,timezoneId] of [['small-mobile',{width:320,height:740},'Asia/Tokyo'],['mobile',{width:390,height:844},'America/Los_Angeles'],['desktop',{width:1440,height:1000},'UTC']]){
    const context=await browser.newContext({viewport,timezoneId});const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.clock.install({time:new Date('2026-10-22T20:00:00Z')});
    await context.route('**/*',route=>{
      const req=route.request(),url=new URL(req.url());
      return ['GET','HEAD'].includes(req.method())&&url.origin===origin?route.continue():route.abort();
    });
    await page.goto(origin+'/events.html');
    for(const e of events) await check(`${label}: ${e.id} exact visible facts, links and layout`,async()=>{
      const card=page.locator(`[data-current="true"][data-event-id="${e.id}"]`);
      assert.equal(await card.count(),1);assert.ok(await card.isVisible());
      const text=await card.textContent();
      for(const key of ['title','timeLabel','locationLabel','costLabel','audienceLabel','description','registrationLabel','availabilityLabel']) assert.ok(text.includes(e[key]),e.id+': '+key);
      assert.match(text,/Details checked October 22, 2026/);
      assert.equal(await card.locator('a.event-link').getAttribute('href'),e.href);
      if(e.registrationUrl){const link=card.getByRole('link',{name:'Registration',exact:true});assert.equal(await link.getAttribute('href'),e.registrationUrl);await link.focus();assert.equal(await link.evaluate(n=>n===document.activeElement),true);}
      const calendar=card.locator('a[href*="calendar.google"]');
      if(e.recurring){
        assert.equal(await calendar.count(),0);const details=card.locator('details');await details.locator('summary').focus();await page.keyboard.press('Enter');
        assert.equal(await details.getAttribute('open'),'');assert.equal(await details.locator('li').count(),e.schedule.length);
        const rows=await details.locator('li').allTextContents();
        for(const [i,s] of e.schedule.entries()){assert.ok(rows[i].includes(s.time));assert.ok(rows[i].includes(new Date(s.date+'T12:00:00Z').toLocaleDateString('en-US',{timeZone:'America/Denver',month:'long',day:'numeric',year:'numeric'})));}
        await page.clock.fastForward('01:00');assert.equal(await details.getAttribute('open'),'');
        await bounds(details,viewport.width);await details.locator('summary').click();
      }else{
        assert.equal(await calendar.count(),1);const url=new URL(await calendar.getAttribute('href'));assert.equal(url.searchParams.get('ctz'),'America/Denver');
        const utc=s=>new Date(s).toISOString().replace(/[-:]/g,'').replace('.000','');assert.equal(url.searchParams.get('dates'),utc(e.dateStart)+'/'+utc(e.dateEnd));
      }
      await card.scrollIntoViewIfNeeded();await bounds(card,viewport.width);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      await card.screenshot({path:path.join(output,`${engine}-november-${e.id}-${label}.png`)});
    });
    await check(`${label}: November cards pass scoped axe and no JavaScript errors`,async()=>{
      await page.goto(origin+'/events.html');const result=await new AxeBuilder({page}).include('main').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      fs.writeFileSync(path.join(output,`${engine}-november-axe-${label}.json`),JSON.stringify(result.violations,null,2));assert.deepEqual(result.violations,[]);assert.deepEqual(errors,[]);
    });
    await check(`${label}: actual November homepage/city previews preserve booking and age blockers`,async()=>{
      await page.clock.setFixedTime(new Date('2026-11-02T19:00:00Z'));
      const cases=[['aurora',/Register by Nov\. 5/,/registered adult/],['centennial',/Registration required by Nov\. 2 at 5 p\.m\. MST/,/ages 5–teen/]];
      for(const [city,booking,age] of cases){
        for(const url of ['/index.html?city='+city,'/best-parks-'+city+'.html']){
          await page.goto(origin+url);const cards=page.locator(url.startsWith('/index')?'.home-event-card':'.city-event-card');const text=await cards.allTextContents();
          assert.ok(text.some(t=>booking.test(t)&&age.test(t)),city+': preview restrictions');await bounds(cards,viewport.width);
          await cards.first().screenshot({path:path.join(output,`${engine}-november-preview-${city}-${url.startsWith('/index')?'home':'city'}-${label}.png`)});
        }
      }
    });
    await check(`${label}: November end-time expiry refreshes an open tab without expiring the other DMNS session`,async()=>{
      await page.clock.setFixedTime(new Date('2026-11-08T05:00:00Z'));await page.goto(origin+'/events.html?city=denver');
      assert.equal(await page.locator('[data-current="true"][data-event-id="denver-dmns-free-admission-2026"]').count(),1);
      await page.clock.setFixedTime(new Date('2026-11-16T23:59:30Z'));await page.goto(origin+'/events.html?city=denver');
      await page.clock.setFixedTime(new Date('2026-11-17T00:00:00Z'));await page.clock.fastForward('01:00');
      assert.equal(await page.locator('[data-current="true"][data-event-id="denver-dmns-free-admission-2026"]').count(),0);
      assert.equal(await page.locator('[data-current="true"][data-event-id="denver-mile-high-tree-2026"]').count(),1);
      await page.clock.setFixedTime(new Date('2026-12-01T04:59:30Z'));await page.goto(origin+'/events.html?city=denver');
      assert.equal(await page.locator('[data-current="true"][data-event-id="denver-mile-high-tree-2026"]').count(),1);
      await page.clock.setFixedTime(new Date('2026-12-01T05:00:00Z'));await page.clock.fastForward('01:00');
      assert.equal(await page.locator('[data-current="true"][data-event-id="denver-mile-high-tree-2026"]').count(),0);
      const archived=page.locator('[data-current="false"][data-event-id="denver-mile-high-tree-2026"]');assert.equal(await archived.count(),1);assert.match(await archived.textContent(),/November nights/);
      await page.goto(origin+'/index.html?city=denver');assert.equal(await page.locator('.home-event-card').count(),0);
      await page.goto(origin+'/best-parks-denver.html');assert.equal(await page.locator('.city-event-card').count(),0);
    });
    await context.close();
  }
  await browser.close();server.close();
  fs.writeFileSync(path.join(output,`${engine}-november-results.json`),JSON.stringify({engine,results,failures},null,2));
  if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
