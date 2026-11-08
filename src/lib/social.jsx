// Piezas de la parte "social": avatar con iniciales, estrellas y lectura de recomendaciones de un vecino.
// Colecciones: comentarios { publicacionId, autorId, autorNombre, texto } y
// recomendaciones { autorId = deId, deId, deNombre, paraId, paraNombre, estrellas 1-5, texto } (una por pareja, id fijo).
import { Star } from 'lucide-react'
import { listar } from './db'
import { msFecha } from './contacto'
import { traducir } from './i18n'

export const iniciales = (nombre = '') => nombre.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?'

export function Avatar({ nombre, size = 44, className = '' }) {
  return <span className={`avatar ${className}`} style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }} aria-hidden="true">{iniciales(nombre)}</span>
}

/** 5 estrellas (las llenas segun el promedio redondeado) + "4.8 (12)" o "Sin recomendaciones". */
export function Estrellas({ valor = 0, n = 0, size = 18, texto = true, t = (s, v) => traducir('es', s, v) }) {
  const llenas = Math.round(valor)
  const etiqueta = n ? t(n === 1 ? '{v} de 5, {n} recomendación' : '{v} de 5, {n} recomendaciones', { v: valor.toFixed(1), n }) : t('Sin recomendaciones aún')
  return (
    <span className="estrellas" role="img" aria-label={etiqueta}>
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={size} className={i <= llenas ? 'llena' : ''} aria-hidden="true" />)}
      {texto && <span className="estrellas-texto">{n ? `${valor.toFixed(1)} (${n})` : t('Sin recomendaciones')}</span>}
    </span>
  )
}

/** Recomendaciones que recibio un vecino: lista (recientes primero), cantidad y promedio de estrellas. */
export async function cargarResenas(paraId) {
  const lista = (await listar('recomendaciones', { paraId }, 200)).sort((a, b) => msFecha(b.fecha) - msFecha(a.fecha))
  const n = lista.length
  const promedio = n ? lista.reduce((s, r) => s + (Number(r.estrellas) || 0), 0) / n : 0
  return { lista, n, promedio }
}
