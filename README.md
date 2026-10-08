# Vogelmatch

Een offline quiz die helpt bij de keuze voor een vogel als huisdier. Geen persoonlijkheidsquiz, maar een matching-tool: je krijgt 3–5 soorten die passen bij je huis, je week en je wensen, met uitleg waarom, wat de vogel nodig heeft en waar je rekening mee moet houden.

Alles draait lokaal in de browser. Geen backend, geen account, geen netwerkverkeer tijdens gebruik.

## Gebruiken

Open `index.html` in een browser. Dat is alles: geen installatie, geen server. De pagina laadt de scripts uit `src/`, dus houd die map ernaast.

Wil je één los bestand, bijvoorbeeld om te delen of op een telefoon te openen:

```
python3 build.py     # schrijft dist/vogelmatch.html
```

Wil je het online zetten, bijvoorbeeld via GitHub Pages: publiceer de hoofdmap van de repo.

## Wat het doet

- **Twee versies:** snel (17 vragen, ±5 min) en uitgebreid (26 vragen, ±10 min).
- **32 soorten** in vijf categorieën: zang- en siervogels, parkieten, kleine, middelgrote en grote papegaaien.
- **Gewogen matching** in plaats van punten tellen. Een soort krijgt een fit-score uit je wensen, strafpunten voor mismatches en valt af bij een harde incompatibiliteit (bijvoorbeeld veel te luid, te weinig ruimte, te weinig tijd of een levensduur die je niet wilt aangaan).
- **Per soort:** redenen voor de match, aandachtspunten, levensduur, tijdsbesteding, kosten, risico's, een ideale dag en bronnen.
- **1 of 2 vogels:** een eigen beslislogica per soort, afhankelijk van sociale behoefte, je werkweek, beschikbare tijd en gewenste band.
- **Andere huisdieren:** een aparte compatibiliteitsbeoordeling (kat, hond, konijn/cavia, knaagdieren, vogels, reptielen). Tam betekent nooit veilig onbeheerd samen.
- **Man of pop** en **kleur/mutatie** komen pas ná de soortkeuze, met de nadruk dat individueel karakter zwaarder weegt dan geslacht of kleur.
- **Reality check** vóór de uitslag en een veiligheidschecklist (PTFE, ramen, ventilatoren, planten, slaap, free flight).
- **Mijn uitslagen:** uitslagen bewaren met een eigen naam en notities, alleen in de browser (`localStorage`).
- **“Waarom krijg ik dit advies?”** toont per soort de gewichten, strafpunten en bronnen.

## Structuur

```
src/
  data.js        soortendatabase (kenmerken, teksten, bronnen)
  questions.js   vragen en tussentijdse inzichten
  engine.js      scoring, 1-of-2-advies, huisdieren-check, uitleg
  app.js         interface en opslag
tests/
  profielen.js   vaste testprofielen (appartement, veel tijd, zang, konijnen, extremen)
  simulatie.js   willekeurige quizzen: controleert op scheefgroei in de uitslagen
index.html       opmaak (CSS) en HTML-skelet; laadt de scripts uit src/
build.py         optioneel: bouwt alles tot één bestand (dist/vogelmatch.html)
```

Er is geen bouwstap nodig: pas een bestand in `src/` aan en herlaad de pagina.

## Testen

```
node tests/profielen.js        # vaste profielen, top 5 + afvallers
node tests/simulatie.js 20000  # verdeling van winnaars over willekeurige quizzen
```

Draai de simulatie na elke wijziging aan de data of de scoring. Een soort die structureel te vaak wint (bijvoorbeeld omdat hij nergens een nadeel heeft) wijst op een kalibratieprobleem. De kalibratie staat bovenaan `src/engine.js` (`SCORE_BASE`, `SCORE_FIT`, `PEN_SCALE`).

## Een soort toevoegen

Voeg een object toe aan `SPECIES` in `src/data.js`, volgens het patroon van de bestaande soorten:

- kenmerken op een schaal van 1–5 (`noise`, `bite`, `mess`, `social`, `difficulty`, …), levensduur `life: [min, max]` en dagelijkse aandacht `hours: [min, max]`;
- `pair`: `solo`, `paar`, `groep` of `flex` (stuurt het 1-of-2-advies);
- teksten (`tag`, `pros`, `cons`, `risks`, `pairNote`, `sexNote`, `day`);
- kleuren `c` voor de illustratie en `mut` voor kleurvarianten;
- `src`: sleutels uit `SOURCES`.

Bouw daarna opnieuw en draai de tests.

## Over de data

De schalen zijn **kwalitatieve inschattingen** op basis van de genoemde bronnen en ervaringskennis, geen meetwaarden. Ze beschrijven soortgemiddelden; individuele vogels verschillen sterk. Zie `DATA_NOTE` in `src/data.js`.

Hoofdbronnen: LICG-huisdierenbijsluiters, Young e.a. (2012) over levensduur van papegaaien in gevangenschap, World Parrot Trust, Lafeber, NBvV, CITES, IPLO en Sovon voor regelgeving rond invasieve soorten. De volledige lijst staat in `SOURCES` in `src/data.js` en per soort in de uitslag.

Regelgeving verandert. Controleer bij aanschaf altijd de actuele regels, onder meer rond CITES-papieren en de EU-lijst van invasieve exoten.

## Disclaimer

Dit is een hulpmiddel om na te denken, geen vervanging van advies van een vogeldierenarts of ervaren houders. Een vogel is een langdurige verantwoordelijkheid: veel papegaaien worden 20–60 jaar of ouder.
