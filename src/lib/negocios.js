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

/** Cuantos vecinos recomiendan un negocio: los de la semilla (nRecomendaciones) mas las recomendaciones reales. */
export const totalRecomendaciones = (negocio, resenas) => (negocio.nRecomendaciones || 0) + (resenas?.[negocio.id]?.n || 0)
