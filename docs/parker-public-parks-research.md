# Parker Public Parks Research

Source: official Parker public parks copy provided by user on 2026-04-03.

Purpose: use this sheet to normalize Parker park names, addresses, and amenity flags before updating `parker-parks-data.js`.

## Status key

- `matched`: official park name lines up closely with current Parker dataset
- `rename`: current Parker dataset exists but should be renamed to the official park name
- `add`: official park appears to be missing from the current Parker dataset first pass

## Structured list

| Official name | Status | Current dataset match | Address / location | Amenities from official text | Notes |
|---|---|---|---|---|---|
| Auburn Hills Community Park | matched | Auburn Hills Community Park | 11682 Bradbury Ranch Rd. | community park | Town, Ryland Homes, and Prairie Crossing Elementary worked together on completion |
| Bar CCC Park | rename | Bar CCC | Mainstreet just east of Cherry Creek | trail access, trailhead, parking, ballfield, 2 shade shelters | Should likely add `trails`, `baseball`, `shelter` |
| Bayou Gulch Regional Park | matched | Bayou Gulch Regional Park | 4815 Fox Sparrow Rd | regional park | Owned and managed by Douglas County Parks |
| Challenger Regional Park | matched | Challenger Regional Park | 17299 E. Lincoln Ave. | regional park | Owned and managed by Douglas County Parks |
| Discovery Park | matched | Discovery Park | Mainstreet and Pine Drive | interactive fountains, winter ice trail, events, gathering space | Fountains suggest seasonal splash feature, but we should decide whether to map this as `sprayground` or keep as note only |
| Dog Park and Disc Golf Course | rename | USMC CPL David M Sonka Dog Park and Westcreek Disc Golf Course | 17855 Pine Lane | dog park, shade structures, drinking fountains, small dog area, agility course, disc golf, 18 holes | Strong candidate for `dog_park`, `disc_golf`, maybe `restroom` only if officially confirmed elsewhere; drinking fountains are not currently a site filter |
| Iron Horse Park | matched | Iron Horse Park | 20151 Tallman Ave. | Tallman Gulch Trail access, 3 ball fields, shade structures, seasonal port-a-potty | Should add `trails`, `baseball`, `shelter`, maybe `restroom` if we count seasonal port-a-potty |
| Living Wheel Park | matched | Living Wheel Park | corner of Mainstreet and Stage Run | benches, walking paths | Walking paths probably not enough to tag as `trails` unless we want a broader standard |
| Looking Glass Community Park | add | none in current first pass | near Chambers Road and Spirit Trail Boulevard along Brandy Gulch | dog park, multi-purpose fields, playgrounds, pickleball, picnic pavilion | Strong missing park; should likely add `dog_park`, `soccer`, `playground`, `pickleball`, `shelter` |
| McCabe Meadows | rename | Salisbury / McCabe Meadows / Arboretum | west side of Parker Road, north of Indian Pipe Lane | trailhead, picnic area, parking, arboretum | Likely should add `trails`, `shelter` only if picnic area includes covered shelter; otherwise leave as note |
| O'Brien Park | matched | O'Brien Park | on Mainstreet in downtown Parker | lighted softball field, basketball court, playground, outdoor pool, slides, water features | Should add `baseball`, `basketball`, `playground`, `pool` |
| Preservation Park and Trailhead | rename | Preservation Park | northern gateway into Parker and Douglas County | trailhead | Should at least add `trails` |
| Railbender Skate & Tennis Park | matched | Railbender Skate & Tennis Park | west side of Twenty Mile Road between E. Plaza Drive and Longs Way | 6 lighted tennis courts, playground, 3 picnic shelters, restrooms, Cherry Creek Regional Trail trailhead, parking | Should add `tennis`, `playground`, `shelter`, `restroom`, `trails`; current first pass only has `tennis` and `skate` |
| Salisbury Regional Park | rename | Salisbury Park & Open Space | along Motsenbocker Road | equestrian park, sports complex | Official text here is broad; richer amenity details may need separate research |
| Stroh Ranch Soccer Fields | rename | Stroh Ranch Soccer Park | north side of Stroh Road, west of Cherry Creek | 2 regulation soccer fields, playground, 2 picnic shelters | Should add `soccer`, `playground`, `shelter` |
| Tallman Meadow Park | matched | Tallman Meadow Park | east side of Parker in the Idyllwilde community | picnic and barbecue facilities, shade shelter, playground, multi-use sports field, baseball field, trails | Should add `playground`, `shelter`, `baseball`, `trails`, maybe `soccer` for multi-use field only if we want that inferred |
| Trails at Crowfoot Community Park | add | none in current first pass | Parker, CO | baseball field, multi-use sports field, tennis, pickleball, basketball, playgrounds, picnic/shade shelters, jogging trail, disc golf | Strong missing park with many filters |
| 20-Mile Historic Park | rename | Twenty Mile House | near Parker Road and Mainstreet | historic park | Official public-facing name should probably replace current GIS-style name |

## Recommended first data fixes

1. Rename current Parker entries to official public-facing names where the match is clear.
2. Add addresses for parks where the official page gives them directly.
3. Update amenity flags for parks with explicit amenities in the official text:
   - Bar CCC Park
   - Iron Horse Park
   - O'Brien Park
   - Railbender Skate & Tennis Park
   - Stroh Ranch Soccer Fields
   - Tallman Meadow Park
4. Add missing official parks that are not in the current first pass:
   - Looking Glass Community Park
   - Trails at Crowfoot Community Park
5. Decide a rule for borderline tags:
   - `restroom` for seasonal port-a-potty
   - `sprayground` for interactive fountains
   - `trails` for short internal walking paths versus real trail access

## Suggested amenity mapping standard

Use these only when the official source is explicit:

- `playground`
- `pickleball`
- `tennis`
- `basketball`
- `baseball`
- `soccer`
- `pool`
- `sprayground`
- `dog_park`
- `trails`
- `disc_golf`
- `skate`
- `golf`
- `restroom`
- `shelter`

Keep these as descriptive notes unless we add new filter types later:

- parking
- benches
- drinking fountains
- small dog area
- agility course
- equestrian
- arboretum
- event space
- historic site
