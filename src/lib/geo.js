// Utilidades de geolocalizacion: celda aproximada (privacidad), geohash y distancia.
import { geohashForLocation, geohashQueryBounds, distanceBetween } from 'geofire-common'

export const RADIOS_KM = [0.5, 1, 2, 5]
export const RADIO_DEFAULT_KM = 1
export const RADIO_MINKA_KM = 3

// Surquillo (barrio de la demo) como respaldo si el GPS no responde
export const CENTRO_RESPALDO = { lat: -12.1135, lng: -77.0225 }

// ---- Ubicacion fija de demo (Surquillo). ?demo=1 la activa, ?demo=0 la apaga; queda guardada.
const KEY_DEMO = 'ayni_ubicacion_demo'
export function ubicacionDemoActiva() {
  try { return localStorage.getItem(KEY_DEMO) === '1' } catch { return false }
}
export function setUbicacionDemoActiva(activa) {
  try { activa ? localStorage.setItem(KEY_DEMO, '1') : localStorage.removeItem(KEY_DEMO) } catch { /* sin storage */ }
}
try {
  const p = new URLSearchParams(window.location.search).get('demo')
  if (p === '1' || p === '0') setUbicacionDemoActiva(p === '1')
} catch { /* sin window */ }

/** Redondea la ubicacion a una celda de ~300 m. Nunca guardamos la casa exacta. */
export function celdaAprox({ lat, lng }) {
  const paso = 0.0027 // ~300 m
  return {
    lat: Math.round(lat / paso) * paso,
    lng: Math.round(lng / paso) * paso,
  }
}

export function geohash(p) {
  return geohashForLocation([p.lat, p.lng])
}

/** Rangos de geohash para consultar Firestore por cercania. */
export function rangosGeohash(centro, radioKm) {
  return geohashQueryBounds([centro.lat, centro.lng], radioKm * 1000)
}

export function distanciaKm(a, b) {
  return distanceBetween([a.lat, a.lng], [b.lat, b.lng])
}

/** Ubicacion actual del celular (Promise). Usa respaldo si falla o no hay permiso; fija si hay modo demo. */
export function ubicacionActual() {
  return new Promise((resolve) => {
    if (ubicacionDemoActiva()) return resolve({ ...CENTRO_RESPALDO, aprox: false, demo: true })
    if (!('geolocation' in navigator)) return resolve({ ...CENTRO_RESPALDO, aprox: true })
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, aprox: false }),
      () => resolve({ ...CENTRO_RESPALDO, aprox: true }),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    )
  })
}
