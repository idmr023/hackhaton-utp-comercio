// Cola de publicaciones pendientes (IndexedDB) para cuando no hay internet.
// Flujo: sin senal -> encolar() -> al volver la senal, sincronizar() las sube a Firestore en orden.
// Nota: Firestore ya tiene persistencia offline propia; esta cola ademas permite mostrar el
// estado "pendiente" al vecino y reintentar la clasificacion IA cuando vuelva internet.
import { crear } from './db'

const DB_NAME = 'ayni_offline'
const STORE = 'cola'

function abrir() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'localId', autoIncrement: true })
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function tx(modo, fn) {
  return abrir().then((idb) => new Promise((resolve, reject) => {
    const t = idb.transaction(STORE, modo)
    const r = fn(t.objectStore(STORE))
    t.oncomplete = () => resolve(r?.result ?? r)
    t.onerror = () => reject(t.error)
  }))
}

export async function encolar(col, docu) {
  await tx('readwrite', (s) => s.add({ col, docu, creadoEn: Date.now() }))
}

export async function pendientes() {
  return tx('readonly', (s) => s.getAll())
}

/** Sube todo lo pendiente en orden FIFO. Devuelve cuantos subio. */
export async function sincronizar(onCadaUno) {
  const lista = await pendientes()
  let subidos = 0
  for (const item of lista) {
    try {
      await crear(item.col, { ...item.docu, estado: 'activa' })
      await tx('readwrite', (s) => s.delete(item.localId))
      subidos++
      onCadaUno?.(item)
    } catch (e) {
      console.warn('No se pudo sincronizar, se reintenta luego', e)
      break // mantiene el orden; se reintenta en el proximo evento online
    }
  }
  return subidos
}

/** Activa la sincronizacion automatica al recuperar conexion. */
export function activarAutoSync(onSync) {
  const handler = async () => {
    const n = await sincronizar()
    if (n > 0) onSync?.(n)
  }
  window.addEventListener('online', handler)
  if (navigator.onLine) handler()
  return () => window.removeEventListener('online', handler)
}
