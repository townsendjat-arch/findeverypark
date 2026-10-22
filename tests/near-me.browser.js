/* Phase 1 Near Me acceptance: local server, synthetic locations only.
 * BROWSER=chromium|webkit node tests/near-me.browser.js
 * All non-local traffic is intercepted, including analytics and map providers.
 * The optional Leaflet spy tests the app/provider boundary, not real map tiles.
 * Physical iOS Safari and Android Chrome permission UI remains a separate gate.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const vm = require('node:vm');
const {chromium,webkit} = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const root=path.resolve(__dirname,'..'), output=path.join(root,'test-results');
const engineName=process.env.BROWSER||'chromium';
assert.ok(['chromium','webkit'].includes(engineName),'BROWSER must be chromium or webkit');
const sentinel=[12.3456789,-98.7654321]; // Explicitly synthetic, never an owner's location.
const R=3958.8;
const results=[],failures=[];
const centroidContext={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'city-centroids.js'),'utf8'),centroidContext);
const cities=JSON.parse(JSON.stringify(centroidContext.window.FEP_CITY_CENTROIDS));
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  try {
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return;}
    const requested=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const target=path.resolve(root,'.'+(requested==='/'?'/index.html':requested));
    if(!target.startsWith(root+path.sep)||requested.split('/').some(p=>p.startsWith('.'))) {res.writeHead(404).end();return;}
    const body=fs.readFileSync(target);res.setHeader('Content-Type',mime[path.extname(target)]||'application/octet-stream');res.end(req.method==='HEAD'?undefined:body);
  } catch(_){res.writeHead(404).end();}
});
function oracle(a,b) {
  if(a[0]===b[0]&&a[1]===b[1])return 0;
  const rad=Math.PI/180;
  return R*Math.acos(Math.max(-1,Math.min(1,Math.sin(a[0]*rad)*Math.sin(b[0]*rad)+Math.cos(a[0]*rad)*Math.cos(b[0]*rad)*Math.cos((a[1]-b[1])*rad))));
}
function pair(park) {
  return typeof park.lat==='number'&&typeof park.lng==='number'&&Number.isFinite(park.lat)&&Number.isFinite(park.lng)&&Math.abs(park.lat)<=90&&Math.abs(park.lng)<=180?[park.lat,park.lng]:null;
}
function sorted(parks,origin,filter='') {
  return parks.map((p,index)=>({...p,index,dist:pair(p)?oracle(origin,pair(p)):Infinity}))
    .filter(p=>!filter||(p.f||p.features||{})[filter]||(filter==='restroom'&&p.bathrooms))
    .sort((a,b)=>(a.dist===b.dist?a.index-b.index:a.dist-b.dist));
}
function decoded(value) {
  let text=typeof value==='string'?value:JSON.stringify(value);
  for(let i=0;i<3;i++){try{const next=decodeURIComponent(text.replace(/\+/g,' '));if(next===text)break;text=next;}catch(_){break;}}
  return text;
}
function assertNoSentinel(value,label) {
  const text=decoded(value);
  for(const number of sentinel)for(let places=3;places<=9;places++){
    const variant=number.toFixed(places).replace(/0+$/,'').replace(/\.$/,'');
    assert.equal(text.includes(variant),false,label+' contains a synthetic coordinate variant');
  }
}
const leafletSpy=`(function(){
  window.__mapCalls=[];
  function record(method,value){window.__mapCalls.push({method:method,value:value});}
  function marker(coords){record('marker',coords);return {bindPopup:function(){return this;},addTo:function(layer){if(layer.layers)layer.layers.push(this);return this;},getLatLng:function(){return {lat:coords[0],lng:coords[1]};},openPopup:function(){return this;},setStyle:function(){return this;},bringToFront:function(){return this;}};}
  window.L={map:function(){return {setView:function(coords){record('setView',coords);return this;},fitBounds:function(bounds){record('fitBounds',bounds.coords);return this;},invalidateSize:function(){},removeLayer:function(){}};},tileLayer:function(url){record('tileLayer',url);return {addTo:function(){return this;}};},layerGroup:function(){return {layers:[],addTo:function(){return this;},clearLayers:function(){this.layers=[];},eachLayer:function(callback){this.layers.forEach(callback);}};},circleMarker:marker,latLng:function(lat,lng){return [lat,lng];},latLngBounds:function(coords){return {coords:coords,pad:function(){return this;}};}};
})();`;
const fixtureParks=[
  {id:'synthetic-unknown',n:'A Unknown',a:'Synthetic',lat:null,lng:null,ac:500,f:{playground:true}},
  {id:'synthetic-far',n:'B Far',a:'Synthetic',lat:0,lng:0.01505,ac:200,f:{playground:true}},
  {id:'synthetic-tie-a',n:'C Tie A',a:'Synthetic',lat:0,lng:0.01465,ac:2,f:{playground:true}},
  {id:'synthetic-zero',n:'D Zero',a:'Synthetic',lat:0,lng:0,ac:1,f:{playground:true}},
  {id:'synthetic-tie-b',n:'E Tie B',a:'Synthetic',lat:0,lng:0.01465,ac:300,f:{playground:true}},
  {id:'synthetic-other',n:'F No Playground',a:'Synthetic',lat:0,lng:0.001,ac:20,f:{trails:true}}
];
function fixtureSource(city,parks=fixtureParks){return 'window.registerParkDataset('+JSON.stringify(city)+','+JSON.stringify(parks)+');';}
let browser,origin,currentCaseName='suite';
async function check(name,callback){currentCaseName=name;console.log('START',name);try{await callback();results.push({name,passed:true});console.log('PASS',name);}catch(error){failures.push({name,message:error.stack});console.error('FAIL',name,error.stack);}}
async function deadline(promise,milliseconds,label){let timer;try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(label+' exceeded '+milliseconds+' ms')),milliseconds);})]);}finally{clearTimeout(timer);}}
function sentinelFields(value,prefix='snapshot',paths=[]) {
  if(value&&typeof value==='object'){for(const [key,item] of Object.entries(value))sentinelFields(item,prefix+'.'+key,paths);}
  else if(value!==undefined&&value!==null){try{assertNoSentinel(value,prefix);}catch(_){paths.push(prefix);}}
  return paths;
}
function redactSynthetic(value){
  if(Array.isArray(value))return value.map(redactSynthetic);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,redactSynthetic(item)]));
  if(value===undefined||value===null)return value;
  if(typeof value==='number'){try{assertNoSentinel(value,'Diagnostic number');return value;}catch(_){return '[synthetic-coordinate-redacted]';}}
  if(typeof value!=='string')return value;
  let text=decoded(value);
  for(const number of sentinel)for(let places=3;places<=9;places++){
    const variant=number.toFixed(places).replace(/0+$/,'').replace(/\.$/,'');
    text=text.split(variant).join('[synthetic-coordinate-redacted]');
  }
  return text;
}
async function failureDiagnostics(page,requests,consoleMessages,pageErrors,error) {
  const filename=engineName+'-near-me-failure-'+currentCaseName.replace(/[^a-z0-9]+/gi,'-').toLowerCase().slice(0,160);
  const details={name:currentCaseName,error:error.stack,pageErrors,consoleMessages,requestCount:requests.length};
  try{Object.assign(details,await deadline(page.evaluate(()=>({
    url:location.href,history:history.state,activeDataset:window.ACTIVE_DATASET_KEY,
    title:document.querySelector('#page-intro-title')?.textContent,
    status:document.querySelector('#location-status')?.textContent,
    sort:document.querySelector('#sort')?.value,search:document.querySelector('#search')?.value,
    ids:Array.from(document.querySelectorAll('#grid .card[data-park-id]'),card=>card.dataset.parkId),
    selectedFilters:Array.from(document.querySelectorAll('.pill[aria-pressed="true"]'),node=>node.dataset.k),
    viewport:{width:innerWidth,scrollWidth:document.documentElement.scrollWidth},
    overflow:Array.from(document.querySelectorAll('body *')).map(node=>{const box=node.getBoundingClientRect();return {element:node.tagName.toLowerCase()+(node.id?'#'+node.id:'')+(typeof node.className==='string'?'.'+node.className.trim().replace(/\s+/g,'.'):''),left:box.left,right:box.right,width:box.width,scrollWidth:node.scrollWidth};}).filter(box=>box.width>0&&(box.left<-.5||box.right>innerWidth+.5)).slice(0,80),
    privacySnapshot:{url:location.href,state:history.state,local:Object.fromEntries(Object.entries(localStorage)),session:Object.fromEntries(Object.entries(sessionStorage)),cookies:document.cookie,dataLayer:Array.from(window.dataLayer||[],args=>Array.from(args)),historyWrites:window.__historyWrites,resources:window.__resourceSnapshots,links:Array.from(document.querySelectorAll('a[href]'),a=>a.getAttribute('href').startsWith('#')?a.getAttribute('href'):a.href)}
  })),4000,'Failure diagnostic snapshot'));
  details.syntheticCoordinateFields=sentinelFields(details.privacySnapshot);delete details.privacySnapshot;
  }catch(diagnosticError){details.diagnosticError=diagnosticError.message;}
  fs.writeFileSync(path.join(output,filename+'.json'),JSON.stringify(redactSynthetic(details),null,2));
  try{await page.screenshot({path:path.join(output,filename+'.png'),fullPage:false,animations:'disabled',timeout:5000});}catch(_){}
}
async function testPage(viewport,options,callback) {
  const context=await browser.newContext({viewport,timezoneId:'America/Denver',javaScriptEnabled:options.javascript!==false});
  const page=await context.newPage(),requests=[],consoleMessages=[],pageErrors=[];
  page.setDefaultTimeout(12000);
  page.on('console',message=>consoleMessages.push(message.text()));
  page.on('pageerror',error=>pageErrors.push(error.message));
  await context.addInitScript(({failCleanup,unsupported})=>{
    window.__geoRequests=[];window.__historyWrites=[];window.__resourceSnapshots=[];
    const originalReplace=history.replaceState.bind(history),originalPush=history.pushState.bind(history);
    history.replaceState=function(state,title,url){window.__historyWrites.push({state,url});if(failCleanup)throw new Error('Synthetic cleanup failure');return originalReplace(state,title,url);};
    history.pushState=function(state,title,url){window.__historyWrites.push({state,url});return originalPush(state,title,url);};
    Object.defineProperty(navigator,'geolocation',{configurable:true,value:unsupported?undefined:{getCurrentPosition(success,error,options){window.__geoRequests.push({success,error,options});}}});
    const append=Node.prototype.appendChild;
    Node.prototype.appendChild=function(node){if(node.tagName==='SCRIPT'&&/^https?:/.test(node.src)&&new URL(node.src).origin!==location.origin){window.__resourceSnapshots.push({url:location.href,src:node.src,dataLayer:Array.from(window.dataLayer||[],args=>Array.from(args))});}return append.call(this,node);};
  },{failCleanup:!!options.failCleanup,unsupported:!!options.unsupported});
  await context.route('**/*',async route=>{
    const request=route.request();
    requests.push({url:request.url(),headers:await request.allHeaders(),body:request.postData()||'',navigation:request.isNavigationRequest(),resource:request.resourceType()});
    const url=new URL(request.url());
    if(url.origin!==origin){
      if(options.map&&/leaflet.*\.js(?:\?|$)/.test(url.pathname))await route.fulfill({status:200,contentType:'text/javascript',body:leafletSpy});
      else await route.abort();
      return;
    }
    if(options.route&&await options.route(route,url))return;
    if(options.fixture&&url.pathname.endsWith('-parks-data.js')){const city=path.basename(url.pathname,'-parks-data.js');await route.fulfill({status:200,contentType:'text/javascript',body:fixtureSource(city)});return;}
    await route.continue();
  });
  try {
    await deadline(callback({page,context,requests,consoleMessages,pageErrors}),60000,'Browser case callback');
    if(options.javascript!==false){
      const snapshot=await page.evaluate(()=>({url:location.href,state:history.state,local:Object.fromEntries(Object.entries(localStorage)),session:Object.fromEntries(Object.entries(sessionStorage)),cookies:document.cookie,dataLayer:Array.from(window.dataLayer||[],args=>Array.from(args)),historyWrites:window.__historyWrites,resources:window.__resourceSnapshots,links:Array.from(document.querySelectorAll('a[href]'),a=>a.getAttribute('href').startsWith('#')?a.getAttribute('href'):a.href)}));
      if(!options.failCleanup)assertNoSentinel(snapshot,'URL/history/storage/analytics/outbound links');
      else {delete snapshot.url;assertNoSentinel(snapshot,'Fail-closed stored/derived state');}
      assertNoSentinel(consoleMessages,'Console');
      for(const [requestIndex,request] of requests.entries()){
        // The initial host request is inherently visible before client cleanup.
        const initialLegacy=requestIndex===0&&request.navigation&&request.resource==='document'&&new URL(request.url).searchParams.get('lat')===String(sentinel[0])&&new URL(request.url).searchParams.get('lng')===String(sentinel[1]);
        if(initialLegacy){const safeHeaders={...request.headers};delete safeHeaders.referer;assertNoSentinel(safeHeaders,'Initial request headers other than the caller-provided legacy referrer');assertNoSentinel(request.body,'Initial request body');}
        else assertNoSentinel(request,'Outgoing request URL, headers or body');
      }
      assert.deepEqual(pageErrors,[],'No uncaught runtime errors');
    }
  } catch(error) {try{await failureDiagnostics(page,requests,consoleMessages,pageErrors,error);}catch(diagnosticError){console.error('Failure diagnostics unavailable:',diagnosticError.message);}throw error;}
  finally {await context.close();}
}
const cards=page=>page.locator('#grid .card[data-park-id]');
const cityLink=(page,city)=>page.locator('.dataset-link[data-dataset="'+city+'"]');
async function ready(page,city='aurora'){
  await page.waitForFunction(city=>window.getParkDataset&&Array.isArray(window.getParkDataset(city))&&document.querySelector('#grid .card[data-park-id]'),city);
}
async function gotoCity(page,city='aurora',extra=''){await page.goto(origin+'/parks.html?dataset='+city+extra);await ready(page,city);}
async function requestLocation(page){await page.locator('#btn-locate').click();await page.waitForFunction(()=>window.__geoRequests.length>0);}
async function assertAwaitingPresentation(page){
  await page.waitForFunction(()=>document.querySelector('#page-intro-title').textContent==='Choose a city to see parks');
  assert.equal(await page.locator('.page-intro').innerText(),'Choose a city to see parks','Waiting intro contains only neutral city-confirmation copy');
  for(const selector of ['#page-intro-subtitle','#page-intro-copy','#dataset-note','.browse-shell','#map'])assert.equal(await page.locator(selector).isVisible(),false,selector+' is hidden before confirmation');
  assert.equal(await cards(page).count(),0,'Waiting state exposes no park cards');
  assert.equal(await page.locator('.dataset-link.active,.dataset-link[aria-current]').count(),0,'Suggested or cached cities are not confirmed cities');
  assert.equal(new URL(page.url()).searchParams.get('dataset'),null,'No city is selected in the URL');
  assert.equal(new URL(page.url()).searchParams.get('near'),'1');
}
async function assertAwaitingCity(page){
  await assertAwaitingPresentation(page);
  await page.waitForFunction(()=>history.state?.awaitingCity===true);
  assert.equal(await page.evaluate(()=>history.state.explicitCity),false);
}
async function assertConfirmedCity(page,key){
  const name=(await cityLink(page,key).textContent()).trim();
  assert.equal(await page.locator('#page-intro-title').textContent(),'Parks in '+name);
  for(const selector of ['#page-intro-subtitle','#page-intro-copy','#dataset-note','.browse-shell','#map'])assert.equal(await page.locator(selector).isVisible(),true,selector+' is restored after confirmation');
  assert.ok((await page.locator('#page-intro-subtitle').textContent()).includes(name));
  assert.ok((await page.locator('#page-intro-copy').textContent()).includes(name));
  assert.equal(await page.locator('.dataset-link.active').count(),1);
  assert.equal(await cityLink(page,key).getAttribute('aria-current'),'true');
  assert.equal(new URL(page.url()).searchParams.get('dataset'),key);
  assert.ok(await cards(page).count());
}

