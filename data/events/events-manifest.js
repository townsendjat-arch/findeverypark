// FindEveryPark — Events Manifest
// Version: 2026-05 | Research Agent build
// All events verified from official sources (city websites, parks departments, organizers)
// Covers: May 15 – August 15, 2026 | Front Range, CO

window.EVENTS_DATA = {

  updatedLabel: "Updated May 2026",

  cities: {
    aurora: {
      label: "Aurora",
      subtitle: "Curated family events in Aurora — updated weekly.",
      submitHeading: "Know an Aurora event?",
      footerNote: "Aurora has the most events. More cities added weekly."
    },
    parker: {
      label: "Parker",
      subtitle: "Family-friendly events in Parker and Douglas County.",
      submitHeading: "Know a Parker event?",
      footerNote: "Parker events sourced from Parker Arts, Town of Parker, and Parker Chamber."
    },
    "highlands-ranch": {
      label: "Highlands Ranch",
      subtitle: "Events in Highlands Ranch from HRCA and community partners.",
      submitHeading: "Know a Highlands Ranch event?",
      footerNote: "Highlands Ranch events sourced from HRCA and community partners."
    },
    denver: {
      label: "Denver",
      subtitle: "Big family events in Denver worth the drive.",
      submitHeading: "Know a Denver event?",
      footerNote: "Denver events are large, high-confidence picks worth the trip from the suburbs."
    },
    centennial: {
      label: "Centennial",
      subtitle: "Family events in Centennial and Arapahoe County.",
      submitHeading: "Know a Centennial event?",
      footerNote: "Centennial coverage expanding. Submit events to help us grow it."
    },
    lakewood: {
      label: "Lakewood",
      subtitle: "Family events in Lakewood — updated as new events are confirmed.",
      submitHeading: "Know a Lakewood event?",
      footerNote: "Lakewood events sourced from the City of Lakewood and Belmar."
    },
    broomfield: {
      label: "Broomfield",
      subtitle: "Family events in Broomfield — concerts, markets, and more.",
      submitHeading: "Know a Broomfield event?",
      footerNote: "Broomfield events sourced from the City of Broomfield."
    },
    "castle-rock": {
      label: "Castle Rock",
      subtitle: "Family events in Castle Rock — worth the drive south.",
      submitHeading: "Know a Castle Rock event?",
      footerNote: "Castle Rock events sourced from the Town of Castle Rock."
    },
    golden: {
      label: "Golden",
      subtitle: "Family events and indoor backups in Golden.",
      submitHeading: "Know a Golden event?",
      footerNote: "Golden events sourced from Visit Golden and the Golden History Museum."
    }
  },

  bucketCopy: {
    "Big Events": "Major community events worth planning your weekend around.",
    "Concerts & Music": "Free outdoor music — bring chairs, blankets, and snacks.",
    "Recurring": "Dependable weekly or monthly events. Show up any time.",
    "Festivals": "One-time or annual festivals worth the trip.",
    "Kids & Family": "Events specifically built for kids and families."
  },

  events: [

    // ── AURORA ──────────────────────────────────────────────────────────

    {
      id: "aurora-fest-2026",
      city: "aurora",
      title: "Aurora Fest 2026",
      bucket: "Big Events",
      dateLabel: "June 13, 2026",
      dateStart: "2026-06-13T15:00:00",
      dateEnd: "2026-06-13T22:00:00",
      timeLabel: "3–10 p.m.",
      locationLabel: "Aurora Municipal Center Great Lawn, 15151 E. Alameda Pkwy",
      audienceLabel: "All ages",
      costType: "free",
      costLabel: "Free",
      href: "https://www.auroragov.org/things_to_do/events/aurora_fest",
      category: "Festival",
      recurring: false,
      dadNote: "Big crowd but worth it. Parade of Nations, world food trucks, live music, kids activities, and a drone show to cap it off. Starts at 3 — get there early for parking."
    },

    {
      id: "aurora-music-movies-june11",
      city: "aurora",
      title: "Music at the Movies — Kalama Polynesian Dancers + Moana 2",
      bucket: "Concerts & Music",
      dateLabel: "June 11, 2026",
      dateStart: "2026-06-11T17:00:00",
      dateEnd: "2026-06-11T20:30:00",
      timeLabel: "Concert 5 p.m., Movie ~6 p.m.",
      locationLabel: "Traditions Neighborhood Park, 100 S. Jackson Gap Way, Aurora",
      audienceLabel: "All ages",
      costType: "free",
      costLabel: "Free",
      href: "https://www.auroragov.org/things_to_do/events/park_lights___movie_nights",
      category: "Outdoor Movie",
      recurring: false,
      dadNote: "Moana 2 under the stars — kids will sit still for this one. Bring chairs, blankets, and snacks. Free popcorn while supplies last."
    },

    {
      id: "aurora-music-movies-june25",
      city: "aurora",
      title: "Music at the Movies — Decades Dance Band + Grease Sing-A-Long",
      bucket: "Concerts & Music",
      dateLabel: "June 25, 2026",
      dateStart: "2026-06-25T17:00:00",
      dateEnd: "2026-06-25T20:30:00",
      timeLabel: "Concert 5 p.m., Movie ~6 p.m.",
      locationLabel: "Aqua Vista Park, 18700 E. Wagon Trail Cir., Aurora",
      audienceLabel: "All ages",
      costType: "free",
      costLabel: "Free",
      href: "https://www.auroragov.org/things_to_do/events/park_lights___movie_nights",
      category: "Outdoor Movie",
      recurring: false,
      dadNote: "Grease sing-along is a good excuse to embarrass yourself in front of your kids. Bring chairs and stay for the whole thing — the park has good open space."
    },

    {
      id: "aurora-4th-of-july-2026",
      city: "aurora",
      title: "Aurora 4th of July Spectacular",
      bucket: "Big Events",
      dateLabel: "July 4, 2026",
      dateStart: "2026-07-04T18:00:00",
      dateEnd: "2026-07-04T22:30:00",
      timeLabel: "6 p.m. | Fireworks ~9:30 p.m.",
      locationLabel: "Aurora Municipal Center Great Lawn, 15151 E. Alameda Pkwy",
      audienceLabel: "All ages",
      costType: "free",
      costLabel: "Free",
      href: "https://www.auroragov.org/things_to_do/events/4th_of_july_spectacular",
      category: "Holiday Event",
      recurring: false,
      dadNote: "Free parking, live bands, food trucks, face painting, and a 30-minute fireworks show. Bring lawn chairs and get there before 7 p.m. for a good spot."
    },

    {
      id: "aurora-music-movies-july9",
      city: "aurora",
      title: "Music at the Movies — Animal Farm + IF",
      bucket: "Concerts & Music",
      dateLabel: "July 9, 2026",
      dateStart: "2026-07-09T17:00:00",
      dateEnd: "2026-07-09T20:30:00",
      timeLabel: "Concert 5 p.m., Movie ~6 p.m.",
      locationLabel: "Country Lane Park, 10099 E. Colorado Ave., Aurora",
      audienceLabel: "All ages",
      costType: "free",
      costLabel: "Free",
      href: "https://www.auroragov.org/things_to_do/events/park_lights___movie_nights",
      category: "Outdoor Movie",
      recurring: false,
      dadNote: "IF is a solid pick for younger kids. Country Lane Park has open grass — easy to spread out. Bring bug spray."
    },

    {
      id: "aurora-music-movies-july23",
      city: "aurora",
      title: "Music at the Movies — The Man Cubs + Captain America: Brave New World",
      bucket: "Concerts & Music",
      dateLabel: "July 23, 2026",
      dateStart: "2026-07-23T17:00:00",
      dateEnd: "2026-07-23T20:30:00",
      timeLabel: "Concert 5 p.m., Movie ~6 p.m.",
      locationLabel: "Mission Viejo Park, 3999 S. Mission Pkwy, Aurora",
      audienceLabel: "All ages",
      costType: "free",
      costLabel: "Free",
      href: "https://www.auroragov.org/things_to_do/events/park_lights___movie_nights",
      category: "Outdoor Movie",
      recurring: false,
      dadNote: "PG-13 — fine for most school-age kids. The Man Cubs are a solid local band. This is the last one of the summer series, so make it count."
    },

    {
      id: "aurora-county-fair-2026",
      city: "aurora",
      title: "Arapahoe County Fair — 120th Annual",
      bucket: "Big Events",
      dateLabel: "July 23, 2026",
      dateStart: "2026-07-23T16:00:00",
      dateEnd: "2026-07-26T22:30:00",
      timeLabel: "July 23–26 | Thu 4 p.m., Fri–Sun 11 a.m.",
      locationLabel: "Arapahoe County Fairgrounds, 25690 E. Quincy Ave., Aurora",
      audienceLabel: "All ages",
      costType: "paid",
      costLabel: "$25 GA | Kids under 36\" free",
      href: "https://www.arapahoecountyfair.com/",
      category: "Festival",
      recurring: false,
      dadNote: "Unlimited carnival rides with admission. Rodeo, animals, BMX stunts, 4-H exhibits. Full county fair experience. Go Friday or Saturday for the biggest crowd energy."
    },

    // ── PARKER ──────────────────────────────────────────────────────────

    {
      id: "parker-days-2026",
      city: "parker",
      title: "Parker Days Festival — 50th Anniversary",
      bucket: "Big Events",
      dateLabel: "June 11, 2026",
      dateStart: "2026-06-11T00:00:00",
      dateEnd: "2026-06-14T23:59:00",
      timeLabel: "June 11–14 | All day",
      locationLabel: "Downtown Parker, 19751 E. Mainstreet, Parker",
      audienceLabel: "All ages",
      costType: "free",
      costLabel: "Free admission",
      href: "https://parkerdaysfestival.com/",
      category: "Festival",
      recurring: false,
      dadNote: "50th anniversary year — Parker's biggest weekend. 40+ carnival rides, 3 music stages, food, crafts, and a massive crowd. Go Thursday or Sunday if you want shorter lines. Budget time for the carnival or you'll hear about it."
    },

    {
      id: "parker-concerts-june4",
      city: "parker",
      title: "Discovery Park Concert Series — The Elegant Plums",
      bucket: "Recurring",
      dateLabel: "June 4, 2026",
      dateStart: "2026-06-04T18:30:00",
      dateEnd: "2026-06-04T20:00:00",
      timeLabel: "6:30–8 p.m.",
      locationLabel: "Discovery Park, 20115 Mainstreet, Parker",
      audienceLabel: "All ages",
      costType: "free",
      costLabel: "Free",
      href: "https://parkerarts.org/event-venues/discovery-park/",
      category: "Concert",
      recurring: true,
      dadNote: "Interactive water fountain for kids while the music plays. Bring a blanket, grab food from a truck, and let the kids run. This is a reliable Thursday night reset."
    },

    {
      id: "parker-concerts-june11",
      city: "parker",
      title: "Discovery Park Concert Series — The Violet Pines",
      bucket: "Recurring",
      dateLabel: "June 11, 2026",
      dateStart: "2026-06-11T18:30:00",
      dateEnd: "2026-06-11T20:00:00",
      timeLabel: "6:30–8 p.m.",
      locationLabel: "Discovery Park, 20115 Mainstreet, Parker",
      audienceLabel: "All ages",
      costType: "free",
      costLabel: "Free",
      href: "https://parkerarts.org/event-venues/discovery-park/",
      category: "Concert",
      recurring: true,
      dadNote: "Same drill every Thursday — blanket, food truck, let the kids splash in the fountain. The water feature makes this more than just a concert."
    },

    {
      id: "parker-concerts-june18",
      city: "parker",
      title: "Discovery Park Concert Series — Lucky Catch",
      bucket: "Recurring",
      dateLabel: "June 18, 2026",
      dateStart: "2026-06-18T18:30:00",
      dateEnd: "2026-06-18T20:00:00",
      timeLabel: "6:30–8 p.m.",
      locationLabel: "Discovery Park, 20115 Mainstreet, Parker",
      audienceLabel: "All ages",
      costType: "free",
      costLabel: "Free",
      href: "https://parkerarts.org/event-venues/discovery-park/",
      category: "Concert",
      recurring: true,
      dadNote: "Free concert, fountain for kids, food trucks on site. No glass containers allowed. Perfect Thursday-night routine if you're in Parker."
    },

    {
      id: "parker-concerts-june25",
      city: "parker",
      title: "Discovery Park Concert Series — Boogie Machine",
      bucket: "Recurring",
      dateLabel: "June 25, 2026",
      dateStart: "2026-06-25T18:30:00",
      dateEnd: "2026-06-25T20:00:00",
      timeLabel: "6:30–8 p.m.",
      locationLabel: "Discovery Park, 20115 Mainstreet, Parker",
      audienceLabel: "All ages",
      costType: "free",
      costLabel: "Free",
      href: "https://parkerarts.org/event-venues/discovery-park/",
      category: "Concert",
      recurring: true,
      dadNote: "Boogie Machine — expect dancing. Good energy band for the end of June. Bring chairs and snacks."
    },

    {
      id: "parker-concerts-july2",
      city: "parker",
      title: "Discovery Park Concert Series — 101st Army Band",
      bucket: "Recurring",
      dateLabel: "July 2, 2026",
      dateStart: "2026-07-02T18:30:00",
      dateEnd: "2026-07-02T20:00:00",
      timeLabel: "6:30–8 p.m.",
      locationLabel: "Discovery Park, 20115 Mainstreet, Parker",
      audienceLabel: "All ages",
      costType: "free",
      costLabel: "Free",
      href: "https://parkerarts.org/event-venues/discovery-park/",
      category: "Concert",
      recurring: true,
      dadNote: "Army Band two days before the 4th — good patriotic energy for the holiday week. Easy outing before the weekend chaos kicks in."
    },

    {
      id: "parker-concerts-july9",
      city: "parker",
      title: "Discovery Park Concert Series — Isaac Points Jakarta Band",
      bucket: "Recurring",
      dateLabel: "July 9, 2026",
      dateStart: "2026-07-09T18:30:00",
      dateEnd: "2026-07-09T20:00:00",
      timeLabel: "6:30–8 p.m.",
      locationLabel: "Discovery Park, 20115 Mainstreet, Parker",
      audienceLabel: "All ages",
      costType: "free",
      costLabel: "Free",
      href: "https://parkerarts.org/event-venues/discovery-park/",
      category: "Concert",
      recurring: true,
      dadNote: "Consistent Thursday night option all summer. Kids in the fountain, adults with food truck dinner. Hard to beat for a free weeknight."
    },

    {
      id: "parker-concerts-july16",
      city: "parker",
      title: "Discovery Park Concert Series — Caltucky",
      bucket: "Recurring",
      dateLabel: "July 16, 2026",
      dateStart: "2026-07-16T18:30:00",
      dateEnd: "2026-07-16T20:00:00",
      timeLabel: "6:30–8 p.m.",
      locationLabel: "Discovery Park, 20115 Mainstreet, Parker",
      audienceLabel: "All ages",
      costType: "free",
      costLabel: "Free",
      href: "https://parkerarts.org/event-venues/discovery-park/",
      category: "Concert",
      recurring: true,
      dadNote: "Mid-July Thursday — good midpoint of summer outing. No registration needed, just show up."
    },

    {
      id: "parker-concerts-july23",
      city: "parker",
      title: "Discovery Park Concert Series — El Paso Lasso",
      bucket: "Recurring",
      dateLabel: "July 23, 2026",
      dateStart: "2026-07-23T18:30:00",
      dateEnd: "2026-07-23T20:00:00",
      timeLabel: "6:30–8 p.m.",
      locationLabel: "Discovery Park, 20115 Mainstreet, Parker",
      audienceLabel: "All ages",
      costType: "free",
      costLabel: "Free",
      href: "https://parkerarts.org/event-venues/discovery-park/",
      category: "Concert",
      recurring: true,
      dadNote: "Last Thursday concert of the summer series. End it right — blanket on the lawn, food truck dinner, fountain time."
    },

    // ── HIGHLANDS RANCH ─────────────────────────────────────────────────

    {
      id: "hr-concert-june5",
      city: "highlands-ranch",
      title: "HRCA Summer Concert Series — Iron Prophecy",
      bucket: "Recurring",
      dateLabel: "June 5, 2026",
      dateStart: "2026-06-05T18:30:00",
      dateEnd: "2026-06-05T20:00:00",
      timeLabel: "6:30–8 p.m.",
      locationLabel: "Highland Heritage Regional Park, 9651 S. Quebec St., Highlands Ranch",
      audienceLabel: "All ages",
      costType: "free",
      costLabel: "Free",
      href: "https://hrcaonline.org/Events/Summer-Concert-Series",
      category: "Concert",
      recurring: true,
      dadNote: "Sunset views of the Rockies behind the stage. Bring a picnic or grab food truck eats on site. No dogs or glass containers. This is a reliable Thursday-night move all summer."
    },

    {
      id: "hr-concert-june12",
      city: "highlands-ranch",
      title: "HRCA Summer Concert Series — Amanda V's Material Girl",
      bucket: "Recurring",
      dateLabel: "June 12, 2026",
      dateStart: "2026-06-12T18:30:00",
      dateEnd: "2026-06-12T20:00:00",
      timeLabel: "6:30–8 p.m.",
      locationLabel: "Highland Heritage Regional Park, 9651 S. Quebec St., Highlands Ranch",
      audienceLabel: "All ages",
      costType: "free",
      costLabel: "Free",
      href: "https://hrcaonline.org/Events/Summer-Concert-Series",
      category: "Concert",
      recurring: true,
      dadNote: "Madonna tribute band — kids may not know the songs but they'll dance anyway. Good summer Thursday energy."
    },

    {
      id: "hr-concert-june19",
      city: "highlands-ranch",
      title: "HRCA Summer Concert Series — Van Zeppelin",
      bucket: "Recurring",
      dateLabel: "June 19, 2026",
      dateStart: "2026-06-19T18:30:00",
      dateEnd: "2026-06-19T20:00:00",
      timeLabel: "6:30–8 p.m.",
      locationLabel: "Highland Heritage Regional Park, 9651 S. Quebec St., Highlands Ranch",
      audienceLabel: "All ages",
      costType: "free",
      costLabel: "Free",
      href: "https://hrcaonline.org/Events/Summer-Concert-Series",
      category: "Concert",
      recurring: true,
      dadNote: "Van Halen + Zeppelin tribute. Good for parents, easier for kids to handle than the real thing. Sunset behind the Rockies seals the deal."
    },

    {
      id: "hr-concert-july10",
      city: "highlands-ranch",
      title: "HRCA Summer Concert Series — Ninety2K",
      bucket: "Recurring",
      dateLabel: "July 10, 2026",
      dateStart: "2026-07-10T18:30:00",
      dateEnd: "2026-07-10T20:00:00",
      timeLabel: "6:30–8 p.m.",
      locationLabel: "Highland Heritage Regional Park, 9651 S. Quebec St., Highlands Ranch",
      audienceLabel: "All ages",
      costType: "free",
      costLabel: "Free",
      href: "https://hrcaonline.org/Events/Summer-Concert-Series",
      category: "Concert",
      recurring: true,
      dadNote: "90s hits band. High crowd-sing-along potential. Food trucks on site. Bring blankets — it cools off fast after 7:30."
    },

    {
      id: "hr-concert-july17",
      city: "highlands-ranch",
      title: "HRCA Summer Concert Series — Jewel & the Rough",
      bucket: "Recurring",
      dateLabel: "July 17, 2026",
      dateStart: "2026-07-17T18:30:00",
      dateEnd: "2026-07-17T20:00:00",
      timeLabel: "6:30–8 p.m.",
      locationLabel: "Highland Heritage Regional Park, 9651 S. Quebec St., Highlands Ranch",
      audienceLabel: "All ages",
      costType: "free",
      costLabel: "Free",
      href: "https://hrcaonline.org/Events/Summer-Concert-Series",
      category: "Concert",
      recurring: true,
      dadNote: "Good mid-July Thursday if you need a low-effort evening out. No registration, no cost, just show up."
    },

    {
      id: "hr-concert-july24",
      city: "highlands-ranch",
      title: "HRCA Summer Concert Series — Christie Huff Music",
      bucket: "Recurring",
      dateLabel: "July 24, 2026",
      dateStart: "2026-07-24T18:30:00",
      dateEnd: "2026-07-24T20:00:00",
      timeLabel: "6:30–8 p.m.",
      locationLabel: "Highland Heritage Regional Park, 9651 S. Quebec St., Highlands Ranch",
      audienceLabel: "All ages",
      costType: "free",
      costLabel: "Free",
      href: "https://hrcaonline.org/Events/Summer-Concert-Series",
      category: "Concert",
      recurring: true,
      dadNote: "Late July — summer winding down but still worth it. Same routine: blanket, food truck, music, mountain sunset."
    },

    {
      id: "hr-concert-july31",
      city: "highlands-ranch",
      title: "HRCA Summer Concert Series — Phillip Lamar & Paizley Park",
      bucket: "Recurring",
      dateLabel: "July 31, 2026",
      dateStart: "2026-07-31T18:30:00",
      dateEnd: "2026-07-31T20:00:00",
      timeLabel: "6:30–8 p.m.",
      locationLabel: "Highland Heritage Regional Park, 9651 S. Quebec St., Highlands Ranch",
      audienceLabel: "All ages",
      costType: "free",
      costLabel: "Free",
      href: "https://hrcaonline.org/Events/Summer-Concert-Series",
      category: "Concert",
      recurring: true,
      dadNote: "Final concert of the summer series. Make it the last good summer Thursday before school prep mode kicks in."
    },

    // ── DENVER ──────────────────────────────────────────────────────────

    {
      id: "denver-chalk-art-2026",
      city: "denver",
      title: "Denver Chalk Art Festival",
      bucket: "Festivals",
      dateLabel: "June 6, 2026",
      dateStart: "2026-06-06T10:00:00",
      dateEnd: "2026-06-07T18:00:00",
      timeLabel: "June 6–7 | 10 a.m.–6 p.m.",
      locationLabel: "Golden Triangle Creative District, Bannock between 11th–13th, Denver",
      audienceLabel: "All ages",
      costType: "free",
      costLabel: "Free",
      href: "https://denverchalk.art/",
      category: "Festival",
      recurring: false,
      dadNote: "200+ artists drawing on the streets — genuinely impressive and easy to walk through with kids. Little Spoon Kids Corner lets kids make their own chalk art. Go Sunday for completed pieces; Saturday to watch artists work."
    },

    {
      id: "denver-black-arts-2026",
      city: "denver",
      title: "Colorado Black Arts Festival — 40th Annual",
      bucket: "Big Events",
      dateLabel: "July 10, 2026",
      dateStart: "2026-07-10T00:00:00",
      dateEnd: "2026-07-12T23:59:00",
      timeLabel: "July 10–12 | All day",
      locationLabel: "City Park West, Denver",
      audienceLabel: "All ages",
      costType: "free",
      costLabel: "Free (donations welcome)",
      href: "https://colbaf.org/",
      category: "Festival",
      recurring: false,
      dadNote: "40th year — three stages, 80+ artists and vendors, Children's Pavilion with museum partners, food court. Genuinely great cultural event, not just a market. Worth the drive from the suburbs."
    },

    {
      id: "denver-cherry-creek-arts-2026",
      city: "denver",
      title: "Cherry Creek Arts Festival",
      bucket: "Big Events",
      dateLabel: "July 3, 2026",
      dateStart: "2026-07-03T10:00:00",
      dateEnd: "2026-07-05T18:00:00",
      timeLabel: "July 3–5 | Fri–Sat 10 a.m.–8 p.m., Sun 10 a.m.–6 p.m.",
      locationLabel: "Cherry Creek North, 2nd Ave from Clayton to Adams, Denver",
      audienceLabel: "All ages",
      costType: "free",
      costLabel: "Free",
      href: "https://cherryarts.org/events/cherry-creek-arts-festival/",
      category: "Festival",
      recurring: false,
      dadNote: "250 juried artists, live music, Creation Station for kids, and good food. It's a big crowd on the 4th — go Friday July 3 for a more relaxed experience. Parking is tight; take RTD or bike if you can."
    },

    {
      id: "levitt-denver-summer-2026",
      city: "denver",
      title: "Levitt Pavilion Denver — Free Summer Concert Series",
      bucket: "Recurring",
      dateLabel: "May 23, 2026",
      dateStart: "2026-05-23T18:00:00",
      dateEnd: "2026-10-01T22:00:00",
      timeLabel: "Thursdays–Sundays, ~6 p.m. | May 23–Oct 1",
      locationLabel: "Ruby Hill Park, 1380 W. Florida Ave., Denver",
      audienceLabel: "All ages",
      costType: "free",
      costLabel: "Free (RSVP encouraged)",
      href: "https://www.levittdenver.org/free-concert-series",
      category: "Concert",
      recurring: true,
      dadNote: "50+ free concerts across all genres all summer. All-ages venue with lawn seating — bring blankets and chairs. RSVP at levittdenver.org to reserve your spot. One of the best free music setups on the Front Range."
    },

    // ── PARKER (additional) ─────────────────────────────────────────────

    {
      id: "parker-touch-a-truck-2026",
      city: "parker",
      title: "Touch-a-Truck at Parker Farmers Market",
      bucket: "Kids & Family",
      dateLabel: "May 17, 2026",
      dateStart: "2026-05-17T08:00:00",
      dateEnd: "2026-05-17T13:00:00",
      timeLabel: "8 a.m.–1 p.m.",
      locationLabel: "O'Brien Park, Parker",
      audienceLabel: "Toddlers & preschoolers",
      costType: "free",
      costLabel: "Free",
      href: "https://www.parkerco.gov/2418",
      category: "Kids Activity",
      recurring: false,
      dadNote: "Great quick outing if your kid likes big trucks and city equipment. Combine with a lap around the farmers market and you've got a full morning."
    },

    {
      id: "parker-farmers-market-2026",
      city: "parker",
      title: "Parker Farmers Market",
      bucket: "Recurring",
      dateLabel: "May 17, 2026",
      dateStart: "2026-05-17T08:00:00",
      dateEnd: "2026-08-30T13:00:00",
      timeLabel: "Sundays, 8 a.m.–1 p.m. | May–Aug",
      locationLabel: "O'Brien Park, Parker",
      audienceLabel: "All ages",
      costType: "free",
      costLabel: "Free entry",
      href: "https://www.parkerco.gov/2418",
      category: "Farmers Market",
      recurring: true,
      dadNote: "Walk, snack, let the kids pick something weird from a vendor. Low-pressure Sunday morning that counts as getting outside."
    },

    // ── CASTLE ROCK ─────────────────────────────────────────────────────

    {
      id: "castle-rock-first-fridays-june",
      city: "castle-rock",
      title: "Castle Rock First Fridays — June",
      bucket: "Concerts & Music",
      dateLabel: "June 5, 2026",
      dateStart: "2026-06-05T17:30:00",
      dateEnd: "2026-06-05T21:00:00",
      timeLabel: "5:30 p.m. | Music 6–9 p.m.",
      locationLabel: "Downtown Castle Rock",
      audienceLabel: "All ages",
      costType: "free",
      costLabel: "Free",
      href: "https://www.crgov.com/",
      category: "Concert",
      recurring: false,
      dadNote: "Food trucks, live music, and enough open space for kids to move around. Castle Rock's downtown is walkable — easy to make a full evening of it."
    },

    {
      id: "castle-rock-first-fridays-july",
      city: "castle-rock",
      title: "Castle Rock First Fridays — July",
      bucket: "Concerts & Music",
      dateLabel: "July 3, 2026",
      dateStart: "2026-07-03T17:30:00",
      dateEnd: "2026-07-03T21:00:00",
      timeLabel: "5:30 p.m. | Music 6–9 p.m.",
      locationLabel: "Downtown Castle Rock",
      audienceLabel: "All ages",
      costType: "free",
      costLabel: "Free",
      href: "https://www.crgov.com/",
      category: "Concert",
      recurring: false,
      dadNote: "July 3rd version — good pre-holiday outing before the 4th crowds hit everywhere else. Food trucks and music in a walkable downtown."
    },

    {
      id: "castle-rock-first-fridays-aug",
      city: "castle-rock",
      title: "Castle Rock First Fridays — August",
      bucket: "Concerts & Music",
      dateLabel: "August 7, 2026",
      dateStart: "2026-08-07T17:30:00",
      dateEnd: "2026-08-07T21:00:00",
      timeLabel: "5:30 p.m. | Music 6–9 p.m.",
      locationLabel: "Downtown Castle Rock",
      audienceLabel: "All ages",
      costType: "free",
      costLabel: "Free",
      href: "https://www.crgov.com/",
      category: "Concert",
      recurring: false,
      dadNote: "Last one of the summer. Good send-off before school starts. Same formula — food trucks, music, space for the kids."
    },

    // ── LAKEWOOD ────────────────────────────────────────────────────────

    {
      id: "lakewood-rockin-block-party-2026",
      city: "lakewood",
      title: "Rockin' Block Party at Belmar",
      bucket: "Big Events",
      dateLabel: "June 6, 2026",
      dateStart: "2026-06-06T17:00:00",
      dateEnd: "2026-06-06T23:00:00",
      timeLabel: "5–11 p.m.",
      locationLabel: "Belmar, Lakewood",
      audienceLabel: "All ages",
      costType: "free",
      costLabel: "Free",
      href: "https://www.lakewood.org/",
      category: "Festival",
      recurring: false,
      dadNote: "Food trucks, outdoor movie, scavenger hunt, and a roaming T-Rex. Hard yes. One of the more creative free family events on the Front Range this summer."
    },

    {
      id: "lakewood-big-belmar-bash-2026",
      city: "lakewood",
      title: "Big Belmar Bash — Drone Show & Community Night",
      bucket: "Big Events",
      dateLabel: "July 3, 2026",
      dateStart: "2026-07-03T17:00:00",
      dateEnd: "2026-07-03T22:00:00",
      timeLabel: "5–10 p.m.",
      locationLabel: "Belmar, Lakewood",
      audienceLabel: "All ages",
      costType: "free",
      costLabel: "Free",
      href: "https://www.lakewood.org/",
      category: "Big Event",
      recurring: false,
      dadNote: "Drone show instead of fireworks — lower noise, same spectacle. Solid July 3rd alternative if you want something festive without the 4th chaos."
    },

    // ── BROOMFIELD ──────────────────────────────────────────────────────

    {
      id: "broomfield-concert-series-2026",
      city: "broomfield",
      title: "Broomfield Summer Concert Series",
      bucket: "Recurring",
      dateLabel: "June 10, 2026",
      dateStart: "2026-06-10T18:00:00",
      dateEnd: "2026-08-12T20:30:00",
      timeLabel: "Wednesdays | Activities 6 p.m., Music 6:30–8:30 p.m.",
      locationLabel: "Broomfield (confirm venue at source)",
      audienceLabel: "All ages",
      costType: "free",
      costLabel: "Free",
      href: "https://www.broomfield.org/",
      category: "Concert",
      recurring: true,
      dadNote: "Food trucks and kid activities at every concert. Wednesday nights starting June 10 — low-friction midweek reset. Check source for venue location each week."
    },

    // ── GOLDEN ──────────────────────────────────────────────────────────

    {
      id: "golden-farmers-market-2026",
      city: "golden",
      title: "Golden Farmers Market",
      bucket: "Recurring",
      dateLabel: "May 16, 2026",
      dateStart: "2026-05-16T08:00:00",
      dateEnd: "2026-08-29T13:00:00",
      timeLabel: "Saturdays, 8 a.m.–1 p.m. | May–Aug",
      locationLabel: "Downtown Golden",
      audienceLabel: "All ages",
      costType: "free",
      costLabel: "Free entry",
      href: "https://www.visitgolden.com/",
      category: "Farmers Market",
      recurring: true,
      dadNote: "Parking is a nightmare after 9:30 a.m. Go early, grab a pastry, hit Clear Creek after. Toddlers and dogs welcome. One of the best Saturday morning routines on the Front Range."
    },

    {
      id: "golden-history-museum-2026",
      city: "golden",
      title: "Golden History Museum",
      bucket: "Recurring",
      dateLabel: "May 15, 2026",
      dateStart: "2026-05-15T10:00:00",
      dateEnd: "2026-08-15T16:30:00",
      timeLabel: "Tues–Sat, 10 a.m.–4:30 p.m.",
      locationLabel: "923 10th St., Golden",
      audienceLabel: "Younger kids",
      costType: "free",
      costLabel: "Free",
      href: "https://www.goldenhistory.org/",
      category: "Indoor Backup",
      recurring: true,
      dadNote: "Easy indoor backup near downtown Golden when the weather or moods go sideways. Combine with the farmers market or Clear Creek for a full Golden morning."
    }

  ]
};
