// Puntos Ayni como libro de movimientos: solo se CREAN documentos, nunca se editan.
// saldo = puntos de ayudas confirmadas (ayudas_intercambios.ayudaId) - puntos canjeados (canjes.usuarioId).
// Asi funciona con las reglas actuales (create libre; update solo con autorId) y todo queda auditable.
import { listar } from './db'

export const PUNTOS = { MINKA: 20, AYUDA: 10, RECOMENDACION: 2 }
export const TOPE_AYUDAS_DIA = 3
export const TOPE_PUNTOS_DIA = 30
const DIA = 864e5

// Fecha de Firestore (Timestamp), de modo local (numero) o pendiente de subir (null = ahora)
export const msFecha = (f) => (f == null ? Date.now() : f.seconds ? f.seconds * 1000 : Number(f) || Date.now())
const esHoy = (f) => new Date(msFecha(f)).toDateString() === new Date().toDateString()

export async function saldoPuntos(usuarioId) {
  const [ganados, canjes] = await Promise.all([
    listar('ayudas_intercambios', { ayudaId: usuarioId }, 500),
    listar('canjes', { usuarioId }, 500),
  ])
  return ganados.reduce((s, a) => s + (a.puntos || 0), 0) - canjes.reduce((s, c) => s + (c.costoPuntos || 0), 0)
}

/** Antifraude para quien ayuda: misma pareja en 30 dias 100% / 50% / 0;
 *  maximo 3 ayudas y 30 puntos por dia. Devuelve { puntos, motivo: null|'reducido'|'pareja'|'tope_dia' }. */
export async function calcularPuntos(ayudaId, recibeId, base) {
  const previas = await listar('ayudas_intercambios', { ayudaId }, 500)
  const ahora = Date.now()
  const conPareja = previas.filter((a) => a.recibeId === recibeId && ahora - msFecha(a.fecha) < 30 * DIA).length
  const hoy = previas.filter((a) => esHoy(a.fecha))
  if (hoy.length >= TOPE_AYUDAS_DIA) return { puntos: 0, motivo: 'tope_dia' }
  const porPareja = conPareja === 0 ? base : conPareja === 1 ? Math.floor(base / 2) : 0
  if (porPareja === 0) return { puntos: 0, motivo: 'pareja' }
  const puntosHoy = hoy.reduce((s, a) => s + (a.puntos || 0), 0)
  const puntos = Math.max(0, Math.min(porPareja, TOPE_PUNTOS_DIA - puntosHoy))
  return { puntos, motivo: puntos === 0 ? 'tope_dia' : puntos < base ? 'reducido' : null }
}

/** Codigo de 4 digitos de una ayuda: lo ve quien ayuda; quien recibe lo escribe en persona. */
export function codigo4(id) {
  let h = 7
  for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return String(1000 + (h % 9000))
}