async function respond(page,coords=sentinel,index=-1){await page.evaluate(({coords,index})=>{const list=window.__geoRequests;list[index<0?list.length-1:index].success({coords:{latitude:coords[0],longitude:coords[1]}});},{coords,index});}
async function requestCount(page){return page.evaluate(()=>window.__geoRequests.length);}
async function state(page){return page.evaluate(()=>({url:location.href,history:history.state,sort:document.querySelector('#sort').value,status:document.querySelector('#location-status').textContent,ids:Array.from(document.querySelectorAll('#grid .card[data-park-id]'),c=>c.dataset.parkId),distances:Array.from(document.querySelectorAll('#grid .park-distance'),d=>d.textContent)}));}
async function settleCity(page,city){await page.waitForFunction(city=>new URL(location.href).searchParams.get('dataset')===city&&document.querySelector('#grid .card[data-park-id]')&&Array.from(document.querySelectorAll('#grid .card[data-park-id]')).every(card=>(window.getParkDataset(city)||[]).some(park=>park.id===card.dataset.parkId)),city);}
async function chooseCity(page,city){await cityLink(page,city).click();await settleCity(page,city);}
async function assertNearest(page,city,coords=sentinel,filter='',query=''){
  const parks=await page.evaluate(city=>window.getParkDataset(city),city),expected=sorted(parks,coords,filter).filter(p=>!query||(p.n||p.name).toLowerCase().includes(query.toLowerCase())||(p.a||p.address||'').toLowerCase().includes(query.toLowerCase()));
  await page.waitForFunction(()=>document.querySelector('#sort').value==='nearest');
  const actual=await cards(page).evaluateAll(nodes=>nodes.map(node=>node.dataset.parkId));
  assert.deepEqual(actual,expected.slice(0,actual.length).map(p=>p.id),'Exact ordered visible park IDs');
  assert.ok(actual.length>0,'Nonempty fixture');
  const distances=await page.locator('#grid .park-distance').allTextContents();
  assert.equal(distances.length,actual.length,'Each card has a known distance or explicit unavailable label');
  assert.equal(await page.locator('#sort').inputValue(),'nearest');
  for(const href of await page.locator('#grid a[href*="google.com/maps"]').evaluateAll(nodes=>nodes.map(node=>node.href))){assert.equal(new URL(href).searchParams.has('origin'),false,'Directions have destination only');}
  return expected;
}
async function filterClick(page,key){const filter=page.locator('.pill[data-k="'+key+'"]');if(!await filter.isVisible())await page.locator('#filter-toggle').click();await filter.click();}
async function screenshot(page,name){await page.locator('#location-panel').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,engineName+'-near-me-'+name+'.png'),fullPage:false});}
async function screenshotNearestCards(page,label){
  const card=cards(page).first(),distance=card.locator('.park-distance');
  await card.scrollIntoViewIfNeeded();await distance.scrollIntoViewIfNeeded();
  await distance.evaluate(node=>{
    const box=node.getBoundingClientRect(),sticky=document.querySelector('.sticky');
    const stickyBottom=sticky&&getComputedStyle(sticky).position==='sticky'?Math.max(0,sticky.getBoundingClientRect().bottom):0;
    const target=Math.min(innerHeight-box.height/2-16,Math.max(innerHeight/2,stickyBottom+box.height/2+24));
    window.scrollBy(0,box.top+box.height/2-target);
  });
  assert.equal(await distance.isVisible(),true,'Nearest first-card distance label is rendered');
  assert.equal(await distance.evaluate(node=>{const box=node.getBoundingClientRect();return box.top>=-.5&&box.bottom<=innerHeight+.5&&box.left>=-.5&&box.right<=innerWidth+.5;}),true,'Nearest first-card distance label is inside the viewport');
  assert.equal(await distance.evaluate(node=>{const box=node.getBoundingClientRect(),hit=document.elementFromPoint(box.left+box.width/2,box.top+box.height/2);return hit===node||node.contains(hit);}),true,'Distance label is unobstructed by sticky controls');
  await page.screenshot({path:path.join(output,engineName+'-near-me-nearest-cards-'+label+'.png'),fullPage:false});
  await card.screenshot({path:path.join(output,engineName+'-near-me-nearest-card-detail-'+label+'.png')});
}


