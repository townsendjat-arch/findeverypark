const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
for(const page of ['index.html','parks.html','trails.html']) test(page+': GPS controls fail closed before scripts or if config fails',()=>{
 const html=read(page);
 assert.match(html,/\[hidden\]\s*\{\s*display:\s*none\s*!important/);
 assert.match(html,/<script src="gps-availability.js"><\/script>/);
 const control=html.match(/<(?:a|button)[^>]*id="(?:geoBtn|btn-locate)"[^>]*>/)[0];
 assert.match(control,/data-gps-only/);assert.match(control,/\bhidden\b/);
 if(page!=='index.html')assert.match(control,/\bdisabled\b/);
});
test('availability is false without URL, storage or query override',()=>{
 const gps=[{hidden:false,disabled:false},{hidden:false}],paused=[{hidden:true}],context={window:{},document:{querySelectorAll:selector=>selector==='[data-gps-only]'?gps:paused}};
 vm.runInNewContext(read('gps-availability.js'),context);
 assert.equal(context.window.FEP_GPS_AVAILABLE,false);
 assert.ok(gps.every(node=>node.hidden));assert.equal(gps[0].disabled,true);assert.equal(paused[0].hidden,false);
 assert.doesNotMatch(read('gps-availability.js'),/localStorage|sessionStorage|searchParams|location\.search/);
});
test('underlying request manager retained byte-for-byte from deployed baseline',()=>{
 assert.equal(crypto.createHash('sha256').update(read('near-me.js')).digest('hex'),'8ce0649a5a5685b7a776ca3adc4a646d30ba2c7ec4d0fadfb45cb5126b2ef184');
});
test('both native acquisition entrypoints are guarded and nearest is not selectable',()=>{
 const parks=read('parks.html'),trails=read('trails.html');
 assert.match(parks,/function locateMe\(\) \{\s*if \(!GPS_AVAILABLE\)/);
 assert.match(parks,/geolocation: GPS_AVAILABLE \? navigator.geolocation : undefined/);
 assert.match(trails,/function locateMe\(\) \{\s*if \(window.FEP_GPS_AVAILABLE !== true\) return;/);
 assert.match(parks,/<option value="nearest" data-gps-only hidden disabled>/);
 assert.match(parks,/if \(GPS_AVAILABLE\) document.getElementById\('btn-locate'\).focus\(\)/);
});
test('manual homepage action replaces the GPS gap without changing city-confirmation routing',()=>{
 assert.match(read('index.html'),/id="browseParksBtn" data-gps-paused href="\.\/parks.html\?near=1">Browse parks by city/);
 assert.match(read('index.html'),/Choose a city, then compare parks and amenities/);
});
