(function () {
  window.BEST_PARKS_PAGES = {
    aurora: {
      eyebrow: "Best Parks",
      title: "Best Parks in Aurora, Colorado",
      summary: "Curated Aurora picks that combine the strongest playgrounds, destination parks, and repeat family stops in the current guide.",
      featuredParkIds: [
        "co-aurora-great-plains-park",
        "co-aurora-utah-park",
        "co-aurora-del-mar-park",
        "co-aurora-red-tailed-hawk-park"
      ]
    },
    centennial: {
      eyebrow: "Best Parks",
      title: "Best Parks in Centennial, Colorado",
      summary: "A first curated Centennial list built around strong family, trail, and neighborhood picks.",
      featuredParkIds: [
        "co-centennial-cherry-creek-valley-ecological-park",
        "co-centennial-dekoevend-park",
        "co-centennial-cherry-park",
        "co-centennial-clarkson-park"
      ]
    },
    parker: {
      eyebrow: "Best Parks",
      title: "Best Parks in Parker, Colorado",
      summary: "A curated Parker short list that blends destination parks, activity-focused stops, and easy local favorites.",
      featuredParkIds: [
        "co-parker-o-brien-park",
        "co-parker-railbender-skate-tennis-park",
        "co-parker-salisbury-park-open-space",
        "co-parker-discovery-park"
      ]
    },
    "lone-tree": {
      eyebrow: "Best Parks",
      title: "Best Parks in Lone Tree, Colorado",
      summary: "A first curated Lone Tree short list built to highlight the easiest parks to start with.",
      featuredParkIds: [
        "co-lone-tree-sweetwater-park",
        "co-lone-tree-promenade-park",
        "co-lone-tree-lonesome-pine-park",
        "co-lone-tree-altair-park"
      ]
    }
  };

  window.PARK_GUIDE_DATA = {
    "co-aurora-great-plains-park": {
      best_for: "Best for Toddlers",
      short_reason: "Splash pad, easy playground flow, and one of the friendliest family layouts in Aurora.",
      local_tip: "Bring backup clothes in summer and plan a morning visit before the hottest stretch.",
      toddler_note: "Strong toddler stop thanks to the tot swings and easy splash-pad repeatability.",
      shade_note: "Shade structures help near the play area, but midday sun is still real.",
      crowd_note: "Busy on warm weekends when the water features are running.",
      seasonal_note: "Best in late spring through early fall when the splash area is active.",
      standout_feature: "Splash pad"
    },
    "co-aurora-utah-park": {
      best_for: "Best All-Around Park",
      short_reason: "Big mix of playgrounds, trails, ballfields, pool access, and everyday-family usefulness.",
      local_tip: "This is an easy park to pair with a longer loop or a quick weekday stop depending on the time you have.",
      toddler_note: "Works for mixed-age families better than toddler-only outings.",
      shade_note: "Some mature trees help, especially compared with newer east-side parks.",
      crowd_note: "Popular enough to feel active without always feeling overwhelming.",
      standout_feature: "Balanced amenity mix"
    },
    "co-aurora-del-mar-park": {
      best_for: "Best Playground Variety",
      short_reason: "A high-utility central Aurora park with playgrounds, sports, shade, and a stronger destination feel.",
      local_tip: "Good choice when you want a park that can hold older kids and younger kids at the same time.",
      toddler_note: "Works, but the bigger value is how much range it gives mixed-age families.",
      shade_note: "One of the better Aurora picks for natural shade coverage.",
      crowd_note: "Can feel busy because it serves so many different uses well.",
      standout_feature: "Shade plus activity range"
    },
    "co-aurora-red-tailed-hawk-park": {
      best_for: "Best Inclusive Playground",
      short_reason: "A destination-level park with inclusive play, splash features, trail access, and strong all-abilities value.",
      local_tip: "Easy one to turn into a half-day outing because there is enough variety to stay longer.",
      toddler_note: "Good for a range of ages, not just bigger kids.",
      shade_note: "Some helpful structures, but still plan for sun on warmer days.",
      crowd_note: "A known destination park, especially in nicer weather.",
      standout_feature: "Inclusive play design"
    },
    "co-centennial-cherry-creek-valley-ecological-park": {
      best_for: "Best Green Escape",
      short_reason: "Strong early Centennial pick if you want trails, breathing room, and a greener-feeling stop.",
      local_tip: "Use this as more of a walk-and-explore outing than a quick playground stop.",
      crowd_note: "Feels calmer than a typical neighborhood playground park.",
      seasonal_note: "Best in shoulder seasons when longer walks are easier.",
      standout_feature: "Open-space feel"
    },
    "co-centennial-dekoevend-park": {
      best_for: "Best Classic Park Day",
      short_reason: "One of the stronger full-park Centennial options with a broader all-around park feel.",
      local_tip: "A good first stop if you want to get a read on Centennial’s family park mix.",
      toddler_note: "Better as a general family stop than a tiny-kids-only destination.",
      standout_feature: "Well-rounded city park feel"
    },
    "co-centennial-cherry-park": {
      best_for: "Best Neighborhood Family Stop",
      short_reason: "A strong local pick when you want family amenities without committing to a huge destination outing.",
      local_tip: "Works well as an everyday repeat park instead of a once-in-a-while special trip.",
      crowd_note: "More neighborhood rhythm than destination-park traffic.",
      standout_feature: "Repeat-visit convenience"
    },
    "co-centennial-clarkson-park": {
      best_for: "Best Quick Park Stop",
      short_reason: "A practical Centennial option for shorter outings and easy neighborhood use.",
      local_tip: "Good backup plan when you want something lower-lift and close-in.",
      toddler_note: "Can work well for shorter-energy outings with younger kids.",
      standout_feature: "Easy everyday use"
    },
    "co-parker-o-brien-park": {
      best_for: "Best Downtown Park",
      short_reason: "A strong central Parker pick with playground, pool, and activity mix right in the middle of town.",
      local_tip: "Easy to pair with other downtown Parker stops before or after the park.",
      crowd_note: "Expect more energy here than at quieter neighborhood parks.",
      seasonal_note: "Summer is the strongest season thanks to the pool.",
      standout_feature: "Downtown convenience"
    },
    "co-parker-railbender-skate-tennis-park": {
      best_for: "Best Active Kids Park",
      short_reason: "A high-utility Parker stop for skate, tennis, trails, playground time, and longer mixed-age outings.",
      local_tip: "Great choice when different kids in the group want different things.",
      toddler_note: "Usable, but shines more for school-age kids and active siblings.",
      shade_note: "Some shelter support helps, but activity areas still run sunny.",
      standout_feature: "Multi-activity range"
    },
    "co-parker-salisbury-park-open-space": {
      best_for: "Best Big-Space Outing",
      short_reason: "A stronger Parker pick when you want room, trails, and a larger-format destination feel.",
      local_tip: "Plan this more like a bigger outdoor outing than a fast neighborhood stop.",
      crowd_note: "Feels spread out enough to absorb busier times well.",
      standout_feature: "Large-scale park footprint"
    },
    "co-parker-discovery-park": {
      best_for: "Best Splash Pad Stop",
      short_reason: "Compact downtown Parker park with interactive fountains and a strong warm-weather repeat-visit case.",
      local_tip: "Best when you want a shorter outing with a built-in downtown Parker walk or snack stop.",
      seasonal_note: "The warm-weather fountain season is when this park shines most.",
      standout_feature: "Interactive fountains"
    },
    "co-lone-tree-sweetwater-park": {
      best_for: "Best First Lone Tree Stop",
      short_reason: "A clean starting point for getting oriented in Lone Tree without needing a long scouting trip.",
      local_tip: "Use this as an anchor stop while you learn how the smaller Lone Tree park network fits together.",
      standout_feature: "Easy first-look park"
    },
    "co-lone-tree-promenade-park": {
      best_for: "Best Central Browse Pick",
      short_reason: "A strong early Lone Tree pick for map-first browsing and quick comparison against nearby parks.",
      local_tip: "Good candidate for an early repeat visit while richer park notes are still being built out.",
      standout_feature: "Good map anchor"
    },
    "co-lone-tree-lonesome-pine-park": {
      best_for: "Best Local Favorite Candidate",
      short_reason: "One of the Lone Tree parks worth prioritizing for deeper guide polish as the city coverage expands.",
      local_tip: "Pair this with another nearby Lone Tree stop if you want a faster read on the city’s park mix.",
      standout_feature: "High-upside polish pick"
    },
    "co-lone-tree-altair-park": {
      best_for: "Best Early Guide Candidate",
      short_reason: "A useful Lone Tree park to feature early as the city guide grows into a richer local guide.",
      local_tip: "Good one to keep on your shortlist as photos and additional field notes come online.",
      standout_feature: "Strong early feature candidate"
    }
  };

})();
