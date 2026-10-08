/* ============================================================
   VOGELMATCH — UI
   ============================================================ */
const $ = (sel, el=document) => el.querySelector(sel);
const app = () => $("#app");
const STORE = "vogelmatch.v1";
const STORE2 = "vogelmatch.v2";
const fresh = (mode="c") => ({ mode, i:0, answers:{}, seen:{}, sel:0, sex:"geen", mut:{}, R:null, savedId:null, fromList:false });
let ST = fresh();

/* ---------- Vogeltekening (parametrische veldgidsplaat) ---------- */
let svgId = 0;
function birdSVG(s, over={}, cls=""){
  const c = Object.assign({}, s.c, over);
  const id = "h"+(++svgId);
  const L = {short:22, medium:38, long:58, verylong:84}[s.tail||"medium"];
  const hr = s.bigHead ? 28 : 24;
  const beak = {
    cone:`<path d="M145 58 L163 65 L145 72 Z" fill="${c.beak}"/>`,
    thin:`<path d="M146 61 L161 64 L146 67 Z" fill="${c.beak}"/>`,
    hook:`<path d="M143 55 Q162 56 158 76 Q152 69 143 70 Z" fill="${c.beak}"/><path d="M144 70 Q151 71 152 76 Q146 77 143 73 Z" fill="${c.beak}" opacity=".85"/>`,
    bighook:`<path d="M140 50 Q170 50 162 84 Q154 72 140 73 Z" fill="${c.beak}"/><path d="M141 72 Q152 73 153 81 Q145 82 140 77 Z" fill="${c.beak}" opacity=".85"/>`
  }[s.beak||"hook"];
  const crest = s.crest==="tuft" ? `<path d="M116 44 Q108 16 126 6 Q118 24 124 42 Z M122 42 Q122 18 138 12 Q128 26 130 44 Z" fill="${c.crest||c.head}"/>`
    : s.crest==="cockatoo" ? `<path d="M104 52 Q86 22 104 4 Q104 26 118 42 Z M112 44 Q106 12 128 2 Q120 22 128 40 Z M120 40 Q124 14 144 10 Q132 26 134 42 Z" fill="${c.crest||c.head}"/>` : "";
  const scale = s.scale ? `<g stroke="#fff" stroke-opacity=".35" stroke-width="1.4" fill="none"><path d="M104 88 q5 4 10 0 M112 96 q5 4 10 0 M102 100 q5 4 10 0 M108 108 q5 4 10 0"/></g>` : "";
  const scallop = s.scallop ? `<g stroke="${s.scallop}" stroke-width="2.2" fill="none"><path d="M86 104 q6 6 12 0 M80 118 q6 6 12 0 M92 116 q6 6 12 0 M84 130 q6 6 12 0"/></g>` : "";
  return `<svg class="bird ${cls}" viewBox="0 0 200 200" role="img" aria-label="Illustratie ${s.nl}">
  <defs><clipPath id="${id}"><circle cx="124" cy="62" r="${hr}"/></clipPath></defs>
  <path d="M86 140 L72 136 L${72-L*0.38} ${140+L} L${84-L*0.22} ${146+L*0.92} Z" fill="${c.tail}"/>
  ${s.vent?`<ellipse cx="84" cy="146" rx="9" ry="6" fill="${s.vent}"/>`:""}
  <ellipse cx="102" cy="110" rx="34" ry="47" transform="rotate(-24 102 110)" fill="${c.body}"/>
  ${c.chest?`<ellipse cx="114" cy="98" rx="21" ry="25" transform="rotate(-24 114 98)" fill="${c.chest}"/>`:""}
  ${c.belly?`<ellipse cx="104" cy="128" rx="17" ry="15" fill="${c.belly}"/>`:""}
  ${scale}
  <path d="M120 80 Q70 84 66 142 Q76 150 88 146 Q104 124 116 104 Z" fill="${c.wing}"/>
  ${s.primaries?`<path d="M66 142 Q76 150 88 146 Q80 136 72 128 Z" fill="${s.primaries}"/>`:""}
  ${scallop}
  ${s.shoulder?`<ellipse cx="112" cy="90" rx="7" ry="5" fill="${s.shoulder}"/>`:""}
  ${crest}
  <circle cx="124" cy="62" r="${hr}" fill="${c.head}"/>
  <g clip-path="url(#${id})">
    ${c.cap?`<ellipse cx="128" cy="38" rx="26" ry="15" fill="${c.cap}"/>`:""}
    ${c.cheek?`<circle cx="134" cy="74" r="9" fill="${c.cheek}"/>`:""}
  </g>
  ${c.ring?`<path d="M104 78 Q124 94 146 80" stroke="${c.ring}" stroke-width="4" fill="none" stroke-linecap="round"/>`:""}
  ${c.eye?`<circle cx="134" cy="58" r="6.5" fill="${c.eye}"/>`:""}
  <circle cx="134" cy="58" r="3.6" fill="#141414"/><circle cx="135.2" cy="56.8" r="1.1" fill="#fff"/>
  ${beak}
  <g stroke="#7a6a5a" stroke-width="3" stroke-linecap="round"><path d="M98 152 l-3 10 M110 150 l0 12"/></g>
  <rect x="18" y="160" width="172" height="9" rx="4.5" fill="var(--branch)"/>
  </svg>`;
}

