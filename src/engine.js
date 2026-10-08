/* ============================================================
   VOGELMATCH — matching-engine (geen netwerk nodig)
   Score = 25 + 73·fit + Σ(strafpunten)   → 3..98
   fit   = gewogen gelijkenis tussen jouw wensen en soortkenmerken
   straf = mismatches op randvoorwaarden (geluid, tijd, ruimte, …)
   hard  = harde incompatibiliteit → soort valt af, ongeacht fit
   ============================================================ */

const DEFAULTS = { proof:1, kinderen:0, leren:2, training:[], bouw:"x", vakantie:1, keuken:0, slaap:1, dieren:["geen"], ochtend:[], karakter:[] };

/* Kalibratie (getest met 20.000 gesimuleerde profielen): fit weegt zwaarder dan
   ‘geen bezwaren’, zodat een soort zonder nadelen maar met matige fit niet te vaak wint. */
const SCORE_BASE = 25, SCORE_FIT = 73, PEN_SCALE = 0.6;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const has = (arr, v) => Array.isArray(arr) && arr.includes(v);
function cmAvg(s){ const m = s.cm.match(/(\d+)(?:–(\d+))?/); if(!m) return 25; const a=+m[1], b=m[2]?+m[2]:a; return (a+b)/2; }

function buildProfile(raw){
  const a = Object.assign({}, DEFAULTS, raw);
  const k = a.karakter || [], o = a.ochtend || [];
  const P = { a };
  P.wantHands = a.doel==="maatje"?5 : a.doel==="samen"?3 : 1;
  if (has(o,"schouder") && a.doel!=="kijken") P.wantHands = 5;
  if (has(k,"aanhankelijk")) P.wantHands = Math.max(P.wantHands, 4);
  P.wantBond = a.doel==="maatje"?5 : a.doel==="samen"?4 : 1;
  P.handsW = a.doel==="maatje"?3 : a.doel==="samen"?2 : 2.5;
  if (has(k,"aanhankelijk")) P.handsW += 1.5;
  P.clownW = (has(k,"clown")?2.5:0) + (has(o,"tafel")?1:0);
  P.intelW = (has(k,"slim")?2:0) + (has(o,"tafel")?0.5:0);
  const tr = (a.training||[]).filter(x=>x!=="geen").length;
  P.trainW = (has(k,"slim")?1:0) + tr*0.4;
  P.songW = (has(k,"zang")?3:0) + (has(o,"zang")?2:0);
  P.talkW = (has(k,"praten")?2.5:0) + (has(o,"praat")?1.5:0);
  P.flightW = (has(k,"vlieger")?2:0) + (has(o,"vlucht")?1:0) + (a.vliegen===3?1:0);
  P.calmW = has(k,"rustig")?2:0;
  P.indepW = has(k,"zelfstandig")?2:0;
  P.boldW = has(k,"pit")?1.5:0;
  P.noiseMax = a.geluid ?? 3;
  P.hours = a.tijd ?? 2;
  P.alone = a.alleen ?? 1;
  P.flight = a.vliegen ?? 2;
  P.spaceMax = a.ruimte ?? 3;
  P.pets = (a.dieren||[]).filter(x=>x!=="geen");
  P.kids = a.kinderen;
  P.exp = a.ervaring ?? 1;
  P.learn = a.leren;
  P.biteMax = a.bijten ?? 4;
  P.messMax = a.rommel ?? 3;
  P.destructMax = a.slopen;
  P.lifeMax = a.levensduur ?? 35;
  P.lifeLove = a.levensduur===80;
  P.costMax = a.budget ?? 3;
  P.size = a.formaat || "x";
  P.build = a.bouw || "x";
  P.aantal = a.aantal || "weet";
  P.woning = a.woning || "rij";
  return P;
}

