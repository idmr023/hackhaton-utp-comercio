// Textos y enlaces compartidos entre el mapa y la lista de vecinos (docs/TEXTOS_PANTALLAS.md §4, §4b y §9).
export const waLink = (num, msj) => `https://wa.me/51${num}?text=${encodeURIComponent(msj)}`
const corto = (t, n = 40) => (t.length > n ? t.slice(0, n).trim() + '…' : t)
const nombre1 = (n) => (n || '').split(' ')[0]
const MSJ_PUB = {
  OFREZCO: (p) => `Hola ${nombre1(p.autorNombre)}, vi en Ayni que ofreces "${corto(p.texto)}". ¿Podemos coordinar?`,
  NECESITO: (p) => `Hola ${nombre1(p.autorNombre)}, vi en Ayni que necesitas "${corto(p.texto)}". ¿Te puedo ayudar?`,
  RECOMIENDO: (p) => `Hola ${nombre1(p.autorNombre)}, vi tu recomendación en Ayni: "${corto(p.texto)}". ¿Me cuentas más?`,
}
export const msjPublicacion = (p) => (MSJ_PUB[p.tipo] || MSJ_PUB.OFREZCO)(p)
export const msjNegocio = (n) => `Hola, te vi en Ayni como ${n.rubro}. ¿Estás disponible?`

export const NOMBRE_TIPO = { OFREZCO: 'Ofrezco', NECESITO: 'Necesito', RECOMIENDO: 'Recomiendo' }
export const CLASE_TIPO = { OFREZCO: '', NECESITO: 'terracota', RECOMIENDO: 'maiz' }

// Fecha de Firestore (Timestamp), numero o null (recien creada, aun sin confirmar del servidor)
export const msFecha = (f) => (f == null ? Date.now() : f.seconds ? f.seconds * 1000 : Number(f) || 0)
export function haceCuanto(f) {
  const min = Math.round((Date.now() - msFecha(f)) / 60000)
  if (min < 1) return 'ahora'
  if (min < 60) return `hace ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.round(h / 24)
  return d === 1 ? 'ayer' : `hace ${d} días`
}
export const metros = (km) => `${Math.round(km * 1000)} m`
export const textoRadio = (r) => (r < 1 ? `${r * 1000} m` : `${r} km`)

// Celda aproximada (~300 m) donde cae una publicacion: varias comparten el mismo punto
export const claveCelda = (geo) => `${geo.lat.toFixed(5)},${geo.lng.toFixed(5)}`