/* ---------- Helpers ---------- */
const qList = () => QUESTIONS.filter(q => ST.mode==="e" || q.mode==="c");
const byId = id => SPECIES.find(s=>s.id===id);
/* Bewaarde uitslagen: lijst met antwoorden, momentopname van de top 5, naam en notities */
const esc = t => String(t??"").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmtDate = iso => new Date(iso).toLocaleDateString("nl-NL",{day:"numeric",month:"long",year:"numeric"});
function mkEntry(answers, mode, date){
  const R = rankAll(answers);
  return { id:"r"+Date.now().toString(36)+Math.random().toString(36).slice(2,6), date:date||new Date().toISOString(), mode, answers, title:"", notes:"", top:R.ok.slice(0,5).map(r=>({id:r.s.id, score:r.score})) };
}
function getAll(){
  try{
    let d = JSON.parse(localStorage.getItem(STORE2)||"null");
    if (!d){ d={results:[]}; const old=JSON.parse(localStorage.getItem(STORE)||"null");
      if (old && old.answers){ d.results.push(mkEntry(old.answers, old.mode||"c", old.date)); localStorage.setItem(STORE2, JSON.stringify(d)); localStorage.removeItem(STORE); } }
    return d;
  }catch(e){ return {results:[]}; }
}
function putAll(d){ try{ localStorage.setItem(STORE2, JSON.stringify(d)); return true; }catch(e){ return false; } }
function findEntry(id){ return getAll().results.find(x=>x.id===id); }
function saveCurrent(){ const d=getAll(); const e=mkEntry(ST.answers, ST.mode); d.results.unshift(e); if (!putAll(d)) return null; ST.savedId=e.id; return e; }
function updateEntry(id, patch){ const d=getAll(); const e=d.results.find(x=>x.id===id); if (!e) return false; Object.assign(e, patch); return putAll(d); }
function deleteEntry(id){ const d=getAll(); d.results=d.results.filter(x=>x.id!==id); putAll(d); }
function toast(msg){ const t=$("#toast"); t.textContent=msg; t.classList.add("on"); clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove("on"),2200); }
function confirmTap(btn, label, action){
  btn.onclick = ()=>{
    if (btn.dataset.armed){ action(); return; }
    btn.dataset.armed="1"; const old=btn.innerHTML; btn.innerHTML=label; btn.classList.add("armed");
    setTimeout(()=>{ if(btn.isConnected){ delete btn.dataset.armed; btn.innerHTML=old; btn.classList.remove("armed"); } },3500);
  };
}
function wipeAll(){ try{ localStorage.removeItem(STORE); localStorage.removeItem(STORE2); }catch(e){} ST=fresh(); renderStart(); toast("Alles gewist"); }
/* Na een schermwissel: naar boven en focus op de kop (toetsenbord/schermlezer) */
function afterScreen(){ window.scrollTo(0,0); const h=app().querySelector("h1, h2"); if (h){ h.setAttribute("tabindex","-1"); h.focus({preventScroll:true}); } }
function bar(v,max=5){ let h=""; for(let i=1;i<=max;i++) h+=`<i class="${i<=v?"on":""}"></i>`; return `<span class="pips" aria-label="${v} van ${max}">${h}</span>`; }

