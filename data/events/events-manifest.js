// FindEveryPark — Events Manifest
// Version: 2026-06 | Curated Aurora Summer Events
// Source: Aurora Front Range Summer 2026 Master Schedule
// Covers: June – August 2026 | Aurora, CO

window.EVENTS_DATA = {

  updatedLabel: "Updated June 2026",

  cities: {
    aurora: {
      label: "Aurora",
      subtitle: "Curated family events in Aurora — updated weekly.",
      submitHeading: "Know an Aurora event?",
      footerNote: "Aurora events sourced from the City of Aurora, local organizers, and community partners."
    }
  },

  events: [

    // ONGOING SUMMER EVENTS — Movies in the Park

    {
      id: "aurora-park-lights-movie-nights",
      city: "aurora",
      title: "Park Lights & Movie Nights",
      section: "ongoing",
      subgroup: "Movies in the Park",
      subgroupOrder: 1,
      recurring: true,
      recurrence_label: "Movie Nights This Summer",
      dropdownLabel: "View Movie Lineup",
      description: "Free community movie nights under the stars at Aurora parks. Pre-film entertainment starts at 5:15 PM, movies begin at 6:00 PM.",
      locationLabel: "Various Aurora Parks",
      timeLabel: "5:15 PM – 8:00 PM",
      costLabel: "Free",
      costType: "free",
      audienceLabel: "All ages",
      series_start: "2026-06-04",
      series_end: "2026-06-13",
      schedule: [
        { date: "2026-06-04", title: "Homeward Bound: The Incredible Journey (G)", location: "Rocky Ridge Park" },
        { date: "2026-06-05", title: "Puss in Boots: The Last Wish (PG)", location: "Hilltop Park" },
        { date: "2026-06-13", title: "Barbie (PG-13)", location: "Larkspur Park" }
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
      title: "4th of July Spectacular",
      section: "holiday",
      recurring: false,
      description: "Flagship Independence Day celebration featuring live music, local food trucks, family-friendly events, and traditional festivities on the Great Lawn.",
      locationLabel: "Aurora Municipal Center Great Lawn",
      dateStart: "2026-07-04T18:00:00",
      dateEnd: "2026-07-04T22:00:00",
      dateLabel: "Saturday, July 4",
      timeLabel: "6:00 PM – 10:00 PM",
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
      locationLabel: "Town Center at Aurora",
      dateStart: "2026-07-26T08:00:00",
      dateEnd: "2026-07-26T10:00:00",
      dateLabel: "Saturday, July 26",
      timeLabel: "8:00 AM – 10:00 AM",
      costLabel: "Free",
      costType: "free",
      audienceLabel: "All ages"
    }
  ]
};