/* ---------- 1 of 2 vogels ---------- */
function pairAdvice(s, P){
  const why = [];
  if (s.pair==="groep") return { n:2, plus:true, head:"Voor jou zou ik minimaal 2 vogels kiezen, liefst een klein groepje", why:["Deze soort is een uitgesproken groepsdier en is niet mensgericht: alleen gehouden mist hij al het sociale contact."], trade:"Meer vogels betekent een bredere kooi of volière, maar weinig extra werk." };
  if (s.pair==="paar") return { n:2, head:"Voor jou zou ik 2 vogels kiezen", why:[s.pairNote], trade:"Train ze apart in korte sessies, dan blijft de band met jou goed. Huisvesting, rommel en geluid nemen iets toe." };
  if (s.pair==="solo") {
    if (P.aantal==="groep") return { n:2, plus:true, head:"Voor jou zou ik er meerdere in een volière houden", why:[s.pairNote], trade:"Kies dan voor een ruime volière en let op ruzies." };
    return { n:1, head:"Voor jou zou ik 1 vogel kiezen", why:[s.pairNote], trade:"Deze soort heeft weinig behoefte aan een partner." };
  }
  // flex
  let sc = 0;
  if (P.alone===2){ sc+=2; why.push("Je bent op vier of meer dagen per week 8+ uur weg — een soortgenoot vangt die uren op."); }
  else if (P.alone===1){ sc+=1; why.push("Je bent een paar dagen per week lang weg."); }
  if (P.hours < s.hours[0]+1){ sc+=1; why.push(P.hours < s.hours[0] ? `Je beschikbare tijd (${fmtH(P.hours)}) is minder dan wat één vogel van deze soort minimaal vraagt (${fmtH(s.hours[0])}); twee vogels vangen dat deels op.` : `Je beschikbare tijd (${fmtH(P.hours)}) is niet veel meer dan wat deze soort minimaal vraagt (${fmtH(s.hours[0])}).`); }
  if (P.hours >= s.hours[0]+1.5 && P.alone===0){ sc-=1; why.push("Je hebt ruim voldoende tijd en bent veel thuis: jij kunt zijn belangrijkste gezelschap zijn."); }
  if (P.wantHands>=5){ sc-=1; why.push("Je wilt een zeer sterke band met jóu; één vogel richt zich meer op mensen."); }
  if (P.aantal==="twee"||P.aantal==="groep"){ sc+=1; why.push("Je staat zelf open voor twee vogels."); }
  if (P.aantal==="een"){ sc-=1; }
  if (s.social>=5){ sc+=1; why.push("Deze soort heeft een zeer hoge sociale behoefte."); }
  const n = sc>=1 ? 2 : 1;
  const head = n===2 ? "Voor jou zou ik 2 vogels kiezen" : "Voor jou zou ik 1 vogel kiezen";
  const trade = n===2
    ? "Twee vogels geven elkaar soortspecifiek contact (poetsen, roepen, spelen). De band met jou wordt anders — niet per se minder — als je ze allebei apart blijft trainen. Geluid, rommel en kosten nemen toe; begin met quarantaine en introduceer geleidelijk."
    : "Eén vogel richt zich sterker op mensen, maar jij bent dan zijn ‘zwerm’. Dat betekent: dagelijks voldoende tijd, niet lange dagen alleen, en verrijking als je weg bent. Kun je dat later niet meer bieden, voeg dan een soortgenoot toe.";
  return { n, head, why: why.length?why:[s.pairNote], trade };
}
function fmtH(h){ h=Math.round(h*4)/4; return h===0?"0 uur": (h<1? Math.round(h*60)+" min" : (Number.isInteger(h)? h+" uur" : String(h).replace(".",",")+" uur")); }
function fmtRange(a,b){ if (a<1 && b<1) return Math.round(a*60)+"–"+Math.round(b*60)+" min"; if (a>=1 && b>=1){ const f=x=>String(Math.round(x*4)/4).replace(".",","); return f(a)+"–"+f(b)+" uur"; } return fmtH(a)+" – "+fmtH(b); }

