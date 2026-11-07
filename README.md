# Ayni – "tu barrio se ayuda"
Hackathon UTP – El Comercio 2026 · PWA para conseguir productos, servicios y ayuda entre vecinos, con **Modo Minka** para emergencias.

> Contexto completo del proyecto (reto, propuesta, roles, cronograma, guion de demo): [`docs/AYNI_CONTEXTO_COMPLETO.md`](docs/AYNI_CONTEXTO_COMPLETO.md). Diagramas en `docs/`.

## Correr en 2 minutos (P1)
```bash
npm install
cp .env.example .env        # en Windows: copy .env.example .env
npm run dev                  # app en http://localhost:5173
npm run server               # en OTRA terminal: mini servidor Didit en :3001
```
Sin nada en `.env` la app corre en **modo demo local** (datos en el navegador, con el barrio de ejemplo ya cargado). Cuando P4 tenga Firebase, se pegan las claves en `.env` y se reinicia `npm run dev`: la misma app pasa a usar Firestore.

### Probar desde el celular (P2 / P3)
- **Misma Wi-Fi:** `npm run dev` muestra una URL `http://192.168.x.x:5173`. Ábrela en Chrome del celular. (Así el modo offline NO funciona: el service worker exige HTTPS.)
- **Con HTTPS (offline real):** `npx cloudflared tunnel --url http://localhost:5173` y abrir el link `https://....trycloudflare.com` que imprime. Gratis, sin cuenta.
- Para probar offline en la PC: DevTools → Network → Offline.

## Estructura
```
src/
  App.jsx              rutas, barra superior (modo, conexión), navegación inferior
  index.css            estilos móvil-primero, letra grande, botones de 48 px
  lib/
    firebase.js        init Firebase + persistencia offline (o modo demo local si .env vacío)
    db.js              capa de datos: crear / listar / listarCerca (geohash) — Firestore o local
    geo.js             celda aproximada ~300 m, geohash, distancia, radios (1 km por defecto)
    offlineQueue.js    cola IndexedDB de publicaciones + sincronización al volver la señal
    ia.js              Gemini (clasificar, resumir) + clasificador de respaldo por palabras clave
    estado.jsx         estado global: usuario, modo barrio/minka, online, ubicación, radio
  pages/
    Tutorial.jsx       3 pantallas, solo la primera vez
    Registro.jsx       teléfono + DNI → /api/verificar-dni (Didit) → hash del DNI
    Mapa.jsx           Modo Barrio: mapa Leaflet, selector de radio, negocios, publicaciones, botón +
    Publicar.jsx       3 toques: tipo → texto/voz/foto → Publicar (online o a la cola)
    Minka.jsx          3 botones, necesidades/recursos cercanos, boletín       ← P3 completa
    Puntos.jsx         saldo, catálogo de recompensas, canje con código de 6 dígitos ← P3 completa
    Perfil.jsx         datos, verificación, WhatsApp opt-in
server/index.js        Express: POST /api/verificar-dni → Didit (RENIEC). Única copia de la API key.
firestore.rules        reglas mínimas (P4 las sube en la consola)
datos/semilla.json     barrio de ejemplo (P3 lo cambia por el real) · public/semilla.json = copia para modo local
scripts/seed.mjs       `npm run seed` carga datos/semilla.json en Firestore
```

## Colecciones Firestore
`usuarios` · `publicaciones` · `recomendaciones` · `negocios_oficios` · `ayudas_intercambios` · `recompensas` · `canjes` · `emergencias` · `necesidades` · `recursos` · `avisos_minka` · `estados_minka`

Todo documento con ubicación lleva `geo` (celda aproximada) y `geohash`; `listarCerca()` consulta por rangos de geohash y filtra por distancia real.

## Pendientes por rol (sábado)
- **P2 + P1:** Firebase Auth por SMS en `Registro.jsx`; popup de negocio con botón "Recomendar"; foto en el popup; probar offline real por HTTPS.
- **P3 + P1:** en `Minka.jsx` mapa de necesidades (rojo) vs recursos (verde) y match automático (`recursos` más cercano del mismo tipo → `necesidades.asignadoA`); en `Puntos.jsx` restar puntos al canjear, confirmar ayuda con código de 4 dígitos + distancia < 200 m, reglas antifraude (10/5/0 por pareja, tope 3/día); botón WhatsApp en perfiles de vecinos.
- **P4 + P1:** pegar claves en `.env`, subir `firestore.rules`, `npm run seed`, probar Didit con curl y poner `DIDIT_API_KEY`; prompt de resumen de zona para el boletín.

## Costo
S/ 0: Firebase Spark (sin tarjeta), Gemini nivel gratuito, Didit 500 verificaciones/mes, OpenStreetMap. **Nadie vincula una tarjeta a Firebase ni Google Cloud.**
