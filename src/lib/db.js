// Capa de datos. Una sola API para toda la app; por debajo usa Firestore o,
// si no hay configuracion, un almacen local en el navegador (MODO DEMO LOCAL).
// Colecciones: usuarios, publicaciones, recomendaciones, negocios_oficios,
// ayudas_intercambios, recompensas, canjes, emergencias, necesidades, recursos, avisos_minka
import {
  collection, addDoc, getDocs, getDoc, query, where, orderBy, limit, serverTimestamp, doc, updateDoc, setDoc,
} from 'firebase/firestore'
import { db, FIREBASE_ACTIVO } from './firebase'
import { geohash, rangosGeohash, distanciaKm } from './geo'
import { sha256 } from './hash'

export const MODO_DEMO_LOCAL = !FIREBASE_ACTIVO

// ---------- almacen local (solo demo) ----------
const KEY = 'ayni_local_db'
const KEY_VERSION = 'ayni_local_semilla_version'
function leerLocal() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} }
}
function escribirLocal(data) { localStorage.setItem(KEY, JSON.stringify(data)) }
const idLocal = () => 'loc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
function localAdd(col, docu, id) {
  const data = leerLocal()
  const nuevo = { id: id || idLocal(), ...docu, fecha: Date.now() }
  data[col] = [nuevo, ...(data[col] || []).filter((d) => d.id !== nuevo.id)] // mismo id = reemplaza
  escribirLocal(data)
  return nuevo
}
function localList(col) { return (leerLocal()[col] || []) }

// ---------- API ----------

/** Espera una promesa como maximo `ms`; si no, rechaza con Error('timeout').
 *  Con senal debil Firestore guarda la escritura en su cola local y no confirma:
 *  usar esto para no dejar la pantalla esperando para siempre. */
export const conTiempo = (promesa, ms) =>
  Promise.race([promesa, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))])

/** Id nuevo para un documento. Se genera en el celular, funciona sin internet. */
export function nuevoId(col) {
  return MODO_DEMO_LOCAL ? idLocal() : doc(collection(db, col)).id
}

/** Crea un documento en una coleccion. Devuelve el id.
 *  Con `id` fijo la escritura es idempotente: reintentarla (cola offline, recarga) no duplica. */
export async function crear(col, docu, id) {
  if (MODO_DEMO_LOCAL) return localAdd(col, docu, id).id
  const datos = { ...docu, fecha: serverTimestamp() }
  if (id) { await setDoc(doc(db, col, id), datos); return id }
  const ref = await addDoc(collection(db, col), datos)
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

/** Crea sin colgarse: si Firestore no confirma en `ms` (sin senal), queda en su cola local y sube solo.
 *  Id fijo = reintentos no duplican. Devuelve { id, sinSenal }. */
export async function crearSeguro(col, docu, id = nuevoId(col), ms = 4000) {
  try { await conTiempo(crear(col, docu, id), ms); return { id, sinSenal: false } }
  catch (e) { if (e.message !== 'timeout') throw e; return { id, sinSenal: true } }
}

/** Actualiza sin colgarse (misma idea que crearSeguro). */
export async function actualizarSeguro(col, id, cambios, ms = 4000) {
  try { await conTiempo(actualizar(col, id, cambios), ms) }
  catch (e) { if (e.message !== 'timeout') throw e }
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

/** Lee un documento por id. Devuelve null si no existe. */
export async function obtener(col, id) {
  if (MODO_DEMO_LOCAL) return localList(col).find((d) => d.id === id) || null
  const s = await getDoc(doc(db, col, id))
  return s.exists() ? { id: s.id, ...s.data() } : null
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

/** MODO DEMO LOCAL: carga /semilla.json (misma data que datos/semilla.json).
 *  Si la semilla cambia, reemplaza solo lo sembrado y conserva lo que publico el usuario. */
export async function inicializarDemoLocal() {
  if (!MODO_DEMO_LOCAL) return
  try {
    const texto = await (await fetch('/semilla.json')).text()
    const version = await sha256(texto)
    if (localStorage.getItem(KEY_VERSION) === version) return
    const semilla = JSON.parse(texto)
    const data = leerLocal()
    for (const [col, docs] of Object.entries(semilla)) {
      const propios = (data[col] || []).filter((d) => !d.deSemilla)
      const sembrados = docs.map((d, i) => ({ id: `semilla_${col}_${i}`, ...d, deSemilla: true, fecha: Date.now() - i * 60000 }))
      data[col] = [...propios, ...sembrados]
    }
    escribirLocal(data)
    localStorage.setItem(KEY_VERSION, version)
  } catch (e) { console.warn('No se pudo cargar semilla local (sin internet: se usa lo guardado)', e) }
}

/** Prepara una publicacion: ubicacion aproximada + geohash. */
export function conGeo(docu, geoAprox) {
  return { ...docu, geo: geoAprox, geohash: geohash(geoAprox) }
}
