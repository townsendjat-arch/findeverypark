/* Research only: real Leaflet; synthetic local tiles; no runtime changes.
 * BROWSER=chromium|webkit node tests/mobile-map-gestures.browser.js
 * Mouse wheel/drag are NOT finger swipe/pinch or physical-device evidence.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {chromium, webkit} = require('playwright');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'test-results');
const engine = process.env.BROWSER || 'chromium';
assert.ok(['chromium', 'webkit'].includes(engine));
const origin = 'https://mobile-map-fixture.test';
const leaflet = path.join(path.dirname(require.resolve('leaflet/package.json')), 'dist');
const mime = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.png':'image/png', '.svg':'image/svg+xml', '.jpg':'image/jpeg', '.webp':'image/webp'};
const tile = '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#b9d5ad"/><path d="M0 128h256M128 0v256" stroke="white" stroke-width="4"/><text x="20" y="30">FIXTURE TILE</text></svg>';
const report = {engine, scope:'Browser-emulated 320/390px touch-capable mobile contexts, real Leaflet 1.9.4, synthetic tiles. No physical phone, trusted touch swipe/pinch, momentum, browser chrome, or screen reader verification.', results:[], failures:[]};
const settle = page => page.waitForTimeout(650);
async function snapshot(page) {
  return page.evaluate(() => {
    const el = document.getElementById('map');
    const r = el.getBoundingClientRect();
    const active = document.activeElement;
    return {scrollY, maxScroll:document.documentElement.scrollHeight-innerHeight,
      zoom:map.getZoom(), center:map.getCenter(), mapRect:{x:r.x,y:r.y,width:r.width,height:r.height},
      active:{tag:active.tagName,id:active.id,label:active.getAttribute('aria-label'),className:String(active.className),inMap:el.contains(active)},
      options:{dragging:map.dragging.enabled(),scrollWheelZoom:map.scrollWheelZoom.enabled(),touchZoom:map.touchZoom.enabled(),keyboard:map.keyboard.enabled()},
      touchAction:getComputedStyle(el).touchAction, mobile:{width:innerWidth,height:innerHeight,maxTouchPoints:navigator.maxTouchPoints}};
  });
}
async function measure(page, name, action) {
  const before = await snapshot(page);
  await action(); await settle(page);
  const after = await snapshot(page);
  return {name,before,after,scrollDelta:after.scrollY-before.scrollY,zoomDelta:after.zoom-before.zoom,
    centerChanged:Math.abs(after.center.lat-before.center.lat)>0.000001 || Math.abs(after.center.lng-before.center.lng)>0.000001};
}
async function alignMap(page) {
  await page.locator('#map').scrollIntoViewIfNeeded();
  await page.evaluate(() => scrollBy(0,document.getElementById('map').getBoundingClientRect().top-110));
  await settle(page);
}
(async () => {
  fs.mkdirSync(output,{recursive:true});
  let browser;
  try {
    const options = engine==='chromium' && process.env.CHROMIUM_EXECUTABLE_PATH ? {executablePath:process.env.CHROMIUM_EXECUTABLE_PATH} : {};
    browser = await ({chromium,webkit}[engine]).launch({headless:true,...options});
    for (const width of [320,390]) {
      const context = await browser.newContext({viewport:{width,height:width===320?740:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
      const page = await context.newPage();
      page.setDefaultTimeout(15000);
      const result = {width,observations:[],pageErrors:[],publicRequestsSent:0,limitations:['Touchscreen.tap only; wheel and drag below use mouse input, not fingers.','No recommendation to change interaction mode follows from viewport emulation alone.']};
      page.on('pageerror',error=>result.pageErrors.push(error.message));
      await context.route('**/*',async route=>{
        const url = new URL(route.request().url());
        if (url.origin===origin) {
          const file = path.resolve(root,'.'+url.pathname);
          if (!file.startsWith(root+path.sep) || url.pathname.split('/').some(s=>s.startsWith('.'))) return route.abort();
          try {return await route.fulfill({body:fs.readFileSync(file),contentType:mime[path.extname(file)]||'application/octet-stream'});} catch {return route.fulfill({status:404,body:'Fixture file missing'});}
        }
        if (url.href==='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js') return route.fulfill({body:fs.readFileSync(path.join(leaflet,'leaflet.js')),contentType:'text/javascript'});
        if (url.href==='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css') return route.fulfill({body:fs.readFileSync(path.join(leaflet,'leaflet.css')),contentType:'text/css'});
        if (/tile\.openstreetmap\.org|server\.arcgisonline\.com/.test(url.hostname)) return route.fulfill({body:tile,contentType:'image/svg+xml'});
        return route.abort(); // Nothing reaches public providers, fonts, or analytics.
      });
      try {
        await page.goto(origin+'/parks.html?dataset=centennial');
        await page.waitForFunction(()=>window.L?.version==='1.9.4' && typeof map!=='undefined' && map && document.querySelector('#grid .card[data-park-id]'));
        await page.evaluate(()=>scrollTo(0,0)); await settle(page);
        result.observations.push(await measure(page,'mouse wheel before map',async()=>{await page.mouse.move(width/2,300);await page.mouse.wheel(0,300);}));
        await alignMap(page);
        let box=await page.locator('#map').boundingBox();
        result.observations.push(await measure(page,'mouse wheel over map',async()=>{await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.wheel(0,200);}));
        await alignMap(page); box=await page.locator('#map').boundingBox();
        result.observations.push(await measure(page,'mouse drag over map (not touch swipe)',async()=>{
          const x=box.x+box.width*0.5,y=box.y+box.height*0.5;
          await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+45,y-80,{steps:12});await page.mouse.up();
        }));
        await page.locator('#map').focus();
        result.observations.push(await measure(page,'focused map ArrowRight',()=>page.keyboard.press('ArrowRight')));
        result.observations.push(await measure(page,'focused map Shift+Tab exit',()=>page.keyboard.press('Shift+Tab')));
        await page.locator('#map').focus();
        const tabSequence=[];
        for (let i=0;i<200;i++) {
          await page.keyboard.press('Tab');
          const active=await page.evaluate(()=>({tag:document.activeElement.tagName,id:document.activeElement.id,label:document.activeElement.getAttribute('aria-label'),inMap:document.getElementById('map').contains(document.activeElement)}));
          tabSequence.push(active); if (!active.inMap) break;
        }
        result.keyboardForwardExit={exited:!tabSequence.at(-1).inMap,tabs:tabSequence.length,sequence:tabSequence};
        await alignMap(page);
        result.observations.push(await measure(page,'touch tap zoom-in control (not pinch)',()=>page.locator('#map .leaflet-control-zoom-in').tap()));
        await page.screenshot({path:path.join(output,`mobile-map-research-${engine}-${width}.png`)});
        assert.deepEqual(result.pageErrors,[],'No page errors during research');
      } catch(error) {
        result.error=error.stack;report.failures.push({width,error:error.stack});
      } finally {report.results.push(result);await context.close();}
    }
  } catch(error) {report.failures.push({setup:error.stack});}
  finally {
    if (browser) await browser.close();
    fs.writeFileSync(path.join(output,`mobile-map-research-${engine}.json`),JSON.stringify(report,null,2));
    console.log(JSON.stringify(report,null,2));
    if (report.failures.length) process.exitCode=1;
  }
})();
