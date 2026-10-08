/* ============================================================
   VRAGEN — mode 'c' = kernvraag (snel), 'e' = alleen uitgebreid
   types: cards (1 keuze, door), multi (max n), slider
   ============================================================ */
const QUESTIONS = [
/* ---- 1. Wat zoek je? ---- */
{ id:"doel", mode:"c", type:"cards", sec:"Wat zoek je?",
  title:"Wat hoop je dat een vogel aan je leven toevoegt?",
  opts:[
    {v:"maatje", e:"🫶", t:"Een maatje dat naar me toe komt", s:"Op mijn hand of schouder, en samen dingen doen"},
    {v:"samen", e:"🤝", t:"Samen dingen doen, zonder geknuffel", s:"Trainen en spelen; op schoot zitten hoeft niet"},
    {v:"kijken", e:"🔭", t:"Kijken en luisteren", s:"Leven in huis, zonder dat hij mij nodig heeft"} ]},

{ id:"ochtend", mode:"c", type:"multi", max:2, sec:"Wat zoek je?",
  title:"Zaterdagochtend, je drinkt koffie. Welk beeld maakt je het blijst?",
  sub:"Kies er één of twee.",
  opts:[
    {v:"schouder", e:"☕", t:"Hij zit op je schouder en knabbelt aan je haar"},
    {v:"tafel", e:"🥄", t:"Hij scharrelt over tafel en pikt je lepeltje"},
    {v:"zang", e:"🎶", t:"Hij zingt terwijl jij de krant leest"},
    {v:"vlucht", e:"🪽", t:"Hij vliegt een rondje en landt op je hand"},
    {v:"praat", e:"💬", t:"Hij zegt ‘goedemorgen’ voordat jij het doet"} ]},

{ id:"karakter", mode:"c", type:"multi", max:3, sec:"Wat zoek je?",
  title:"Welke eigenschappen zoek je in je vogel?",
  sub:"Kies er hooguit drie.",
  opts:[
    {v:"aanhankelijk", e:"💛", t:"Aanhankelijk"},
    {v:"clown", e:"🤹", t:"Speels en clownesk"},
    {v:"slim", e:"🧩", t:"Slim en leergierig"},
    {v:"rustig", e:"🍃", t:"Rustig en relaxed"},
    {v:"pit", e:"🌶️", t:"Eigenwijs, met pit"},
    {v:"zelfstandig", e:"🧭", t:"Zelfstandig"},
    {v:"zang", e:"🎵", t:"Zingt mooi"},
    {v:"praten", e:"🗣️", t:"Praat of doet geluiden na"},
    {v:"vlieger", e:"🪶", t:"Vliegt sierlijk"} ]},

{ id:"training", mode:"e", type:"multi", max:6, exclusive:"geen", sec:"Wat zoek je?",
  title:"Wat zou je je vogel graag leren?",
  sub:"Kies alles wat je aanspreekt.",
  opts:[
    {v:"target", e:"🎯", t:"Een stokje volgen (target)"},
    {v:"stepup", e:"✋", t:"Op je hand stappen als je het vraagt"},
    {v:"recall", e:"📣", t:"Naar je toe vliegen als je roept"},
    {v:"trucs", e:"🎩", t:"Trucjes"},
    {v:"tuig", e:"🦺", t:"Een tuigje dragen om mee naar buiten te gaan"},
    {v:"geen", e:"🙃", t:"Niets, dat hoeft niet"} ]},

/* ---- 2. Je huis ---- */
{ id:"woning", mode:"c", type:"cards", sec:"Je huis",
  title:"In wat voor huis woon je?",
  sub:"Dit bepaalt vooral hoeveel geluid haalbaar is.",
  opts:[
    {v:"app", e:"🏢", t:"Appartement of bovenwoning", s:"Buren boven, onder of naast je"},
    {v:"rij", e:"🏘️", t:"Rijtjeshuis of hoekwoning", s:"Een of twee gedeelde muren"},
    {v:"vrij", e:"🏡", t:"Vrijstaand of twee-onder-een-kap", s:"Meer afstand tot de buren"} ]},

{ id:"geluid", mode:"c", type:"slider", sec:"Je huis",
  title:"Hoeveel geluid kun je over twee jaar nog steeds verdragen, ook om 7 uur ’s ochtends?",
  sub:"Schuif tot de omschrijving klopt.",
  min:1, max:5, step:1, def:2, ends:["stil","luid"],
  labels:[
    ["Zacht gefluit en gekwetter","Denk aan een kanarie of vinken."],
    ["Vrolijk gekwetter en contactroepjes","Hoorbaar in de kamer, niet bij de buren."],
    ["Af en toe een scherpe roep","Korte, hoge roepen bij opwinding of als je de kamer uitloopt."],
    ["Elke dag luide roepsessies","’s Ochtends en ’s avonds flink lawaai; de buren horen het."],
    ["Maakt me echt niet uit","Ook minutenlang krijsen. Eerlijk zijn mag."] ]},

{ id:"vliegen", mode:"c", type:"cards", sec:"Je huis",
  title:"Mag je vogel vrij door het huis vliegen?",
  opts:[
    {v:3, e:"🪽", t:"Ja, uren per dag als ik thuis ben"},
    {v:2, e:"⏱️", t:"Ja, ongeveer een uur per dag"},
    {v:1, e:"🏗️", t:"Nee, ik kies liever voor een grote (buiten)volière"},
    {v:0, e:"🚫", t:"Nee, hij blijft in zijn kooi"} ]},

{ id:"ruimte", mode:"c", type:"cards", sec:"Je huis",
  title:"Hoeveel ruimte heb je voor zijn kooi of volière?",
  opts:[
    {v:2, e:"📦", t:"Een kooi tot ±80 cm breed"},
    {v:3, e:"🏠", t:"Een ruime kooi van 100–150 cm breed"},
    {v:4, e:"🏛️", t:"Een kamervolière of een hele hoek van de kamer"},
    {v:5, e:"🌳", t:"Een eigen vogelkamer of buitenvolière"} ]},

{ id:"proof", mode:"e", type:"cards", sec:"Je huis",
  title:"Kun je een kamer echt vogelveilig maken?",
  sub:"Ramen dicht, ventilator uit, geen giftige planten, geen open water of hete pannen.",
  opts:[
    {v:2, e:"✅", t:"Ja, helemaal"},
    {v:1, e:"🙂", t:"Grotendeels, met wat aanpassingen"},
    {v:0, e:"😬", t:"Dat wordt lastig", s:"Bijvoorbeeld een open keuken, veel planten of deuren die vaak openstaan"} ]},

{ id:"keuken", mode:"e", type:"cards", sec:"Je huis",
  title:"Kunnen kookdampen de ruimte van je vogel bereiken?",
  sub:"Verhitte anti-aanbaklaag (PTFE/Teflon) geeft dampen die voor vogels binnen minuten dodelijk kunnen zijn.",
  opts:[
    {v:1, e:"🍳", t:"Ja", s:"Open keuken en/of pannen met anti-aanbaklaag"},
    {v:0, e:"🚪", t:"Nee", s:"Gesloten keuken of alleen PTFE-vrije pannen"} ]},

{ id:"slaap", mode:"e", type:"cards", sec:"Je huis",
  title:"Kan je vogel elke nacht 10–12 uur in het donker en de rust slapen?",
  opts:[
    {v:1, e:"🌙", t:"Ja", s:"In een rustige kamer of met een afdekdoek"},
    {v:0, e:"📺", t:"Dat wordt lastig", s:"De woonkamer is ’s avonds lang in gebruik"} ]},

/* ---- 3. Je week ---- */
{ id:"tijd", mode:"c", type:"slider", sec:"Je week",
  title:"Hoeveel uur per dag ben je echt met je vogel bezig?",
  sub:"Trainen, spelen en samen zijn tellen mee. Alleen in dezelfde kamer zitten niet.",
  min:0, max:6, step:0.5, def:2, unit:"uur",
  labels:null },

{ id:"alleen", mode:"c", type:"cards", sec:"Je week",
  title:"Op hoeveel werkdagen per week is er 8 uur of langer niemand thuis?",
  opts:[
    {v:0, e:"🏠", t:"Bijna nooit", s:"Bijvoorbeeld door thuiswerken of een druk huishouden"},
    {v:1, e:"🗓️", t:"Twee à drie dagen"},
    {v:2, e:"🚆", t:"Vier dagen of meer", s:"Lange werkdagen of diensten"} ]},

{ id:"aantal", mode:"c", type:"cards", sec:"Je week",
  title:"Zie je jezelf met één vogel of met meer?",
  sub:"Geen strikvraag: het beste antwoord hangt af van de soort en van je week. Je krijgt straks per soort advies.",
  opts:[
    {v:"een", e:"1️⃣", t:"Eén", s:"Ik wil zijn belangrijkste maatje zijn"},
    {v:"twee", e:"2️⃣", t:"Twee", s:"Zodat ze elkaar hebben"},
    {v:"groep", e:"🐦", t:"Een groepje", s:"In een volière"},
    {v:"weet", e:"🤔", t:"Weet ik nog niet", s:"Adviseer me"} ]},

{ id:"vakantie", mode:"e", type:"cards", sec:"Je week",
  title:"Wie zorgt voor je vogel als je twee weken weg bent?",
  opts:[
    {v:2, e:"🧑‍🤝‍🧑", t:"Een vaste oppas die verstand heeft van vogels"},
    {v:1, e:"🏨", t:"Een vogelpension"},
    {v:0, e:"❓", t:"Dat weet ik nog niet"} ]},

/* ---- 4. Huisgenoten ---- */
{ id:"dieren", mode:"c", type:"multi", max:7, exclusive:"geen", sec:"Huisgenoten",
  title:"Welke andere dieren wonen er nu of straks bij je?",
  sub:"Kies alles wat van toepassing is.",
  opts:[
    {v:"geen", e:"🚫", t:"Geen andere dieren"},
    {v:"kat", e:"🐈", t:"Kat"},
    {v:"hond", e:"🐕", t:"Hond"},
    {v:"konijn", e:"🐇", t:"Konijn of cavia"},
    {v:"knaag", e:"🐀", t:"Rat, muis of hamster"},
    {v:"vogel", e:"🐦", t:"Andere vogels"},
    {v:"reptiel", e:"🦎", t:"Reptiel"} ]},

{ id:"kinderen", mode:"e", type:"cards", sec:"Huisgenoten",
  title:"Wonen er kinderen bij je, of komen ze vaak over de vloer?",
  opts:[
    {v:0, e:"🙅", t:"Nee"},
    {v:2, e:"🧒", t:"Ja, jonger dan 8 jaar"},
    {v:1, e:"🧑", t:"Ja, 8 jaar of ouder"} ]},

/* ---- 5. Ervaring & gedrag ---- */
{ id:"ervaring", mode:"c", type:"cards", sec:"Ervaring & gedrag",
  title:"Hoeveel ervaring heb je met dieren?",
  opts:[
    {v:1, e:"🌱", t:"Ik begin bij nul"},
    {v:2, e:"🐾", t:"Veel ervaring met andere dieren"},
    {v:3, e:"🐤", t:"Ik heb eerder vogels gehad"},
    {v:4, e:"🦜", t:"Ik heb eerder papegaaien gehad"} ]},

{ id:"leren", mode:"e", type:"cards", sec:"Ervaring & gedrag",
  title:"Hoeveel zin heb je om de lichaamstaal en het gedrag van je vogel te leren lezen?",
  opts:[
    {v:1, e:"🤷", t:"Weinig", s:"Het moet vooral gewoon werken"},
    {v:2, e:"📖", t:"Prima, als het nodig is"},
    {v:3, e:"🎓", t:"Veel", s:"Ik wil snappen waarom hij iets doet: clickertraining, positief belonen"} ]},

{ id:"bijten", mode:"c", type:"cards", sec:"Ervaring & gedrag",
  title:"Je vogel wil niet terug de kooi in en bijt je hard in je vinger. Wat denk je?",
  opts:[
    {v:2, e:"🛑", t:"“Dit is voor mij echt een dealbreaker.”"},
    {v:4, e:"🩹", t:"“Au. Wat las ik verkeerd? Dat wil ik leren.”"},
    {v:5, e:"🦷", t:"“Hoort erbij, ook in hormonale periodes.”"} ]},

{ id:"rommel", mode:"c", type:"slider", sec:"Ervaring & gedrag",
  title:"Hoeveel rommel kun je aan?",
  sub:"Zaaddoppen, veertjes, stof, versnipperd speelgoed en fruitspetters tegen de muur.",
  min:1, max:5, step:1, def:3, ends:["weinig","veel"],
  labels:[["Bijna niets","Alles moet netjes blijven."],["Een beetje","Elke dag even stofzuigen is oké."],["Gemiddeld","Rond de kooi is het nooit helemaal schoon."],["Flink wat","Twee keer per dag vegen vind ik prima."],["Chaos is gezellig","Spetters, stof en snippers: geen probleem."]] },

{ id:"slopen", mode:"e", type:"cards", sec:"Ervaring & gedrag",
  title:"Je vogel heeft een hoek uit je houten vensterbank geknaagd. Hoe reageer je?",
  opts:[
    {v:2, e:"😱", t:"“Dit is een ramp.”"},
    {v:3, e:"😅", t:"“Jammer, ik had beter moeten opletten.”"},
    {v:5, e:"🪵", t:"“Gezond gedrag. Ik geef hem voortaan sloophout.”"} ]},

/* ---- 6. Lange termijn ---- */
{ id:"levensduur", mode:"c", type:"cards", sec:"Lange termijn",
  title:"Voor hoeveel jaar wil je je aan een vogel binden?",
  sub:"Sommige papegaaien worden 40–60 jaar of ouder.",
  opts:[
    {v:12, e:"⏳", t:"Hooguit ±12 jaar"},
    {v:20, e:"📅", t:"Tot ±20 jaar"},
    {v:35, e:"🗓️", t:"Tot ±35 jaar"},
    {v:80, e:"♾️", t:"Hoe langer hoe liever", s:"Ik regel ook wie hem na mij krijgt"} ]},

{ id:"budget", mode:"c", type:"cards", sec:"Lange termijn",
  title:"Wat past bij je budget?",
  sub:"Denk aan vaste kosten per jaar (voer, speelgoed, controles) én een onverwachte rekening van €500–1000 bij een vogeldierenarts.",
  opts:[
    {v:2, e:"🪙", t:"Krap", s:"Liefst onder ±€300 per jaar; een grote rekening wordt lastig"},
    {v:3, e:"💶", t:"Gemiddeld", s:"±€300–800 per jaar; een onverwachte rekening lukt met wat schuiven"},
    {v:5, e:"💳", t:"Ruim", s:"Ook hogere kosten en grote rekeningen zijn geen probleem"} ]},

/* ---- 7. Uiterlijk (bewust als laatste) ---- */
{ id:"formaat", mode:"c", type:"cards", sec:"Uiterlijk",
  title:"Tot slot het uiterlijk. Hoe groot mag je vogel zijn?",
  sub:"Gemeten van kop tot staartpunt.",
  opts:[
    {v:"klein", e:"🐤", t:"Klein", s:"Tot ±25 cm"},
    {v:"middel", e:"🐦", t:"Middelgroot", s:"±25–35 cm"},
    {v:"groot", e:"🦜", t:"Groot", s:"35 cm of meer"},
    {v:"x", e:"🤷", t:"Maakt me niet uit"} ]},

{ id:"bouw", mode:"e", type:"cards", sec:"Uiterlijk",
  title:"Welk silhouet spreekt je meer aan?",
  opts:[
    {v:"slank", e:"🪶", t:"Slank, met een lange staart"},
    {v:"compact", e:"🥚", t:"Compact en stevig"},
    {v:"x", e:"🤷", t:"Maakt me niet uit"} ]}
];

