// Capa de datos. Una sola API para toda la app; por debajo usa Firestore o,
// si no hay configuracion, un almacen local en el navegador (MODO DEMO LOCAL).
// Colecciones: usuarios, publicaciones, recomendaciones, negocios_oficios,
// ayudas_intercambios, recompensas, canjes, emergencias, necesidades, recursos, avisos_minka
import {
  collection, addDoc, getDocs, query, where, orderBy, limit, serverTimestamp, doc, updateDoc,
} from 'firebase/firestore'
import { db, FIREBASE_ACTIVO } from './firebase'
import { geohash, rangosGeohash, distanciaKm } from './geo'

export const MODO_DEMO_LOCAL = !FIREBASE_ACTIVO

// ---------- almacen local (solo demo) ----------
const KEY = 'ayni_local_db'
function leerLocal() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} }
}
function escribirLocal(data) { localStorage.setItem(KEY, JSON.stringify(data)) }
function localAdd(col, docu) {
  const data = leerLocal()
  data[col] = data[col] || []
  const nuevo = { id: 'loc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7), ...docu, fecha: Date.now() }
  data[col].unshift(nuevo)
  escribirLocal(data)
  return nuevo
}
function localList(col) { return (leerLocal()[col] || []) }

// ---------- API ----------

/** Crea un documento en una coleccion. Devuelve el id. */
export async function crear(col, docu) {
  if (MODO_DEMO_LOCAL) return localAdd(col, docu).id
  const ref = await addDoc(collection(db, col), { ...docu, fecha: serverTimestamp() })
  return ref.id
}

export async function actualizar(col, id, cambios) {
  if (MODO_DEMO_LOCAL) {
    const data = leerLocal()
    data[col] = (data[col] || []).map((d) => (d.id === id ? { ...d, ...cambios } : d))
    escribirLocal(data)
    return
  }
  await updateDoc(doc(db, col, id), cambios)
}

/** Lista documentos de una coleccion con geo dentro de un radio (km) desde centro. */
export async function listarCerca(col, centro, radioKm, filtros = {}) {
  let docs = []
  if (MODO_DEMO_LOCAL) {
    docs = localList(col)
  } else {
    // Una consulta por rango de geohash (geofire), luego filtro exacto por distancia
    const rangos = rangosGeohash(centro, radioKm)
    const partes = await Promise.all(
      rangos.map(([ini, fin]) =>
        getDocs(query(collection(db, col), orderBy('geohash'), where('geohash', '>=', ini), where('geohash', '<=', fin), limit(200))),
      ),
    )
    docs = partes.flatMap((s) => s.docs.map((d) => ({ id: d.id, ...d.data() })))
  }
  return docs
    .filter((d) => d.geo && distanciaKm(centro, d.geo) <= radioKm)
    .filter((d) => Object.entries(filtros).every(([k, v]) => d[k] === v))
    .map((d) => ({ ...d, distanciaKm: distanciaKm(centro, d.geo) }))
    .sort((a, b) => a.distanciaKm - b.distanciaKm)
}

/** Lista simple (sin geo), por ejemplo avisos_minka o recompensas. */
export async function listar(col, filtros = {}, max = 100) {
  if (MODO_DEMO_LOCAL) {
    return localList(col).filter((d) => Object.entries(filtros).every(([k, v]) => d[k] === v)).slice(0, max)
  }
  let q = collection(db, col)
  const conds = Object.entries(filtros).map(([k, v]) => where(k, '==', v))
  q = query(q, ...conds, limit(max))
  const s = await getDocs(q)
  return s.docs.map((d) => ({ id: d.id, ...d.data() }))
}

/** MODO DEMO LOCAL: la primera vez carga /semilla.json (misma data que datos/semilla.json). */
export async function inicializarDemoLocal() {
  if (!MODO_DEMO_LOCAL || localStorage.getItem(KEY)) return
  try {
    const semilla = await (await fetch('/semilla.json')).json()
    const data = {}
    for (const [col, docs] of Object.entries(semilla)) {
      data[col] = docs.map((d, i) => ({ id: `semilla_${col}_${i}`, ...d, fecha: Date.now() - i * 60000 }))
    }
    escribirLocal(data)
  } catch (e) { console.warn('No se pudo cargar semilla local', e) }
}

/** Prepara una publicacion: ubicacion aproximada + geohash. */
export function conGeo(docu, geoAprox) {
  return { ...docu, geo: geoAprox, geohash: geohash(geoAprox) }
}
