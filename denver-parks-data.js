(function () {
  window.PARK_COORDS = window.PARK_COORDS || {};
  const denver_datasetKey = "denver";
  const denver_sourceLink = "";
  const denver_sourceParks = [{"n":"29th and Fairfax","lat":39.75769,"lng":-104.927858,"surface_type":"Poured in Place","class_category":"PG-NEIGHBORHOOD","year_rehab":"2021","notes":"","source_loc_codes":["405"]},{"n":"39th Ave Greenway","lat":39.771335,"lng":-104.959234,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2020","notes":"Nature Play","source_loc_codes":["229"]},{"n":"41st & Ensenada","lat":39.772849,"lng":-104.7592,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2004","notes":"","source_loc_codes":["524"]},{"n":"41st & Tennyson","lat":39.773275,"lng":-105.044415,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"1998","notes":"","source_loc_codes":["035"]},{"n":"51st & Broadway Park","lat":39.788673,"lng":-104.987094,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2016","notes":"","source_loc_codes":["230"]},{"n":"51st & Zuni","lat":39.790134,"lng":-105.014687,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2000","notes":"","source_loc_codes":["009"]},{"n":"Alamo Placita Park","lat":39.72057,"lng":-104.976052,"surface_type":"Sand","class_category":"PG-NEIGHBORHOOD","year_rehab":"1990","notes":"","source_loc_codes":["301"]},{"n":"Argo Park","lat":39.782706,"lng":-104.981675,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2010","notes":"","source_loc_codes":["212"]},{"n":"Arkins Park","lat":39.770193,"lng":-104.981275,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2020","notes":"","source_loc_codes":["944"]},{"n":"Arkins Promenade","lat":39.773534,"lng":-104.9792,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2022","notes":"","source_loc_codes":["945"]},{"n":"Ash Grove Park","lat":39.685399,"lng":-104.925147,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2016","notes":"","source_loc_codes":["751"]},{"n":"Aspgren Park","lat":39.704171,"lng":-105.002461,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"1991","notes":"","source_loc_codes":["801"]},{"n":"Aztlan Park","lat":39.776923,"lng":-105.004512,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2011","notes":"","source_loc_codes":["032"]},{"n":"Barnum East Park","lat":39.724193,"lng":-105.023307,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2016","notes":"","source_loc_codes":["803"]},{"n":"Barnum Park","lat":39.723466,"lng":-105.028583,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2002","notes":"4th & Hooker","source_loc_codes":["804"]},{"n":"Bates & Hobart Park","lat":39.661536,"lng":-105.061085,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2007","notes":"","source_loc_codes":["142"]},{"n":"Bayaud Park","lat":39.714568,"lng":-104.900619,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2001","notes":"","source_loc_codes":["L05"]},{"n":"Bear Creek Park","lat":39.653119,"lng":-105.046065,"surface_type":"Wood Fiber","class_category":"PG-REGIONAL","year_rehab":"2009","notes":"","source_loc_codes":["139"]},{"n":"Bear Valley Park","lat":39.660329,"lng":-105.07164,"surface_type":"Sand, Wood Fiber","class_category":"PG-REGIONAL","year_rehab":"2001","notes":"Darthmouth & Reed","source_loc_codes":["140"]},{"n":"Benedict Fountain Park","lat":39.74792,"lng":-104.98209,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2013","notes":"","source_loc_codes":["310"]},{"n":"Berkeley Lake Park","lat":39.781009,"lng":-105.05022,"surface_type":"Sand","class_category":"PG-REGIONAL","year_rehab":"2007","notes":"","source_loc_codes":["002"]},{"n":"Bezoff","lat":39.704634,"lng":-104.870107,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2010","notes":"","source_loc_codes":["624"]},{"n":"Bible (James A) Park","lat":39.666352,"lng":-104.90844,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2021","notes":"","source_loc_codes":["602"]},{"n":"Byers & Pecos Park","lat":39.711919,"lng":-105.007205,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2019","notes":"","source_loc_codes":["831"]},{"n":"Central Park","lat":39.760923,"lng":-104.884898,"surface_type":"Poured-In-Place","class_category":"PG-REGIONAL","year_rehab":"2023","notes":"Multi-Surface","source_loc_codes":["561"]},{"n":"Central Park Rec Center","lat":39.760689,"lng":-104.874966,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2010","notes":"","source_loc_codes":["567"]},{"n":"Chaffee (Jerome B) Park","lat":39.776303,"lng":-105.010488,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2009","notes":"","source_loc_codes":["003"]},{"n":"Cheesman Park","lat":39.73321,"lng":-104.968111,"surface_type":"Sand","class_category":"PG-REGIONAL","year_rehab":"1992","notes":"","source_loc_codes":["312"]},{"n":"City of Axum Park","lat":39.763444,"lng":-104.935108,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2010","notes":"","source_loc_codes":["417"]},{"n":"City of Nairobi","lat":39.766092,"lng":-104.946779,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2013","notes":"","source_loc_codes":["217"]},{"n":"City of Potenza Park","lat":39.696182,"lng":-104.924195,"surface_type":"Poured in Place","class_category":"PG-NEIGHBORHOOD","year_rehab":"2024","notes":"","source_loc_codes":["762"]},{"n":"City of Ulaanbaatar Park","lat":39.723963,"lng":-104.900482,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2007","notes":"","source_loc_codes":["L17"]},{"n":"City park","lat":39.745966,"lng":-104.943845,"surface_type":"Wood Fiber","class_category":"PG-REGIONAL","year_rehab":"2024","notes":"DMNS Nature Paly","source_loc_codes":["201"]},{"n":"City Park","lat":39.747838,"lng":-104.955519,"surface_type":"Poured in Place","class_category":"PG-REGIONAL","year_rehab":"2021","notes":"Multiple surface types","source_loc_codes":["201"]},{"n":"Congress Park","lat":39.729758,"lng":-104.95662,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2024","notes":"","source_loc_codes":["314"]},{"n":"Cook (Judge Joseph E) Park","lat":39.686226,"lng":-104.911397,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2023","notes":"EWF, Sythetic Turf, Poured in Place Rubber","source_loc_codes":["763"]},{"n":"Cottonwood Gallery","lat":39.792266,"lng":-104.88859,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2017","notes":"Nature Play Element - 4 pit areas","source_loc_codes":["577"]},{"n":"Crescent Park","lat":39.729494,"lng":-104.899703,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2004","notes":"","source_loc_codes":["L25"]},{"n":"Crestmoor Park","lat":39.714875,"lng":-104.916156,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2001","notes":"","source_loc_codes":["403"]},{"n":"Cuatro Vientos","lat":39.710618,"lng":-105.037947,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2014","notes":"","source_loc_codes":["825"]},{"n":"Dailey Park","lat":39.715923,"lng":-104.99309,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2025","notes":"","source_loc_codes":["713"]},{"n":"DeBoer","lat":39.670973,"lng":-104.961217,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2010","notes":"","source_loc_codes":["805"]},{"n":"Denargo Park","lat":39.765116,"lng":-104.991234,"surface_type":"","class_category":"PG-NEIGHBORHOOD","year_rehab":"2025","notes":"Developer built and maintained","source_loc_codes":["920"]},{"n":"Denison Park","lat":39.733405,"lng":-104.904264,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2004","notes":"","source_loc_codes":["458"]},{"n":"Douglass (Fredrick) Park","lat":39.759476,"lng":-104.96802,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2001","notes":"","source_loc_codes":["226"]},{"n":"Downtown Childrens Playground","lat":39.750071,"lng":-105.004052,"surface_type":"Poured in Place","class_category":"PG-NEIGHBORHOOD","year_rehab":"2007","notes":"","source_loc_codes":["942"]},{"n":"Dreiling Park","lat":39.71397,"lng":-105.046722,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"1993","notes":"Wolff & Windsor","source_loc_codes":["836"]},{"n":"Dunham (Lee) Park","lat":39.778761,"lng":-104.95438,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2017","notes":"","source_loc_codes":["209"]},{"n":"Eastmoor Park","lat":39.640226,"lng":-104.908699,"surface_type":"Sand","class_category":"PG-COMMUNITY","year_rehab":"1992","notes":"","source_loc_codes":["606"]},{"n":"Eisenhower (Mamie Daud) Park","lat":39.659116,"lng":-104.936858,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"1992","notes":"new equipment addedd 2015","source_loc_codes":["630"]},{"n":"Elmendorf Park","lat":39.792544,"lng":-104.84191,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2010","notes":"","source_loc_codes":["536"]},{"n":"Elyria (Johnson Center) Park","lat":39.783945,"lng":-104.964272,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2006","notes":"","source_loc_codes":["204"]},{"n":"Falcon Park","lat":39.793521,"lng":-104.829617,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2017","notes":"Wood Fiber and Poured-in-Place","source_loc_codes":["537"]},{"n":"Ferguson Park","lat":39.750761,"lng":-104.93248,"surface_type":"Sand","class_category":"PG-NEIGHBORHOOD","year_rehab":"1991","notes":"","source_loc_codes":["421"]},{"n":"First Creek Park","lat":39.793589,"lng":-104.768333,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2019","notes":"Nature Play","source_loc_codes":["586"]},{"n":"Flores (Hector M) Park","lat":39.722883,"lng":-104.995894,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2012","notes":"","source_loc_codes":["322"]},{"n":"Franco (Bernabe Indio) Park","lat":39.768448,"lng":-105.001402,"surface_type":"Sand","class_category":"PG-NEIGHBORHOOD","year_rehab":"2002","notes":"","source_loc_codes":["022"]},{"n":"Fuller Park","lat":39.757896,"lng":-104.966752,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2000","notes":"","source_loc_codes":["205"]},{"n":"Garfield Lake Park","lat":39.695257,"lng":-105.037423,"surface_type":"Sand","class_category":"PG-COMMUNITY","year_rehab":"1993","notes":"","source_loc_codes":["807"]},{"n":"Garland (David T) Park","lat":39.694271,"lng":-104.91528,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"1992","notes":"West","source_loc_codes":["728"]},{"n":"Garland & Saratoga Park","lat":39.626878,"lng":-105.103751,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2024","notes":"","source_loc_codes":["166"]},{"n":"Garrison & Union Park","lat":39.632584,"lng":-105.102904,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2002","notes":"South","source_loc_codes":["158"]},{"n":"Gates Crescent Park","lat":39.749183,"lng":-105.016178,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"1997","notes":"","source_loc_codes":["907"]},{"n":"Globeville Landing Park","lat":39.777681,"lng":-104.976551,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2019","notes":"Nature Play Element","source_loc_codes":["908"]},{"n":"Golden Key Park","lat":39.662958,"lng":-104.887125,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"1998","notes":"","source_loc_codes":["607"]},{"n":"Governors Park","lat":39.727552,"lng":-104.981741,"surface_type":"Sand","class_category":"PG-NEIGHBORHOOD","year_rehab":"1998","notes":"","source_loc_codes":["316"]},{"n":"Granado (Lorraine) Community Park","lat":39.789788,"lng":-104.949586,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2006","notes":"","source_loc_codes":["941"]},{"n":"Grant Frontier Park","lat":39.675683,"lng":-104.997068,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2017","notes":"Nature Play","source_loc_codes":["909"]},{"n":"Great Lawn Park","lat":39.723564,"lng":-104.886309,"surface_type":"Sand","class_category":"PG-REGIONAL","year_rehab":"2008","notes":"","source_loc_codes":["L07"]},{"n":"Green Valley Ranch East Park","lat":39.777869,"lng":-104.749749,"surface_type":"Sand","class_category":"PG-COMMUNITY","year_rehab":"2011","notes":"","source_loc_codes":["550"]},{"n":"Green Valley Ranch West Park","lat":39.778512,"lng":-104.767585,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2004","notes":"","source_loc_codes":["549"]},{"n":"Greenway Park","lat":39.752533,"lng":-104.895852,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2003","notes":"","source_loc_codes":["556"]},{"n":"Hallack Park","lat":39.746643,"lng":-105.030412,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2013","notes":"","source_loc_codes":["018"]},{"n":"Hampden Heights Park","lat":39.656333,"lng":-104.878148,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2010","notes":"","source_loc_codes":["614"]},{"n":"Harvard Gulch Mini Park","lat":39.671536,"lng":-104.972651,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2001","notes":"","source_loc_codes":["816"]},{"n":"Harvard Gulch Park","lat":39.674622,"lng":-104.981736,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2007","notes":"","source_loc_codes":["829"]},{"n":"Harvey Park","lat":39.678787,"lng":-105.042586,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2025","notes":"Synthetic Turf and Wood Fiber","source_loc_codes":["130"]},{"n":"High Plains Park","lat":39.801978,"lng":-104.873511,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2023","notes":"","source_loc_codes":["595"]},{"n":"Highland Gateway Park","lat":39.761888,"lng":-105.006681,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"1998","notes":"","source_loc_codes":["046"]},{"n":"Highland Park","lat":39.763208,"lng":-105.027269,"surface_type":"Sand","class_category":"PG-NEIGHBORHOOD","year_rehab":"1990","notes":"","source_loc_codes":["013"]},{"n":"Highland Senior Center Park","lat":39.758113,"lng":-105.036948,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2003","notes":"","source_loc_codes":["034"]},{"n":"Hirshorn Park","lat":39.75989,"lng":-105.010718,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2000","notes":"","source_loc_codes":["014"]},{"n":"Huston Lake Park","lat":39.701134,"lng":-105.018048,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2025","notes":"","source_loc_codes":["811"]},{"n":"Hutchinson (Theodore A) Park","lat":39.657174,"lng":-104.904162,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2003","notes":"","source_loc_codes":["616"]},{"n":"I-70 Cover Park","lat":39.78048,"lng":-104.954978,"surface_type":"Rubberized Surface","class_category":"PG-NEIGHBORHOOD","year_rehab":"2022","notes":"","source_loc_codes":["262"]},{"n":"Inspiration Point Park","lat":39.786712,"lng":-105.055885,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2022","notes":"Multi-Pit, Multi-Surface","source_loc_codes":["005"]},{"n":"Jefferson & Kendall Park","lat":39.650756,"lng":-105.067366,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2005","notes":"","source_loc_codes":["156"]},{"n":"Jefferson Park","lat":39.750685,"lng":-105.021457,"surface_type":"Poured in Place","class_category":"PG-NEIGHBORHOOD","year_rehab":"2015","notes":"EWF/PIP","source_loc_codes":["016"]},{"n":"Jefferson Square Park","lat":39.644838,"lng":-104.920594,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2004","notes":"","source_loc_codes":["629"]},{"n":"Johnson-Habitat","lat":39.705104,"lng":-104.998086,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2015","notes":"Nature Play","source_loc_codes":["910"]},{"n":"Kentucky & Knox Park","lat":39.700665,"lng":-105.032742,"surface_type":"Poured in Place","class_category":"PG-NEIGHBORHOOD","year_rehab":"2024","notes":"Sythetic Turf and PIP","source_loc_codes":["817"]},{"n":"Kittredge Park","lat":39.729584,"lng":-104.907561,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2007","notes":"","source_loc_codes":["461"]},{"n":"La Alma / Lincoln Park","lat":39.734958,"lng":-105.003882,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"1991","notes":"North","source_loc_codes":["315"]},{"n":"La Lomita Park","lat":39.679917,"lng":-105.012335,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2020","notes":"","source_loc_codes":["830"]},{"n":"La Raza Park","lat":39.770271,"lng":-105.004531,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2002","notes":"","source_loc_codes":["004"]},{"n":"Lakewood and Dry Gulch Park","lat":39.734347,"lng":-105.042576,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2011","notes":"11th & Winona","source_loc_codes":["030"]},{"n":"Lawson (Sonny) Park","lat":39.751915,"lng":-104.982185,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2014","notes":"","source_loc_codes":["208"]},{"n":"Lindsley (Henry S) Park","lat":39.733749,"lng":-104.933447,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2002","notes":"","source_loc_codes":["401"]},{"n":"Loretto Heights Park","lat":39.663601,"lng":-105.032436,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2025","notes":"","source_loc_codes":["163"]},{"n":"Lowry Sports Park","lat":39.717317,"lng":-104.892463,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2007","notes":"","source_loc_codes":["L10"]},{"n":"Magna Carta Park","lat":39.654247,"lng":-104.939576,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2004","notes":"","source_loc_codes":["631"]},{"n":"Manley (James N) Park","lat":39.722848,"lng":-104.957431,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2012","notes":"","source_loc_codes":["337"]},{"n":"Martin Luther King Jr Park","lat":39.770202,"lng":-104.909079,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2017/2021","notes":"","source_loc_codes":["415"]},{"n":"Martinez (Joseph P) Park","lat":39.730665,"lng":-105.043093,"surface_type":"Sand, Poured in Place","class_category":"PG-COMMUNITY","year_rehab":"1991","notes":"Multi-surface","source_loc_codes":["029"]},{"n":"Mayfair Park","lat":39.732303,"lng":-104.920914,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2013","notes":"","source_loc_codes":["432"]},{"n":"McNichols (William H) Park","lat":39.744666,"lng":-104.899584,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2021","notes":"Wood Fiber, Synthetic Turf, Sand","source_loc_codes":["L11"]},{"n":"McWilliams Park","lat":39.668012,"lng":-104.953641,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2022","notes":"Multiple surface types","source_loc_codes":["814"]},{"n":"Mestizo Curtis Park","lat":39.761366,"lng":-104.975862,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2015","notes":"","source_loc_codes":["203"]},{"n":"Montbello Central Park","lat":39.784504,"lng":-104.829544,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2018","notes":"","source_loc_codes":["541"]},{"n":"Montbello Open Space","lat":39.779969,"lng":-104.843673,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2019","notes":"Nature Play","source_loc_codes":["539"]},{"n":"Montclair Park","lat":39.734952,"lng":-104.908773,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"1991","notes":"Surfacing replaced in 2021","source_loc_codes":["408"]},{"n":"New Freedom","lat":39.736843,"lng":-104.885527,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2012","notes":"","source_loc_codes":["L26"]},{"n":"North Commons Lawn","lat":39.806581,"lng":-104.876511,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2018","notes":"Nature Play Element","source_loc_codes":["590"]},{"n":"North Sports Fields","lat":39.801173,"lng":-104.870347,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2021","notes":"","source_loc_codes":["594"]},{"n":"Observatory Park","lat":39.677039,"lng":-104.953039,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2010","notes":"","source_loc_codes":["818"]},{"n":"Parkfield","lat":39.793126,"lng":-104.80616,"surface_type":"Wood Fiber","class_category":"PG-REGIONAL","year_rehab":"2011","notes":"","source_loc_codes":["516"]},{"n":"Pasquinel's Landing","lat":39.680055,"lng":-104.997538,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2017","notes":"Nature Play","source_loc_codes":["914"]},{"n":"Pferdesteller Park","lat":39.763261,"lng":-105.049335,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2010","notes":"","source_loc_codes":["017"]},{"n":"Pinecrest Village Park","lat":39.646339,"lng":-105.056371,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2006","notes":"","source_loc_codes":["161"]},{"n":"Pinehurst Park","lat":39.637293,"lng":-105.047912,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2005","notes":"","source_loc_codes":["159"]},{"n":"Platt (James H) Park","lat":39.688686,"lng":-104.983132,"surface_type":"Sand","class_category":"PG-NEIGHBORHOOD","year_rehab":"2001","notes":"","source_loc_codes":["824"]},{"n":"Prairie Meadows","lat":39.792414,"lng":-104.892587,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2017","notes":"","source_loc_codes":["576"]},{"n":"Pulaski Park","lat":39.712999,"lng":-104.947451,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2010","notes":"","source_loc_codes":["319"]},{"n":"Quick (Lenore B) Park","lat":39.754426,"lng":-104.974925,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2017","notes":"","source_loc_codes":["220"]},{"n":"Robinson Park","lat":39.719711,"lng":-104.927352,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2021","notes":"Wood Fiber, Poured in Place, Sand, Synthetic Turf","source_loc_codes":["414"]},{"n":"Rocky Mountain Lake Park","lat":39.780753,"lng":-105.030229,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2007","notes":"","source_loc_codes":["007"]},{"n":"Rosamond Park","lat":39.641904,"lng":-104.895049,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2024","notes":"","source_loc_codes":["621"]},{"n":"Ruby Hill Park","lat":39.685306,"lng":-105.00528,"surface_type":"Wood Fiber","class_category":"PG-REGIONAL","year_rehab":"2011","notes":"","source_loc_codes":["827"]},{"n":"Russell Square Park","lat":39.767245,"lng":-104.96166,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2022","notes":"","source_loc_codes":["206"]},{"n":"Sanchez (Paco) Park","lat":39.737216,"lng":-105.031069,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2020","notes":"Poured in place, artificial turf","source_loc_codes":["028"]},{"n":"Sanderson Gulch - Irving & Java","lat":39.687036,"lng":-105.029279,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2010","notes":"","source_loc_codes":["841"]},{"n":"Sanderson Gulch Open Space","lat":39.688145,"lng":-105.02335,"surface_type":"Wood Fiber, Rubberized Surface","class_category":"PG-NEIGHBORHOOD","year_rehab":"1995","notes":"Mexico & Raleigh","source_loc_codes":["828"]},{"n":"Sandhills Prairie","lat":39.79439,"lng":-104.886493,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2017","notes":"Nature Play","source_loc_codes":["581"]},{"n":"Schafer (Martin J) Park","lat":39.768527,"lng":-104.956196,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"1993","notes":"","source_loc_codes":["218"]},{"n":"Silverman (Melvin F) Park","lat":39.785202,"lng":-104.841284,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2012","notes":"","source_loc_codes":["534"]},{"n":"Skyland Park","lat":39.764499,"lng":-104.920847,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2013","notes":"","source_loc_codes":["429"]},{"n":"Sloans Lake Park","lat":39.74696,"lng":-105.044649,"surface_type":"Wood Fiber","class_category":"PG-REGIONAL","year_rehab":"2011","notes":"North","source_loc_codes":["019"]},{"n":"Southmoor Park","lat":39.651426,"lng":-104.905408,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"1992","notes":"","source_loc_codes":["622"]},{"n":"St Charles Place Park","lat":39.769727,"lng":-104.970977,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2019/2021","notes":"Nature Play Element","source_loc_codes":["207"]},{"n":"St Patricks Park","lat":39.763524,"lng":-105.006152,"surface_type":"Sand","class_category":"PG-NEIGHBORHOOD","year_rehab":"1998","notes":"","source_loc_codes":["043"]},{"n":"Stanford & Balsam","lat":39.634932,"lng":-105.09418,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2024","notes":"","source_loc_codes":["181"]},{"n":"Stout Street Childrens Park","lat":39.754564,"lng":-104.982162,"surface_type":"Turf","class_category":"PG-NEIGHBORHOOD","year_rehab":"2022","notes":"synthetic turf surfacing","source_loc_codes":["221"]},{"n":"Sunken Gardens Park","lat":39.729758,"lng":-104.992321,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2000","notes":"","source_loc_codes":["318"]},{"n":"Swansea Park","lat":39.786471,"lng":-104.955257,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2020","notes":"","source_loc_codes":["210"]},{"n":"The Bluffs","lat":39.801502,"lng":-104.877141,"surface_type":"Wood Fiber","class_category":"PG-Community","year_rehab":"2018","notes":"Nature Play Element","source_loc_codes":["589"]},{"n":"Thomas (Fred N) Park","lat":39.751799,"lng":-104.900848,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2018","notes":"","source_loc_codes":["L16"]},{"n":"Town Center","lat":39.78888,"lng":-104.766165,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2007","notes":"","source_loc_codes":["558"]},{"n":"Verbena Park","lat":39.733608,"lng":-104.891565,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2024","notes":"","source_loc_codes":["L18"]},{"n":"Village Place Park","lat":39.777351,"lng":-104.832194,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2004","notes":"","source_loc_codes":["540"]},{"n":"Walker","lat":39.759189,"lng":-104.965176,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2010","notes":"","source_loc_codes":["227"]},{"n":"Wallace (George M) Park","lat":39.628635,"lng":-104.890055,"surface_type":"Sand","class_category":"PG-COMMUNITY","year_rehab":"1999","notes":"","source_loc_codes":["612"]},{"n":"Washington Park","lat":39.698927,"lng":-104.971514,"surface_type":"Wood Fiber, Turf","class_category":"PG-REGIONAL","year_rehab":"2018","notes":"Diagonal","source_loc_codes":["711"]},{"n":"Weir Gulch Marina","lat":39.732137,"lng":-105.01788,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2014","notes":"","source_loc_codes":["917"]},{"n":"Weir Gulch Park","lat":39.719836,"lng":-105.036964,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"1998","notes":"2nd & Newton","source_loc_codes":["836"]},{"n":"West Harvard Gulch","lat":39.670281,"lng":-105.022494,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2020","notes":"Vassar & Decatur","source_loc_codes":["145"]},{"n":"West-Bar-Val-Wood","lat":39.713252,"lng":-105.012212,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2010","notes":"","source_loc_codes":["838"]},{"n":"Westwood Park","lat":39.701245,"lng":-105.050378,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"2018","notes":"Nature Play Element","source_loc_codes":["839"]},{"n":"Whitsell Park","lat":39.772605,"lng":-104.746659,"surface_type":"Wood Fiber","class_category":"PG-COMMUNITY","year_rehab":"2004","notes":"","source_loc_codes":["522"]},{"n":"Williams (Dr Daniel Hale) Park","lat":39.759692,"lng":-104.97128,"surface_type":"Wood Fiber","class_category":"PG-NEIGHBORHOOD","year_rehab":"1992","notes":"","source_loc_codes":["225"]}];

  const denver_slugify = (value) => (
    window.slugifyParkValue
      ? window.slugifyParkValue(value)
      : String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
  );

  const denver_sourceSlugCounts = denver_sourceParks.reduce((acc, park) => {
    const slug = denver_slugify(park.n);
    acc[slug] = (acc[slug] || 0) + 1;
    return acc;
  }, {});

  const denver_sourceByName = denver_sourceParks.reduce((acc, park) => {
    acc[park.n] = park;
    return acc;
  }, {});

  const denver_backgroundParks = denver_sourceParks.map((park) => {
    const denver_baseSlug = denver_slugify(park.n);
    const denver_uniqueSuffix = denver_sourceSlugCounts[denver_baseSlug] > 1
      ? "-" + denver_slugify(`${(park.source_loc_codes || []).join("-")}-${park.lat}-${park.lng}`)
      : "";

    return {
      id: "co-denver-source-" + denver_baseSlug + denver_uniqueSuffix,
      n: park.n,
      a: "",
      ac: 0,
      lat: park.lat,
      lng: park.lng,
      coords_status: "source_centroid",
      f: { playground: 1 },
      photos: [],
      d: "A Denver playground location kept in the background dataset for future city coverage.",
      city: "Denver",
      state: "CO",
      stateName: "Colorado",
      owner: "City and County of Denver",
      sourceCategory: park.class_category || "Playground",
      sourceLink: denver_sourceLink,
      source_name: park.n,
      source_loc_codes: park.source_loc_codes,
      surface_type: park.surface_type,
      year_rehab: park.year_rehab,
      notes: park.notes
    };
  });

  const denver_curatedParks = [
    {
      id: "co-denver-paco-sanchez-park",
      n: "Paco Sánchez Park",
      source_name: "Sanchez (Paco) Park",
      lat: 39.7436,
      lng: -105.0094,
      coords_status: "verified",
      denver_feature_tags: ["playground", "climbing", "slides", "views"],
      d: "A standout Denver park with a big playground, climbing play, slides, and city views.",
      f: { playground: 1 }
    },
    {
      id: "co-denver-central-park-playground",
      n: "Central Park Playground",
      source_name: "Central Park",
      lat: 39.858,
      lng: -104.8895,
      coords_status: "verified",
      denver_feature_tags: ["playground", "splash_pad", "zipline", "open_space"],
      d: "A popular family stop with a playground, splash pad, zipline, and lots of open space.",
      f: { playground: 1, sprayground: 1 }
    },
    {
      id: "co-denver-city-park-nature-play",
      n: "City Park Nature Play",
      source_name: "City Park",
      lat: 39.7479,
      lng: -104.9496,
      coords_status: "verified",
      denver_feature_tags: ["nature_play", "climbing", "unique"],
      d: "A more creative City Park stop with nature play, climbing features, and a one-of-a-kind feel.",
      f: { playground: 1 }
    },
    {
      id: "co-denver-city-park-playground",
      n: "City Park Playground",
      source_name: "City park",
      lat: 39.7485,
      lng: -104.95,
      coords_status: "verified",
      denver_feature_tags: ["playground", "busy", "large"],
      d: "A large City Park playground that stays busy and gives families plenty of room to play.",
      f: { playground: 1 }
    },
    {
      id: "co-denver-central-park",
      n: "Central Park Main Area",
      source_name: "Central Park",
      lat: 39.8585,
      lng: -104.889,
      coords_status: "verified",
      denver_feature_tags: ["playground", "splash_pad", "parking", "open_space"],
      d: "A big Denver park with a playground, splash pad, parking, and room to spread out.",
      f: { playground: 1, sprayground: 1 }
    },
    {
      id: "co-denver-belleview-park",
      n: "Belleview Park",
      lat: 39.6237,
      lng: -105.0086,
      coords_status: "verified",
      denver_feature_tags: ["playground", "shade", "train", "open_space"],
      d: "A family-friendly park with a playground, shade, train rides nearby, and open space.",
      f: { playground: 1 }
    },
    {
      id: "co-denver-crestmoor-park",
      n: "Crestmoor Park Playground",
      source_name: "Crestmoor Park",
      lat: 39.7186,
      lng: -104.9123,
      coords_status: "verified",
      denver_feature_tags: ["playground", "shade", "picnic", "open_space"],
      d: "A neighborhood favorite with a playground, shade, picnic spots, and open space.",
      f: { playground: 1 }
    },
    {
      id: "co-denver-johnson-habitat-park",
      n: "Johnson-Habitat Park",
      source_name: "Johnson-Habitat",
      lat: 39.7053,
      lng: -105.0098,
      coords_status: "verified",
      denver_feature_tags: ["playground", "nature", "climbing"],
      d: "A Denver top pick with a playground, natural feel, and extra climbing play.",
      f: { playground: 1 }
    },
    {
      id: "co-denver-james-a-bible-park",
      n: "James A. Bible Park",
      source_name: "Bible (James A) Park",
      lat: 39.6677,
      lng: -104.9125,
      coords_status: "verified",
      denver_feature_tags: ["playground", "trails", "open_space", "shade"],
      d: "A bigger southeast Denver park with a playground, trails, shade, and open space.",
      f: { playground: 1, trails: 1 }
    }
  ].map((park) => {
    const denver_sourcePark = park.source_name ? denver_sourceByName[park.source_name] : null;
    return {
      a: "",
      ac: 0,
      photos: [],
      city: "Denver",
      state: "CO",
      stateName: "Colorado",
      owner: "City and County of Denver",
      sourceCategory: "Curated Park Pick",
      sourceLink: denver_sourceLink,
      coords_status: denver_sourcePark ? "source_centroid" : "missing",
      lat: denver_sourcePark ? denver_sourcePark.lat : undefined,
      lng: denver_sourcePark ? denver_sourcePark.lng : undefined,
      surface_type: denver_sourcePark ? denver_sourcePark.surface_type : "",
      year_rehab: denver_sourcePark ? denver_sourcePark.year_rehab : "",
      notes: denver_sourcePark ? denver_sourcePark.notes : "",
      source_loc_codes: denver_sourcePark ? denver_sourcePark.source_loc_codes : [],
      ...park
    };
  });

  const denver_allParks = denver_backgroundParks.concat(denver_curatedParks);
  const denver_nameCounts = denver_allParks.reduce((acc, park) => {
    acc[park.n] = (acc[park.n] || 0) + 1;
    return acc;
  }, {});
  const denver_coords = {};
  denver_allParks.forEach((park) => {
    const denver_lat = Number(park.lat);
    const denver_lng = Number(park.lng);
    if (Number.isFinite(denver_lat) && Number.isFinite(denver_lng)) {
      denver_coords[park.id] = [denver_lat, denver_lng];
      if (denver_nameCounts[park.n] === 1) {
        denver_coords[park.n] = [denver_lat, denver_lng];
      }
    }
  });
  window.PARK_COORDS[denver_datasetKey] = denver_coords;

  (window.registerParkDataset || function (_datasetKey, list) { window.PARKS = list; return list; })(
    denver_datasetKey,
    denver_allParks,
    {
      city: "Denver",
      state: "CO",
      stateName: "Colorado",
      brandName: "Find Every Park Colorado"
    }
  );
})();