/* ---------- Start ---------- */
function renderStart(){
  const n = getAll().results.length;
  const trio = ["valkparkiet","pyrrhura","kanarie"].map(byId);
  app().innerHTML = `
  <section class="start">
    <div class="plates" aria-hidden="true">${trio.map((s,i)=>`<div class="plate p${i}">${birdSVG(s)}</div>`).join("")}</div>
    <h1>Welke vogel past bij jou?</h1>
    <p class="lede">Geen ‘welke vogel ben jij’-quiz. Je krijgt 3–5 soorten die realistisch passen bij je huis, je week en je wensen — met eerlijke uitleg waarom, en waar je aan begint.</p>
    <div class="cta">
      <button class="btn primary" data-go="c">Snelle versie <small>${QUESTIONS.filter(q=>q.mode==="c").length} vragen, ±5 minuten</small></button>
      <button class="btn" data-go="e">Uitgebreid <small>${QUESTIONS.length} vragen, ±10 minuten</small></button>
    </div>
    ${n?`<button class="btn mine" id="mine">📒 Mijn uitslagen <small>${n} bewaard</small></button>`:""}
    <p class="fine">Werkt volledig offline. Je antwoorden blijven op dit apparaat.</p>
  </section>`;
  afterScreen();
  app().querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{ ST=fresh(b.dataset.go); renderQ(); });
  if (n) $("#mine").onclick=renderSaved;
}

/* ---------- Mijn uitslagen ---------- */
function openEntry(e){ ST=fresh(e.mode||"c"); ST.answers=e.answers; ST.savedId=e.id; ST.fromList=true; renderResults(); afterScreen(); }
function renderSaved(){
  const list = getAll().results;
  if (!list.length){ renderStart(); return; }
  app().innerHTML = `<section class="saved">
    <header class="qhead"><button class="icon" id="back" aria-label="Terug naar start">←</button><span class="sec">Mijn uitslagen</span></header>
    <p class="sub">Je bewaarde uitslagen en notities. Ze staan alleen op dit apparaat.</p>
    ${list.map(e=>{ const top=(e.top||[]).filter(t=>byId(t.id)); const first=top[0]&&byId(top[0].id);
      return `<article class="card entry" data-id="${e.id}">
        <div class="en-head">${first?`<div class="en-plate">${birdSVG(first,{},"mini")}</div>`:""}
          <div class="en-meta"><h3>${esc(e.title)||(first?first.nl:"Uitslag")}</h3>
          <p class="fine">${fmtDate(e.date)}, ${e.mode==="e"?"uitgebreide":"snelle"} versie</p></div></div>
        <ol class="en-top">${top.slice(0,3).map(t=>`<li>${byId(t.id).nl} <span>${t.score}%</span></li>`).join("")}</ol>
        ${e.notes?`<p class="en-note">${esc(e.notes.length>180?e.notes.slice(0,180)+"…":e.notes)}</p>`:`<p class="fine">Nog geen notities.</p>`}
        <div class="en-act"><button class="btn primary" data-open="${e.id}">Openen</button><button class="link danger" data-del="${e.id}">Verwijderen</button></div>
      </article>`; }).join("")}
    <button class="link danger" id="wipeall">Alle bewaarde uitslagen wissen</button>
  </section>`;
  afterScreen();
  $("#back").onclick=renderStart;
  app().querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>openEntry(findEntry(b.dataset.open)));
  app().querySelectorAll("[data-del]").forEach(b=>confirmTap(b,"Zeker? Tik nogmaals",()=>{ deleteEntry(b.dataset.del); toast("Uitslag verwijderd"); renderSaved(); }));
  confirmTap($("#wipeall"),"Zeker weten? Tik nogmaals om alles te wissen", wipeAll);
}

