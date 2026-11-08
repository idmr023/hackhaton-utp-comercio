// Piezas de la parte "social": avatar (foto de perfil o iniciales), estrellas y lectura de recomendaciones de un vecino.
// Colecciones: comentarios { publicacionId | negocioId, autorId, autorNombre, texto },
// recomendaciones { autorId = deId, deId, deNombre, paraId, paraTipo?, paraNombre, estrellas 1-5, texto } (una por pareja, id fijo),
// perfiles { autorId = usuarioId, usuarioId, fotoBase64 } con id = usuario.id (la foto va aparte porque `usuarios` no se puede editar).
import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { listar, obtener } from './db'
import { msFecha } from './contacto'
import { traducir } from './i18n'
import { useEstado } from './estado'

export const iniciales = (nombre = '') => nombre.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?'

// Cache de fotos de perfil por usuario (una lectura por vecino por sesion; null = no tiene foto)
const cacheFotos = new Map()
const enCurso = new Map()
export function setFotoPerfilCache(usuarioId, foto) { cacheFotos.set(usuarioId, foto || null) }
function cargarFotoPerfil(usuarioId) {
  if (cacheFotos.has(usuarioId)) return Promise.resolve(cacheFotos.get(usuarioId))
  if (!enCurso.has(usuarioId)) {
    enCurso.set(usuarioId, obtener('perfiles', usuarioId).then((p) => p?.fotoBase64 || null).catch(() => null)
      .then((f) => { cacheFotos.set(usuarioId, f); enCurso.delete(usuarioId); return f }))
  }
  return enCurso.get(usuarioId)
}
/** Foto de perfil de un vecino (base64) o null. La del usuario actual sale de su sesion. */
export function useFotoPerfil(usuarioId) {
  const { usuario } = useEstado()
  const [foto, setFoto] = useState(() => (usuarioId && cacheFotos.has(usuarioId) ? cacheFotos.get(usuarioId) : null))
  useEffect(() => {
    if (!usuarioId || usuarioId === usuario?.id) return
    let vivo = true
    cargarFotoPerfil(usuarioId).then((f) => { if (vivo) setFoto(f) })
    return () => { vivo = false }
  }, [usuarioId, usuario?.id])
  if (usuarioId && usuarioId === usuario?.id) return usuario.fotoBase64 || null
  return foto
}

export function Avatar({ nombre, usuarioId, size = 44, className = '' }) {
  const foto = useFotoPerfil(usuarioId)
  return (
    <span className={`avatar ${className}`} style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }} aria-hidden="true">
      {foto ? <img src={foto} alt="" /> : iniciales(nombre)}
    </span>
  )
}

/** 5 estrellas (las llenas segun el promedio redondeado) + "4.8 (12)" o el texto `vacio`. */
export function Estrellas({ valor = 0, n = 0, size = 18, texto = true, vacio = 'Sin recomendaciones', t = (s, v) => traducir('es', s, v) }) {
  const llenas = Math.round(valor)
  const etiqueta = n ? t(n === 1 ? '{v} de 5, {n} recomendación' : '{v} de 5, {n} recomendaciones', { v: valor.toFixed(1), n }) : t(vacio)
  return (
    <span className="estrellas" role="img" aria-label={etiqueta}>
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={size} className={i <= llenas ? 'llena' : ''} aria-hidden="true" />)}
      {texto && <span className="estrellas-texto">{n ? `${valor.toFixed(1)} (${n})` : t(vacio)}</span>}
    </span>
  )
}

/** Recomendaciones que recibio un vecino o negocio: lista (recientes primero), cantidad y promedio de estrellas. */
export async function cargarResenas(paraId) {
  const lista = (await listar('recomendaciones', { paraId }, 200)).sort((a, b) => msFecha(b.fecha) - msFecha(a.fecha))
  const n = lista.length
  const promedio = n ? lista.reduce((s, r) => s + (Number(r.estrellas) || 0), 0) / n : 0
  return { lista, n, promedio }
}
