// Testprofielen A–E en extremen. Gebruik: node tests/profielen.js
const { SPECIES } = require("../src/data.js"); global.SPECIES = SPECIES;
const E = require("../src/engine.js");
const profielen = {
  "A  appartement, stil, weinig tijd, beginner": {doel:"samen",ochtend:["tafel"],karakter:["rustig"],woning:"app",geluid:1,tijd:0.5,alleen:2,vliegen:2,ruimte:3,dieren:["geen"],ervaring:1,bijten:2,rommel:2,levensduur:20,budget:2,formaat:"x",aantal:"weet"},
  "B  veel tijd, groot huis, lawaai oké, slim": {doel:"maatje",ochtend:["praat","tafel"],karakter:["slim","praten","clown"],woning:"vrij",geluid:5,tijd:5,alleen:0,vliegen:3,ruimte:5,dieren:["geen"],ervaring:4,leren:3,bijten:5,rommel:5,slopen:5,levensduur:80,budget:5,formaat:"groot",aantal:"een"},
  "C  mooie zang, weinig interactie": {doel:"kijken",ochtend:["zang"],karakter:["zang","rustig"],woning:"rij",geluid:2,tijd:0.5,alleen:2,vliegen:0,ruimte:3,dieren:["geen"],ervaring:1,bijten:2,rommel:2,levensduur:20,budget:2,formaat:"klein",aantal:"weet"},
  "D  één sociale, speelse vlieger": {doel:"maatje",ochtend:["schouder","vlucht"],karakter:["aanhankelijk","clown","vlieger"],woning:"rij",geluid:3,tijd:3,alleen:0,vliegen:3,ruimte:3,dieren:["geen"],ervaring:2,leren:3,bijten:4,rommel:4,levensduur:80,budget:3,formaat:"x",aantal:"een",training:["target","recall","trucs"]},
  "E  konijnen + vrij vliegen": {doel:"maatje",ochtend:["vlucht","schouder"],karakter:["aanhankelijk","clown","vlieger"],woning:"rij",geluid:3,tijd:3,alleen:1,vliegen:3,ruimte:3,dieren:["konijn"],ervaring:2,bijten:4,rommel:3,levensduur:80,budget:3,formaat:"x",aantal:"weet"},
  "X1 kat + hond, beginner": {doel:"maatje",karakter:["aanhankelijk"],woning:"app",geluid:2,tijd:2,alleen:1,vliegen:2,ruimte:2,dieren:["kat","hond"],ervaring:1,bijten:4,rommel:3,levensduur:20,budget:2,formaat:"x",aantal:"weet"},
  "X2 alles streng (verwacht: weinig/niets)": {doel:"kijken",karakter:[],woning:"app",geluid:1,tijd:0,alleen:2,vliegen:0,ruimte:2,dieren:["kat"],ervaring:1,bijten:2,rommel:1,levensduur:12,budget:2,formaat:"x",aantal:"een"},
};
for (const [naam, a] of Object.entries(profielen)) {
  const R = E.rankAll(a);
  console.log(`\n== ${naam} ==`);
  R.ok.slice(0, 5).forEach((r, i) => console.log(`${i + 1}. ${r.s.nl.padEnd(36)} ${String(r.score).padStart(3)}%  ${r.pair.n === 1 ? "1 vogel" : "2 vogels"}`));
  console.log("   afgevallen:", R.out.slice(0, 4).map(r => `${r.s.nl} [${r.hard.map(h => h.kind).join("/")}]`).join("; ") || "-");
}