/* ---------- Quiz ---------- */
function renderQ(){
  const L = qList(), q = L[ST.i], a = ST.answers[q.id];
  const pct = Math.round(ST.i/L.length*100);
  let body = "";
  if (q.type==="cards"){
    body = `<div class="opts">${q.opts.map(o=>`<button class="opt ${a===o.v?"sel":""}" data-v='${JSON.stringify(o.v)}'><span class="em">${o.e}</span><span><b>${o.t}</b>${o.s?`<small>${o.s}</small>`:""}</span></button>`).join("")}</div>`;
  } else if (q.type==="multi"){
    const cur = a||[];
    body = `<div class="chips">${q.opts.map(o=>`<button class="chip ${cur.includes(o.v)?"sel":""}" data-v="${o.v}" aria-pressed="${cur.includes(o.v)}"><span>${o.e}</span> ${o.t}</button>`).join("")}</div>
            <button class="btn primary next" ${cur.length?"":"disabled"}>Verder</button>`;
  } else {
    const v = a ?? q.def;
    body = `<div class="slider"><output id="sv"></output><input type="range" min="${q.min}" max="${q.max}" step="${q.step}" value="${v}" id="rng" aria-label="${q.title}"><div class="sl-ends"><span>${q.unit?q.min+" "+q.unit:(q.ends||["minder"])[0]}</span><span>${q.unit?q.max+"+ "+q.unit:(q.ends||[,"meer"])[1]}</span></div><p id="sd" class="sdesc"></p></div>
            <button class="btn primary next">Verder</button>`;
  }
  app().innerHTML = `
  <section class="quiz">
    <header class="qhead">
      <button class="icon" id="back" aria-label="Vorige">←</button>
      <span class="sec">${q.sec}</span>
      <span class="count">${ST.i+1}/${L.length}</span>
      <button class="icon stop" id="stop" aria-label="Stoppen en antwoorden wissen" title="Stoppen en antwoorden wissen">✕</button>
    </header>
    <div class="branch" aria-hidden="true"><div class="twig"></div><div class="perch" style="left:calc(${pct}% - 9px)">🐦</div></div>
    <h2>${q.title}</h2>${q.sub?`<p class="sub">${q.sub}</p>`:""}
    ${body}
  </section>`;
  confirmTap($("#stop"), "Wissen?", ()=>{ ST=fresh(); renderStart(); toast("Antwoorden gewist"); });
  afterScreen();
  $("#back").onclick = ()=>{ if (ST.i===0) renderStart(); else { ST.i--; renderQ(); } };
  if (q.type==="cards") app().querySelectorAll(".opt").forEach(b=>b.onclick=()=>{ ST.answers[q.id]=JSON.parse(b.dataset.v); b.classList.add("sel"); setTimeout(()=>advance(q),140); });
  if (q.type==="multi"){
    app().querySelectorAll(".chip").forEach(b=>b.onclick=()=>{
      let cur = [...(ST.answers[q.id]||[])]; const v=b.dataset.v;
      if (cur.includes(v)) cur = cur.filter(x=>x!==v);
      else { if (q.exclusive===v) cur=[v]; else { cur=cur.filter(x=>x!==q.exclusive); if (cur.length>=q.max) { toast(`Maximaal ${q.max} keuzes`); return; } cur.push(v);} }
      ST.answers[q.id]=cur;
      app().querySelectorAll(".chip").forEach(c=>{ const on=cur.includes(c.dataset.v); c.classList.toggle("sel",on); c.setAttribute("aria-pressed",on); });
      $(".next").disabled = !cur.length;
    });
    $(".next").onclick=()=>advance(q);
  }
  if (q.type==="slider"){
    const r=$("#rng"), upd=()=>{ const v=+r.value; ST.answers[q.id]=v;
      if (q.labels){ const l=q.labels[v-q.min]; $("#sv").textContent=l[0]; $("#sd").textContent=l[1]; }
      else { $("#sv").textContent = v>=q.max ? `${q.max}+ uur` : fmtH(v); $("#sd").textContent = v<1?"Weinig tijd past bij soorten die vooral elkaar hebben.": v<2?"Genoeg voor een paar kleine parkieten of een rustige soort.": v<3.5?"Ruim genoeg voor een tamme kleine papegaai.":"Veel tijd: ook veeleisende soorten worden een optie."; } };
    r.oninput=upd; upd(); $(".next").onclick=()=>advance(q);
  }
}
function advance(q){
  const ins = INSIGHTS.find(n=>n.after.includes(q.id) && !ST.seen[n.id] && n.test(Object.assign({},ST.answers)));
  const go = ()=>{ ST.i++; if (ST.i>=qList().length) renderReality(); else renderQ(); };
  if (ins){ ST.seen[ins.id]=1; renderInsight(ins, go); } else go();
}
function renderInsight(ins, go){
  app().innerHTML = `<section class="insight"><div class="bulb" aria-hidden="true">💡</div><h2>Goed om te weten</h2><p>${ins.txt}</p><button class="btn primary" id="ok">Verder</button></section>`;
  window.scrollTo(0,0); $("#ok").onclick=go; $("#ok").focus();
}

