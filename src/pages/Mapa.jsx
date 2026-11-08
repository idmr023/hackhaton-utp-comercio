// Modo Barrio: mapa a todo el alto con radio caminable, publicaciones y negocios cercanos, boton "Publicar".
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useNavigate } from 'react-router-dom'
import { Plus, Star, MessageCircle, Store, MapPin, LocateFixed, CloudUpload, Megaphone, Clock3 } from 'lucide-react'
import { useEstado } from '../lib/estado'
import { listarCerca } from '../lib/db'
import { RADIOS_KM } from '../lib/geo'
import { pendientes } from '../lib/offlineQueue'
import { iconoRubro, ICONO_TIPO, svg } from '../lib/iconos'

// Pines del mapa (divIcon con clases de index.css: no dependen de imagenes externas)
const ICONO_YO = L.divIcon({ html: '<div class="pin pin-yo"></div>', className: '', iconSize: [20, 20], iconAnchor: [10, 10] })

const cacheIconos = {}
const iconoNegocio = (rubro) => (cacheIconos[rubro] ??= L.divIcon({
  html: `<div class="pin pin-negocio">${svg(iconoRubro(rubro), { size: 18 })}</div>`,
  className: '', iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -14],
}))
const NOMBRE_TIPO = { OFREZCO: 'Ofrezco', NECESITO: 'Necesito', RECOMIENDO: 'Recomiendo' }
const CHIP_TIPO = { OFREZCO: 'chip', NECESITO: 'chip terracota', RECOMIENDO: 'chip maiz' }

// WhatsApp con mensaje precargado (textos en docs/TEXTOS_PANTALLAS.md §9)
const waLink = (num, msj) => `https://wa.me/51${num}?text=${encodeURIComponent(msj)}`
const corto = (t, n = 40) => (t.length > n ? t.slice(0, n).trim() + '…' : t)
const nombre1 = (n) => (n || '').split(' ')[0]
const MSJ_PUB = {
  OFREZCO: (p) => `Hola ${nombre1(p.autorNombre)}, vi en Ayni que ofreces "${corto(p.texto)}". ¿Podemos coordinar?`,
  NECESITO: (p) => `Hola ${nombre1(p.autorNombre)}, vi en Ayni que necesitas "${corto(p.texto)}". ¿Te puedo ayudar?`,
  RECOMIENDO: (p) => `Hola ${nombre1(p.autorNombre)}, vi tu recomendación en Ayni: "${corto(p.texto)}". ¿Me cuentas más?`,
}

// Grupo de publicaciones: circulo del color del tipo de la mas reciente + contador si hay varias
const iconoGrupo = (tipo, n) => L.divIcon({
  html: `<div class="pin pin-pub ${tipo}">${svg(ICONO_TIPO[tipo] || ICONO_TIPO.OFREZCO, { size: 20 })}${n > 1 ? `<span class="pin-contador">${n}</span>` : ''}</div>`,
  className: '', iconSize: [38, 38], iconAnchor: [19, 19], popupAnchor: [0, -16],
})

// Las publicaciones se guardan en una celda aproximada (~300 m), asi que varias caen en el
// mismo punto y se taparian: un icono por celda, con la lista completa en el popup.
const msFecha = (f) => (f == null ? Infinity : f.seconds ? f.seconds * 1000 : Number(f) || 0) // null = recien creada
function agruparPorCelda(pubs) {
  const grupos = new Map()
  for (const p of pubs) {
    const k = `${p.geo.lat.toFixed(5)},${p.geo.lng.toFixed(5)}`
    if (!grupos.has(k)) grupos.set(k, [])
    grupos.get(k).push(p)
  }
  return [...grupos].map(([k, items]) => ({ k, items: items.sort((a, b) => msFecha(b.fecha) - msFecha(a.fecha)) }))
}

// Zoom segun el radio: con 1 km los pines se distinguen (el circulo puede salir del borde; se puede alejar)
const ZOOM_RADIO = { 0.5: 17, 1: 16, 2: 15, 5: 13 }
function Centrar({ centro, zoom }) {
  const map = useMap()
  useEffect(() => { if (centro) map.setView([centro.lat, centro.lng], zoom) }, [centro, zoom, map])
  return null
}
const textoRadio = (r) => (r < 1 ? `${r * 1000} m` : `${r} km`)
const WhatsApp = ({ num, msj }) => (
  <a className="pop-wa" href={waLink(num, msj)} target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" />WhatsApp</a>
)