(async()=>{
  fs.mkdirSync(output,{recursive:true});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));origin='http://127.0.0.1:'+server.address().port;
  try{
    const launch={headless:true};
    if(engineName==='chromium'&&process.env.CHROMIUM_EXECUTABLE_PATH)launch.executablePath=process.env.CHROMIUM_EXECUTABLE_PATH;
    browser=await ({chromium,webkit})[engineName].launch(launch);
    for(const [label,viewport] of [['small-mobile',{width:320,height:740}],['mobile',{width:390,height:844}],['desktop',{width:1440,height:1000}]]){
      const run=(name,options,fn)=>check(label+': '+name,()=>testPage(viewport,options,fn));
      await run('home Near Me is a clean link and neither entry prompts automatically',{},async({page})=>{
        await page.goto(origin+'/index.html');assert.equal(await requestCount(page),0);
        await page.locator('#geoBtn').click();await page.waitForURL('**/parks.html?near=1');
        assert.equal(await requestCount(page),0);assert.equal(new URL(page.url()).search,'?near=1');
        assert.ok(await page.locator('#location-panel').isVisible());await assertAwaitingCity(page);
        await screenshot(page,label+'-entry');
      });
      await run('nearest without a fix focuses explicit action without requesting GPS',{},async({page})=>{
        await gotoCity(page);await page.locator('#sort').selectOption('nearest');
        assert.equal(await requestCount(page),0);assert.equal(await page.locator('#sort').inputValue(),'alpha');
        assert.equal(await page.locator('#btn-locate').evaluate(el=>el===document.activeElement),true);
      });
      await run('explicit city gets nearest, preserves filtered/search ordering and same-page city scope',{map:true},async({page})=>{
        await gotoCity(page);await requestLocation(page);await respond(page);await assertNearest(page,'aurora');
        assert.deepEqual(await page.evaluate(()=>window.__geoRequests[0].options),{timeout:8000,maximumAge:0,enableHighAccuracy:false});
        await filterClick(page,'playground');const expected=await assertNearest(page,'aurora',sentinel,'playground');
        const chosen=expected[0];await page.locator('#search').fill(chosen.n||chosen.name);await assertNearest(page,'aurora',sentinel,'playground',chosen.n||chosen.name);
        assert.equal(await page.locator('#sort').inputValue(),'nearest');
        await page.locator('#search').fill('');await chooseCity(page,'denver');await assertNearest(page,'denver',sentinel,'playground');
        assert.equal(await requestCount(page),1);assert.equal(await page.locator('.pill[data-k="playground"]').getAttribute('aria-pressed'),'true');
        assertNoSentinel(await page.evaluate(()=>window.__mapCalls||[]),'Leaflet map/marker calls');
        await screenshot(page,label+'-nearest-filtered');await screenshotNearestCards(page,label);
      });
      await run('unselected city requires simple centroid confirmation, including a far-away fix',{},async({page})=>{
        await page.goto(origin+'/parks.html?near=1');await assertAwaitingCity(page);await requestLocation(page);await respond(page);await assertAwaitingCity(page);
        const closest=cities.map((c,index)=>({...c,index,dist:oracle(sentinel,[c.lat,c.lng])})).sort((a,b)=>a.dist-b.dist||a.index-b.index)[0];
        await page.waitForFunction(()=>document.querySelector('#city-suggestion').textContent.includes('Closest covered city'));
        const text=await page.locator('#city-suggestion').textContent();
        assert.match(text,/approximately.*mi.*centre/i);assert.match(text,/not.*nearest park.*city.boundary/i);
        assert.equal(await cards(page).count(),0,'No parks listed before city confirmation');
        const suggested=cityLink(page,closest.key);
        assert.equal(await suggested.evaluate(node=>node===document.activeElement&&node.classList.contains('suggested')),true,'Suggested city receives keyboard focus');
        await page.waitForFunction(key=>{const node=document.querySelector('.dataset-link[data-dataset="'+key+'"]');const box=node.getBoundingClientRect();return box.left>=-.5&&box.right<=innerWidth+.5;},closest.key);
        assert.equal(await suggested.evaluate(node=>{const box=node.getBoundingClientRect();return box.left>=-.5&&box.right<=innerWidth+.5;}),true,'Suggested city chip is horizontally visible without swiping');
        await screenshot(page,label+'-confirm-city');
        await page.screenshot({path:path.join(output,engineName+'-near-me-'+label+'-confirm-city-full.png'),fullPage:true});
        await chooseCity(page,closest.key);await assertConfirmedCity(page,closest.key);await assertNearest(page,closest.key);assert.equal(await requestCount(page),1);
      });
      await run('waiting city remains neutral after denial, clear and Back/Forward while plain manual browsing stays visible',{},async({page})=>{
        await page.goto(origin+'/parks.html');await ready(page);
        assert.equal(await page.locator('#page-intro-title').textContent(),'Parks in Aurora');assert.equal(await page.locator('.browse-shell').isVisible(),true);assert.ok(await cards(page).count());
        assert.equal(await requestCount(page),0);
        await page.goto(origin+'/parks.html?near=1');await assertAwaitingCity(page);
        await requestLocation(page);await page.evaluate(()=>window.__geoRequests[0].error({code:1}));await assertAwaitingCity(page);
        assert.match(await page.locator('#location-status').textContent(),/denied/i);
        await requestLocation(page);await respond(page);await assertAwaitingCity(page);
        await page.locator('#clear-location').click();await assertAwaitingCity(page);
        assert.equal(await page.locator('#city-suggestion').isVisible(),false);assert.equal((await page.locator('#city-suggestion').textContent()).trim(),'');assert.equal(await page.locator('#sort').inputValue(),'alpha');
        await requestLocation(page);await respond(page);await assertAwaitingCity(page);
        await chooseCity(page,'parker');await assertConfirmedCity(page,'parker');await assertNearest(page,'parker');
        await page.goBack();await assertAwaitingCity(page);assert.equal(await requestCount(page),3);
        await page.goForward();await settleCity(page,'parker');await assertConfirmedCity(page,'parker');await assertNearest(page,'parker');assert.equal(await requestCount(page),3);
      });
      {
        let release,intercepted;const gate=new Promise(resolve=>release=resolve),seen=new Promise(resolve=>intercepted=resolve);
        await run('waiting city is neutral while initial dataset is held or fails, before history exists',{
          route:async(route,url)=>{if(url.pathname==='/aurora-parks-data.js'){intercepted();await gate;await route.abort();return true;}return false;}
        },async({page})=>{
          try{
            await page.goto(origin+'/parks.html?near=1',{waitUntil:'commit'});await deadline(seen,12000,'Initial Aurora dataset request starting');
            await assertAwaitingPresentation(page);assert.equal(await page.evaluate(()=>history.state),null,'Waiting presentation does not depend on completed dataset history');
            assert.deepEqual(await page.evaluate(()=>({explicitCity,awaitingCity})),{explicitCity:false,awaitingCity:true});assert.equal(await requestCount(page),0);
            release();await page.waitForFunction(()=>/Park data could not be loaded/i.test(document.querySelector('#location-status').textContent));
            await assertAwaitingPresentation(page);assert.deepEqual(await page.evaluate(()=>({explicitCity,awaitingCity})),{explicitCity:false,awaitingCity:true});
            assert.equal(await page.evaluate(()=>typeof window.L),'undefined');assert.equal(await requestCount(page),0);
            await chooseCity(page,'parker');await assertConfirmedCity(page,'parker');assert.equal(await requestCount(page),0);
          }finally{release();}
        });
      }
      await run('cached Parker does not implicitly confirm a city after Home Near Me or a suggested location',{},async({page})=>{
        await gotoCity(page,'parker');assert.equal(await page.evaluate(()=>localStorage.getItem('activeDataset')),'parker');
        await page.goto(origin+'/index.html');await page.locator('#geoBtn').click();await page.waitForURL('**/parks.html?near=1');
        await page.waitForFunction(()=>window.ACTIVE_DATASET_KEY==='parker'&&Array.isArray(window.getParkDataset('parker')));await assertAwaitingCity(page);assert.equal(await requestCount(page),0);
        await requestLocation(page);await respond(page);await assertAwaitingCity(page);assert.ok(await page.locator('#city-suggestion').isVisible());
        await chooseCity(page,'denver');await assertConfirmedCity(page,'denver');await assertNearest(page,'denver');assert.equal(await requestCount(page),1);
      });
      await run('synthetic zero/ties/unknown and equal rounded distances remain ordered after amenity filter',{fixture:true},async({page})=>{
        await gotoCity(page);await requestLocation(page);await respond(page,[0,0]);await filterClick(page,'playground');
        const ids=await cards(page).evaluateAll(nodes=>nodes.map(n=>n.dataset.parkId));
        assert.deepEqual(ids,['synthetic-zero','synthetic-tie-a','synthetic-tie-b','synthetic-far','synthetic-unknown']);
        assert.match(await page.locator('[data-park-id="synthetic-zero"] .park-distance').textContent(),/<0\.1 mi/);
        assert.match(await page.locator('[data-park-id="synthetic-unknown"] .park-distance').textContent(),/unavailable/i);
        await page.locator('#search').fill('D Zero');assert.deepEqual(await cards(page).evaluateAll(nodes=>nodes.map(n=>n.dataset.parkId)),['synthetic-zero']);
        await page.locator('#search').fill('No such synthetic park');assert.equal(await cards(page).count(),0);assert.ok(await page.locator('#empty').isVisible());
      });
      for(const [code,message] of [[1,/denied|permission/i],[2,/unavailable|could not/i],[3,/timed out|timeout/i]]){
        await run('permission failure '+code+' gives distinct feedback and manual city fallback',{},async({page})=>{
          await gotoCity(page,'parker');await requestLocation(page);await page.evaluate(code=>window.__geoRequests[0].error({code}),code);
          assert.match(await page.locator('#location-status').textContent(),message);assert.equal(await requestCount(page),1);
          if(code===1)await screenshot(page,label+'-permission-denied');
          assert.equal(await page.locator('#sort').inputValue(),'alpha');assert.equal(new URL(page.url()).searchParams.get('dataset'),'parker');
          await chooseCity(page,'denver');assert.equal(await requestCount(page),1);assert.equal(await page.locator('#grid .park-distance').count(),0);
          await respond(page);assert.equal(await page.locator('#sort').inputValue(),'alpha','Late success cannot undo failure/manual intent');
        });
      }
      await run('duplicate taps coalesce; clear cancels pending and ignores late success',{},async({page})=>{
        await gotoCity(page);await page.locator('#btn-locate').evaluate(button=>{button.click();button.click();});assert.equal(await requestCount(page),1);
        await page.locator('#clear-location').click();await respond(page);assert.equal(await page.locator('#sort').inputValue(),'alpha');assert.equal(await page.locator('#grid .park-distance').count(),0);
        await requestLocation(page);await respond(page,[0,0]);assert.equal(await requestCount(page),2);assert.equal(await page.locator('#sort').inputValue(),'nearest');
        await page.locator('#clear-location').click();assert.equal(await page.locator('#sort').inputValue(),'alpha');assert.equal(await page.locator('#grid .park-distance').count(),0);
      });
      await run('newer sort and city choices defeat pending location callbacks',{},async({page})=>{
        await gotoCity(page);await requestLocation(page);await page.locator('#sort').selectOption('big');await respond(page);
        assert.equal(await page.locator('#sort').inputValue(),'big');assert.equal(await page.locator('#grid .park-distance').count(),0);
        await requestLocation(page);await chooseCity(page,'parker');await respond(page);
        assert.equal(new URL(page.url()).searchParams.get('dataset'),'parker');assert.notEqual(await page.locator('#sort').inputValue(),'nearest');
      });
      await run('unanswered native prompt has 15-second foreground deadline and no hidden retry',{},async({page})=>{
        await page.clock.install();await gotoCity(page);await requestLocation(page);await page.clock.fastForward(15001);
        assert.match(await page.locator('#location-status').textContent(),/timed out|taking too long|deadline|no location|cancelled here/i);
        await respond(page);assert.equal(await page.locator('#sort').inputValue(),'alpha');assert.equal(await requestCount(page),1);
      });
      await run('same-document Back/Forward restores only non-coordinate city/filter/search/sort state',{},async({page})=>{
        await gotoCity(page);await requestLocation(page);await respond(page);await filterClick(page,'playground');await chooseCity(page,'denver');
        const denver=(await state(page)).ids;await chooseCity(page,'parker');const parker=(await state(page)).ids;
        await page.goBack();await settleCity(page,'denver');
        await assertNearest(page,'denver',sentinel,'playground');assert.deepEqual((await state(page)).ids,denver);
        await page.goForward();await settleCity(page,'parker');await assertNearest(page,'parker',sentinel,'playground');
        assert.deepEqual((await state(page)).ids,parker);assert.equal(await requestCount(page),1);
      });
      await run('reload and persisted pagehide/pageshow clear fix/distances without prompting',{},async({page})=>{
        await gotoCity(page);await requestLocation(page);await respond(page);await page.reload();await ready(page);
        assert.equal(await requestCount(page),0);assert.equal(await page.locator('#sort').inputValue(),'alpha');assert.equal(await page.locator('#grid .park-distance').count(),0);
        await requestLocation(page);await respond(page);await page.evaluate(()=>{window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));});
        assert.equal(await page.locator('#sort').inputValue(),'alpha');assert.equal(await page.locator('#grid .park-distance').count(),0);assert.equal(await requestCount(page),1);
      });
      await run('actual departure/Back never restores stale fix or automatically prompts',{},async({page})=>{
        await gotoCity(page);await requestLocation(page);await respond(page);await page.goto(origin+'/index.html');await page.goBack();await ready(page);
        assert.equal(await page.locator('#sort').inputValue(),'alpha');assert.equal(await page.locator('#grid .park-distance').count(),0);
        assert.ok((await requestCount(page))<=1,'No additional request on restored/new document');
      });
      await run('keyboard, live feedback, labels, mobile targets and scoped axe audit',{},async({page})=>{
        await gotoCity(page);await page.locator('#btn-locate').focus();await page.keyboard.press('Enter');assert.equal(await requestCount(page),1);
        assert.equal(await page.locator('#location-status').getAttribute('role'),'status');assert.equal(await page.locator('#location-status').getAttribute('aria-live'),'polite');
        await page.evaluate(()=>window.__geoRequests[0].error({code:1}));
        assert.ok((await page.locator('#search').getAttribute('aria-label'))||await page.locator('label[for="search"]').count());
        assert.ok((await page.locator('#sort').getAttribute('aria-label'))||await page.locator('label[for="sort"]').count());
        await cityLink(page,'parker').focus();await page.keyboard.press('Enter');await ready(page,'parker');
        for(const box of await page.locator('#location-panel button:visible,.dataset-link:visible').evaluateAll(nodes=>nodes.map(node=>({w:node.getBoundingClientRect().width,h:node.getBoundingClientRect().height}))))assert.ok(box.w>=44&&box.h>=44,'Location and city touch targets ≥44px');
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'No page-wide horizontal overflow');
        await deadline(page.evaluate(async()=>{await document.fonts.ready;await Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{})));}),5000,'Fonts and finite animations settling before axe');
        const audit=await new AxeBuilder({page}).include('#location-panel').include('.top-controls').include('.dataset-link').include('#filter-bar').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
        fs.writeFileSync(path.join(output,engineName+'-near-me-axe-'+label+'.json'),JSON.stringify(audit.violations,null,2));
        assert.deepEqual(audit.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length})),[]);
        await screenshot(page,label+'-denied-accessible');
      });
      await run('directory list and nearest work without Leaflet',{},async({page})=>{
        await gotoCity(page);assert.equal(await page.evaluate(()=>typeof window.L),'undefined');await requestLocation(page);await respond(page);await assertNearest(page,'aurora');
      });
      for(const entry of ['index.html','parks.html']){
        await run(entry+' legacy URL privacy cleanup precedes analytics and resource requests',{},async({page,requests})=>{
          await page.goto(origin+'/'+entry+'?dataset=parker&near=1&lat='+sentinel[0]+'&lng='+sentinel[1]+'&unknown='+encodeURIComponent(sentinel.join(','))+'#'+encodeURIComponent(sentinel.join(',')),{referer:'https://example.test/source?lat='+sentinel[0]+'&lng='+sentinel[1]});
          assert.equal(await requestCount(page),0);assert.equal(new URL(page.url()).search,entry==='parks.html'?'?dataset=parker':'?dataset=parker&near=1');assert.equal(new URL(page.url()).hash,'');
          const info=await page.evaluate(()=>({privacy:window.FEP_PRIVACY,config:Array.from(window.dataLayer||[],args=>Array.from(args)).find(args=>args[0]==='config'),resources:window.__resourceSnapshots}));
          assert.equal(info.privacy.ok,true);assert.equal(info.config[2].page_referrer,'https://example.test/source');const safeInitial=origin+'/'+entry+'?dataset=parker&near=1';assert.equal(info.privacy.pageLocation,safeInitial);assert.equal(info.config[2].page_location,safeInitial);
          for(const resource of info.resources)assertNoSentinel(resource,'Resource insertion snapshot');
          for(const request of requests.filter(r=>!r.navigation))assert.equal(request.headers.referer,undefined,'Early no-referrer applies to subresources');
        });
        await run(entry+' cleanup failure disables GA/location and keeps clean manual links',{failCleanup:true},async({page,requests})=>{
          await page.goto(origin+'/'+entry+'?dataset=parker&lat='+sentinel[0]+'&lng='+sentinel[1]);
          assert.equal(await page.evaluate(()=>window.FEP_PRIVACY.ok),false);
          assert.equal(requests.some(r=>/google-analytics|googletagmanager/.test(r.url)),false);
          if(entry==='parks.html'){
            await ready(page,'parker');await page.locator('#btn-locate').evaluate(button=>button.click());assert.equal(await requestCount(page),0);
            assert.match(await page.locator('#location-status').textContent(),/disabled|privacy|manual|location.*unavailable/i);
            const href=await cityLink(page,'denver').getAttribute('href');assert.ok(href.includes('dataset=denver'));assertNoSentinel(href,'Manual fallback link');
          }else{assertNoSentinel(await page.locator('#geoBtn').getAttribute('href'),'Home fallback link');}
        });
      }
    }
    const desktop={width:1440,height:1000};
    await check('all 17 supported city chips retain one in-memory fix and exact city-only order',()=>testPage(desktop,{},async({page})=>{
      await gotoCity(page);await requestLocation(page);await respond(page);
      const keys=await page.locator('.dataset-link[data-dataset]').evaluateAll(nodes=>nodes.map(n=>n.dataset.dataset));assert.equal(keys.length,17);
      for(const city of keys){await chooseCity(page,city);await assertNearest(page,city);}
      assert.equal(await requestCount(page),1);
    }));
    await check('plain directory Back/Forward restores manual visibility, search, Largest and Smallest without consent',()=>testPage(desktop,{},async({page})=>{
      await page.goto(origin+'/parks.html');await ready(page);const alpha=(await state(page)).ids;
      await page.locator('#sort').selectOption('big');const largest=(await state(page)).ids;
      await page.locator('#sort').selectOption('small');const smallest=(await state(page)).ids;
      await page.locator('#search').fill('Park');assert.equal(await requestCount(page),0);
      await page.goBack();await page.waitForFunction(()=>document.querySelector('#search').value==='');
      assert.equal(await page.locator('#sort').inputValue(),'small');assert.deepEqual((await state(page)).ids,smallest);
      await page.goBack();await page.waitForFunction(()=>document.querySelector('#sort').value==='big');assert.deepEqual((await state(page)).ids,largest);
      await page.goBack();await page.waitForFunction(()=>document.querySelector('#sort').value==='alpha');assert.deepEqual((await state(page)).ids,alpha);
      assert.ok(await page.locator('.browse-shell').isVisible());assert.equal(new URL(page.url()).search,'');
      await page.goForward();await page.waitForFunction(()=>document.querySelector('#sort').value==='big');assert.deepEqual((await state(page)).ids,largest);assert.equal(await requestCount(page),0);
    }));
    await check('load-more keeps the complete city nearest order, including unknown-coordinate tail',()=>testPage(desktop,{},async({page})=>{
      await gotoCity(page);await requestLocation(page);await respond(page);
      for(let remaining=30;await page.locator('#load-more-wrap button').count();remaining--){assert.ok(remaining>0,'Bounded number of load-more clicks');await page.locator('#load-more-wrap button').click();}
      const expected=await assertNearest(page,'aurora');assert.equal(await cards(page).count(),expected.length);
    }));
    await check('invalid dataset loader names never request prototype-derived scripts',()=>testPage(desktop,{},async({page,requests})=>{
      await gotoCity(page);const before=requests.length;
      const outcomes=await page.evaluate(async()=>Promise.all(['constructor','toString','__proto__','hasOwnProperty'].map(async key=>{try{await window.loadParkDataset(key);return 'accepted';}catch(_){return 'rejected';}})));
      assert.deepEqual(outcomes,['rejected','rejected','rejected','rejected']);assert.equal(requests.length,before);
    }));
    await check('latest async city selection wins even when an older dataset completes last',()=>{
      let release;const gate=new Promise(resolve=>release=resolve);let intercepted;
      const seen=new Promise(resolve=>intercepted=resolve);
      return testPage(desktop,{route:async(route,url)=>{if(url.pathname==='/denver-parks-data.js'){intercepted();await gate;await route.continue();return true;}return false;}},async({page})=>{
        try{await gotoCity(page);await requestLocation(page);await respond(page);await cityLink(page,'denver').click();await deadline(seen,12000,'Delayed Denver dataset request starting');await chooseCity(page,'parker');await assertNearest(page,'parker');release();await page.waitForFunction(()=>Array.isArray(window.getParkDataset('denver')));assert.equal(new URL(page.url()).searchParams.get('dataset'),'parker');await assertNearest(page,'parker');}finally{release();}
      });
    });
    await check('failed city load preserves usable manual browsing and reports failure',()=>testPage(desktop,{route:async(route,url)=>{if(url.pathname==='/denver-parks-data.js'){await route.abort();return true;}return false;}},async({page})=>{
      await gotoCity(page);await cityLink(page,'denver').click();await page.waitForFunction(()=>/could not|unable|unavailable|failed/i.test(document.querySelector('#location-status').textContent));
      await chooseCity(page,'parker');assert.ok(await cards(page).count());assert.equal(await requestCount(page),0);
    }));
    await check('unsupported amenity is removed with feedback while supported selection and nearest persist',()=>testPage(desktop,{route:async(route,url)=>{
      if(url.pathname==='/parker-parks-data.js'){await route.fulfill({status:200,contentType:'text/javascript',body:fixtureSource('parker',fixtureParks.map(p=>({...p,f:{trails:true}})))});return true;}return false;
    }},async({page})=>{
      await gotoCity(page);await requestLocation(page);await respond(page);await filterClick(page,'playground');await chooseCity(page,'parker');
      assert.match(await page.locator('#location-status').textContent(),/filter.*removed|removed.*filter|not available|not supported/i);await assertNearest(page,'parker');assert.equal(await page.locator('.pill[data-k="playground"]').count(),0);
    }));
    await check('late history failure clears the fix and centroid suggestion, disables location, and preserves manual browsing',()=>testPage(desktop,{},async({page})=>{
      await page.goto(origin+'/parks.html?near=1');await requestLocation(page);await respond(page);
      await page.waitForFunction(()=>document.querySelector('#city-suggestion').textContent.includes('Closest covered city'));
      assert.ok(await page.locator('#city-suggestion').isVisible());assert.equal(await requestCount(page),1);
      await page.evaluate(()=>{history.pushState=function(){throw new Error('Synthetic late history failure');};history.replaceState=function(){throw new Error('Synthetic late history failure');};});
      await cityLink(page,'parker').click();await page.waitForFunction(()=>window.FEP_PRIVACY.ok===false);
      assert.equal(await page.locator('#btn-locate').isDisabled(),true);assert.equal(await page.locator('#city-suggestion').isVisible(),false);
      assert.equal((await page.locator('#city-suggestion').textContent()).trim(),'');assert.equal(await page.locator('#grid .park-distance').count(),0);
      assert.equal(await page.locator('#sort').inputValue(),'alpha');assert.equal(await page.evaluate(()=>window['ga-disable-G-9GWTHQXZNY']),true);
      await page.locator('#btn-locate').evaluate(button=>button.click());assert.equal(await requestCount(page),1,'Disabled explicit control never creates another GPS request');
      await cityLink(page,'denver').click();await page.waitForFunction(()=>window.ACTIVE_DATASET_KEY==='denver'&&document.querySelector('#page-intro-title').textContent.includes('Denver'));
      assert.ok(await cards(page).count());assert.equal(await page.locator('#grid .park-distance').count(),0);assert.equal(await requestCount(page),1);
    }));
    await check('geolocation unsupported retains manual city browsing',()=>testPage(desktop,{unsupported:true},async({page})=>{
      await gotoCity(page);await page.locator('#btn-locate').click();assert.match(await page.locator('#location-status').textContent(),/not supported|unavailable|manual/i);await chooseCity(page,'parker');assert.equal(await requestCount(page),0);
    }));
    await check('JavaScript disabled exposes safe city links or explicit fallback, not a fake working directory',()=>testPage(desktop,{javascript:false},async({page,requests})=>{
      await page.goto(origin+'/parks.html?near=1');assert.ok(await cityLink(page,'parker').isVisible());
      assert.ok(await page.locator('noscript').count());assert.match(await page.locator('noscript').textContent(),/javascript|city|guide/i);
      for(const href of await page.locator('.dataset-link').evaluateAll(nodes=>nodes.map(n=>n.href)))assert.equal(/[?&](lat|lng)=/.test(href),false);
      assert.equal(requests.some(r=>/google-analytics|googletagmanager/.test(r.url)),false);
    }));
  }catch(error){failures.push({name:'suite infrastructure',message:error.stack});console.error(error);}
  finally{
    if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));
    const report={engine:engineName,viewports:['320x740','390x844','1440x1000'],passed:results.length,failed:failures.length,results,failures,privacy:'Synthetic coordinates only; every non-local request intercepted. Initial host request on a legacy coordinate URL cannot be erased. No production analytics requests were allowed.',limitations:['Playwright is not physical iOS Safari or Android Chrome permission-dialog testing.','Leaflet boundary spy tests map calls without contacting the provider; real map-tile/provider behavior is not a physical-device pass.','Synthetic persisted pagehide/pageshow checks the bfcache handler; actual Back behavior may be a reload if automation disables bfcache.']};
    fs.writeFileSync(path.join(output,engineName+'-near-me-results.json'),JSON.stringify(report,null,2));
    console.log('Near Me results: '+results.length+' passed; '+failures.length+' failed.');if(failures.length)process.exitCode=1;
  }
})();
