/* Deterministic, synthetic-only Phase 1 tests. No network or real location. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));

function registry() {
  const context = { window: { dispatchEvent() {} }, CustomEvent: function (type, options) { this.type = type; this.detail = options.detail; } };
  vm.createContext(context);
  vm.runInContext(read('park-data-registry.js'), context);
  return context.window;
}

for (const value of [null, undefined, '', ' ', 'bad', Infinity, -Infinity, NaN, true, false, [], {}]) {
  test('registry rejects invalid coordinate pair input: ' + String(value), () => {
    const w = registry();
    for (const park of [{lat:value,lng:20}, {lat:20,lng:value}]) {
      const result = w.normalizePark({n:'Synthetic invalid park', ...park}, 'aurora');
      assert.equal(result.lat, null);
      assert.equal(result.lng, null);
    }
  });
}

test('registry keeps genuine zero and legacy numeric pairs, rejects out-of-range pairs', () => {
  const w = registry();
  for (const [lat,lng] of [[0,0],['0','0'],[-90,-180],[90,180],['39.7','-104.8']]) {
    const result = w.normalizePark({n:'Synthetic valid park',lat,lng}, 'aurora');
    assert.equal(result.lat, Number(lat)); assert.equal(result.lng, Number(lng));
  }
  for (const [lat,lng] of [[90.001,0],[-90.001,0],[0,180.001],[0,-180.001]]) {
    const result = w.normalizePark({n:'Synthetic invalid park',lat,lng}, 'aurora');
    assert.equal(result.lat,null); assert.equal(result.lng,null);
  }
  w.PARK_COORDS = {aurora:{'Legacy pair':['0','-45']}};
  const legacy = w.normalizePark({n:'Legacy pair'}, 'aurora');
  assert.equal(legacy.lat,0); assert.equal(legacy.lng,-45);
});

function runGuard(file, { fail = false, href = 'https://findeverypark.com/' + file + '?dataset=parker&near=1&lat=12.3456789&lng=-98.7654321&unknown=12.3456789#12.3456789,-98.7654321', referrer = 'https://example.test/source?lat=12.3456789&lng=-98.7654321#location' } = {}) {
  const html = read(file);
  const source = html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
  const events = [], window = { location: new URL(href) };
  const history = { replaceState(state, title, target) {
    events.push({ type:'replace', state, target });
    if (fail) throw new Error('Synthetic history failure');
    window.location = new URL(target, window.location);
  } };
  const document = { referrer, createElement: () => ({}), head: { appendChild(node) {
    events.push({ type:'resource', href:window.location.href, src:node.src, dataLayer:plain(window.dataLayer || []) });
  } } };
  const context = { window, history, document, URL, Date };
  vm.runInNewContext(source, context);
  return {html,window,events};
}

for (const file of ['index.html','parks.html']) {
  test(file + ': no-referrer and cleanup precede every external resource', () => {
    const {html,window,events} = runGuard(file);
    assert.match(html.slice(0,html.indexOf('<script>')), /<meta name="referrer" content="no-referrer">/);
    const close = html.indexOf('</script>');
    assert.equal(/<(?:script|link|img|iframe)[^>]+(?:src|href)=["']https?:/i.test(html.slice(0,html.indexOf('<script>'))), false);
    assert.ok(close < html.indexOf('<link'), 'Guard is first, before link resources');
    assert.equal(window.FEP_PRIVACY.ok,true);
    assert.equal(window.location.search,'?dataset=parker&near=1');
    assert.equal(window.location.hash,'');
    assert.equal(events[0].type,'replace'); assert.equal(events[0].state,null);
    assert.equal(events.filter(e => e.type === 'resource').length,1);
    assert.equal(events[1].href,window.location.href);
    const config = plain(window.dataLayer).find(args => args[0] === 'config');
    assert.ok(config,'Existing GA configuration remains present');
    assert.equal(config[1],'G-9GWTHQXZNY');
    assert.equal(config[2].page_location,window.location.href);
    assert.equal(config[2].page_referrer,'https://example.test/source');
    assert.equal(JSON.stringify(events).includes('12.3456789'),false);
    assert.equal(JSON.stringify(events).includes('-98.7654321'),false);
  });
  test(file + ': cleanup failure suppresses analytics and exposes closed privacy flag', () => {
    const {window,events} = runGuard(file,{fail:true});
    assert.equal(window.FEP_PRIVACY.ok,false);
    assert.equal(window.dataLayer,undefined);
    assert.equal(window.gtag,undefined);
    assert.equal(events.filter(e=>e.type==='resource').length,0);
  });
  test(file + ': allowlist discards unknown cities, coordinates, unsafe fragments and coordinate-like text', () => {
    const {window} = runGuard(file,{href:'https://findeverypark.com/' + file + '?dataset=outside&sort=nearest&near=1&filter=dog,invalid&search=12.3456789%2C-98.7654321#encoded%253D12.3456789'});
    assert.equal(window.location.search,'?near=1&filter=dog');
    assert.equal(window.location.hash,'');
  });
  test(file + ': ordinary search survives browsing but is excluded from initial GA configuration', () => {
    const {window} = runGuard(file,{href:'https://findeverypark.com/' + file + '?dataset=denver&search=Central+Park&sort=big'});
    assert.equal(window.location.search,'?dataset=denver&search=Central+Park&sort=big');
    const config = plain(window.dataLayer).find(args => args[0] === 'config');
    assert.equal(new URL(config[2].page_location).searchParams.has('search'),false);
  });
}

test('homepage no longer requests location or emits coordinate URLs', () => {
  const html = read('index.html');
  assert.equal(html.includes('navigator.geolocation'),false);
  assert.ok(html.includes('parks.html?near=1'));
  assert.equal(/lat=|lng=/.test(html),false);
});

const near = require('../near-me.js');
const R = 3958.8;
// Independent spherical law of cosines, not a copy of the implementation's haversine.
function oracle(a,b) {
  if (a[0] === b[0] && a[1] === b[1]) return 0;
  const radians = Math.PI / 180;
  const cosine = Math.sin(a[0]*radians)*Math.sin(b[0]*radians) + Math.cos(a[0]*radians)*Math.cos(b[0]*radians)*Math.cos((a[1]-b[1])*radians);
  return R * Math.acos(Math.max(-1,Math.min(1,cosine)));
}

test('coordinate helper validates pairs without coercing null/blank/boolean to zero', () => {
  for (const bad of [null,undefined,'',' ',true,false,NaN,Infinity,{},[]]) {
    assert.equal(near.coordinatePair(bad,0),null); assert.equal(near.coordinatePair(0,bad),null);
  }
  for (const pair of [[0,0],[90,-180],[-90,180],['0','0'],['39.5','-104.8']]) assert.deepEqual(near.coordinatePair(...pair),pair.map(Number));
  for (const pair of [[91,0],[-91,0],[0,181],[0,-181]]) assert.equal(near.coordinatePair(...pair),null);
});

test('distance matches independent spherical oracle within 0.001 mile across hemispheres', () => {
  const pairs = [
    [[0,0],[0,1]], [[0,0],[1,0]], [[39.7294,-104.8319],[39.7392,-104.9903]],
    [[12.3456789,-98.7654321],[-33.9249,18.4241]], [[0,179.9],[0,-179.9]],
    [[89.5,40],[89.5,-140]], [[-89.5,40],[-89.5,-140]], [[0,0],[0,180]],
    [[45,90],[-45,-90]], [[39.7,-104.8],[39.7001,-104.8001]], [[0,0],[0,0]]
  ];
  for (const [a,b] of pairs) {
    const actual = near.distanceMiles(...a,...b), expected = oracle(a,b);
    assert.ok(Math.abs(actual-expected) <= 0.001, 'Independent distance tolerance');
    assert.equal(actual,near.distanceMiles(...b,...a),'Symmetric distance');
    assert.ok(Number.isFinite(actual) && actual >= 0);
  }
  assert.ok(Math.abs(near.distanceMiles(0,0,0,1)-69.09409442795152) < 1e-10);
  assert.equal(near.distanceMiles(0,0,0,0),0);
  assert.equal(near.distanceMiles(null,0,0,0),null);
  assert.equal(near.distanceMiles(0,0,91,0),null);
});

test('nearest ordering is unrounded, stable, zero-first and missing-last', () => {
  const parks = [
    {id:'unknown-a',dist:null,origIdx:0}, {id:'far',dist:1.04,origIdx:1},
    {id:'tie-a',dist:1.01,origIdx:2}, {id:'zero',dist:0,origIdx:3},
    {id:'tie-b',dist:1.01,origIdx:4}, {id:'unknown-b',dist:NaN,origIdx:5}
  ];
  assert.equal(near.distanceLabel(1.04),near.distanceLabel(1.01),'Rounding fixture has equal display labels');
  assert.deepEqual(parks.slice().sort(near.compareDistances).map(p=>p.id),['zero','tie-a','tie-b','far','unknown-a','unknown-b']);
  assert.deepEqual(parks.map(p=>p.id),['unknown-a','far','tie-a','zero','tie-b','unknown-b'],'Caller data unchanged');
});

test('distance labels retain existing rounding and show zero instead of hiding it', () => {
  for (const [distance,label] of [[0,'<0.1 mi'],[0.09,'<0.1 mi'],[0.1,'0.1 mi'],[1.04,'1.0 mi'],[9.94,'9.9 mi'],[10.49,'10 mi'],[10.51,'11 mi'],[null,'Distance unavailable'],[NaN,'Distance unavailable']]) assert.equal(near.distanceLabel(distance),label);
});

test('closest covered city is spherical centroid ranking, including far-outside coverage', () => {
  const context={window:{}}; vm.runInNewContext(read('city-centroids.js'),context);
  const cities=plain(context.window.FEP_CITY_CENTROIDS); assert.equal(cities.length,17);
  for (const origin of [[39.7,-104.8],[12.3456789,-98.7654321],[0,0],[90,0],[-89,179]]) {
    const expected=cities.map((c,index)=>({...c,index,distance:oracle(origin,[c.lat,c.lng])})).sort((a,b)=>a.distance-b.distance||a.index-b.index)[0];
    const actual=near.nearestCity(origin,cities);
    assert.equal(actual.key,expected.key); assert.ok(Math.abs(actual.dist-expected.distance)<=0.001);
  }
  assert.equal(near.nearestCity(null,cities),null);
  assert.equal(near.nearestCity([0,0],[]),null);
  assert.equal(near.nearestCity([0,0],[{key:'missing',lat:null,lng:null}]),null);
  assert.equal(near.nearestCity([0,0],[{key:'a',lat:0,lng:1},{key:'b',lat:0,lng:1}]).key,'a');
});

function requestFixture({unsupported=false,throws=false}={}) {
  let time=0,next=1;
  const timers=new Map(),requests=[],success=[],errors=[],pending=[];
  const geolocation=unsupported ? undefined : {getCurrentPosition(ok,error,options) {
    if(throws) throw new Error('Synthetic platform error');
    requests.push({ok,error,options});
  }};
  const manager=near.createRequestManager({geolocation,onSuccess:p=>success.push(p),onError:e=>errors.push(e),onPending:p=>pending.push(p),
    now:()=>time,setTimeout:(callback,delay)=>{const id=next++;timers.set(id,{at:time+delay,callback});return id;},clearTimeout:id=>timers.delete(id)});
  function advance(milliseconds) {
    const until=time+milliseconds;
    for (;;) {
      const due=[...timers].filter(([,t])=>t.at<=until).sort((a,b)=>a[1].at-b[1].at)[0];
      if(!due) break;
      time=due[1].at;timers.delete(due[0]);due[1].callback();
    }
    time=until;
  }
  return {manager,requests,success,errors,pending,timers,advance};
}

test('one explicit start makes one request with approved options; duplicate taps coalesce', () => {
  const f=requestFixture(); assert.equal(f.requests.length,0);
  assert.equal(f.manager.start(),true);assert.equal(f.manager.start(),false);
  assert.equal(f.requests.length,1);
  assert.deepEqual(f.requests[0].options,{timeout:8000,maximumAge:0,enableHighAccuracy:false});
  f.requests[0].ok({coords:{latitude:0,longitude:0}});
  assert.deepEqual(f.success,[[0,0]]);assert.deepEqual(f.pending,[true,false]);
  assert.equal(f.manager.isPending(),false);assert.equal(f.timers.size,0);
});

for (const [code,result] of [[1,'denied'],[2,'unavailable'],[3,'timeout'],[999,'unavailable']]) {
  test('request error ' + code + ' produces distinct ' + result + ' result without retry', () => {
    const f=requestFixture();f.manager.start();f.requests[0].error({code});f.advance(30000);
    assert.deepEqual(f.errors,[result]);assert.equal(f.requests.length,1);assert.equal(f.success.length,0);
    f.requests[0].ok({coords:{latitude:12.3456789,longitude:-98.7654321}});
    assert.equal(f.success.length,0,'A late success after error is ignored');
  });
}

test('foreground UI deadline bounds unanswered prompt and ignores late callback', () => {
  const f=requestFixture();f.manager.start();f.advance(14999);assert.equal(f.errors.length,0);
  f.advance(1);assert.deepEqual(f.errors,['deadline']);assert.equal(f.manager.isPending(),false);
  f.requests[0].ok({coords:{latitude:12.3456789,longitude:-98.7654321}});assert.equal(f.success.length,0);
  assert.equal(f.requests.length,1,'No hidden retry');
});

test('foreground deadline pauses while hidden and resumes with remaining time', () => {
  const f=requestFixture();f.manager.start();f.advance(5000);f.manager.setHidden(true);f.advance(60000);
  assert.equal(f.errors.length,0);assert.equal(f.manager.isPending(),true);
  f.manager.setHidden(false);f.advance(9999);assert.equal(f.errors.length,0);f.advance(1);
  assert.deepEqual(f.errors,['deadline']);
});

test('request started while hidden gets a full foreground deadline on return', () => {
  const f=requestFixture();f.manager.setHidden(true);f.manager.start();f.advance(60000);
  assert.equal(f.errors.length,0);f.manager.setHidden(false);f.advance(15000);assert.deepEqual(f.errors,['deadline']);
});

for (const reason of ['cancel','clear','new city','new sort','pagehide']) {
  test(reason + ' cancellation invalidates old callback without preventing an explicit fresh request', () => {
    const f=requestFixture();f.manager.start();const old=f.requests[0];f.manager.cancel();f.manager.start();
    old.ok({coords:{latitude:12.3456789,longitude:-98.7654321}});old.error({code:1});
    assert.equal(f.success.length,0);assert.equal(f.errors.length,0);assert.equal(f.manager.isPending(),true);
    f.requests[1].ok({coords:{latitude:0,longitude:0}});assert.deepEqual(f.success,[[0,0]]);
    assert.equal(f.requests.length,2);assert.equal(f.manager.isPending(),false);
  });
}

test('invalid success coordinates, unsupported geolocation and synchronous failure fail safely', () => {
  const f=requestFixture();f.manager.start();f.requests[0].ok({coords:{latitude:null,longitude:0}});assert.deepEqual(f.errors,['unavailable']);
  const unsupported=requestFixture({unsupported:true});assert.equal(unsupported.manager.start(),false);assert.deepEqual(unsupported.errors,['unsupported']);assert.equal(unsupported.manager.isPending(),false);
  const throwing=requestFixture({throws:true});throwing.manager.start();assert.deepEqual(throwing.errors,['unavailable']);assert.equal(throwing.manager.isPending(),false);assert.equal(throwing.timers.size,0);
});

test('async dataset loader rejects inherited/prototype keys without inserting a script', async () => {
  const inserted=[];
  const window={location:{search:'?dataset=aurora',pathname:'/parks.html'},PARK_SITE:{defaultDataset:'aurora'},getParkDataset:key=>key==='aurora'?[]:null};
  const context={window,URLSearchParams,Map,Promise,localStorage:{getItem(){return '';},setItem(){}},document:{createElement(){return {dataset:{},remove(){}};},body:{appendChild(node){inserted.push(node);}}}};
  vm.runInNewContext(read('dataset-loader.js'),context);
  await window.DATASET_LOAD_PROMISE;
  for(const key of ['constructor','toString','__proto__','hasOwnProperty','outside','../../index.html'])await assert.rejects(window.loadParkDataset(key),/Unsupported city/);
  assert.equal(inserted.length,0,'No unallowlisted script request');
});
