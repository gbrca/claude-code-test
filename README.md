# 🚗 Autó Szimulátor - BeamNG Style

Egy egyszerű, de élvezetes autó szimulátor a böngészőben, amely a BeamNG Drive stílusát követi. A projekt Three.js-t használ a 3D megjelenítéshez és Cannon.js-t a fizikai szimulációhoz.

## ✨ Jellemzők

- **Valósághű fizika**: Cannon.js fizikai motor a realisztikus autó viselkedésért
- **3D grafika**: Three.js alapú 3D renderelés árnyékokkal és világítással
- **Többféle kamera nézet**: Követő, első személy és kinematikus kamerák
- **Interaktív környezet**: Rámpa, dobozok és egyéb akadályok
- **Teljes irányítás**: Gyorsítás, fékezés, kormányzás és kézifék
- **Valós idejű sebességmérő**: Km/h-ban kijelzett sebesség

## 🎮 Irányítás

| Billentyű | Funkció |
|-----------|---------|
| `W` / `↑` | Gyorsítás |
| `S` / `↓` | Fékezés / Tolat |
| `A` / `←` | Balra fordulás |
| `D` / `→` | Jobbra fordulás |
| `SPACE` | Kézifék |
| `C` | Kamera váltás |
| `R` | Autó visszaállítása |

## 🚀 Használat

### Egyszerű indítás

1. Nyisd meg az `index.html` fájlt egy modern böngészőben (Chrome, Firefox, Edge ajánlott)
2. Várj, amíg betöltődnek a könyvtárak
3. Kezdj el vezetni!

### Helyi szerver indítása (ajánlott)

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (ha telepítve van http-server)
npx http-server
```

Ezután nyisd meg a böngészőt és navigálj a `http://localhost:8000` címre.

## 📋 Rendszerkövetelmények

- Modern böngésző WebGL támogatással
- Stabil internetkapcsolat (a Three.js és Cannon.js CDN-ről töltődik be)
- Ajánlott: Dedikált videókártya a jobb teljesítményért

## 🛠️ Technológiák

- **Three.js (r128)**: 3D grafikai könyvtár WebGL-hez
- **Cannon.js (0.6.2)**: Fizikai motor JavaScript-ben
- **HTML5 & CSS3**: Modern webes technológiák
- **Vanilla JavaScript**: Tiszta JavaScript, keretrendszer nélkül

## 🎨 Jellemzők részletesen

### Fizikai szimuláció
- Realisztikus gumiabroncs-tapadás
- Felfüggesztés szimuláció
- Súrlódási és fékerő számítás
- Gravitáció és tömegközéppont

### Vizuális effektek
- Dinamikus árnyékok
- Köd effekt a távolban
- Környezeti világítás (ambient, directional, hemisphere)
- Változatos terep geometria

### Kamera rendszerek
1. **Követő kamera**: Az autó mögött követi a járművet
2. **Első személy**: Vezetői nézet az autó belsejéből
3. **Kinematikus**: Körbeforog az autó körül

## 🔧 Testreszabás

A `main.js` fájlban található `vehicleParams` objektumban módosíthatod az autó paramétereit:

```javascript
const vehicleParams = {
    chassisWidth: 1.8,      // Autó szélesség
    chassisHeight: 0.6,     // Autó magasság
    chassisLength: 4,       // Autó hosszúság
    wheelRadius: 0.4,       // Kerék sugár
    maxSteerVal: Math.PI/8, // Maximum kormányzási szög
    maxForce: 1500,         // Maximum motor erő
    brakeForce: 100,        // Fékező erő
    mass: 800               // Autó tömege (kg)
};
```

## 📝 Fejlesztési lehetőségek

- [ ] Több autó modell
- [ ] Nagyobb pálya különböző tereptípusokkal
- [ ] Autó sérülés szimuláció (mint a BeamNG-ben)
- [ ] Többjátékos mód
- [ ] Hangeffektek (motor, gumiabroncs csikorgás)
- [ ] Különböző időjárási viszonyok
- [ ] Vezetéstámogató rendszerek (ABS, ESP)
- [ ] Pályaszerkesztő

## 🐛 Hibajavítás

**Az oldal nem töltődik be / üres képernyő:**
- Ellenőrizd az internetkapcsolatot (CDN könyvtárak betöltéséhez)
- Nyisd meg a böngésző konzolt (F12) és keresd a hibákat
- Használj HTTPS vagy localhost szervert

**Lassú teljesítmény:**
- Csökkentsd a böngésző ablak méretét
- Zárd be a többi böngésző tabot
- Frissítsd a videókártyaDriverEit

**Az irányítás nem működik:**
- Kattints az ablakra, hogy fókuszban legyen
- Próbáld meg frissíteni az oldalt (F5)

## 📜 Licenc

Ez a projekt oktatatási célokra készült és szabadon felhasználható.

## 🙏 Köszönetnyilvánítás

- **Three.js** - Amazing 3D graphics library
- **Cannon.js** - Fantastic physics engine
- **BeamNG Drive** - Inspiráció a játékmenethez

---

Készítette: Claude | Élvezd a vezetést! 🏁