/* Tussentijdse inzichten: test(antwoorden) → tekst. Elk inzicht max 1× per sessie. */
const INSIGHTS = [
 { id:"knuffelstil", after:["geluid"], test:a => (a.doel==="maatje" || (a.karakter||[]).includes("aanhankelijk")) && a.geluid<=2,
   txt:"Interessant: veel interactie, weinig lawaai. Dat maakt grote papegaaien en conures meteen minder geschikt — de stillere aanhankelijke soorten blijven over." },
 { id:"buren", after:["geluid"], test:a => a.woning==="app" && a.geluid>=4,
   txt:"Je kiest voor veel geluid in een appartement. Wees eerlijk over je buren: luide papegaaien zijn een veelvoorkomende reden voor herplaatsing." },
 { id:"zangknuffel", after:["karakter"], test:a => (a.karakter||[]).includes("zang") && ((a.karakter||[]).includes("aanhankelijk") || a.doel==="maatje"),
   txt:"Zang én knuffelen: dat zit zelden in één soort. De beste zangers (kanaries, vinken) zijn kijkvogels; de knuffelaars zingen meestal niet." },
 { id:"slimbeginner", after:["ervaring"], test:a => (a.karakter||[]).includes("slim") && a.ervaring===1,
   txt:"De slimste papegaaien zijn ook de meest veeleisende. Voor beginners zoeken we slimheid in soorten die vergevingsgezind zijn." },
 { id:"alleen1", after:["aantal"], test:a => a.aantal==="een" && a.alleen===2,
   txt:"Je kiest voor één vogel én je bent vaak lang weg. Dat is een belangrijke combinatie: je advies verschuift richting soorten die zelfstandiger zijn, of richting twee vogels." },
 { id:"kat", after:["dieren"], test:a => (a.dieren||[]).includes("kat"),
   txt:"Katten en vogels: één krab of beet kan voor een vogel dodelijk zijn (bacteriën in katten­speeksel). Hoe tam beide ook zijn — nooit samen zonder dat er een deur tussen zit." },
 { id:"konijn", after:["dieren"], test:a => (a.dieren||[]).includes("konijn") && a.vliegen>=2,
   txt:"Konijnen en vrij vliegen kan, maar niet tegelijk zonder toezicht: brutale papegaaien bijten in oren en ogen, en een konijn kan een vogel op de grond verwonden. Dit telt mee in je score." },
 { id:"kortleven", after:["levensduur"], test:a => a.levensduur<=12,
   txt:"Met maximaal ±12 jaar vallen vrijwel alle papegaaien af — ook kleine soorten als valkparkiet en Pyrrhura worden vaak 15–30 jaar." },
 { id:"bijtstop", after:["bijten"], test:a => a.bijten===2,
   txt:"Eerlijk: elke kromsnavel kan bijten. We sluiten de bijterigste soorten uit en zoeken soorten die het zelden doen." },
 { id:"krap", after:["budget"], test:a => a.budget===2,
   txt:"Een krap budget is geen schande, maar wel een welzijnsfactor: grote papegaaien kosten vaak honderden euro’s per jaar plus gespecialiseerde dierenartszorg." },
 { id:"geenvlucht", after:["vliegen"], test:a => a.vliegen===0,
   txt:"Geen vrije vlucht betekent dat de kooi zelf vliegruimte moet bieden. Soorten die echt moeten vliegen schuiven daardoor naar beneden." }
];

if (typeof module !== "undefined") module.exports = { QUESTIONS, INSIGHTS };