/* ---------- Reality check ---------- */
function renderReality(){
  ST.R = rankAll(ST.answers);
  const top = ST.R.ok[0];
  if (!top){ renderNone(); return; }
  const lines = realityCheck(top, ST.R.P);
  app().innerHTML = `<section class="reality">
    <h2>Even eerlijk, voordat je je uitslag ziet</h2>
    <p class="sub">Een vogel is geen makkelijk huisdier. Dit geldt voor je beste match:</p>
    <ul class="rlist">${lines.map(l=>`<li>${l}</li>`).join("")}</ul>
    <button class="btn primary" id="see">Ik snap het, toon mijn uitslag</button>
    <button class="link" id="edit">Antwoorden aanpassen</button>
  </section>`;
  afterScreen();
  $("#see").onclick=()=>{ ST.sel=0; ST.shown=null; renderResults(); afterScreen(); };
  $("#edit").onclick=()=>{ ST.i=0; ST.savedId=null; ST.fromList=false; renderQ(); };
}
function renderNone(){
  const near = ST.R.out.slice(0,3);
  app().innerHTML = `<section class="reality"><h2>Op dit moment past geen enkele soort helemaal</h2>
  <p class="sub">Dat is ook een uitkomst. Dit zijn de soorten die het dichtst in de buurt kwamen, en waarom ze afvielen:</p>
  <ul class="rlist">${near.map(r=>`<li><b>${r.s.nl}</b>: ${r.hard.map(h=>h.label).join("; ")}</li>`).join("")}</ul>
  <p class="sub">Vaak maakt één knop het verschil: meer tijd, een grotere kooi, of een iets hogere geluidsgrens.</p>
  <button class="btn primary" id="edit">Antwoorden aanpassen</button></section>`;
  afterScreen();
  $("#edit").onclick=()=>{ ST.i=0; ST.savedId=null; ST.fromList=false; renderQ(); };
}

