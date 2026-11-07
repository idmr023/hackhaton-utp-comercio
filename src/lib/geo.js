// Utilidades de geolocalizacion: celda aproximada (privacidad), geohash y distancia.
import { geohashForLocation, geohashQueryBounds, distanceBetween } from 'geofire-common'

export const RADIOS_KM = [0.5, 1, 2, 5]
export const RADIO_DEFAULT_KM = 1
export const RADIO_MINKA_KM = 3

// Lima Centro como respaldo si el GPS no responde (cambiar por el barrio de la demo)
export const CENTRO_RESPALDO = { lat: -12.0464, lng: -77.0428 }

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

/** Ubicacion actual del celular (Promise). Usa respaldo si falla o no hay permiso. */
export function ubicacionActual() {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) return resolve({ ...CENTRO_RESPALDO, aprox: true })
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, aprox: false }),
      () => resolve({ ...CENTRO_RESPALDO, aprox: true }),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    )
  })
}
