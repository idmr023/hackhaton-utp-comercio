// Datos semilla para la demo. P3 edita `datos/semilla.json` con el barrio real.
// Uso: npm run seed   (necesita .env con Firebase; si no hay, imprime un aviso)
// En MODO DEMO LOCAL (sin Firebase) la app carga public/semilla.json sola la primera vez.
import { readFileSync } from 'node:fs'
import 'dotenv/config'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { geohashForLocation } from 'geofire-common'

const cfg = {
  apiKey: process.env.VITE_FIREBASE_API_KEY, authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID, appId: process.env.VITE_FIREBASE_APP_ID,
}
if (!cfg.apiKey) { console.log('Sin Firebase en .env: nada que sembrar (la app usa modo demo local).'); process.exit(0) }

const db = getFirestore(initializeApp(cfg))
const semilla = JSON.parse(readFileSync(new URL('../datos/semilla.json', import.meta.url)))

// Con `id` fijo: se crea una sola vez (correr seed 2 veces no duplica). Sin `id`: addDoc.
for (const [col, docs] of Object.entries(semilla)) {
  let nuevos = 0
  for (const { id, ...d } of docs) {
    if (d.geo) d.geohash = geohashForLocation([d.geo.lat, d.geo.lng])
    const datos = { ...d, fecha: serverTimestamp() }
    if (!id) { await addDoc(collection(db, col), datos); nuevos++; continue }
    const ref = doc(db, col, id)
    if ((await getDoc(ref)).exists()) continue
    await setDoc(ref, datos); nuevos++
  }
  console.log(`${col}: ${nuevos} nuevos, ${docs.length - nuevos} ya existian`)
}
console.log('Semilla cargada.')
process.exit(0)
