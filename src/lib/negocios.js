// Negocios del barrio: categorias (para filtrar en Vecinos → Negocios) y resenas (estrellas) por negocio.
// Las recomendaciones a negocios viven en la misma coleccion `recomendaciones` que las de vecinos,
// con paraTipo: 'negocio' y paraId = id del negocio (una por vecino y negocio: id fijo rec_{de}_{negocio}).
import { listar } from './db'

export const CATEGORIAS_NEGOCIO = [
  ['todo', 'Todo'], ['comida', 'Comida'], ['salud', 'Salud'], ['hogar', 'Hogar y oficios'], ['belleza', 'Belleza'], ['tiendas', 'Tiendas'],
]
const REGLAS = [
  ['comida', /abarrote|bodega|pan|men[uú]|restaur|poller|verdul|fruta|verdura|comida|juguer|cevich|chifa|pizza/i],
  ['salud', /farmac|salud|veterin|mascota|cl[ií]nic|dent|[oó]ptic/i],
  ['hogar', /ferret|gasfit|electric|t[ée]cnico|costur|enmiend|lavander|mec[aá]n|llanta|zapat|calzado|carpint|pint|cerraj|limpieza|mudanza/i],
  ['belleza', /peluq|barber|est[ée]tica|spa|u[ñn]as|belleza/i],
]
/** Categoria de un negocio segun su rubro o nombre. Lo que no calza va a "tiendas". */
export const categoriaNegocio = (rubro = '', nombre = '') => REGLAS.find(([, re]) => re.test(rubro) || re.test(nombre))?.[0] || 'tiendas'
export const nombreCategoria = (id) => CATEGORIAS_NEGOCIO.find(([k]) => k === id)?.[1] || 'Tiendas'

/** Resenas de TODOS los negocios de una vez (una sola consulta): { [negocioId]: { n, promedio } }. */
export async function cargarResenasNegocios() {
  const lista = await listar('recomendaciones', { paraTipo: 'negocio' }, 1000)
  const por = {}
  for (const r of lista) {
    const x = (por[r.paraId] ??= { n: 0, suma: 0 })
    x.n += 1; x.suma += Number(r.estrellas) || 0
  }
  return Object.fromEntries(Object.entries(por).map(([id, { n, suma }]) => [id, { n, promedio: n ? suma / n : 0 }]))
}

/** Visible para los vecinos: ni quitado del mapa ("retirado") ni eliminado. */
export const negocioVisible = (n) => !!n && n.estado !== 'retirado' && n.estado !== 'eliminado'

/** ELIMINAR mi negocio: las reglas no dejan borrar, asi que el documento queda con estado "eliminado" y sin datos ni fotos.
 *  Nadie lo ve (ni el dueno), y "Registrar mi negocio" empieza de cero. (Las opiniones y comentarios viejos quedan en Firestore.) */
export const NEGOCIO_ELIMINADO = { estado: 'eliminado', nombre: 'Negocio eliminado', descripcion: null, horario: null, whatsapp: null, fotoBase64: null, logoBase64: null, resumenIA: null, nRecomendaciones: 0 }

/** Estrellas DE EJEMPLO (ficticias, para la demo) de los 15 negocios de la semilla: se toma que los nRecomendaciones
 *  vecinos de la semilla los calificaron con este promedio. Van en el codigo porque los negocios de la semilla no tienen
 *  autorId y las reglas no dejan agregarles campos. Las opiniones reales se suman encima (resenaNegocio). */
const ESTRELLAS_DEMO = {
  neg_01: 4.5, neg_02: 4.7, neg_03: 4.4, neg_04: 4.8, neg_05: 4.6, neg_06: 4.7, neg_07: 4.2, neg_08: 4.3,
  neg_09: 4.9, neg_10: 4.6, neg_11: 4.1, neg_12: 4.6, neg_13: 4.4, neg_14: 4.5, neg_15: 4.3,
}

/** Estrellas de un negocio = las de ejemplo de la semilla + las opiniones reales (`real` = { n, promedio }).
 *  Cada opinion nueva sube la cantidad en 1 y mueve el promedio. null si no tiene ninguna. */
export function resenaNegocio(negocio, real) {
  const nBase = negocio?.nRecomendaciones || 0
  const nReal = real?.n || 0
  const n = nBase + nReal
  if (!n) return null
  const base = ESTRELLAS_DEMO[negocio.id] ?? 4.5
  return { n, nReales: nReal, promedio: (base * nBase + (real?.promedio || 0) * nReal) / n }
}

/** Para el mapa y la lista: { [negocioId]: { n, promedio } } de todos los negocios (ejemplo + reales). */
export const combinarResenas = (negocios, reales = {}) =>
  Object.fromEntries(negocios.map((x) => [x.id, resenaNegocio(x, reales[x.id])]).filter(([, r]) => r))

/** Cuantos vecinos recomiendan un negocio: los de la semilla (nRecomendaciones) mas las opiniones reales.
 *  `resenas` es el resultado de combinarResenas (su n ya suma las dos cosas). */
export const totalRecomendaciones = (negocio, resenas) => resenas?.[negocio.id]?.n ?? (negocio.nRecomendaciones || 0)
