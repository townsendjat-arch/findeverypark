(function () {
  window.PARK_COORDS = window.PARK_COORDS || {};
  const loneTree_datasetKey = "lone-tree";
  const loneTree_sourceLink = "";

  const loneTree_baseParks = [
    {id:"co-lone-tree-sweetwater-park",park_type:"neighborhood",n:"Sweetwater Park",a:"",ac:0,f:{},photos:[],d:`A hidden gem that earns its reputation. Well-maintained playground for kids 2–10, shaded pavilion with picnic tables, baseball field, and grassy open space. No restrooms on site, so plan accordingly — but there is a water fountain with a dog spout and pet waste bags. The paved trail connects to tennis courts and Cook Creek Pool, making it a solid quick stop or a longer outing if you tack on the trail. Coyotes are active in this area, heads up.`,city:"Lone Tree",state:"CO",stateName:"Colorado",owner:"City of Lone Tree",sourceCategory:"Park",sourceLink:loneTree_sourceLink},
    {id:"co-lone-tree-prairie-sky-park",park_type:"flagship",n:"Prairie Sky Park",a:"",ac:0,f:{},photos:[],d:`Probably the top playground in Lone Tree. Two play areas cover toddlers through older kids, plus swings, tunnels, climbing features, and fun extras like the dinosaur climber and spring riders. Big shaded gazebo, picnic tables, and open space make this one easy for longer hangs or birthday meetups.`,city:"Lone Tree",state:"CO",stateName:"Colorado",owner:"City of Lone Tree",sourceCategory:"Park",sourceLink:loneTree_sourceLink},
    {id:"co-lone-tree-belvedere-park",park_type:"neighborhood",n:"Belvedere Park",a:"",ac:0,f:{},photos:[],d:"A quieter Lone Tree park that works well for a short stop outdoors.",city:"Lone Tree",state:"CO",stateName:"Colorado",owner:"City of Lone Tree",sourceCategory:"Park",sourceLink:loneTree_sourceLink},
    {id:"co-lone-tree-promenade-park",park_type:"neighborhood",n:"Promenade Park",a:"",ac:0,f:{},photos:[],d:"A central Lone Tree park that is easy to pair with nearby stops.",city:"Lone Tree",state:"CO",stateName:"Colorado",owner:"City of Lone Tree",sourceCategory:"Park",sourceLink:loneTree_sourceLink},
    {id:"co-lone-tree-lincoln-commons-park",park_type:"neighborhood",n:"Lincoln Commons Park",a:"",ac:0,f:{},photos:[],d:"A neighborhood park for a quick break outside in Lone Tree.",city:"Lone Tree",state:"CO",stateName:"Colorado",owner:"City of Lone Tree",sourceCategory:"Park",sourceLink:loneTree_sourceLink},
    {id:"co-lone-tree-the-park-at-lone-tree-elementary",park_type:"neighborhood",n:"The Park at Lone Tree Elementary",a:"",ac:0,f:{},photos:[],d:"A school-adjacent park space that can work for a short local visit.",city:"Lone Tree",state:"CO",stateName:"Colorado",owner:"City of Lone Tree",sourceCategory:"Park",sourceLink:loneTree_sourceLink},
    {id:"co-lone-tree-altair-park",park_type:"neighborhood",n:"Altair Park",a:"",ac:0,f:{},photos:[],d:`A creative neighborhood park with a couple of details that make it worth the stop. Musical play instruments and a butterfly garden give it more character than your average playground. Tucked behind Kohl's on Peacock Drive — easy to miss but worth finding. Sports fields, walking trails, and a playground round it out. Quiet and clean, good for bikes and dog walks. The kind of park that doesn't show up on lists but locals know it.`,city:"Lone Tree",state:"CO",stateName:"Colorado",owner:"City of Lone Tree",sourceCategory:"Park",sourceLink:loneTree_sourceLink},
    {id:"co-lone-tree-carriage-club-estates-park",park_type:"neighborhood",n:"Carriage Club Estates Park",a:"",ac:0,f:{},photos:[],d:"A neighborhood green space for a quick outdoor stop.",city:"Lone Tree",state:"CO",stateName:"Colorado",owner:"City of Lone Tree",sourceCategory:"Park",sourceLink:loneTree_sourceLink},
    {id:"co-lone-tree-centennial-ridge-park",park_type:"neighborhood",n:"Centennial Ridge Park",a:"",ac:0,f:{},photos:[],d:`A solid toddler stop with modern play equipment added in 2021. Three slides, a dedicated toddler section, swings, and a clean layout that's easy to supervise. Summer-only portable restrooms on site. No grand features, but the equipment is newer than most neighborhood parks in the area and the space is well-kept. Best for younger kids and short visits — not a half-day destination but a reliable quick stop.`,city:"Lone Tree",state:"CO",stateName:"Colorado",owner:"City of Lone Tree",sourceCategory:"Park",sourceLink:loneTree_sourceLink},
    {id:"co-lone-tree-fairways-park",park_type:"neighborhood",n:"Fairways Park",a:"",ac:0,f:{},photos:[],d:`Reopened in 2025 after a full renovation, and the upgrade shows. Two playgrounds now — one for toddlers, one for bigger kids — plus a soccer field with a paved loop around it so you can walk while keeping an eye on the action. Covered picnic area with a BBQ pit, benches, and decent parking. Portables for restrooms, not permanent. Compact but well-packed, and the paved loop connecting the soccer field to the playground is a nice design touch. Next to the Lone Tree Rec Center if you want to add a swim or gym visit.`,city:"Lone Tree",state:"CO",stateName:"Colorado",owner:"City of Lone Tree",sourceCategory:"Park",sourceLink:loneTree_sourceLink},
    {id:"co-lone-tree-laquinta-park",park_type:"neighborhood",n:"LaQuinta Park",a:"",ac:0,f:{},photos:[],d:`Hidden inside the Inverness business district — not where you'd expect a park, but it's there. Tennis courts and a multi-purpose field, but no playground and no permanent restrooms. Works well if you're in the area and want to hit some courts or let kids run on the field. Skip it if you need a playground or shade structure; there's not much else here. More of a utility stop than a destination.`,city:"Lone Tree",state:"CO",stateName:"Colorado",owner:"City of Lone Tree",sourceCategory:"Park",sourceLink:loneTree_sourceLink},
    {id:"co-lone-tree-lonesome-pine-park",park_type:"neighborhood",n:"Lonesome Pine Park",a:"",ac:0,f:{},photos:[],d:`A smaller neighborhood park that's better for a quick outing than an all-day destination. You've got a basic playground, nearby tennis courts, and walking paths — the kind of place you hit when the kids need outside time and you don't want the hassle of crowds. Quiet, simple, useful.`,city:"Lone Tree",state:"CO",stateName:"Colorado",owner:"City of Lone Tree",sourceCategory:"Park",sourceLink:loneTree_sourceLink},
    {id:"co-lone-tree-timberline-park",park_type:"neighborhood",n:"Timberline Park",a:"",ac:0,f:{},photos:[],d:"A Lone Tree neighborhood park for a short visit outside.",city:"Lone Tree",state:"CO",stateName:"Colorado",owner:"City of Lone Tree",sourceCategory:"Park",sourceLink:loneTree_sourceLink}
  ];

  const loneTree_supplementalParks = [
    {
      id: "co-lone-tree-prairie-sky-park", park_type: "flagship",
      n: "Prairie Sky Park",
      lat: 39.53,
      lng: -104.88,
      coords_status: "approx",
      f: { playground: 1, restroom: 1, shelter: 1 },
      restroom_details: "Porta-potty",
      amenity_summary: "2 playgrounds, gazebo, grill",
      d: `Probably the top playground in Lone Tree. Two play areas cover toddlers through older kids, plus swings, tunnels, climbing features, and fun extras like the dinosaur climber and spring riders. Big shaded gazebo, picnic tables, and open space make this one easy for longer hangs or birthday meetups.`
    },
    {
      id: "co-lone-tree-belvedere-park", park_type: "neighborhood",
      n: "Belvedere Park",
      lat: 39.53,
      lng: -104.88,
      coords_status: "approx",
      f: { trails: 1, restroom: 1 },
      restroom_details: "Porta-potty",
      amenity_summary: "Hidden park, trail access",
      d: "A quieter park with trail access and a porta-potty."
    },
    {
      id: "co-lone-tree-cook-creek-park", park_type: "flagship",
      n: "Cook Creek Park",
      lat: 39.55,
      lng: -104.89,
      coords_status: "approx",
      a: "",
      ac: 0,
      f: { pool: 1, sprayground: 1, restroom: 1 },
      restroom_details: "Yes",
      amenity_summary: "Seasonal pool, splash pad",
      photos: [],
      d: `This is one of the best summer spots in Lone Tree. Two outdoor pools, water slides, a giant dump bucket, basketball hoops in the water, and a zero-entry area for little kids make it an easy family win. Add in concessions, tennis courts, and solid pricing, and it's easy to spend a few hours here.`,
      city: "Lone Tree",
      state: "CO",
      stateName: "Colorado",
      owner: "City of Lone Tree",
      sourceCategory: "Park",
      sourceLink: loneTree_sourceLink
    },
    {
      id: "co-lone-tree-centennial-ridge-park", park_type: "neighborhood",
      n: "Centennial Ridge Park",
      lat: 39.54,
      lng: -104.9,
      coords_status: "approx",
      f: { playground: 1, restroom: 1 },
      restroom_details: "Summer only",
      amenity_summary: "Modern toddler equipment",
      d: `A solid toddler stop with modern play equipment added in 2021. Three slides, a dedicated toddler section, swings, and a clean layout that's easy to supervise. Summer-only portable restrooms on site. No grand features, but the equipment is newer than most neighborhood parks in the area and the space is well-kept. Best for younger kids and short visits — not a half-day destination but a reliable quick stop.`
    },
    {
      id: "co-lone-tree-altair-park", park_type: "neighborhood",
      n: "Altair Park",
      lat: 39.56,
      lng: -104.9,
      coords_status: "approx",
      f: { garden: 1 },
      restroom_details: "No",
      amenity_summary: "Musical instruments, butterfly garden",
      d: `A creative neighborhood park with a couple of details that make it worth the stop. Musical play instruments and a butterfly garden give it more character than your average playground. Tucked behind Kohl's on Peacock Drive — easy to miss but worth finding. Sports fields, walking trails, and a playground round it out. Quiet and clean, good for bikes and dog walks. The kind of park that doesn't show up on lists but locals know it.`
    },
    {
      id: "co-lone-tree-fairways-park", park_type: "neighborhood",
      n: "Fairways Park",
      lat: 39.54,
      lng: -104.89,
      coords_status: "approx",
      f: { trails: 1, restroom: 1, golf: 1 },
      restroom_details: "Porta-potty",
      amenity_summary: "Near golf course, paved loop",
      d: `Reopened in 2025 after a full renovation, and the upgrade shows. Two playgrounds now — one for toddlers, one for bigger kids — plus a soccer field with a paved loop around it so you can walk while keeping an eye on the action. Covered picnic area with a BBQ pit, benches, and decent parking. Portables for restrooms, not permanent. Compact but well-packed, and the paved loop connecting the soccer field to the playground is a nice design touch. Next to the Lone Tree Rec Center if you want to add a swim or gym visit.`
    },
    {
      id: "co-lone-tree-laquinta-park", park_type: "neighborhood",
      n: "LaQuinta Park",
      lat: 39.54,
      lng: -104.9,
      coords_status: "approx",
      f: { tennis: 1 },
      restroom_details: "No",
      amenity_summary: "Tennis courts, business district",
      d: `Hidden inside the Inverness business district — not where you'd expect a park, but it's there. Tennis courts and a multi-purpose field, but no playground and no permanent restrooms. Works well if you're in the area and want to hit some courts or let kids run on the field. Skip it if you need a playground or shade structure; there's not much else here. More of a utility stop than a destination.`
    },
    {
      id: "co-lone-tree-lonesome-pine-park", park_type: "neighborhood",
      n: "Lonesome Pine Park",
      lat: 39.56,
      lng: -104.9,
      coords_status: "approx",
      f: { playground: 1 },
      restroom_details: "No",
      amenity_summary: "Fully ADA accessible, sand digger",
      accessibility_note: "Fully ADA accessible",
      d: `A smaller neighborhood park that's better for a quick outing than an all-day destination. You've got a basic playground, nearby tennis courts, and walking paths — the kind of place you hit when the kids need outside time and you don't want the hassle of crowds. Quiet, simple, useful.`
    },
    {
      id: "co-lone-tree-kimmer-plaza", park_type: "historic",
      n: "Kimmer Plaza",
      lat: 39.55,
      lng: -104.88,
      coords_status: "approx",
      a: "",
      ac: 0,
      f: {},
      restroom_details: "No",
      amenity_summary: "Fitness stations, wetlands",
      photos: [],
      d: "A plaza-style stop with fitness stations and wetland views.",
      city: "Lone Tree",
      state: "CO",
      stateName: "Colorado",
      owner: "City of Lone Tree",
      sourceCategory: "Park",
      sourceLink: loneTree_sourceLink
    },
    {
      id: "co-lone-tree-maximus-trail-park", park_type: "open_space",
      n: "Maximus Trail Park",
      lat: 39.56,
      lng: -104.89,
      coords_status: "approx",
      a: "",
      ac: 0,
      f: { trails: 1 },
      restroom_details: "No",
      amenity_summary: "Trail connections",
      photos: [],
      d: "A smaller park stop that works well as a jumping-off point for nearby trails.",
      city: "Lone Tree",
      state: "CO",
      stateName: "Colorado",
      owner: "City of Lone Tree",
      sourceCategory: "Park",
      sourceLink: loneTree_sourceLink
    }
  ];

  const loneTree_supplementalByName = loneTree_supplementalParks.reduce((acc, park) => {
    acc[park.n] = park;
    return acc;
  }, {});

  const loneTree_mergedParks = loneTree_baseParks.map((park) => {
    const loneTree_override = loneTree_supplementalByName[park.n];
    if (!loneTree_override) {
      return park;
    }

    return {
      ...park,
      ...loneTree_override,
      f: {
        ...(park.f || {}),
        ...(loneTree_override.f || {})
      }
    };
  });

  loneTree_supplementalParks.forEach((park) => {
    if (!loneTree_mergedParks.some((entry) => entry.n === park.n)) {
      loneTree_mergedParks.push(park);
    }
  });

  const loneTree_coords = {};
  loneTree_mergedParks.forEach((park) => {
    const loneTree_lat = Number(park.lat);
    const loneTree_lng = Number(park.lng);

    if (Number.isFinite(loneTree_lat) && Number.isFinite(loneTree_lng)) {
      loneTree_coords[park.n] = [loneTree_lat, loneTree_lng];
    }
  });
  window.PARK_COORDS[loneTree_datasetKey] = loneTree_coords;

  (window.registerParkDataset || function (_datasetKey, list) { window.PARKS = list; return list; })(
    loneTree_datasetKey,
    loneTree_mergedParks,
    {
      city: "Lone Tree",
      state: "CO",
      stateName: "Colorado",
      brandName: "Find Every Park Colorado"
    }
  );
})();
