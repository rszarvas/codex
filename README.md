# Video Stream Mentő Chrome bővítmény

Ez a repository egy Manifest V3 alapú Chrome bővítményt tartalmaz, amely a megnyitott weboldalon található, közvetlenül elérhető videó URL-eket felismeri, majd a Chrome letöltési API-ján keresztül elindítja a mentést.

## Fontos korlátok

- A bővítmény csak olyan videókat tud menteni, amelyek nem DRM-védettek és közvetlenül elérhető URL-lel rendelkeznek.
- A `blob:` URL-ek, titkosított streamek és DRM-védett lejátszások nem tölthetők le ezzel a bővítménnyel.
- A Chrome bővítmények biztonsági modellje nem engedi, hogy egy bővítmény tetszőleges abszolút könyvtárba írjon. A beállításokban ezért a Chrome alapértelmezett Letöltések mappáján belüli relatív útvonal adható meg.
- A bővítményt csak olyan tartalmak mentésére használd, amelyekhez jogod van, például saját videókhoz, szabadon licencelt anyagokhoz vagy belső vállalati tartalmakhoz.

## Fő funkciók

- Videóelemek és videóra mutató linkek keresése a megnyitott weboldalon.
- Hálózati válaszok figyelése ismert média MIME-típusokra és kiterjesztésekre.
- Letöltés indítása a Chrome letöltési kezelőjével.
- Beállítható cél almappa a Letöltések mappán belül.
- Opcionális Chrome mentési párbeszédablak minden letöltés előtt.

## Hol vannak a betöltendő fájlok?

A Chrome-ba azt a mappát kell betölteni, amelynek a gyökerében közvetlenül megtalálható a `manifest.json`, mellette pedig a teljes `src` mappa.

Helyes mappaszerkezet:

```text
video-stream-mento/
├── manifest.json
├── README.md
└── src/
    ├── background.js
    ├── content-script.js
    ├── options.html
    ├── options.js
    ├── popup.html
    └── popup.js
```

Fontos: a Chrome **Load unpacked** ablakában ne a `src` mappát, és ne egy konkrét HTML fájlt válassz ki. Mindig a fenti gyökérmappát válaszd, ahol a `manifest.json` közvetlenül látható.

## Telepítés fejlesztői módban

1. Másold vagy töltsd le a teljes projektmappát a saját gépedre.
2. Nyisd meg a `chrome://extensions` oldalt.
3. Kapcsold be a **Developer mode** kapcsolót.
4. Kattints a **Load unpacked** gombra.
5. Válaszd ki azt a teljes projektmappát, amelyben közvetlenül ott van a `manifest.json` és a `src` mappa.
6. Ha korábban már betöltötted hibás mappából, előbb távolítsd el a régi példányt a Chrome Extensions oldalon, majd töltsd be újra a helyes mappából.

## ERR_FILE_NOT_FOUND hiba javítása

Ha a bővítmény ikonjára kattintva Chrome hibaoldalt látsz `ERR_FILE_NOT_FOUND` üzenettel, akkor a Chrome nem találja a manifestben megadott popup vagy beállítási fájlt.

Leggyakoribb okok és megoldások:

1. **Nem a teljes mappát töltötted be.**
   - Megoldás: a **Load unpacked** gombnál azt a mappát válaszd, amelyben a `manifest.json` és a `src` mappa is látható.
2. **Át lett helyezve vagy át lett nevezve a projektmappa betöltés után.**
   - Megoldás: Chrome-ban távolítsd el a bővítményt, majd töltsd be újra az új helyéről.
3. **Hiányzik a `src/popup.html` vagy a `src/options.html`.**
   - Megoldás: ellenőrizd, hogy a teljes `src` mappa át lett másolva, nem csak a `manifest.json`.
4. **Közvetlenül egy HTML fájlt nyitottál meg `file://` útvonallal.**
   - Megoldás: ne a HTML fájlt nyisd meg. A bővítményt a `chrome://extensions` oldalon, **Load unpacked** móddal kell betölteni.

## Használat

1. Nyiss meg egy oldalt, amelyen jogosultan menthető videó található.
2. Indítsd el a videó lejátszását, hogy a bővítmény a hálózati stream URL-t is észlelhesse.
3. Kattints a bővítmény ikonjára.
4. Válaszd ki a listából a menteni kívánt elemet, majd kattints a **Letöltés** gombra.
5. A cél almappát a **Beállítások** gombbal módosíthatod.

## Fájlstruktúra

- `manifest.json` – Chrome Manifest V3 konfiguráció.
- `src/background.js` – háttér service worker, média URL-ek gyűjtése és letöltés indítása.
- `src/content-script.js` – oldalon belüli videóelemek és linkek felismerése.
- `src/popup.html`, `src/popup.js`, `src/popup.css` – felugró kezelőfelület.
- `src/options.html`, `src/options.js`, `src/options.css` – beállítási oldal.