/* ---------- Andere huisdieren ---------- */
const PET_LABEL = { kat:"kat", hond:"hond", konijn:"konijn/cavia", knaag:"rat/muis/hamster", vogel:"andere vogels", reptiel:"reptiel" };
function petEval(s, pets){
  let pts = 0; const notes = [];
  for (const p of pets){
    if (p==="kat"){ const v = s.size>=4?-6:-8; pts+=v; notes.push("Kat: altijd fysiek gescheiden (deur dicht) tijdens vrije vlucht. Een krabje kan via kattenbacteriën dodelijk zijn."); }
    if (p==="hond"){ const v = s.size<=2?-7:-5; pts+=v; notes.push("Hond: jachtinstinct verschilt per hond, maar onbeheerd samen is nooit veilig — ook niet met een ‘lieve’ hond."); }
    if (p==="konijn"){ let v=-2; if (s.bold>=4) v-=6; else if (s.bold>=3) v-=3; if (s.ground>=4) v-=4; pts+=v;
      notes.push(s.bold>=4 ? "Konijn/cavia: deze brutale soort bijt gerust in oren, ogen of poten. Vrij vliegen en vrij rondlopen alleen niet tegelijk, of onder direct toezicht." : "Konijn/cavia: weinig direct gevaar, maar een vogel op de grond kan geschopt worden. Toezicht houden en voer/drinkbak scheiden."); }
    if (p==="knaag"){ const v = s.size<=2?-8:-3; pts+=v; notes.push(s.size<=2 ? "Ratten kunnen kleine vogels doden; muizen/ratten bij een kooi lokken ook stress uit. Strikt gescheiden ruimtes." : "Rat/muis: houd dieren gescheiden; muizen/ratten bij de kooi geven stress en besmettingsrisico."); }
    if (p==="vogel"){ let v=-1; if (s.vsBirds>=4) v=-8; else if (s.vsBirds>=3) v=-4; pts+=v;
      notes.push(s.vsBirds>=4 ? "Andere vogels: deze soort is berucht om agressie naar andere soorten (beten in pootjes en snavels). Nooit samen vrij." : "Andere vogels: altijd 6 weken quarantaine en een dierenartscheck vóór kennismaking; niet automatisch samen in één kooi."); }
    if (p==="reptiel"){ const v = s.size<=2?-4:-2; pts+=v; notes.push("Reptiel: slangen en grote hagedissen zien vogels als prooi. Daarnaast salmonella-hygiëne: handen wassen tussen dieren."); }
  }
  const score = clamp(100 + pts*4, 5, 100);
  const level = score>=80 ? "goed" : score>=55 ? "let op" : "risico";
  return { pts, notes, score, level };
}