export default function Mapa() {
  const { ubicacion, radioKm, setRadioKm, usuario, ubicacionDemo } = useEstado()
  const [pubs, setPubs] = useState([])
  const [negocios, setNegocios] = useState([])
  const [nPend, setNPend] = useState(0)
  const [cargado, setCargado] = useState(false)
  const nav = useNavigate()

  useEffect(() => {
    if (!ubicacion) return
    listarCerca('publicaciones', ubicacion, radioKm).then(setPubs).catch(console.error).finally(() => setCargado(true))
    listarCerca('negocios_oficios', ubicacion, radioKm).then(setNegocios).catch(console.error)
    pendientes().then((l) => setNPend(l.length))
  }, [ubicacion, radioKm])

  if (!ubicacion) return (
    <div className="cargando" role="status">
      <div className="ficha grande teal"><MapPin aria-hidden="true" /></div>
      <p>Buscando tu ubicación…</p>
    </div>
  )

  return (
    <div className="mapa-pantalla">
      <MapContainer center={[ubicacion.lat, ubicacion.lng]} zoom={ZOOM_RADIO[radioKm] || 16} className="mapa" zoomControl={false}>
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Centrar centro={ubicacion} zoom={ZOOM_RADIO[radioKm] || 16} />
        <Circle center={[ubicacion.lat, ubicacion.lng]} radius={radioKm * 1000} pathOptions={{ color: '#2F7C78', weight: 2, dashArray: '6 6', fillOpacity: 0.05 }} />
        <Marker position={[ubicacion.lat, ubicacion.lng]} icon={ICONO_YO}><Popup>Tú ({usuario?.nombre})</Popup></Marker>
        {negocios.map((n) => {
          const Icono = iconoRubro(n.rubro)
          return (
            <Marker key={n.id} position={[n.geo.lat, n.geo.lng]} icon={iconoNegocio(n.rubro)}>
              <Popup>
                <div className="pop-cabecera">
                  <span className="ficha chica"><Icono aria-hidden="true" /></span>
                  <div>
                    <div className="pop-titulo">{n.nombre}</div>
                    <div className="muted">{n.rubro}</div>
                  </div>
                </div>
                <div className="fila-icono muted"><LocateFixed size={16} aria-hidden="true" />A {(n.distanciaKm * 1000).toFixed(0)} m de ti</div>
                {n.horario && <div className="fila-icono muted"><Clock3 size={16} aria-hidden="true" />Atiende {n.horario}</div>}
                <div className="pop-recomendado"><Star size={18} aria-hidden="true" />Recomendado por {n.nRecomendaciones || 0} vecinos de tu zona</div>
                {n.resumenIA && <div className="pop-resumen">“{n.resumenIA}”</div>}
                {n.whatsapp && <WhatsApp num={n.whatsapp} msj={`Hola, te vi en Ayni como ${n.rubro}. ¿Estás disponible?`} />}
              </Popup>
            </Marker>
          )
        })}
        {agruparPorCelda(pubs).map(({ k, items }) => (
          <Marker key={k} position={[items[0].geo.lat, items[0].geo.lng]} icon={iconoGrupo(items[0].tipo, items.length)}>
            <Popup>
              {items.length > 1 && <div className="pop-titulo" style={{ marginBottom: 8 }}>{items.length} publicaciones en esta zona</div>}
              <div className="pop-lista">
                {items.map((p) => {
                  const Icono = ICONO_TIPO[p.tipo] || ICONO_TIPO.OFREZCO
                  return (
                    <div key={p.id} className="pop-item">
                      <div className="chips">
                        <span className={CHIP_TIPO[p.tipo] || 'chip'}><Icono aria-hidden="true" />{NOMBRE_TIPO[p.tipo] || p.tipo}</span>
                        <span className="chip neutro">{p.categoria}</span>
                      </div>
                      <div className="texto">{p.texto}</div>
                      <span className="muted">{p.autorId === usuario?.id ? 'Tú' : p.autorNombre}, a {(p.distanciaKm * 1000).toFixed(0)} m</span>
                      {p.autorWhatsapp && p.autorId !== usuario?.id && (
                        <div><WhatsApp num={p.autorWhatsapp} msj={(MSJ_PUB[p.tipo] || MSJ_PUB.OFREZCO)(p)} /></div>
                      )}
                    </div>
                  )
                })}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="mapa-controles">
        <div className="selector-radio" role="group" aria-label="Radio del barrio">
          {RADIOS_KM.map((r) => (
            <button key={r} className={r === radioKm ? 'activo' : ''} aria-pressed={r === radioKm} onClick={() => setRadioKm(r)}>{textoRadio(r)}</button>
          ))}
        </div>
        <div className="chips">
          {negocios.length > 0 && <span className="chip"><Store aria-hidden="true" />{negocios.length} negocios</span>}
          {pubs.length > 0 && <span className="chip teal"><Megaphone aria-hidden="true" />{pubs.length} publicaciones</span>}
          {nPend > 0 && <span className="chip pendiente"><CloudUpload aria-hidden="true" />{nPend} pendiente{nPend > 1 ? 's' : ''} de subir</span>}
          {ubicacionDemo && <span className="chip neutro"><MapPin aria-hidden="true" />Ubicación demo: Surquillo</span>}
        </div>
      </div>

      {cargado && pubs.length === 0 && (
        <div className="mapa-vacio" role="status">
          <Megaphone size={22} aria-hidden="true" />
          <span>Aún no hay publicaciones a {textoRadio(radioKm)} de ti. Sé el primero: toca Publicar.</span>
        </div>
      )}

      <button className="fab" onClick={() => nav('/publicar')}><Plus aria-hidden="true" />Publicar</button>
    </div>
  )
}
