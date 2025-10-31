export const maintenanceTreeData = {
  "version": "1.0.0",
  "locale": "nl-NL",
  "entry": "start",
  "meta": {
    "name": "Onderhoudsboom — Ongepland (Tenant-Ready)",
    "notes": "Symptoom-gestuurd. Start bevat extra gas-snelkoppeling. Zoekbalk werkt op basis van aliases; eindbladeren geven issue.v1.* codes terug.",
    "bins": [
      "lekkage",
      "afvoer_riolering",
      "verwarming_warmwater",
      "stroom_elektra",
      "deuren_sloten_toegang",
      "ramen_kozijnen_glas",
      "dak_gevel_balkon",
      "ventilatie_schimmel_ongedierte",
      "apparaten",
      "rookmelder_comelder"
    ]
  },
  "nodes": [
    {
      "id": "start",
      "type": "menu",
      "title": "Kies uw probleem",
      "options": [
        { "label": "Lekkage", "next": "cat.lekkage", "aliases": ["lekkage","waterlek","lek","plafond druppelt","water komt binnen","vochtplek","nat","daklekkage","buren lek"] },
        { "label": "Afvoer & Riolering", "next": "cat.afvoer", "aliases": ["verstopping","afvoer","riool","rioollucht","wc verstopt","toilet verstopt","gootsteen verstopt","putje"] },
        { "label": "Verwarming of géén warm water", "next": "cat.verwarming", "aliases": ["verwarming","cv","ketel","radiator koud","geen warmte","geen warm water","boiler","thermostaat"] },
        { "label": "Stroom of elektra", "next": "cat.stroom", "aliases": ["stroom","elektra","stroomstoring","stroom uit","aardlek","kortsluiting","groepenkast","stoppen","zekering"] },
        { "label": "Deuren, Ramen, sloten & toegang", "next": "cat.deuren", "aliases": ["deur","slot","sleutel","balkondeur","schuifpui","dranger","toegang","portiekdeur","garagepoort","hek","raam","kozijn","glas","ruit","espagnolet","sluiting","tocht","kit","dakraam","schuifraam"] },
        { "label": "Dak of gevel", "next": "cat.dak", "aliases": ["dak","gevel","dakgoot","regenpijp","balkon","lichtkoepel","daklekkage","voegwerk","scheur"] },
        { "label": "Ventilatie, schimmel & ongedierte", "next": "cat.vent", "aliases": ["ventilatie","afzuiging","wtw","mechanische ventilatie","schimmel","vocht","stank","geur","muizen","ongedierte","insecten","duiven"] },
        { "label": "Witgoed/Keukenapparatuur ", "next": "cat.apparaten", "aliases": ["apparaat","vaatwasser","oven","fornuis","kookplaat","inductie","koelkast","vriezer","wasmachine","droger","afzuigkap","airco","boiler"] },
        { "label": "Rook- of CO-melder", "next": "cat.stroom.smoke", "aliases": ["rookmelder","co-melder","brandmelder","koolmonoxide","piept","batterij"] },
        { "label": "Ruikt u gas?", "next": "issue.emergency", "aliases": ["gas","gaslucht","ruikt gas","gaskraan","co","koolmonoxide gas"] }
      ]
    },

    /* ---------------- LEKKAGE ---------------- */
    {
      "id": "cat.lekkage",
      "type": "menu",
      "title": "Lekkage",
      "options": [
        { "label": "Plafond, Dak of Muren", "next": "issue.v1.leakage.ceiling_wall_roof.combined", "aliases": ["plafond","dak","muur","muren","plafond vlek","plafond druppelt","dak lekt","bovenburen lek","muur nat","vochtplek muur","plafondlekkage","daklekkage"] },
        { "label": "Gevel (incl. Ramen)", "next": "cat.lekkage.gevel_ramen", "aliases": ["gevel","raam","ramen","kozijn","inregenen","gevel lekt","buitenmuur nat","raam lekt","kozijn lekt","voegwerk","scheur gevel"] },
        { "label": "CV en radiatoren", "next": "cat.lekkage.cv_radiatoren", "aliases": ["cv","radiator","radiatoren","verwarming","cv-lek","leiding lekt","cv leiding lekt","radiator lekt","verwarmingsleiding"] },
        { "label": "Wasbak, afvoer, of toilet", "next": "cat.lekkage.wasbak_afvoer_toilet", "aliases": ["wasbak","afvoer","toilet","wc","gootsteen","spoelbak","wastafel","sifon","afvoerpijp","rioolpijp","douche","bad","doucheputje"] },
        { "label": "Kranen", "next": "issue.v1.leakage.tap.combined", "aliases": ["kraan","kranen","mengkraan","thermostaatkraan","keukenkraan","badkamerkraan","kraan lekt","kraan drupt"] },
        { "label": "Apparaten (wasmachine of vaatwasser)", "next": "issue.v1.leakage.appliances.combined", "aliases": ["apparaat","apparaten","wasmachine","vaatwasser","afwasmachine","slang","aansluiting","aquastop","toevoerslang","afvoerslang"] }
      
        // Commented out original options - will be reconnected later
        // { "label": "Badkamer", "next": "cat.lekkage.badkamer", "aliases": ["badkamer lekkage","douche lekt","bad lekt","kit badkamer","voegen badkamer"] },
        // { "label": "Keuken", "next": "cat.lekkage.keuken", "aliases": ["keuken lekkage","gootsteen lekt","spoelbak lekt","vaatwasser lekt"] },
        // { "label": "Plafond of dak", "next": "cat.lekkage.plafond_dak", "aliases": ["plafond vlek","plafond druppelt","dak lekt","bovenburen lek"] },
        // { "label": "Ramen of gevel", "next": "cat.lekkage.ramen_gevel", "aliases": ["raam lekt","kozijn lekt","inregenen","gevel lekt","buitenmuur nat"] },
        // { "label": "Radiator of leiding lekt", "next": "issue.v1.heating.radiator.leak", "aliases": ["radiator lekt","cv-lek","leiding lekt","cv leiding lekt"] },
        // { "label": "Lekkage van leiding of slang (toevoerwater)", "next": "issue.v1.water.supply.hose_leak", "aliases": ["toevoer","waterslang","inlaat","aansluitslang","aquastop","koud water slang"] },
        // { "label": "Lekkage uit afvoer of pijp (afvoerwater)", "next": "issue.v1.drainage.pipe.leak", "aliases": ["afvoer lekt","pvc lekt","sifon lekt","rioolpijp lekt"] },
        // { "label": "Geen water (hele woning)", "next": "issue.v1.water.supply.no_water", "aliases": ["geen water","waterstoring","kraan doet niets","water uit"] },
        // { "label": "Lage waterdruk", "next": "issue.v1.water.supply.low_pressure", "aliases": ["lage druk","zwakke straal","weinig water","drukprobleem"] }
      ]
    },
    {
      "id": "cat.lekkage.badkamer",
      "type": "menu",
      "title": "Lekkage — Badkamer",
      "options": [
        { "label": "Onder wastafel", "next": "issue.v1.leakage.bathroom.sink_cabinet", "aliases": ["wastafel","onderkastje","sifon","wastafelkastje","fontein lekt"] },
        { "label": "Toilet of stortbak", "next": "issue.v1.leakage.bathroom.toilet_cistern", "aliases": ["toilet lekt","wc lekt","stortbak","reservoir","wc"] },
        { "label": "Douche, bad of afvoerput", "next": "issue.v1.leakage.bathroom.shower_bath_drain", "aliases": ["doucheputje","douchegoot","bad lekt","kit douche","voegen douche","afvoerput"] },
        { "label": "Kraan lekt of defect", "next": "issue.v1.tap.bathroom.leak_or_fault", "aliases": ["kraan badkamer","mengkraan","thermostaatkraan","kraan lekt"] }
      ]
    },
    {
      "id": "cat.lekkage.keuken",
      "type": "menu",
      "title": "Lekkage — Keuken",
      "options": [
        { "label": "Onder gootsteen", "next": "issue.v1.leakage.kitchen.sink_cabinet", "aliases": ["gootsteen","spoelbak","gootsteenkastje","sifon keuken"] },
        { "label": "Aansluiting vaatwasser of wasmachine", "next": "issue.v1.leakage.kitchen.appliance_connection", "aliases": ["vaatwasser slang","inlaatkraan","afvoerslang","wasmachine aansluiting"] },
        { "label": "Kraan lekt of defect", "next": "issue.v1.tap.kitchen.leak_or_fault", "aliases": ["keukenkraan","mengkraan keuken","kraan lekt","kraan drupt"] }
      ]
    },
    {
      "id": "cat.lekkage.ramen_gevel",
      "type": "menu",
      "title": "Lekkage — Ramen of gevel",
      "options": [
        { "label": "Rond kozijn", "next": "issue.v1.window.leak_perimeter", "aliases": ["raam lekt","kozijn lekt","inregenen","langs raam"] },
        { "label": "Buitenmuur", "next": "issue.v1.facade.wall.leak", "aliases": ["gevel lekt","natte muur","voegwerk","scheur metselwerk"] }
      ]
    },
    {
      "id": "cat.lekkage.gevel_ramen",
      "type": "menu",
      "title": "Lekkage — Gevel (incl. Ramen)",
      "options": [
        { "label": "Kozijn of rond het kozijn", "next": "issue.v1.window.leak_perimeter", "aliases": ["kozijn","rond kozijn","raam lekt","kozijn lekt","inregenen","langs raam","rondom raam"] },
        { "label": "Buitenmuur", "next": "issue.v1.facade.wall.leak", "aliases": ["buitenmuur","gevel lekt","natte muur","voegwerk","scheur metselwerk","gevel"] }
      ]
    },
    {
      "id": "cat.lekkage.wasbak_afvoer_toilet",
      "type": "menu",
      "title": "Lekkage — Wasbak, afvoer, of toilet",
      "options": [
        { "label": "Wasbak", "next": "issue.v1.leakage.sink.combined", "aliases": ["wasbak","wastafel","gootsteen","spoelbak","sifon"] },
        { "label": "Toilet", "next": "issue.v1.leakage.toilet.combined", "aliases": ["toilet","wc","stortbak","closet"] },
        { "label": "Badkamer/douche", "next": "issue.v1.leakage.shower.combined", "aliases": ["badkamer","douche","doucheputje","bad","mengkraan"] },
        { "label": "Apparaat", "next": "issue.v1.leakage.appliance.combined", "aliases": ["apparaat","wasmachine","vaatwasser","slang"] },
        { "label": "Keukenafvoer", "next": "issue.v1.leakage.kitchen_drain.combined", "aliases": ["keuken afvoer","gootsteen afvoer","spoelbak afvoer"] } 
      ]
    },

    /* ---------------- AFVOER & RIOLERING ---------------- */
    {
      "id": "cat.afvoer",
      "type": "menu",
      "title": "Afvoer & Riolering",
      "options": [
        { "label": "Toilet verstopt", "next": "issue.v1.drainage.toilet.blocked", "aliases": ["toilet verstopt","wc verstopt","wc","closet verstopt"] },
        { "label": "Douche of bad verstopt", "next": "issue.v1.drainage.bath_shower.blocked", "aliases": ["douche verstopt","bad verstopt","doucheputje verstopt","douchegoot","putje verstopt"] },
        { "label": "Wastafel verstopt (badkamer)", "next": "issue.v1.drainage.bathroom_sink.blocked", "aliases": ["wastafel verstopt","fontein verstopt","afvoer wastafel"] },
        { "label": "Gootsteen verstopt (keuken)", "next": "issue.video", "aliases": ["gootsteen verstopt","spoelbak verstopt","afvoer keuken"] },
        { "label": "Wasmachine-afvoer verstopt", "next": "issue.v1.drainage.washing_machine.blocked", "aliases": ["wasmachine afvoer verstopt","afvoerslang verstopt","overstroom wasmachine"] },
        { "label": "Vloerput of balkonafvoer verstopt", "next": "issue.v1.drainage.floor_or_balcony.blocked", "aliases": ["vloerput verstopt","balkon afvoer","putje balkon"] },
        { "label": "Standleiding verstopt (gemeenschappelijk)", "next": "issue.v1.drainage.riser.common.blocked", "aliases": ["standleiding","hoofdriool","meerdere verdiepingen verstopt","gemeenschappelijke afvoer"] },
        { "label": "Rioollucht in woning", "next": "issue.v1.odor.sewer_indoor", "aliases": ["rioollucht","stank","riool stank","vieze lucht"] }
      ]
    },

    /* ---------------- VERWARMING & WARM WATER ---------------- */
    {
      "id": "cat.verwarming",
      "type": "menu",
      "title": "Verwarming of géén warm water",
      "options": [
        { "label": "Geen verwarming (radiatoren koud)", "next": "issue.v1.heating.no_heat", "aliases": ["geen verwarming","cv werkt niet","radiator koud","kamer koud"] },
        { "label": "Geen warm water (kraan of douche)", "next": "issue.v1.heating.no_hot_water", "aliases": ["geen warm water","douche koud","kraan koud","boiler warm water weg"] },
        { "label": "Radiator", "next": "cat.verwarming.radiator", "aliases": ["radiator probleem","radiator","cv radiator"] },
        { "label": "Ketel of boiler", "next": "cat.verwarming.ketel", "aliases": ["ketel","cv-ketel","boiler","cv storing"] },
        { "label": "Thermostaat", "next": "cat.verwarming.thermostaat", "aliases": ["thermostaat","klokthermostaat","slim thermostaat","honeywell","nest"] },
        { "label": "Blokverwarming (centrale installatie)", "next": "issue.v1.heating.district_or_block", "aliases": ["blokverwarming","centrale verwarming","stadsverwarming blok"] },
        { "label": "Vloerverwarming", "next": "issue.v1.heating.floor_heating.issue", "aliases": ["vloerverwarming","vloer warmt niet op","verdeler"] }
      ]
    },
    {
      "id": "cat.verwarming.radiator",
      "type": "menu",
      "title": "Radiator",
      "options": [
        { "label": "Wordt niet warm", "next": "issue.v1.heating.radiator.no_heat", "aliases": ["radiator koud","radiator wordt niet warm","ontluchten nodig"] },
        { "label": "Lekt", "next": "issue.v1.heating.radiator.leak", "aliases": ["radiator lekt","lekkage radiator","cv lek"] },
        { "label": "Los van de muur", "next": "issue.v1.heating.radiator.loose", "aliases": ["radiator los","beugel los","radiator hangt los"] },
        { "label": "Ventiel of kraan vast", "next": "issue.v1.heating.radiator.valve_stuck", "aliases": ["radiatorkraan vast","ventiel vast","kraan draait niet"] }
      ]
    },
    {
      "id": "cat.verwarming.ketel",
      "type": "menu",
      "title": "Ketel of boiler",
      "options": [
        { "label": "Foutmelding", "next": "issue.v1.heating.boiler.error", "aliases": ["ketel storing","errorcode","storingcode","ketel fout"] },
        { "label": "Druk te laag", "next": "issue.v1.heating.boiler.low_pressure", "aliases": ["druk te laag","vullen ketel","onder 1.0 bar","keteldruk"] },
        { "label": "Valt uit door aardlek", "next": "issue.v1.electrical.rcd.trip", "aliases": ["aardlek ketel","rcd trip","groep valt uit","aardlekschakelaar"] }
      ]
    },
    {
      "id": "cat.verwarming.thermostaat",
      "type": "menu",
      "title": "Thermostaat",
      "options": [
        { "label": "Display uit of batterij leeg", "next": "issue.v1.heating.thermostat.power", "aliases": ["thermostaat uit","batterij leeg","display dood"] },
        { "label": "Reageert niet of geen verbinding", "next": "issue.v1.heating.thermostat.control", "aliases": ["thermostaat reageert niet","geen verbinding","app werkt niet"] }
      ]
    },

    /* ---------------- STROOM / ELEKTRA ---------------- */
    {
      "id": "cat.stroom",
      "type": "menu",
      "title": "Stroom of elektra",
      "options": [
        { "label": "Geheel geen elektra", "next": "issue.v1.electrical.whole_home.outage", "aliases": ["stroom uit","geen stroom","hele huis zonder stroom","algemene storing"] },
        { "label": "Gedeeltelijk geen elektra", "next": "issue.v1.electrical.circuit.breaker_trip", "aliases": ["zekering valt uit","stop slaat door","groep valt uit","automaat klapt"] },
        ///{ "label": "Aardlekschakelaar springt", "next": "issue.v1.electrical.rcd.trip", "aliases": ["aardlek","aardlekschakelaar","rcd trip","differentieel"] },
        ///{ "label": "Lampen doen het niet", "next": "issue.v1.electrical.lighting.room_issue", "aliases": ["lamp stuk","verlichting","lamp doet het niet","armatuur"] },
        ///{ "label": "Stopcontact werkt niet", "next": "issue.v1.electrical.outlet.not_working", "aliases": ["stopcontact kapot","wandcontactdoos","contactdoos werkt niet"] },
        ///{ "label": "Gemeenschappelijke verlichting", "next": "issue.v1.electrical.lighting.common_area", "aliases": ["gang verlichting","portiek verlichting","garage verlichting","buitenlamp"] },
        ///{ "label": "Meterkast (automaten)", "next": "issue.v1.electrical.meter_cabinet.issue", "aliases": ["meterkast","groepenkast","automaten","hoofdschakelaar"] },
        ///{ "label": "Rook- of CO-melder", "next": "cat.stroom.smoke", "aliases": ["rookmelder","co-melder","brandmelder","koolmonoxide","piept","batterij"] },
        ///{ "label": "Intercom en deuropener", "next": "cat.stroom.intercom", "aliases": ["intercom","bellentableau","videofoon","deurbel","buzzer","deuropener"] }
      ]
    },
    {
      "id": "cat.stroom.smoke",
      "type": "menu",
      "title": "Rook- of CO-melder",
      "options": [
        { "label": "Rookmelder", "next": "cat.smoke.rookmelder", "aliases": ["rookmelder","brandmelder","rook detector"] },
        { "label": "CO-melder", "next": "cat.smoke.co_melder", "aliases": ["co-melder","koolmonoxide melder","co detector"] }
      ]
    },
    {
      "id": "cat.smoke.rookmelder",
      "type": "menu",
      "title": "Rookmelder",
      "options": [
        { "label": "Melder in het gehuurde pand", "next": "cat.smoke.rookmelder.gehuurde", "aliases": ["eigen woning","in huis","binnen"] },
        { "label": "Melder in algemene ruimte/trappenhuis", "next": "cat.smoke.rookmelder.algemeen", "aliases": ["trappenhuis","gang","portiek","algemene ruimte"] },
        { "label": "Melder bij de buren", "next": "cat.smoke.rookmelder.buren", "aliases": ["buren","naast","buurman","buurvrouw"] }
      ]
    },
    {
      "id": "cat.smoke.rookmelder.gehuurde",
      "type": "menu",
      "title": "Melder in het gehuurde pand",
      "options": [
        { "label": "Geeft periodiek een signaal", "next": "issue.v1.smoke.battery_replace", "aliases": ["piept","batterij","signaal","twee piepjes"] },
        { "label": "Gaat af als alarm", "next": "issue.v1.smoke.fire_alarm", "aliases": ["alarm","brand","gaat af","continu geluid"] }
      ]
    },
    {
      "id": "cat.smoke.rookmelder.algemeen",
      "type": "menu",
      "title": "Melder in algemene ruimte/trappenhuis",
      "options": [
        { "label": "Geeft periodiek een signaal", "next": "issue.v1.smoke.battery_replace", "aliases": ["piept","batterij","signaal","twee piepjes"] },
        { "label": "Gaat af als alarm", "next": "issue.v1.smoke.fire_alarm", "aliases": ["alarm","brand","gaat af","continu geluid"] }
      ]
    },
    {
      "id": "cat.smoke.rookmelder.buren",
      "type": "menu",
      "title": "Melder bij de buren",
      "options": [
        { "label": "Is de woning bewoond?", "next": "cat.smoke.buren.bewoond", "aliases": ["bewoond","iemand thuis","bewoners"] }
      ]
    },
    {
      "id": "cat.smoke.buren.bewoond",
      "type": "menu",
      "title": "Is de woning bewoond?",
      "options": [
        { "label": "JA - heeft u de buren zelf al benaderd?", "next": "issue.v1.smoke.buren_contact", "aliases": ["ja","bewoond","aangeklopt","contact"] },
        { "label": "NEE - om welke buren gaat het?", "next": "issue.v1.smoke.buren_info", "aliases": ["nee","niet bewoond","leeg","huisnummer"] }
      ]
    },
    {
      "id": "cat.smoke.co_melder",
      "type": "menu",
      "title": "CO-melder",
      "options": [
        { "label": "Geeft periodiek een signaal", "next": "issue.v1.smoke.battery_replace", "aliases": ["piept","batterij","signaal","twee piepjes"] },
        { "label": "Gaat af als alarm", "next": "issue.v1.co.alarm", "aliases": ["alarm","co alarm","koolmonoxide","gaat af"] }
      ]
    },
    {
      "id": "cat.stroom.intercom",
      "type": "menu",
      "title": "Intercom en deuropener",
      "options": [
        { "label": "Bel (Intercom)", "next": "issue.v1.intercom.video_with_door_opener", "aliases": ["video intercom","geen beeld intercom","camera intercom"] },
        { "label": "Intercom en deuropener", "next": "issue.v1.intercom.bel", "aliases": ["intercom geen geluid","spreekinstallatie kapot","microfoon intercom"] },
        { "label": "Video Intercom met Deuropener", "next": "issue.v1.intercom.video_with_door_opener", "aliases": ["video intercom","geen beeld intercom","camera intercom"] }
      ]
    },

    /* ---------------- DEUREN / RAMEN / SLOTEN / TOEGANG ---------------- */
    {
      "id": "cat.deuren",
      "type": "menu",
      "title": "Deuren, Ramen, Sloten & Toegang",
      "options": [
        { "label": "Deuren", "next": "issue.v1.doors.general", "aliases": ["deur","voordeur","achterdeur","woningdeur","huisdeur","binnendeur","kamerdeur","balkondeur","schuifpui","pui","portiekdeur","entree deur","algemene deur","garagepoort","hek","toegangspoort","schuifhek","berging","box","fietsenstalling","lift","elevator"] },
        { "label": "Ramen", "next": "issue.ramen_kozijnen_glas", "aliases": ["raam","raam vast","raam opent niet","raam sluit niet","espagnolet","raam sluiting","raamklink stuk","tocht","kit vervangen","rubbers slecht","kieren","glas kapot","barst in ruit","ruitschade","raam lekt","kozijn lekt","inregenen raam","dakraam","velux","lichtkoepel","schuifraam","balkonraam","pui raam"] },
        { "label": "Sloten", "next": "issue.deuren_sloten", "aliases": ["slot","sleutel","cilinder","slot kapot","cilinder stuk","kan niet op slot","sleutel draait niet","sleutel kwijt","sleutel afgebroken","buitengesloten"] },
        { "label": "Intercom", "next": "cat.stroom.intercom", "aliases": ["intercom","bellentableau","deurbel","buzzer","videofoon","spreekinstallatie","deuropener"] }
        
        // Commented out original options - will be reconnected later
        // { "label": "Woningdeur (voor of achter)", "next": "cat.deuren.woningdeur", "aliases": ["voordeur","achterdeur","woningdeur","huisdeur"] },
        // { "label": "Binnendeur", "next": "cat.deuren.binnendeur", "aliases": ["binnendeur","kamerdeur"] },
        // { "label": "Balkondeur of schuifpui", "next": "cat.deuren.balkon", "aliases": ["balkondeur","schuifpui","pui"] },
        // { "label": "Entree of portiekdeur (gemeenschappelijk)", "next": "cat.deuren.portiek", "aliases": ["portiekdeur","entree deur","algemene deur"] },
        // { "label": "Garage of poort", "next": "cat.deuren.poort", "aliases": ["garagepoort","hek","toegangspoort","schuifhek"] },
        // { "label": "Berging of fietsenstalling", "next": "cat.deuren.berging", "aliases": ["berging","box","fietsenstalling"] },
        // { "label": "Lift", "next": "cat.deuren.lift", "aliases": ["lift","elevator"] },
        // { "label": "Intercom en bellentableau", "next": "cat.stroom.intercom", "aliases": ["intercom","bellentableau","deurbel","buzzer"] },
        // { "label": "Raam gaat niet open of dicht", "next": "issue.v1.windows.open_close_issue", "aliases": ["raam vast","raam opent niet","raam sluit niet"] },
        // { "label": "Sluiting of espagnolet defect", "next": "issue.v1.windows.locking_mechanism_fault", "aliases": ["espagnolet","raam sluiting","raamklink stuk"] },
        // { "label": "Tocht of versleten kit", "next": "issue.v1.windows.draught_or_sealant", "aliases": ["tocht","kit vervangen","rubbers slecht","kieren"] },
        // { "label": "Glasbreuk of barst", "next": "issue.v1.windows.glass.breakage", "aliases": ["glas kapot","barst in ruit","ruitschade"] },
        // { "label": "Lek rondom raam (water)", "next": "issue.v1.window.leak_perimeter", "aliases": ["raam lekt","kozijn lekt","inregenen raam"] },
        // { "label": "Dakraam", "next": "issue.v1.roof_window.issue", "aliases": ["dakraam","velux","lichtkoepel"] },
        // { "label": "Balkonraam of schuifpui", "next": "issue.v1.windows.balcony_slider.issue", "aliases": ["schuifraam","balkonraam","pui raam"] }
      ]
    },
    {
      "id": "cat.deuren.woningdeur",
      "type": "menu",
      "title": "Woningdeur (voor of achter)",
      "options": [
        { "label": "Sluit niet goed", "next": "issue.v1.doors.apartment.close_issue", "aliases": ["deur sluit niet","klemt","loopt aan","afstellen deur"] },
        { "label": "Niet op slot / cilinder defect", "next": "issue.v1.doors.apartment.lock_cylinder_issue", "aliases": ["slot kapot","cilinder stuk","kan niet op slot","sleutel draait niet"] },
        { "label": "Sleutel kwijt of afgebroken", "next": "issue.v1.doors.apartment.key_lost_or_broken", "aliases": ["sleutel kwijt","sleutel afgebroken","buitengesloten"] },
        { "label": "Deurdranger kapot", "next": "issue.v1.doors.apartment.door_closer_fault", "aliases": ["dranger kapot","deur slaat dicht","deur valt dicht"] }
      ]
    },
    {
      "id": "cat.deuren.binnendeur",
      "type": "menu",
      "title": "Binnendeur",
      "options": [
        { "label": "Scharniert niet goed", "next": "issue.v1.doors.internal.hinge_issue", "aliases": ["scharnier kraakt","deur hangt scheef","scharnier kapot"] },
        { "label": "Sluit niet", "next": "issue.v1.doors.internal.close_issue", "aliases": ["valt niet in het slot","deur blijft open","slotje werkt niet"] }
      ]
    },
    {
      "id": "cat.deuren.balkon",
      "type": "menu",
      "title": "Balkondeur of schuifpui",
      "options": [
        { "label": "Loopt stroef", "next": "issue.v1.doors.balcony.slider_stiff", "aliases": ["schuifpui stroef","deurrails","loopt zwaar"] },
        { "label": "Sluit niet", "next": "issue.v1.doors.balcony.slider_close_issue", "aliases": ["schuifpui sluit niet","pui sluit niet","afstelling schuifpui"] }
      ]
    },
    {
      "id": "cat.deuren.portiek",
      "type": "menu",
      "title": "Entree of portiekdeur (gemeenschappelijk)",
      "options": [
        { "label": "Deur sluit niet", "next": "issue.v1.doors.common.entrance_close_issue", "aliases": ["portiekdeur sluit niet","algemene deur open","deur blijft open"] },
        { "label": "Deuropener werkt niet", "next": "issue.v1.doors.common.door_opener_fault", "aliases": ["buzzer werkt niet","magneten deur","elektrisch slot"] }
      ]
    },
    {
      "id": "cat.deuren.poort",
      "type": "menu",
      "title": "Garage of poort",
      "options": [
        { "label": "Poort opent niet of blijft open", "next": "issue.v1.access.gate.not_opening_or_stays_open", "aliases": ["poort opent niet","poort blijft open","hek werkt niet"] },
        { "label": "Pas of afstandsbediening werkt niet", "next": "issue.v1.access.gate.badge_or_remote_issue", "aliases": ["fob werkt niet","tag werkt niet","afstandsbediening kapot","pasje"] },
        { "label": "Verlichting parkeergarage defect", "next": "issue.v1.electrical.lighting.common_area", "aliases": ["garage verlichting","parkeergarage lamp","ganglamp garage"] }
      ]
    },
    {
      "id": "cat.deuren.berging",
      "type": "menu",
      "title": "Berging of fietsenstalling",
      "options": [
        { "label": "Deur of slot defect", "next": "issue.v1.doors.storage.lock_issue", "aliases": ["berging slot","box deur","fietsenstalling deur","hangslot"] }
      ]
    },
    {
      "id": "cat.deuren.lift",
      "type": "menu",
      "title": "Lift",
      "options": [
        { "label": "Lift staat stil", "next": "issue.v1.lift.stuck", "aliases": ["lift blijft staan","lift doet het niet","lift vast"] },
        { "label": "Deuren openen of sluiten niet", "next": "issue.v1.lift.door_issue", "aliases": ["liftdeuren","deuren lift","lift deur storingen"] },
        { "label": "Alarm of spreekverbinding werkt niet", "next": "issue.v1.lift.alarm_comms_fault", "aliases": ["lift alarm","spreekluister lift","intercom lift"] },
        { "label": "Storingsmelding", "next": "issue.v1.lift.error_code", "aliases": ["lift storing","error lift","storingcode lift"] }
      ]
    },

    /* ---------------- DAK OF GEVEL ---------------- */
    {
      "id": "cat.dak",
      "type": "menu",
      "title": "Dak of gevel",
      "options": [
        { "label": "Daklekkage (plat of schuin)", "next": "issue.v1.roof.leak", "aliases": ["daklekkage","dak lekt","nat plafond","bitumen lek"] },
        { "label": "Dakraam of lichtkoepel defect", "next": "issue.v1.roof_window.issue", "aliases": ["dakraam","lichtkoepel","koepel lek","velux"] },
        { "label": "Dakgoot verstopt of beschadigd", "next": "issue.v1.roof.gutter.blocked_or_damaged", "aliases": ["dakgoot verstopt","goot loopt over","goot kapot"] },
        { "label": "Regenpijp verstopt of los", "next": "issue.v1.roof.downpipe.blocked_or_loose", "aliases": ["regenpijp verstopt","hwa verstopt","regenpijp los"] },
        { "label": "Balkon — vloer of afvoerput defect", "next": "issue.v1.balcony.floor_or_drain.issue", "aliases": ["balkon putje","balkon afvoer","balkon vloer probleem"] },
        { "label": "Balkon — afdichting of afwerking beschadigd", "next": "issue.v1.balcony.finish_or_seal.damage", "aliases": ["balkon afdichting","balkon kit","balkon lekkage"] },
        { "label": "Gevel met scheur, voegwerk of lekkage", "next": "issue.v1.facade.masonry_crack_or_leak", "aliases": ["gevel scheur","voegwerk kapot","natte gevel"] },
        { "label": "Terras of dakdoorvoer", "next": "issue.v1.roof.terrace_or_penetration.issue", "aliases": ["dakdoorvoer","doorvoer lek","dakterras probleem"] }
      ]
    },

    /* ---------------- VENTILATIE, SCHIMMEL & ONGEDIERTE ---------------- */
    {
      "id": "cat.vent",
      "type": "menu",
      "title": "Ventilatie, schimmel & ongedierte",
      "options": [
        { "label": "Ventilatie maakt lawaai", "next": "issue.v1.ventilation.noisy", "aliases": ["ventilatie lawaai","bromt","zoemt","herrie ventilatie"] },
        { "label": "Ventilatie werkt niet", "next": "issue.v1.ventilation.unit_failure", "aliases": ["ventilatie kapot","mechanische ventilatie","wtw werkt niet"] },
        { "label": "Afzuigkap werkt niet", "next": "issue.v1.appliance.hob_or_hood.fault", "aliases": ["afzuigkap","keuken afzuiging","kap doet het niet","motor kapot"] },
        { "label": "Schimmel of vochtplekken", "next": "issue.v1.indoor_air.mould_or_damp", "aliases": ["schimmel","vochtplek","condens","muffe geur"] },
        { "label": "Stank of rioollucht", "next": "issue.v1.odor.sewer_indoor", "aliases": ["rioollucht","stank in huis","riool stank"] },
        { "label": "Slechte luchtcirculatie", "next": "issue.v1.indoor_air.poor_circulation", "aliases": ["benauwd","geen ventilatie","weinig lucht"] },
        { "label": "Muizen of ratten", "next": "issue.v1.pest.rodents", "aliases": ["muizen","ratten","knaagdieren"] },
        { "label": "Insecten (mieren, kakkerlakken, wespen)", "next": "issue.v1.pest.insects", "aliases": ["insecten","mieren","kakkerlakken","wespen","zilvervisjes"] },
        { "label": "Duiven of vogels", "next": "issue.v1.pest.birds", "aliases": ["duiven","vogels","meeuwen","overlast vogels"] },
        { "label": "Afval of containers (gemeenschappelijk)", "next": "issue.v1.waste.containers.issue", "aliases": ["container vol","container kapot","afval","vuilnisbak"] }
      ]
    },

    /* ---------------- APPARATEN ---------------- */
    {
      "id": "cat.apparaten",
      "type": "menu",
      "title": "Apparaten (wasmachine of vaatwasser)",
      "options": [
        { "label": "Vaatwasser", "next": "issue.uw_responsabilitya", "aliases": ["keukenapparaat","vaatwasser","oven","fornuis","kookplaat","inductie","koelkast","vriezer","wasmachine","droger","afzuigkap","airco","boiler"] },
        { "label": "Oven", "next": "issue.uw_responsabilityb", "aliases": ["witgoed","wasmachine","droger"] },
        { "label": "Inbouw Koelkast", "next": "issue.uw_responsabilityc", "aliases": ["airco","ventilatie unit","wtw"] },
        { "label": "Inbouw Vriezer", "next": "issue.uw_responsabilityd", "aliases": ["aardlek door apparaat","rcd valt","aardlek trip","stroom valt uit bij apparaat"] },
        { "label": "Inbouw Koel/vries combi", "next": "issue.uw_responsabilitye", "aliases": ["aardlek door apparaat","rcd valt","aardlek trip","stroom valt uit bij apparaat"] },
        { "label": "Vrijstaande koelkast/vriezer/koel vries combi", "next": "issue.uw_responsabilityf", "aliases": ["aardlek door apparaat","rcd valt","aardlek trip","stroom valt uit bij apparaat"] }     
      ]
    },
    {
      "id": "cat.apparaten.keuken",
      "type": "menu",
      "title": "Keukenapparatuur",
      "options": [
        { "label": "Vaatwasser defect", "next": "issue.v1.appliance.dishwasher.fault", "aliases": ["vaatwasser","afwasmachine","dishwasher kapot","lekkage vaatwasser"] },
        { "label": "Koelkast of vriezer defect", "next": "issue.v1.appliance.fridge_freezer.fault", "aliases": ["koelkast","vriezer","koelvries","diepvries kapot"] },
        { "label": "Oven of fornuis defect", "next": "issue.v1.appliance.oven_or_cooker.fault", "aliases": ["oven","fornuis","gasfornuis","elektrisch fornuis","oven werkt niet"] },
        { "label": "Kookplaat of afzuigkap defect", "next": "issue.v1.appliance.hob_or_hood.fault", "aliases": ["kookplaat","inductie","keramisch","afzuigkap","plaat werkt niet"] }
      ]
    },
    {
      "id": "cat.apparaten.witgoed",
      "type": "menu",
      "title": "Witgoed",
      "options": [
        { "label": "Wasmachine defect", "next": "issue.v1.appliance.washing_machine.fault", "aliases": ["wasmachine","wasmachine kapot","filter verstopt","pompt niet af"] },
        { "label": "Droger defect", "next": "issue.v1.appliance.dryer.fault", "aliases": ["droger","droogt niet","droger kapot","luchtafvoer droger"] }
      ]
    },
    {
      "id": "cat.apparaten.klimaat",
      "type": "menu",
      "title": "Klimaatinstallaties",
      "options": [
        { "label": "Airco defect", "next": "issue.v1.appliance.aircon.fault", "aliases": ["airco","ac","airconditioning kapot","koelt niet"] },
        { "label": "Mechanische ventilatie-unit defect", "next": "issue.v1.ventilation.unit_failure", "aliases": ["mechanische ventilatie","wtw","ventilatie box","unit kapot"] }
      ]
    }
  ]
} as const;
