// Draait N willekeurige quizzen en toont hoe vaak elke soort wint (controle op scheefgroei).
// Gebruik: node tests/simulatie.js [aantal]
const { SPECIES } = require("../src/data.js"); global.SPECIES = SPECIES;
const E = require("../src/engine.js");
const { QUESTIONS } = require("../src/questions.js");
const N = +process.argv[2] || 20000;
const pick = a => a[Math.floor(Math.random() * a.length)];
function willekeurig() {
  const a = {};
  for (const q of QUESTIONS) {
    if (q.type === "cards") a[q.id] = pick(q.opts).v;
    else if (q.type === "slider") a[q.id] = q.min + q.step * Math.floor(Math.random() * ((q.max - q.min) / q.step + 1));
    else {
      const o = q.opts.map(x => x.v).filter(v => v !== q.exclusive);
      const k = 1 + Math.floor(Math.random() * Math.min(q.max, 3));
      a[q.id] = [...o].sort(() => Math.random() - 0.5).slice(0, k);
    }
  }
  return a;
}
const cnt = {}; let geen = 0;
for (let i = 0; i < N; i++) { const R = E.rankAll(willekeurig()); if (!R.ok.length) { geen++; continue; } const t = R.ok[0].s.nl; cnt[t] = (cnt[t] || 0) + 1; }
console.log(`${N} quizzen, geen enkele match: ${(geen / N * 100).toFixed(1)}%`);
Object.entries(cnt).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`${(v / N * 100).toFixed(1).padStart(5)}%  ${k}`));