/* ---------- Kern: één soort beoordelen ---------- */
function evalSpecies(s, P){
  const parts = []; // fit-componenten
  const pen = [];   // straf/hard
  const add = (key, label, w, sim, why) => { if (w>0) parts.push({key,label,w,sim:clamp(sim,0,1),why}); };
  const atleast = (v, d=5) => v>=d ? 1 : 1 - (d-v)/4;

  // Interactie
  const hd = P.wantHands;
  const handSim = hd>=4 ? (s.handsOn>=hd ? 1 : 1-(hd-s.handsOn)/3) : 1 - Math.abs(s.handsOn-hd)/4;
  add("hands", "Hoe handtam/knuffelbaar", P.handsW, handSim, `Jij wilt ${hd>=4?"een vogel die graag op je hand of schouder komt":hd===3?"samen dingen doen":"vooral kijken en luisteren"}; deze soort scoort ${s.handsOn}/5.`);
  add("bond", "Band met mensen", 1.5, 1 - Math.abs(s.bond-P.wantBond)/4, `Gewenste band ${P.wantBond}/5, soort ${s.bond}/5.`);
  add("clown", "Speels/clownesk", P.clownW, atleast(s.clown), `Speelsheid ${s.clown}/5.`);
  add("intel", "Intelligentie", P.intelW, atleast(s.intel), `Intelligentie ${s.intel}/5.`);
  add("train", "Trainbaarheid", P.trainW, atleast(s.train), `Trainbaarheid ${s.train}/5.`);
  add("song", "Zang", P.songW, atleast(s.song), `Zang ${s.song}/5.`);
  add("talk", "Praten/nadoen", P.talkW, atleast(s.talk), `Praatvermogen ${s.talk}/5.`);
  add("flight", "Vliegen", P.flightW, atleast(s.flight)*(s.slender?1:0.85), `Vliegtalent ${s.flight}/5${s.slender?", slanke vlieger":""}.`);
  add("calm", "Rust", P.calmW, ((1-(s.activity-1)/4)+(1-(s.noise-1)/4))/2, `Activiteit ${s.activity}/5, geluid ${s.noise}/5.`);
  add("indep", "Zelfstandigheid", P.indepW, clamp(1 - s.hours[0]/4,0,1), `Minimale dagelijkse aandacht ${fmtH(s.hours[0])}.`);
  add("bold", "Pit/eigenwijsheid", P.boldW, atleast(s.bold,4), `Brutaliteit ${s.bold}/5.`);
  if (P.size!=="x"){ const c = cmAvg(s); let sim;
    if (P.size==="klein") sim = c<=25?1:1-(c-25)/15; else if (P.size==="middel") sim = (c>=25&&c<=35)?1:1-Math.min(Math.abs(c-25),Math.abs(c-35))/15; else sim = c>=35?1:1-(35-c)/15;
    add("size","Formaat", 1.5, sim, `±${Math.round(c)} cm.`); }
  if (P.build!=="x") add("build","Bouw", 1, (P.build==="slank")===!!s.slender ? 1 : 0.3, s.slender?"Slank met lange staart.":"Compact gebouwd.");
  if (P.lifeLove) add("life","Lange levensduur (positief voor jou)", 1, Math.min(1, s.life[1]/40), `${s.life[0]}–${s.life[1]} jaar.`);
  if (P.flight>=2) add("flyneed","Past bij dagelijkse vrije vlucht", 1, s.flight>=3?1:0.6, `Vliegbehoefte ${s.flight}/5.`);

  const W = parts.reduce((t,p)=>t+p.w,0) || 1;
  const fit = parts.reduce((t,p)=>t+p.w*p.sim,0)/W;

  // ---- Randvoorwaarden ----
  const P_ = (pts, label, kind, hard=false) => pen.push({pts: hard?pts:Math.round(pts*PEN_SCALE), label, kind, hard});
  // geluid
  let dn = s.noise - P.noiseMax;
  if (P.woning==="app" && s.noise>=4 && P.noiseMax>=4) P_(-5, "Luid in een appartement: buren horen dit dagelijks", "geluid");
  if (dn===1) P_(-12, `Iets luider dan je aankunt (${s.noise}/5, jouw grens is ${P.noiseMax}/5)`, "geluid");
  else if (dn>=2) P_(-40, `Veel luider dan je aankunt (${s.noise}/5, jouw grens is ${P.noiseMax}/5)`, "geluid", true);
  // bijten
  let db = s.bite - P.biteMax;
  if (db===1) P_(-8, `Bijt vaker dan je prettig vindt (${s.bite}/5)`, "bijten");
  else if (db>=2) P_(-18, `Bijtgedrag (${s.bite}/5) past niet bij jouw grens`, "bijten", P.biteMax<=2);
  // rommel / slopen
  let dm = s.mess - P.messMax;
  if (dm===1) P_(-6, `Meer rommel dan je wilt (${s.mess}/5)`, "rommel"); else if (dm>=2) P_(-14, `Veel meer rommel dan je wilt (${s.mess}/5)`, "rommel");
  if (P.destructMax!==undefined){ const dd = s.destruct-P.destructMax; if (dd===1) P_(-5,`Sloopt meer dan je accepteert (${s.destruct}/5)`,"slopen"); else if (dd>=2) P_(-12,`Sloopgedrag (${s.destruct}/5) botst met jouw grens`,"slopen"); }
  // ruimte
  let ds = s.space - P.spaceMax;
  if (ds===1) P_(-10, "Heeft meer verblijfsruimte nodig dan je hebt", "ruimte");
  else if (ds>=2) P_(-40, "Verblijf te klein voor het welzijn van deze soort", "ruimte", true);
  if (P.flight<=1 && s.flight>=4 && P.spaceMax<4) P_(-12, "Moet echt kunnen vliegen; zonder dagelijkse vrije vlucht is je kooi te klein", "vliegen");
  // tijd (afhankelijk van 1/2)
  const pa = pairAdvice(s, P);
  const needMin = (s.pair==="flex" && pa.n===2) ? Math.round(s.hours[0]*0.7*4)/4 : s.hours[0];
  const deficit = needMin - P.hours;
  if (deficit>0.01){
    if (P.hours < needMin*0.5 && needMin>=2) P_(-40, `Heeft minimaal ±${fmtH(needMin)} per dag nodig; jij hebt ${fmtH(P.hours)}`, "tijd", true);
    else P_(-Math.round(8*deficit+3), `Vraagt meer tijd (±${fmtH(needMin)}/dag) dan je hebt (${fmtH(P.hours)})`, "tijd");
  }
  if (P.alone===2 && s.social>=4 && s.pair==="flex" && pa.n===1) P_(-6, "Lange dagen alleen voor een zeer sociale soort", "tijd");
  // levensduur
  if (s.life[0] > P.lifeMax) P_(-40, `Leeft doorgaans ${s.life[0]}–${s.life[1]} jaar; langer dan je je wilt committeren`, "levensduur", true);
  else if (s.life[1] > P.lifeMax+3) P_(-8, `Kan ouder worden (tot ±${s.life[1]} jaar) dan je je wilt committeren`, "levensduur");
  // kosten
  const dc = s.cost - P.costMax;
  if (dc===1) P_(-8, "Kosten (huisvesting, voeding, dierenarts) liggen boven je comfortzone", "kosten");
  else if (dc>=2) P_(-40, "Jaarlijkse en onverwachte kosten passen niet bij je budget", "kosten", true);
  // ervaring
  let cap = [2,3,4,5][P.exp-1] + ((P.learn??2)>=3 ? 1 : 0);
  cap = Math.min(cap, 5);
  const gap = s.difficulty - cap;
  if (gap===1) P_(-10, "Iets uitdagender dan je ervaring nu toelaat", "ervaring");
  else if (gap===2) P_(-20, "Duidelijk te uitdagend voor je huidige ervaring", "ervaring");
  else if (gap>=3) P_(-40, "Veel te veeleisend voor een beginnende houder", "ervaring", true);
  // kinderen
  if (P.kids===2 && s.bite>=4) P_(-10, "Bijterig — lastig met jonge kinderen", "kinderen");
  if (P.kids===2 && s.size>=4) P_(-6, "Grote snavel en jonge kinderen vragen veel toezicht", "kinderen");
  // aantal
  if (P.aantal==="een" && (s.pair==="paar"||s.pair==="groep")) P_(-8, "Hoort met soortgenoten; één vogel is voor deze soort geen goed idee", "aantal");
  if (P.aantal==="groep" && s.pair==="flex" && s.vsBirds>=4) P_(-4, "Groepshuisvesting geeft bij deze soort snel ruzie", "aantal");
  // volière-voorkeur
  if (P.flight===1 && P.spaceMax>=4 && s.handsOn>=5 && s.bond>=5) P_(-4, "Heeft veel menselijk contact nodig; past minder bij volière-houderij", "vliegen");
  // status
  if (s.status==="afgeraden") P_(-15, "Afgeraden voor de meeste particuliere huishoudens", "welzijn");
  // huisdieren
  const pet = petEval(s, P.pets);
  if (pet.pts) P_(pet.pts, "Combinatie met je andere huisdieren", "huisdieren");

  const hard = pen.filter(x=>x.hard);
  const penSum = pen.reduce((t,x)=>t+(x.hard?0:x.pts),0);
  let score = Math.round(SCORE_BASE + SCORE_FIT*fit + penSum);
  score = clamp(score, 3, 98);
  return { s, fit, score, parts, pen, hard, excluded: hard.length>0, pair: pa, pet };
}

