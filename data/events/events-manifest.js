// FindEveryPark — Events Manifest
// Version: 2026-06 | Curated Aurora + Parker Summer Events
// Source: Aurora Front Range Summer 2026 Master Schedule + Parker community events
// Covers: June – August 2026 | Aurora & Parker, CO

window.EVENTS_DATA = {

  updatedLabel: "Updated June 2026",

  cities: {
    aurora: {
      label: "Aurora",
      subtitle: "Curated family events in Aurora — updated weekly.",
      submitHeading: "Know an Aurora event?",
      footerNote: "Aurora events sourced from the City of Aurora, local organizers, and community partners."
    },
    parker: {
      label: "Parker",
      subtitle: "Curated family events in Parker — updated weekly.",
      submitHeading: "Know a Parker event?",
      footerNote: "Parker events sourced from the Town of Parker and community partners."
    },
    highlands_ranch: {
      label: "Highlands Ranch",
      subtitle: "Curated family events in Highlands Ranch — updated weekly.",
      submitHeading: "Know a Highlands Ranch event?",
      footerNote: "Highlands Ranch events sourced from HRCA and community partners."
    },
    denver: {
      label: "Denver",
      subtitle: "Curated family events in Denver — updated weekly.",
      submitHeading: "Know a Denver event?",
      footerNote: "Denver events sourced from city organizations and community partners."
    },
    castle_pines: {
      label: "Castle Pines",
      subtitle: "Curated family events in Castle Pines — updated weekly.",
      submitHeading: "Know a Castle Pines event?",
      footerNote: "Castle Pines events sourced from the City of Castle Pines, Castle Pines Chamber, and community partners."
    },
    brighton: {
      label: "Brighton",
      subtitle: "Curated family events in Brighton — updated weekly.",
      submitHeading: "Know a Brighton event?",
      footerNote: "Brighton events sourced from the City of Brighton and community partners."
    },
    broomfield: {
      label: "Broomfield",
      subtitle: "Curated family events in Broomfield — updated weekly.",
      submitHeading: "Know a Broomfield event?",
      footerNote: "Broomfield events sourced from the City and County of Broomfield and community partners."
    },
    arvada: {
      label: "Arvada",
      subtitle: "Curated family events in Arvada — updated weekly.",
      submitHeading: "Know an Arvada event?",
      footerNote: "Arvada events sourced from the Arvada Festivals Commission and community partners."
    },
    wheat_ridge: {
      label: "Wheat Ridge",
      subtitle: "Curated family events in Wheat Ridge — updated weekly.",
      submitHeading: "Know a Wheat Ridge event?",
      footerNote: "Wheat Ridge events sourced from Wheat Ridge Parks & Rec and community partners."
    },
    thornton: {
      label: "Thornton",
      subtitle: "Curated family events in Thornton — updated weekly.",
      submitHeading: "Know a Thornton event?",
      footerNote: "Thornton events sourced from the City of Thornton and community partners."
    },
    englewood: {
      label: "Englewood",
      subtitle: "Curated family events in Englewood — updated weekly.",
      submitHeading: "Know an Englewood event?",
      footerNote: "Englewood events sourced from the City of Englewood and community partners."
    },
    commerce_city: {
      label: "Commerce City",
      subtitle: "Curated family events in Commerce City — updated weekly.",
      submitHeading: "Know a Commerce City event?",
      footerNote: "Commerce City events sourced from the city and community partners."
    }
  },

  events: [

    // ONGOING SUMMER EVENTS — Movies in the Park

    {
      id: "aurora-park-lights-movie-nights",
      city: "aurora",
      title: "Music at the Movies",
      section: "ongoing",
      subgroup: "Movies in the Park",
      subgroupOrder: 1,
      recurring: true,
      recurrence_label: "Select Wednesdays This Summer",
      dropdownLabel: "View Movie Lineup",
      description: "Free community concerts followed by movies under the stars, presented by Aurora Parks, Recreation and Open Space and Aurora Public Library. Live music begins at 5:00 PM and the movie starts at 6:00 PM. Please review movie content before attending.",
      href: "https://www.auroragov.org/things_to_do/events/music_at_the_movies",
      locationLabel: "Various Aurora Parks",
      timeLabel: "Concert 5:00 PM \u2022 Movie 6:00 PM",
      costLabel: "Free",
      costType: "free",
      audienceLabel: "All ages",
      series_start: "2026-06-24",
      series_end: "2026-07-29",
      schedule: [
        { date: "2026-06-24", title: "How to Train Your Dragon, 2025 (PG)", location: "Terrace Park" },
        { date: "2026-07-15", title: "Hamilton Sing-Along (PG-13)", location: "Settler's Park" },
        { date: "2026-07-29", title: "The SpongeBob Movie: Search for SquarePants (PG)", location: "Meadowood Park" }
      ]
    },

    // ONGOING SUMMER EVENTS — Farmers Markets

    {
      id: "aurora-rebel-marketplace",
      city: "aurora",
      title: "Rebel Marketplace Farmers Market",
      section: "ongoing",
      subgroup: "Farmers Markets",
      subgroupOrder: 2,
      recurring: true,
      recurrence_label: "1st & 3rd Saturdays This Summer",
      dropdownLabel: "View Market Dates",
      description: "A community-driven urban agriculture market dedicated to local food sovereignty, featuring small neighborhood farm produce and artisan goods right in the park.",
      href: "https://www.rebelmarketplace.org",
      locationLabel: "Del Mar Park (6th Ave & Peoria St)",
      timeLabel: "9:00 AM – 1:00 PM",
      costLabel: "Free",
      costType: "free",
      audienceLabel: "All ages",
      series_start: "2026-06-06",
      series_end: "2026-08-29",
      schedule: [
        { date: "2026-06-06", location: "Del Mar Park" },
        { date: "2026-06-20", location: "Del Mar Park" },
        { date: "2026-07-04", location: "Del Mar Park" },
        { date: "2026-07-18", location: "Del Mar Park" },
        { date: "2026-08-01", location: "Del Mar Park" },
        { date: "2026-08-15", location: "Del Mar Park" },
        { date: "2026-08-29", location: "Del Mar Park" }
      ]
    },

    {
      id: "aurora-southlands-farmers-market",
      city: "aurora",
      title: "Southlands Farmers Market",
      section: "ongoing",
      subgroup: "Farmers Markets",
      subgroupOrder: 2,
      recurring: true,
      recurrence_label: "Every Saturday This Summer",
      dropdownLabel: "View Market Dates",
      description: "Weekly open-air market centered around the plaza fountain space. Features fresh organic produce, Palisade peaches, dairy, and baked goods.",
      href: "https://www.southlandsfarmersmarket.com",
      locationLabel: "Town Square / Main Street Plaza, Southlands",
      timeLabel: "8:00 AM – 1:00 PM",
      costLabel: "Free",
      costType: "free",
      audienceLabel: "All ages",
      series_start: "2026-06-06",
      series_end: "2026-08-29",
      schedule: [
        { note: "Every Saturday, June through August 2026", time: "8:00 AM – 1:00 PM", location: "Town Square / Main Street Plaza" }
      ]
    },

    {
      id: "aurora-market-in-the-park",
      city: "aurora",
      title: "Market in the Park",
      section: "ongoing",
      subgroup: "Farmers Markets",
      subgroupOrder: 2,
      recurring: true,
      recurrence_label: "Monthly Saturdays This Summer",
      dropdownLabel: "View Market Dates",
      description: "A monthly outdoor community market festival series at The Aurora Highlands, featuring family-friendly activities, local produce, artisan vendors, and food trucks.",
      href: "https://theaurorahighlands.com",
      locationLabel: "Winged Melody Park (The Aurora Highlands)",
      timeLabel: "Monthly Schedule",
      costLabel: "Free",
      costType: "free",
      audienceLabel: "All ages",
      series_start: "2026-06-13",
      series_end: "2026-08-08",
      schedule: [
        { date: "2026-06-13", location: "Winged Melody Park" },
        { date: "2026-07-11", location: "Winged Melody Park" },
        { date: "2026-08-08", location: "Winged Melody Park" }
      ]
    },

    {
      id: "aurora-mershops-market-days",
      city: "aurora",
      title: "Mershop's Market Days",
      section: "ongoing",
      subgroup: "Farmers Markets",
      subgroupOrder: 2,
      recurring: true,
      recurrence_label: "Select Saturdays This Summer",
      dropdownLabel: "View Market Dates",
      description: "Makers and Farmers Market featuring local produce, artisan vendors, and live music from 11:00 AM to 1:30 PM.",
      href: "https://www.mershops.com",
      locationLabel: "Town Center at Aurora",
      timeLabel: "10:00 AM – 2:00 PM",
      costLabel: "Free",
      costType: "free",
      audienceLabel: "All ages",
      series_start: "2026-06-20",
      series_end: "2026-08-29",
      schedule: [
        { date: "2026-06-20", title: "Live Music: Four the Record", location: "Town Center at Aurora" },
        { date: "2026-06-27", title: "Live Music: Revenant Band", location: "Town Center at Aurora" },
        { date: "2026-07-18", title: "Live Music: Mike Mauer", location: "Town Center at Aurora" },
        { date: "2026-07-25", title: "Live Music: Wendy Woo Girl Crush", location: "Town Center at Aurora" },
        { date: "2026-08-22", title: "Live Music: DOTSERO Trio", location: "Town Center at Aurora" },
        { date: "2026-08-29", title: "Live Music: The Wrecklunds", location: "Town Center at Aurora" }
      ]
    },

    // ONGOING SUMMER EVENTS — Concert Series

    {
      id: "aurora-rhythms-concert-series",
      city: "aurora",
      title: "Aurora Rhythms Concert Series",
      section: "ongoing",
      subgroup: "Concert Series",
      subgroupOrder: 3,
      recurring: true,
      recurrence_label: "Summer Concert Series",
      dropdownLabel: "View Schedule",
      description: "Free summer concert series featuring live music in Aurora parks and libraries. Family-friendly with kid activities at select shows.",
      href: "https://www.auroragov.org/things_to_do/events",
      locationLabel: "Various Aurora Venues",
      timeLabel: "Evening",
      costLabel: "Free",
      costType: "free",
      audienceLabel: "All ages",
      series_start: "2026-06-18",
      series_end: "2026-08-20",
      schedule: [
        { date: "2026-06-18", title: "The Reminders", location: "Aurora Fox Arts Center" },
        { date: "2026-07-30", title: "Perpetual Motion", location: "Mission Viejo Library" },
        { date: "2026-08-20", title: "Salome Songbird Folk Trio", location: "Martin Luther King Jr. Library" }
      ]
    },

    // ONGOING SUMMER EVENTS — Character Meet & Greets

    {
      id: "aurora-magical-meet-greets",
      city: "aurora",
      title: "Magical Meet & Greets",
      section: "ongoing",
      subgroup: "Character Meet & Greets",
      subgroupOrder: 4,
      recurring: true,
      recurrence_label: "Select Sundays This Summer",
      dropdownLabel: "See Dates",
      description: "Free family character meet-and-greet events for kids at Town Center at Aurora.",
      href: "https://shoptowncenteraurora.com",
      locationLabel: "Town Center at Aurora",
      timeLabel: "1:00 PM – 3:00 PM",
      costLabel: "Free",
      costType: "free",
      audienceLabel: "All ages",
      series_start: "2026-07-05",
      series_end: "2026-08-09",
      schedule: [
        { date: "2026-07-05", title: "The Minions", location: "Town Center at Aurora" },
        { date: "2026-08-09", title: "Paw Patrol (Chase & Skye)", location: "Town Center at Aurora" }
      ]
    },

    // HOLIDAY & SEASONAL EVENTS

    {
      id: "aurora-4th-of-july-spectacular",
      city: "aurora",
      title: "Aurora 4th of July Spectacular",
      section: "holiday",
      recurring: false,
      description: "Aurora's signature Independence Day celebration on the Great Lawn featuring performances by Ninety Percent 90s, Starling Circus Acts, and Groove 'N Motion. Food trucks, free face painting, and a 30-minute fireworks finale at 9:30 PM. The Aurora History Museum next door offers free admission 2:00\u20138:00 PM \u2014 a great way to beat the afternoon heat before the lawn opens. Free parking on-site or via the R-Line Metro Station. America's 250th \u2022 Colorado's 150th.",
      locationLabel: "Aurora Municipal Center Great Lawn, 15151 E Alameda Pkwy",
      href: "https://www.auroragov.org/things_to_do/events/4th_of_july_spectacular",
      dateStart: "2026-07-04T18:30:00",
      dateEnd: "2026-07-04T22:00:00",
      dateLabel: "Saturday, July 4",
      timeLabel: "6:30 PM \u2013 10:00 PM \u2022 Fireworks 9:30 PM",
      costLabel: "Free",
      costType: "free",
      audienceLabel: "All ages"
    },

    // ONE-TIME EVENTS

    {
      id: "aurora-fest-2026",
      city: "aurora",
      title: "Aurora Fest 2026",
      section: "onetime",
      recurring: false,
      description: "The city's signature multicultural festival with a Parade of Nations, 29 international food vendors, 20+ live performances, a Selena tribute concert, and a drone light show finale.",
      href: "https://www.auroragov.org/things_to_do/events/aurora_fest",
      locationLabel: "Aurora Municipal Center Great Lawn",
      dateStart: "2026-06-13T15:00:00",
      dateEnd: "2026-06-13T22:00:00",
      dateLabel: "Friday, June 13",
      timeLabel: "3:00 PM – 10:00 PM",
      costLabel: "Free",
      costType: "free",
      audienceLabel: "All ages"
    },

    {
      id: "aurora-fathers-day-grill-chill",
      city: "aurora",
      title: "Father's Day Grill & Chill",
      section: "onetime",
      recurring: false,
      description: "Free public outdoor gathering featuring food trucks, community lawn games (cornhole, yard pong), live music, and pop-up vendors.",
      href: "https://shoptowncenteraurora.com",
      locationLabel: "Town Center at Aurora",
      dateStart: "2026-06-20T10:00:00",
      dateEnd: "2026-06-20T14:00:00",
      dateLabel: "Saturday, June 20",
      timeLabel: "10:00 AM – 2:00 PM",
      costLabel: "Free",
      costType: "free",
      audienceLabel: "All ages"
    },

    {
      id: "aurora-run4yourmind-5k",
      city: "aurora",
      title: "Run 4 Your Mind 5K",
      section: "onetime",
      recurring: false,
      description: "A community movement event and charity run focused on raising regional mental health awareness and community connection.",
      href: "https://shoptowncenteraurora.com",
      locationLabel: "Town Center at Aurora",
      dateStart: "2026-07-26T08:00:00",
      dateEnd: "2026-07-26T10:00:00",
      dateLabel: "Saturday, July 26",
      timeLabel: "8:00 AM – 10:00 AM",
      costLabel: "Free",
      costType: "free",
      audienceLabel: "All ages"
    },

    // PARKER — Featured

    {
      id: "parker-days-festival-2026",
      city: "parker",
      title: "Parker Days Festival",
      section: "featured",
      recurring: false,
      description: "Parker's signature community celebration — four days of carnival rides, live music, food vendors, a marketplace, and kids activities across downtown Parker.",
      href: "https://www.parkerdays.com",
      locationLabel: "Downtown Parker",
      dateStart: "2026-06-11",
      dateEnd: "2026-06-14",
      dateLabel: "June 11–14, 2026",
      timeLabel: "Multi-day festival",
      costLabel: "Free entry",
      costType: "free",
      audienceLabel: "All ages"
    },

    // PARKER — Ongoing Summer Events

    {
      id: "parker-discovery-park-concerts",
      city: "parker",
      title: "Discovery Park Summer Concerts",
      section: "ongoing",
      subgroup: "Concert Series",
      subgroupOrder: 3,
      recurring: true,
      recurrence_label: "Thursdays This Summer",
      dropdownLabel: "View Schedule",
      description: "Free Thursday evening summer concert series at Discovery Park in Parker, featuring a different band each week.",
      href: "https://parkerarts.org/event-venues/discovery-park/",
      locationLabel: "Discovery Park, Parker",
      timeLabel: "Thursday evenings",
      costLabel: "Free",
      costType: "free",
      audienceLabel: "All ages",
      series_start: "2026-06-11",
      series_end: "2026-07-23",
      schedule: [
        { date: "2026-06-11", title: "The Violet Pines", location: "Discovery Park" },
        { date: "2026-06-18", title: "Lucky Catch", location: "Discovery Park" },
        { date: "2026-06-25", title: "Boogie Machine", location: "Discovery Park" },
        { date: "2026-07-02", title: "101st Army Band", location: "Discovery Park" },
        { date: "2026-07-09", title: "Jakarta Band", location: "Discovery Park" },
        { date: "2026-07-16", title: "Caltucky", location: "Discovery Park" },
        { date: "2026-07-23", title: "El Paso Lasso", location: "Discovery Park" }
      ]
    },

    {
      id: "parker-farmers-market",
      city: "parker",
      title: "Parker Farmers Market",
      section: "ongoing",
      subgroup: "Farmers Markets",
      subgroupOrder: 2,
      recurring: true,
      recurrence_label: "Seasonal · Spring through Fall",
      dropdownLabel: "View Market Info",
      description: "Downtown Parker's seasonal farmers market featuring local produce, artisan goods, and community vendors.",
      href: "https://www.mainstreetparker.com",
      locationLabel: "Downtown Parker",
      timeLabel: "Seasonal hours",
      costLabel: "Free",
      costType: "free",
      audienceLabel: "All ages",
      series_start: "2026-04-01",
      series_end: "2026-10-31",
      schedule: [
        { note: "Seasonal market, spring through fall 2026", location: "Downtown Parker" }
      ]
    },

    // PARKER — One-Time Events

    {
      id: "parker-strides-of-love-3k",
      city: "parker",
      title: "Strides of Love 3K Family Fun Run",
      section: "onetime",
      recurring: false,
      description: "Family-oriented community 3K fun run at Tallman Meadow Park in Parker.",
      href: "https://www.stridesoflovefoundation.org",
      locationLabel: "Tallman Meadow Park, Parker",
      dateStart: "2026-06-13",
      dateEnd: "2026-06-13",
      dateLabel: "Saturday, June 13",
      timeLabel: "Morning",
      costLabel: "Registration required",
      costType: "paid",
      audienceLabel: "All ages"
    },

    // HIGHLANDS RANCH — Ongoing Summer Events (highlands_ranch)

    {
      id: "highlands-ranch-summer-concert-series",
      city: "highlands_ranch",
      title: "Highlands Ranch Summer Concert Series",
      section: "ongoing",
      subgroup: "Concert Series",
      subgroupOrder: 3,
      recurring: true,
      recurrence_label: "Every Thursday in June & July \u2022 6:30 PM",
      dropdownLabel: "View Lineup",
      description: "Free outdoor summer concert series featuring live music, food trucks, lawn-chair seating, and a family-friendly atmosphere. Bring lawn chairs, blankets, and a picnic dinner — or grab food from rotating food trucks.",
      href: "https://hfrca.org",
      locationLabel: "Highland Heritage Regional Park, 9651 S Quebec St, Highlands Ranch",
      timeLabel: "6:30 PM – 8:00 PM",
      costLabel: "Free",
      costType: "free",
      audienceLabel: "All ages",
      series_start: "2026-06-04",
      series_end: "2026-07-30",
      schedule: [
        { date: "2026-06-04", title: "Shelvis and the Roustabouts", location: "Highland Heritage Regional Park" },
        { date: "2026-06-11", title: "Tumbledown Shack", location: "Highland Heritage Regional Park" },
        { date: "2026-06-18", title: "Red Rock Vixens", location: "Highland Heritage Regional Park" },
        { date: "2026-06-25", title: "Northwoods Band", location: "Highland Heritage Regional Park" },
        { date: "2026-07-09", title: "90's Til Dawn", location: "Highland Heritage Regional Park" },
        { date: "2026-07-16", title: "Bullet the Blue Sky", location: "Highland Heritage Regional Park" },
        { date: "2026-07-23", title: "Chili Powder", location: "Highland Heritage Regional Park" },
        { date: "2026-07-30", title: "Thumpin'", location: "Highland Heritage Regional Park" }
      ]
    },

    // DENVER — Ongoing Summer Events

    {
      id: "denver-city-park-jazz",
      city: "denver",
      title: "City Park Jazz",
      section: "ongoing",
      subgroup: "Concert Series",
      subgroupOrder: 3,
      recurring: true,
      recurrence_label: "Every Sunday This Summer \u2022 6:00 PM",
      dropdownLabel: "View Lineup",
      description: "Denver's beloved free outdoor jazz concert series at the City Park Pavilion. Bring a blanket, lawn chairs, and a picnic. Running every Sunday evening all summer long.",
      href: "https://cityparkjazz.org/2026-concert-calendar",
      locationLabel: "City Park Pavilion, Denver",
      timeLabel: "6:00 PM – 8:00 PM",
      costLabel: "Free",
      costType: "free",
      audienceLabel: "All ages",
      series_start: "2026-06-07",
      series_end: "2026-08-09",
      schedule: [
        { date: "2026-06-07", title: "DJ Williams Band", location: "City Park Pavilion" },
        { date: "2026-06-14", title: "Spicy Pickles feat. Hannah Rodriguez", location: "City Park Pavilion" },
        { date: "2026-06-21", title: "Hazel Miller & The Collective", location: "City Park Pavilion" },
        { date: "2026-06-28", title: "Shane Endsley & the Denver Municipal Band", location: "City Park Pavilion" },
        { date: "2026-07-05", title: "Brass Band Extravaganza", location: "City Park Pavilion" },
        { date: "2026-07-12", title: "BTTRFLY", location: "City Park Pavilion" },
        { date: "2026-07-19", title: "Conjunto Colores w/ Rasta Salsa", location: "City Park Pavilion" },
        { date: "2026-07-26", title: "Convergence", location: "City Park Pavilion" },
        { date: "2026-08-02", title: "Delta Sonics Blues Revue", location: "City Park Pavilion" },
        { date: "2026-08-09", title: "Jakarta", location: "City Park Pavilion" }
      ]
    },

    // CASTLE PINES — Ongoing Summer Events (castle_pines)

    {
      id: "castle-pines-summer-concert-series",
      city: "castle_pines",
      title: "Castle Pines Summer Concert Series",
      section: "ongoing",
      subgroup: "Concert Series",
      subgroupOrder: 3,
      recurring: true,
      recurrence_label: "Monthly Summer Concerts \u2022 Elk Ridge Park",
      dropdownLabel: "View Lineup",
      description: "Free summer concert series at Elk Ridge Park in Castle Pines. Bring lawn chairs, blankets, and a picnic — enjoy great music under the summer sky. Note: August concert has an earlier start time (5:00 PM).",
      href: "https://www.castlepineschamber.com/concert-series",
      locationLabel: "Elk Ridge Park, 7005 Mira Vista Ln, Castle Pines",
      timeLabel: "6:00 PM – 8:00 PM",
      costLabel: "Free",
      costType: "free",
      audienceLabel: "All ages",
      series_start: "2026-06-28",
      series_end: "2026-08-16",
      schedule: [
        { date: "2026-06-28", title: "That Eighties Band", location: "Elk Ridge Park", time: "6:00 PM – 8:00 PM" },
        { date: "2026-07-26", title: "Narrow Gauge", location: "Elk Ridge Park", time: "6:00 PM – 8:00 PM" },
        { date: "2026-08-16", title: "The Long Run (Eagles Tribute)", location: "Elk Ridge Park", time: "5:00 PM – 7:00 PM" }
      ]
    },

    // BRIGHTON — Ongoing Summer Events

    {
      id: "brighton-flix-and-kicks",
      city: "brighton",
      title: "Brighton Flix & Kicks",
      section: "ongoing",
      subgroup: "Movies in the Park",
      subgroupOrder: 1,
      recurring: true,
      recurrence_label: "Select Thursdays This Summer \u2022 7:00 PM",
      dropdownLabel: "View Movies & Dates",
      description: "Free outdoor summer movie series at Brighton parks. Kid-friendly activities start at 5:30 PM, movie begins at 7:00 PM. Bring blankets, lawn chairs, and a picnic. Seating is first come, first served.",
      href: "https://www.brightonco.gov/3234/Flix-and-Kicks",
      locationLabel: "Carmichael Park, 650 E Southern St, Brighton",
      timeLabel: "Activities 5:30 PM \u2022 Movie 7:00 PM",
      costLabel: "Free",
      costType: "free",
      audienceLabel: "All ages",
      series_start: "2026-06-11",
      series_end: "2026-08-13",
      schedule: [
        { date: "2026-06-11", title: "Zootopia 2 (2025, PG)", location: "Carmichael Park" },
        { date: "2026-06-18", title: "Lilo & Stitch (2025, PG)", location: "Carmichael Park" },
        { date: "2026-06-25", title: "The Greatest Showman (2017, PG)", location: "Carmichael Park" },
        { date: "2026-07-09", title: "Field of Dreams (1989, PG)", location: "Carmichael Park" },
        { date: "2026-07-16", title: "Trolls: Band Together (2023, PG)", location: "Carmichael Park" },
        { date: "2026-07-30", title: "IF (2024, PG)", location: "Carmichael Park" },
        { date: "2026-08-06", title: "Elio (2025, PG)", location: "Carmichael Park" },
        { date: "2026-08-13", title: "Monsters University (2013, PG) \u2014 Drone show to follow", location: "Brighton Park" }
      ]
    },

    // BROOMFIELD — Ongoing Summer Events

    {
      id: "broomfield-summer-concert-series",
      city: "broomfield",
      title: "Broomfield Summer Concert Series",
      section: "ongoing",
      subgroup: "Concert Series",
      subgroupOrder: 3,
      recurring: true,
      recurrence_label: "Every Wednesday June\u2013July \u2022 6:30 PM",
      dropdownLabel: "View Lineup",
      description: "Free Wednesday evening summer concert series with food trucks, activities, and live music for all ages. Food trucks and activities begin at 6:00 PM, music runs 6:30\u20138:30 PM.",
      href: "https://www.broomfield.org/3441/Summer-Concert-Series",
      locationLabel: "Anthem Community Park & Midway Park, Broomfield",
      timeLabel: "6:00 PM \u2013 8:30 PM",
      costLabel: "Free",
      costType: "free",
      audienceLabel: "All ages",
      series_start: "2026-06-10",
      series_end: "2026-07-29",
      schedule: [
        { date: "2026-06-10", title: "Banshee Tree with Velvet Daydream", location: "Anthem Community Park", note: "Food Trucks: Campfire Grill, Farm to Truck, The Snowy Churro" },
        { date: "2026-06-17", title: "Dzirae Gold with Rex Peoples", location: "Anthem Community Park", note: "Food Trucks: Smokin' Bones BBQ, Taste Bud Bullies, MC2 Ice Cream" },
        { date: "2026-06-24", title: "David Lawrence & The Spoonfull with Fruta Brutal", location: "Anthem Community Park", note: "Food Trucks: iPIE, Santa Elena's, HipPops" },
        { date: "2026-07-08", title: "Stillhouse Junkies with The Skinny", location: "Midway Park", note: "Food Trucks: Bamboo Skewer, Santa Elena's, MC2 Ice Cream" },
        { date: "2026-07-15", title: "Beasts of No Nation with Trusetto", location: "Midway Park", note: "Food Trucks: Colorado Taco Truck, Taste of Texas BBQ, Frost & Dough" },
        { date: "2026-07-22", title: "Marfa with Riley J Band", location: "Midway Park", note: "Food Trucks: iPIE, Bamboo Skewer, High Point Creamery" },
        { date: "2026-07-29", title: "Animal Farm with Bear Cub Brigade", location: "Midway Park", note: "Food Trucks: Farm to Truck, Snowy Churro, Kona Ice, Taste of Texas BBQ" }
      ]
    },

    // ARVADA — Ongoing Summer Events

    {
      id: "arvada-movies-around-town",
      city: "arvada",
      title: "Movies Around Town",
      section: "ongoing",
      subgroup: "Movies in the Park",
      subgroupOrder: 1,
      recurring: true,
      recurrence_label: "Select Friday Nights July\u2013October \u2022 Movies at Dusk",
      dropdownLabel: "View Movies & Dates",
      description: "Free outdoor movie nights at Arvada parks throughout the summer and fall, hosted by the Arvada Festivals Commission. Live music before each movie. Bring blankets, lawn chairs, and popcorn. Movies begin at dusk.",
      href: "https://www.arvadaco.gov/1260/Movies-Around-Town",
      locationLabel: "Various Arvada Parks",
      timeLabel: "Live music before dusk \u2022 Movie at dusk",
      costLabel: "Free",
      costType: "free",
      audienceLabel: "All ages",
      series_start: "2026-07-17",
      series_end: "2026-10-09",
      schedule: [
        { date: "2026-07-17", title: "Labyrinth" },
        { date: "2026-08-21", title: "Little Shop of Horrors" },
        { date: "2026-09-18", title: "Super Mario Galaxy" },
        { date: "2026-10-09", title: "People's Choice" }
      ]
    },

    // WHEAT RIDGE — Ongoing Summer Events (wheat_ridge)

    {
      id: "wheat-ridge-performances-in-the-park",
      city: "wheat_ridge",
      title: "Performances in the Park",
      section: "ongoing",
      subgroup: "Concert Series",
      subgroupOrder: 3,
      recurring: true,
      recurrence_label: "Every Wednesday June 17 \u2013 July 29 \u2022 Morning & Evening Shows",
      dropdownLabel: "View Schedule",
      description: "Free family-friendly performances every Wednesday at Anderson Park. Children\u2019s entertainment at 10:00 AM and live concerts at 6:30 PM. Food trucks available during evening performances.",
      href: "https://www.rootedinfun.com/169/Performances-in-the-Park",
      locationLabel: "Anderson Park, 4355 Field St, Wheat Ridge",
      timeLabel: "Children\u2019s 10:00 AM \u2022 Evening 6:30 PM",
      costLabel: "Free",
      costType: "free",
      audienceLabel: "All ages",
      series_start: "2026-06-17",
      series_end: "2026-07-29",
      schedule: [
        { date: "2026-06-17", title: "Morning: Seven Falls Indian Dancers \u2022 Evening: Dance on Fire", location: "Anderson Park" },
        { date: "2026-06-24", title: "Morning: Beth Epley \u2022 Evening: Skean Dhu", location: "Anderson Park" },
        { date: "2026-07-01", title: "Morning: Jeff & Paige \u2022 Evening: Jeff Goodwin & the Front Range Cowboys", location: "Anderson Park" },
        { date: "2026-07-08", title: "Morning: Jason Fye (Magic Show) \u2022 Evening: The Tracers", location: "Anderson Park" },
        { date: "2026-07-15", title: "Morning: Shane Franklin \u2022 Evening: Los Mocochetes", location: "Anderson Park" },
        { date: "2026-07-22", title: "Morning: Artistry in Motion \u2022 Evening: Williams Brothers Band", location: "Anderson Park" },
        { date: "2026-07-29", title: "Morning: TBA \u2022 Evening: Atomic Jones", location: "Anderson Park" }
      ]
    },

    // DENVER — One-Time & Featured Events

    {
      id: "denver-cherry-creek-arts-festival",
      city: "denver",
      title: "Cherry Creek Arts Festival",
      section: "onetime",
      recurring: false,
      description: "World-class outdoor arts festival filling the streets of Cherry Creek North with visual arts, live performances, diverse food vendors, and family activities. The Creation Station offers hands-on art projects designed for kids.",
      locationLabel: "Cherry Creek North, Denver",
      href: "https://cherryarts.org",
      dateStart: "2026-07-03",
      dateEnd: "2026-07-05",
      dateLabel: "July 3\u20135, 2026",
      timeLabel: "Multi-day festival",
      costLabel: "Free",
      costType: "free",
      audienceLabel: "All ages"
    },

    {
      id: "denver-highlands-street-fair",
      city: "denver",
      title: "Highlands Street Fair",
      section: "onetime",
      recurring: false,
      description: "The 43rd annual Highlands neighborhood block party along West 32nd Avenue featuring live music across multiple stages, a dedicated kids' activity area, local artisans, and food vendors.",
      locationLabel: "West 32nd Avenue, Highlands, Denver",
      href: "https://highlands-square.com",
      dateStart: "2026-06-20",
      dateEnd: "2026-06-20",
      dateLabel: "Saturday, June 20",
      timeLabel: "All day",
      costLabel: "Free",
      costType: "free",
      audienceLabel: "All ages"
    },

    {
      id: "denver-dragon-boat-festival",
      city: "denver",
      title: "Colorado Dragon Boat Festival",
      section: "onetime",
      recurring: false,
      description: "Vibrant celebration of Colorado's Asian American Pacific Islander culture at Sloan's Lake Park. Dragon boat races on the water, a dedicated Dragonland kids' area, two stages of cultural performances, a marketplace, and two food courts.",
      locationLabel: "Sloan\u2019s Lake Park, Denver",
      href: "https://www.cdbf.org",
      dateStart: "2026-08-29",
      dateEnd: "2026-08-30",
      dateLabel: "August 29\u201330, 2026",
      timeLabel: "Multi-day festival",
      costLabel: "Free",
      costType: "free",
      audienceLabel: "All ages"
    },

    // DENVER — Holiday & Seasonal

    {
      id: "denver-park-hill-parade",
      city: "denver",
      title: "Park Hill 4th of July Parade",
      section: "holiday",
      recurring: false,
      description: "Denver's largest neighborhood Independence Day parade marching through historic Park Hill along East 23rd Avenue from Dexter St to Krameria St. Over 50 community groups, marching bands, costumed characters, and vintage cars. America's 250th \u2022 Colorado's 150th.",
      locationLabel: "Park Hill, East 23rd Ave, Denver",
      href: "https://www.parkhillparade.org",
      dateStart: "2026-07-04T13:30:00",
      dateEnd: "2026-07-04T15:00:00",
      dateLabel: "Saturday, July 4",
      timeLabel: "Parade starts 1:30 PM",
      costLabel: "Free",
      costType: "free",
      audienceLabel: "All ages"
    },

    // BROOMFIELD — Holiday & Seasonal

    {
      id: "broomfield-4th-of-july",
      city: "broomfield",
      title: "Broomfield County Commons 4th of July Festival",
      section: "holiday",
      recurring: false,
      description: "Full-scale suburban park celebration with unlimited-play inflatable carnival, NurfTurf game area, face painting, and an All-Ages Bike Parade at 5:45 PM where families ride decorated bikes together. Fireworks at 9:15 PM. America's 250th \u2022 Colorado's 150th.",
      locationLabel: "Broomfield County Commons Park",
      href: "https://www.broomfield.org",
      dateStart: "2026-07-04T17:00:00",
      dateEnd: "2026-07-04T21:30:00",
      dateLabel: "Saturday, July 4",
      timeLabel: "5:00 PM \u2013 9:30 PM \u2022 Fireworks 9:15 PM",
      costLabel: "Free",
      costType: "free",
      audienceLabel: "All ages"
    },

    // ENGLEWOOD / LITTLETON — Holiday & Seasonal

    {
      id: "englewood-littleton-4th-of-july",
      city: "englewood",
      title: "Englewood & Littleton Independence Day Celebration",
      section: "holiday",
      recurring: false,
      description: "Collaborative family-friendly Independence Day event spanning Belleview Park and Cornerstone Park with food trucks, activities, and a joint fireworks display at 9:00 PM. Pets and personal fireworks prohibited. America's 250th \u2022 Colorado's 150th.",
      locationLabel: "Belleview Park & Cornerstone Park, Englewood",
      href: "https://www.englewoodco.gov/our-city/events/upcoming/4th-of-july-independence-day-fireworks",
      dateStart: "2026-07-04T17:00:00",
      dateEnd: "2026-07-04T22:00:00",
      dateLabel: "Saturday, July 4",
      timeLabel: "5:00 PM \u2013 10:00 PM \u2022 Fireworks 9:00 PM",
      costLabel: "Free",
      costType: "free",
      audienceLabel: "All ages"
    },

    // COMMERCE CITY — Holiday & Seasonal

    {
      id: "commerce-city-4thfest",
      city: "commerce_city",
      title: "Commerce City 4thFEST",
      section: "holiday",
      recurring: false,
      description: "Billed as the largest public fireworks show in Colorado, following the Colorado Rapids MLS match. Free family-friendly festival with live music, games, and an international rugby doubleheader featuring the USA Eagles. America's 250th \u2022 Colorado's 150th.",
      locationLabel: "Dick's Sporting Goods Park, Commerce City",
      href: "https://www.c3gov.com",
      dateStart: "2026-07-04",
      dateEnd: "2026-07-04",
      dateLabel: "Saturday, July 4",
      timeLabel: "All day",
      costLabel: "Free",
      costType: "free",
      audienceLabel: "All ages"
    },

    // COMMUNITY MEETUPS

    {
      id: "community-tuesday-reservoir-dinner",
      city: "aurora",
      title: "Tuesday Reservoir Dinner Meetup",
      section: "community",
      community_event: true,
      featured: true,
      recurring: true,
      recurrence_label: "Every Tuesday This Summer \u2022 5:30 PM",
      dropdownLabel: "View Schedule",
      description: "Bring the family and enjoy a summer evening at the reservoir. Kids can play in the sand, on the playground, or in the water while adults relax and connect with other local families. Potluck style \u2014 bring what you can: a dish, snack, drinks, or dessert. Hosted by the Find Every Park community.",
      locationLabel: "Cherry Creek Reservoir & Aurora Reservoir (alternating)",
      href: "https://findeverypark.com/community/tuesday-reservoir-dinner-meetup.html",
      timeLabel: "5:30 PM until people head out",
      costLabel: "Free",
      costType: "free",
      audienceLabel: "All ages",
      series_start: "2026-06-09",
      series_end: "2026-08-25",
      schedule: [
        { date: "2026-06-09", title: "Cherry Creek Reservoir \u2014 Swim Beach", location: "Cherry Creek Reservoir" },
        { date: "2026-06-16", title: "Aurora Reservoir \u2014 Playground", location: "Aurora Reservoir" },
        { date: "2026-06-23", title: "Cherry Creek Reservoir \u2014 Swim Beach", location: "Cherry Creek Reservoir" },
        { date: "2026-06-30", title: "Aurora Reservoir \u2014 Playground", location: "Aurora Reservoir" },
        { date: "2026-07-07", title: "Cherry Creek Reservoir \u2014 Swim Beach", location: "Cherry Creek Reservoir" },
        { date: "2026-07-14", title: "Aurora Reservoir \u2014 Playground", location: "Aurora Reservoir" },
        { date: "2026-07-21", title: "Cherry Creek Reservoir \u2014 Swim Beach", location: "Cherry Creek Reservoir" },
        { date: "2026-07-28", title: "Aurora Reservoir \u2014 Playground", location: "Aurora Reservoir" },
        { date: "2026-08-04", title: "Cherry Creek Reservoir \u2014 Swim Beach", location: "Cherry Creek Reservoir" },
        { date: "2026-08-11", title: "Aurora Reservoir \u2014 Playground", location: "Aurora Reservoir" },
        { date: "2026-08-18", title: "Cherry Creek Reservoir \u2014 Swim Beach", location: "Cherry Creek Reservoir" },
        { date: "2026-08-25", title: "Aurora Reservoir \u2014 Playground", location: "Aurora Reservoir" }
      ]
    },

    {
      id: "community-mighty-dads-coffee-parks",
      city: "aurora",
      title: "Coffee & Parks",
      section: "community",
      community_event: true,
      featured: true,
      recurring: true,
      recurrence_label: "Saturdays \u2022 9:00\u201311:00 AM",
      dropdownLabel: "View Upcoming Parks",
      description: "Kids play. Dads connect. Bring the kids, grab a coffee, and join other dads at a different park each week. The kids get playground time while dads socialize, connect, and build community. No RSVP required \u2014 come when you can. Hosted by Mighty Dads.",
      locationLabel: "Rotating parks across Aurora, Centennial & Denver",
      href: "https://mightydads.org",
      timeLabel: "9:00 AM \u2013 11:00 AM",
      costLabel: "Free",
      costType: "free",
      audienceLabel: "All ages \u2022 Dads & kids",
      series_start: "2026-06-13",
      series_end: "2026-08-08",
      schedule: [
        { date: "2026-06-13", title: "Red-Tailed Hawk Park", location: "Aurora" },
        { date: "2026-06-20", title: "Great Plains Park", location: "Aurora" },
        { date: "2026-06-27", title: "Apache Mesa Park", location: "Aurora" },
        { date: "2026-07-04", title: "Centennial Center Park", location: "Centennial" },
        { date: "2026-07-11", title: "Foxridge Park", location: "Centennial" },
        { date: "2026-07-18", title: "Willow Creek Park", location: "Centennial" },
        { date: "2026-07-25", title: "City Park", location: "Denver" },
        { date: "2026-08-01", title: "Central Park", location: "Denver" },
        { date: "2026-08-08", title: "Washington Park", location: "Denver" }
      ]
    }
  ]
};