/* ---------- Resultaten ---------- */
const KIND_ICON = { geluid:"🔊", bijten:"🦷", rommel:"🧹", slopen:"🪵", ruimte:"📐", vliegen:"🪽", tijd:"⏰", levensduur:"⏳", kosten:"💶", ervaring:"🎓", kinderen:"🧒", aantal:"👥", welzijn:"⚠️", huisdieren:"🐾", wens:"🔎" };
let noteTimer=null, noteDirty=false;
function flushNotes(){
  clearTimeout(noteTimer); noteTimer=null;
  if (!noteDirty) return; noteDirty=false;
  const t=$("#ntitle"), x=$("#ntext"); if (!t||!x) return;
  if (!ST.savedId && !saveCurrent()) { toast("Bewaren lukt niet in deze browser"); return; }
  if (updateEntry(ST.savedId,{title:t.value.trim(), notes:x.value})){ const st=$("#nstat"); if (st) st.textContent="Bewaard om "+new Date().toLocaleTimeString("nl-NL",{hour:"2-digit",minute:"2-digit"}); const sb=$("#save"); if (sb) sb.innerHTML="Bewaard ✓"; }
}
function renderResults(){
  flushNotes();
  if (!ST.R) ST.R = rankAll(ST.answers);
  const R = ST.R, top5 = R.ok.slice(0,5);
  if (!top5.length){ renderNone(); return; }
  if (ST.sel>=top5.length) ST.sel=0;
  const r = top5[ST.sel], s = r.s, P = R.P;
  const isNew = ST.shown!==s.id; ST.shown = s.id;
  const gap = top5[0].score - r.score;
  const medals = ["🥇","🥈","🥉","#4","#5"];
  const mutIdx = ST.mut[s.id]||0, mut = (s.mut||[])[mutIdx];
  const reasons = reasonsFor(r), warn = watchouts(r);
  const day = idealDay(r, P);
  const sx = sexAdvice(s, ST.sex, r.pair.n);
  const lead = top5[0];
  const begin = s.beginner>=4?"Ja":s.beginner===3?"Met voorbereiding":"Nee";
  const petLine = (P.pets.length && r.pet.pts<=-6) ? `<p class="callout warn">${s.nl} scoort ${r.fit>=0.8?"hoog":"redelijk"} op jouw wensen, maar door je ${P.pets.map(p=>PET_LABEL[p]).join(" en ")} zakt de match ${-(r.pen.find(p=>p.kind==="huisdieren")||{pts:0}).pts} punten. Extra toezicht en gescheiden momenten zijn nodig.</p>` : "";
  const entry = ST.savedId ? findEntry(ST.savedId) : null;
  if (ST.savedId && !entry) ST.savedId=null;
  app().innerHTML = `
  <section class="results">
    ${ST.fromList?`<button class="link back" id="tolist">← Mijn uitslagen</button>`:""}
    ${entry?`<p class="savedbar">📒 Bewaard op ${fmtDate(entry.date)}${entry.title?`: <b>${esc(entry.title)}</b>`:""}. <a href="#notes">Naar je notities</a></p>`:""}
    <nav class="rank" aria-label="Jouw top ${top5.length}">${top5.map((x,i)=>`<button class="rk ${i===ST.sel?"sel":""}" data-i="${i}" aria-current="${i===ST.sel}"><span class="md">${medals[i]}</span>${birdSVG(x.s,{}, "mini")}<span class="rn">${x.s.nl.replace(/ \(.*\)/,"")}</span><span class="rs">${x.score}%</span></button>`).join("")}</nav>

    <article class="hero">
      <div class="plate big ${isNew?"reveal":""}">${birdSVG(s, mut?mut[1]:{})}</div>
      <div class="hero-txt">
        <p class="rankline">${ST.sel===0?"Beste match":"Alternatief "+medals[ST.sel]}${ST.sel>0?(gap===0?`, even hoog als ${lead.s.nl.replace(/ \(.*\)/,"")}`:`, ${gap} punt${gap===1?"":"en"} achter ${lead.s.nl.replace(/ \(.*\)/,"")}`):""}</p>
        <h1>${s.nl}</h1>
        <p class="sci">${s.sci}<span class="cm">${s.cm}${mut&&mutIdx>0?`, ${mut[0]}`:""}</span></p>
        <div class="seal"><b>${r.score}%</b><span>match</span></div>
        <p class="tag">${s.tag}</p>
      </div>
    </article>
    ${petLine}

    <div class="two">
      <section class="card"><h3>Waarom jij en deze vogel passen</h3>
        <ul class="ticks">${reasons.length?reasons.map(p=>`<li>⭐ <b>${p.label}</b> — ${p.why}</li>`).join(""):`<li>Geen uitgesproken voorkeuren — deze soort past vooral door het ontbreken van conflicten met jouw situatie.</li>`}
        ${s.pros.slice(0,3).map(t=>`<li>✓ ${t}</li>`).join("")}</ul></section>
      <section class="card"><h3>Waar je rekening mee moet houden</h3>
        <ul class="ticks">${warn.map(w=>`<li>${KIND_ICON[w.kind]||"•"} ${w.txt}</li>`).join("")}${s.cons.slice(0,3).map(t=>`<li>– ${t}</li>`).join("")}</ul></section>
    </div>

    <section class="card"><h3>In getallen</h3>
      <div class="facts">
        <div><span>Levensduur</span><b>${s.life[0]}–${s.life[1]} jaar</b></div>
        <div><span>Aandacht per dag</span><b>${fmtRange(s.hours[0],s.hours[1])}</b></div>
        <div><span>Beginnersgeschikt</span><b>${begin}</b></div>
        <div><span>Jaarlijkse kosten</span><b>${["","laag","laag","gemiddeld","hoog","zeer hoog"][s.cost]}</b></div>
      </div>
      <dl class="meters">
        <dt>Geluid</dt><dd>${bar(s.noise)}</dd><dt>Rommel</dt><dd>${bar(s.mess)}</dd>
        <dt>Bijten</dt><dd>${bar(s.bite)}</dd><dt>Slopen</dt><dd>${bar(s.destruct)}</dd>
        <dt>Trainbaar</dt><dd>${bar(s.train)}</dd><dt>Vliegbehoefte</dt><dd>${bar(s.flight)}</dd>
        <dt>Sociaal</dt><dd>${bar(s.social)}</dd><dt>Ruimte</dt><dd>${bar(s.space)}</dd>
        <dt>Moeilijkheid</dt><dd>${bar(s.difficulty)}</dd><dt>Knuffelbaar</dt><dd>${bar(s.handsOn)}</dd>
      </dl>
      <p class="fine">${s.noiseNote}</p>
    </section>

    <section class="card accent"><h3>${r.pair.head}</h3>
      <ul class="ticks">${r.pair.why.map(w=>`<li>${w}</li>`).join("")}</ul>
      <p class="fine">${r.pair.trade}</p></section>

    ${P.pets.length?`<section class="card"><h3>Met je andere dieren <span class="lvl ${r.pet.level.replace(" ","")}">${r.pet.level}</span></h3><ul class="ticks">${r.pet.notes.map(n=>`<li>${n}</li>`).join("")}</ul></section>`:""}

    <section class="card"><h3>Jouw ideale dag samen</h3>
      <ul class="day">${day.bits.map(b=>`<li>${b}</li>`).join("")}</ul><p class="fine">${day.generic}</p></section>

    <section class="card"><h3>Man of vrouw?</h3>
      <div class="seg" role="group" aria-label="Voorkeur geslacht">${[["geen","Geen voorkeur"],["man","Man"],["vrouw","Pop"]].map(([v,t])=>`<button class="${ST.sex===v?"sel":""}" data-sex="${v}">${t}</button>`).join("")}</div>
      <ul class="ticks">${sx.map(t=>`<li>${t}</li>`).join("")}</ul></section>

    ${(s.mut||[]).length>1?`<section class="card"><h3>Kleur kiezen</h3><p class="fine">Kies pas een kleur als de soort klopt. Kleur zegt niets betrouwbaars over karakter; kies een vogel op gedrag en gezondheid.</p>
      <div class="muts">${s.mut.map((m,i)=>`<button class="${i===mutIdx?"sel":""}" data-mut="${i}">${birdSVG(s,m[1],"mini")}<span>${m[0]}</span></button>`).join("")}</div></section>`:""}

    <section class="card"><h3>Gezondheid & welzijn</h3><ul class="ticks">${s.risks.map(t=>`<li>🩺 ${t}</li>`).join("")}</ul>${s.legal?`<p class="callout">📜 ${s.legal}</p>`:""}</section>

    <details class="card why"><summary>Waarom krijg ik dit advies?</summary>
      <p class="fine">Score = ${SCORE_BASE} + ${SCORE_FIT} × jouw ‘fit’ (${Math.round(r.fit*100)}%) + strafpunten. Harde incompatibiliteiten laten een soort afvallen, ongeacht hoe goed de rest past.</p>
      <table><thead><tr><th>Jouw wens</th><th>Gewicht</th><th>Match</th></tr></thead><tbody>
      ${r.parts.sort((a,b)=>b.w-a.w).map(p=>`<tr><td>${p.label}<small>${p.why}</small></td><td>${p.w.toFixed(1)}</td><td>${Math.round(p.sim*100)}%</td></tr>`).join("")}
      </tbody></table>
      ${r.pen.length?`<h4>Strafpunten</h4><ul class="ticks">${r.pen.map(p=>`<li>${KIND_ICON[p.kind]||"•"} ${p.label}: <b>${p.pts}</b></li>`).join("")}</ul>`:"<p class='fine'>Geen strafpunten.</p>"}
      <h4>Over de data</h4><p class="fine">${DATA_NOTE}</p>
      <h4>Bronnen voor deze soort</h4><ol class="src">${s.src.map(k=>`<li><a href="${SOURCES[k].u}" target="_blank" rel="noopener">${SOURCES[k].t}</a></li>`).join("")}</ol>
    </details>

    ${R.out.length?`<details class="card"><summary>Afgevallen soorten (${R.out.length})</summary><p class="fine">Deze soorten pasten op sommige punten, maar botsen hard met jouw situatie:</p><ul class="ticks">${R.out.slice(0,8).map(x=>`<li><b>${x.s.nl}</b> — ${x.hard.map(h=>(KIND_ICON[h.kind]||"")+" "+h.label).join("; ")}</li>`).join("")}</ul></details>`:""}

    <details class="card"><summary>Veiligheidschecklist voor in huis</summary><ul class="ticks">${SAFETY.map(([i,t])=>`<li>${i} ${t}</li>`).join("")}</ul>
      ${ST.answers.keuken===1?`<p class="callout warn">Je gaf aan een open keuken of anti-aanbakpannen te hebben: houd de vogel uit de keukenlucht of stap over op PTFE-vrije pannen.</p>`:""}
      ${ST.answers.slaap===0?`<p class="callout warn">Slaap: zet het nachtverblijf in een rustige kamer of gebruik een afdekdoek, zodat hij 10–12 uur donker heeft.</p>`:""}
      ${ST.answers.vakantie===0?`<p class="callout">Regel vóór aanschaf een oppas of vogelpension; voor papegaaien is dat lastiger dan voor een kat.</p>`:""}
    </details>

    <section class="card notes" id="notes"><h3>Mijn notities</h3>
      <p class="fine">Voor je eigen naslag: kwekers en vogeldierenartsen in de buurt, prijzen, vragen, twijfels. ${entry?"Wijzigingen worden automatisch bewaard.":"Zodra je iets typt, wordt deze uitslag automatisch bewaard."}</p>
      <label class="nlabel" for="ntitle">Naam van deze uitslag</label>
      <input id="ntitle" class="ninput" maxlength="80" placeholder="Bijv. ‘Na gesprek met kweker’" value="${esc(entry?entry.title:"")}">
      <label class="nlabel" for="ntext">Notities</label>
      <textarea id="ntext" class="ninput" rows="6" placeholder="Bijv. kweker in Brabant heeft in het voorjaar DNA-geteste jongen; eerst vogeldierenarts zoeken…">${esc(entry?entry.notes:"")}</textarea>
      <p class="fine" id="nstat">${entry?"Uitslag bewaard op "+fmtDate(entry.date):""}</p>
    </section>

    <div class="actions">
      <button class="btn primary" id="save">${entry?"Bewaard ✓":"Bewaar uitslag"}</button>
      <button class="btn" id="copy">Kopieer samenvatting</button>
      <button class="btn" id="edit">Antwoorden aanpassen</button>
      <button class="link" id="restart">Opnieuw beginnen</button>
      <button class="link danger" id="wipe">Wis alles (antwoorden en alle bewaarde uitslagen)</button>
    </div>
  </section>`;
  app().querySelectorAll(".rk").forEach(b=>b.onclick=()=>{ ST.sel=+b.dataset.i; renderResults(); window.scrollTo(0,0); });
  app().querySelectorAll("[data-sex]").forEach(b=>b.onclick=()=>{ ST.sex=b.dataset.sex; const y=window.scrollY; renderResults(); window.scrollTo(0,y); });
  app().querySelectorAll("[data-mut]").forEach(b=>b.onclick=()=>{ ST.mut[s.id]=+b.dataset.mut; const y=window.scrollY; renderResults(); window.scrollTo(0,y); });
  $("#save").onclick=()=>{ if (ST.savedId){ toast("Al bewaard; notities slaan automatisch op"); return; } if (saveCurrent()){ $("#save").innerHTML="Bewaard ✓"; toast("Uitslag bewaard onder ‘Mijn uitslagen’"); } else toast("Bewaren lukt niet in deze browser"); };
  ["ntitle","ntext"].forEach(id=>{ const el=$("#"+id); el.oninput=()=>{ noteDirty=true; clearTimeout(noteTimer); $("#nstat").textContent="Bezig met bewaren…"; noteTimer=setTimeout(flushNotes,600); }; el.onblur=flushNotes; });
  if (ST.fromList) $("#tolist").onclick=()=>{ flushNotes(); renderSaved(); };
  $("#copy").onclick=()=>copySummary(top5, R);
  $("#edit").onclick=()=>{ flushNotes(); ST.R=null; ST.i=0; ST.savedId=null; ST.fromList=false; renderQ(); };
  $("#restart").onclick=()=>{ flushNotes(); ST=fresh(); renderStart(); };
  confirmTap($("#wipe"), "Zeker weten? Tik nogmaals om alles te wissen", wipeAll);
}
function copySummary(top5, R){
  const t = ["Vogelmatch — mijn uitslag", ...top5.map((r,i)=>`${i+1}. ${r.s.nl} (${r.s.sci}) — ${r.score}%, advies: ${r.pair.n===1?"1 vogel":"2 vogels"+(r.pair.plus?" of meer":"")}`),
    "", "Beste match: "+top5[0].s.nl+". "+top5[0].s.tag, "Let op: "+watchouts(top5[0]).map(w=>w.txt).join("; ")].join("\n");
  const done = ()=>toast("Samenvatting gekopieerd");
  if (navigator.clipboard) navigator.clipboard.writeText(t).then(done, ()=>fallback()); else fallback();
  function fallback(){ const ta=document.createElement("textarea"); ta.value=t; document.body.appendChild(ta); ta.select(); try{document.execCommand("copy"); done();}catch(e){toast("Kopiëren lukt niet");} ta.remove(); }
}

renderStart();