function rankAll(answers, list){
  const P = buildProfile(answers);
  const all = (list||SPECIES).map(s => evalSpecies(s, P));
  const ok = all.filter(r=>!r.excluded).sort((a,b)=> b.score-a.score || b.fit-a.fit);
  const out = all.filter(r=>r.excluded).sort((a,b)=> b.fit-a.fit);
  return { P, ok, out, all };
}

/* ---------- Uitleg-generatoren ---------- */
function reasonsFor(r){
  return r.parts.filter(p=>p.sim>=0.75 && p.w>=1).sort((a,b)=> (b.w*b.sim)-(a.w*a.sim)).slice(0,5);
}
function watchouts(r){
  const own = r.pen.filter(p=>!p.hard).sort((a,b)=>a.pts-b.pts).map(p=>({txt:p.label, kind:p.kind}));
  const weak = r.parts.filter(p=>p.sim<0.5 && p.w>=1.5).map(p=>({txt:`Minder sterk op wat jij belangrijk vindt: ${p.label.toLowerCase()} (${p.why})`, kind:"wens"}));
  return own.concat(weak).slice(0,5);
}
function sexAdvice(s, pref, pairN){
  const out = [s.sexNote];
  if (pref==="vrouw" && s.hormonal>=3) out.push("Je voorkeur is een pop: reken op mogelijke eileg. Beperk nestachtige plekken, aai niet over rug of onder de vleugels, houd daglengte rond 10–12 uur en ken de signalen van legnood (spoed-dierenarts).");
  if (pref==="man" && s.hormonal>=3) out.push("Je voorkeur is een man: mannen leggen geen eieren, maar kunnen net zo goed hormonaal territoriaal of bijterig worden.");
  if (pref && pref!=="geen") out.push("Kies uiteindelijk op het individu: vraag naar opfok en socialisatie, kijk hoe de vogel reageert op jou, en laat het geslacht bij twijfel met DNA bepalen.");
  else out.push("Individueel temperament weegt zwaarder dan geslacht. Geen voorkeur hebben is dus een prima startpunt.");
  if (pairN===2) out.push("Twee vogels van hetzelfde geslacht voorkomt kweken. Een gemengd paar betekent eieren — en de beslissing of je wilt kweken (en wat je met de jongen doet).");
  return out;
}
function idealDay(r, P){
  const s = r.s, bits = [];
  if (s.train>=3 && s.handsOn>=2 && !(P.a.training||[]).includes("geen")) bits.push("☀️ Ochtend: 5–10 minuten training (target of step-up) vóór het ontbijt — dan is hij het meest gemotiveerd.");
  if (P.alone>=1) bits.push(s.intel>=3 ? "💼 Als je weg bent: foerageerspeelgoed, iets om te slopen, licht en geluid aan" + (r.pair.n===2?" — en zijn maatje.":".") : "💼 Als je weg bent: genoeg licht, vers water en voer" + (r.pair.n===2?"; ze hebben elkaar.":"."));
  if (P.flight>=2 && s.flight>=3) bits.push(`🪽 Thuis: ${P.flight===3?"uren":"minimaal een uur"} vrij vliegen in een vogelveilige kamer${s.handsOn>=4?", afgewisseld met samen op de bank of je schouder":""}.`);
  else if (P.flight===1) bits.push("🌳 Volière: veel vlieglengte, takken om te knagen, dagelijks iets nieuws.");
  if (s.clown>=4) bits.push("🎾 Speelkwartier: verstoppertje met lekkers, ballen, stoeien op een speelstand.");
  bits.push("🌙 Avond: terug in het verblijf en 10–12 uur donker en rustig slapen.");
  return { generic:s.day, bits };
}
function realityCheck(r, P){
  const s = r.s, L = [];
  L.push(`⏳ ${s.nl} kan bij goede zorg ${s.life[0]}–${s.life[1]} jaar oud worden.` + (s.life[1]>=40?" Grote kans dat hij jou overleeft: regel wie hem krijgt.":""));
  L.push(`🔊 Geluid ${s.noise}/5: ${s.noiseNote}`);
  L.push(`🕐 Hij vraagt dagelijks ±${fmtRange(s.hours[0],s.hours[1])} echte aandacht${r.pair.n===2?" (bij twee vogels iets minder per vogel)":""}.`);
  L.push("🩺 Je hebt een aviaire (vogel)dierenarts nodig — zoek die vóór aanschaf, niet bij de eerste noodsituatie. Ziekte verbergen ze lang.");
  L.push("🥗 Een zaad-only dieet is een veelvoorkomende oorzaak van ziekte: reken op vers voer en soortgeschikte basisvoeding.");
  if (s.legal) L.push("📜 " + s.legal);
  if (s.status==="afgeraden") L.push("⚠️ Deze soort wordt voor de meeste particulieren afgeraden.");
  return L;
}
const SAFETY = [
  ["🪟","Ramen en deuren dicht tijdens vrije vlucht; ook ‘even’ een kiepraam is genoeg om te ontsnappen."],
  ["🌀","Plafond- en staande ventilatoren uit. Spiegels en grote ramen eventueel afplakken met stickers."],
  ["🍳","PTFE/Teflon (anti-aanbakpannen, sommige airfryers, zelfreinigende ovens) geeft bij oververhitting dodelijke dampen."],
  ["🚬","Geen rook, vape, geurkaarsen, luchtverfrissers of spuitbussen in de vogelruimte."],
  ["🪴","Veel kamerplanten zijn giftig. Check elke plant in vlieg- of knaagbereik."],
  ["🥑","Nooit avocado, chocolade, cafïïne, alcohol of zout eten; zaad-only is ondervoeding."],
  ["🐾","Andere huisdieren nooit onbeheerd samen — ook niet als beide ‘tam’ zijn. Tam ≠ veilig."],
  ["🧒","Kinderen alleen onder toezicht; leer ze rustig te bewegen en nooit vast te pakken."],
  ["😴","10–12 uur donker en rust per nacht. Slaaptekort geeft stress en hormonaal gedrag."],
  ["🏃","Dagelijks beweging, verrijking en sociaal contact; verveling leidt tot plukken en schreeuwen."],
  ["🌍","Buiten vrij vliegen (free flight) is een specialistische discipline met reële verliesrisico. Tamheid of recall-training is géén garantie: één schrikmoment is genoeg."]
];

if (typeof module !== "undefined") module.exports = { fmtRange, buildProfile, evalSpecies, rankAll, pairAdvice, petEval, reasonsFor, watchouts, sexAdvice, idealDay, realityCheck, SAFETY, fmtH, PET_LABEL };
