# Video Stream Mentő Chrome bővítmény

Ez a repository egy Manifest V3 alapú Chrome bővítményt tartalmaz, amely a megnyitott weboldalon található, közvetlenül elérhető videó URL-eket felismeri, majd a Chrome letöltési API-ján keresztül elindítja a mentést.

## Fontos korlátok

- A bővítmény csak olyan videókat tud menteni, amelyek nem DRM-védettek és közvetlenül elérhető URL-lel rendelkeznek.
- A `blob:` URL-ek, titkosított streamek és DRM-védett lejátszások nem tölthetők le ezzel a bővítménnyel.
- A Chrome bővítmények biztonsági modellje nem engedi, hogy egy bővítmény tetszőleges abszolút könyvtárba írjon. A beállításokban ezért a Chrome alapértelmezett Letöltések mappáján belüli relatív almappa adható meg.
- A bővítményt csak olyan tartalmak mentésére használd, amelyekhez jogod van, például saját videókhoz, szabadon licencelt anyagokhoz vagy belső vállalati tartalmakhoz.

## Fő funkciók

- Videóelemek és videóra mutató linkek keresése a megnyitott weboldalon.
- Hálózati válaszok figyelése ismert média MIME-típusokra és kiterjesztésekre.
- Letöltés indítása a Chrome letöltési kezelőjével.
- Beállítható cél almappa a Letöltések mappán belül.
- Opcionális Chrome mentési párbeszédablak minden letöltés előtt.

## Telepítés fejlesztői módban

1. Nyisd meg a `chrome://extensions` oldalt.
2. Kapcsold be a **Developer mode** kapcsolót.
3. Kattints a **Load unpacked** gombra.
4. Válaszd ki ezt a repository könyvtárat.

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
