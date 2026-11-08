// Mapa del barrio: radio caminable, negocios con pin por rubro, publicaciones agrupadas por celda, boton Publicar.
// Recibe los datos de Barrio.jsx (que tambien alimenta la lista de vecinos).
import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useNavigate } from 'react-router-dom'
import { Plus, Star, MessageCircle, Store, MapPin, LocateFixed, CloudUpload, Megaphone, Clock3 } from 'lucide-react'
import { useEstado } from '../lib/estado'
import { RADIOS_KM } from '../lib/geo'
import { iconoRubro, ICONO_TIPO, svg } from '../lib/iconos'
import { waLink, msjPublicacion, msjNegocio, NOMBRE_TIPO, CLASE_TIPO, msFecha, metros, textoRadio, claveCelda } from '../lib/contacto'

// Pines del mapa (divIcon con clases de index.css: no dependen de imagenes externas)
const ICONO_YO = L.divIcon({ html: '<div class="pin pin-yo"></div>', className: '', iconSize: [20, 20], iconAnchor: [10, 10] })
const cacheIconos = {}
const iconoNegocio = (rubro) => (cacheIconos[rubro] ??= L.divIcon({
  html: `<div class="pin pin-negocio">${svg(iconoRubro(rubro), { size: 18 })}</div>`,
  className: '', iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -14],
}))
// Grupo de publicaciones: circulo del color del tipo de la mas reciente + contador si hay varias
const iconoGrupo = (tipo, n) => L.divIcon({
  html: `<div class="pin pin-pub ${tipo}">${svg(ICONO_TIPO[tipo] || ICONO_TIPO.OFREZCO, { size: 20 })}${n > 1 ? `<span class="pin-contador">${n}</span>` : ''}</div>`,
  className: '', iconSize: [38, 38], iconAnchor: [19, 19], popupAnchor: [0, -16],
})

// Las publicaciones se guardan en una celda aproximada (~300 m), asi que varias caen en el
// mismo punto y se taparian: un icono por celda, con la lista completa en el popup.
export function agruparPorCelda(pubs) {
  const grupos = new Map()
  for (const p of pubs) {
    const k = claveCelda(p.geo)
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
// Lo elegido en la lista: acercar y abrir su popup
function Enfocar({ foco, refs }) {
  const map = useMap()
  useEffect(() => {
    if (!foco) return
    map.setView([foco.lat, foco.lng], Math.max(map.getZoom(), 17), { animate: true })
    const t = setTimeout(() => refs.current[foco.k]?.openPopup(), 350)
    return () => clearTimeout(t)
  }, [foco, map, refs])
  return null
}
// Cuando el contenedor cambia de tamano (celular <-> PC) Leaflet necesita recalcular
function Ajustar() {
  const map = useMap()
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 60)
    const f = () => map.invalidateSize()
    window.addEventListener('resize', f)
    return () => { clearTimeout(t); window.removeEventListener('resize', f) }
  }, [map])
  return null
}

const WhatsApp = ({ num, msj }) => (
  <a className="pop-wa" href={waLink(num, msj)} target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" />WhatsApp</a>
)

export default function Mapa({ pubs, negocios, nPend, cargado, foco }) {
  const { ubicacion, radioKm, setRadioKm, usuario, ubicacionDemo } = useEstado()
  const nav = useNavigate()
  const refs = useRef({}) // marcadores por clave, para abrir el popup desde la lista

  return (
    <div className="mapa-pantalla">
      <MapContainer center={[ubicacion.lat, ubicacion.lng]} zoom={ZOOM_RADIO[radioKm] || 16} className="mapa" zoomControl={false}>
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Centrar centro={ubicacion} zoom={ZOOM_RADIO[radioKm] || 16} />
        <Enfocar foco={foco} refs={refs} />
        <Ajustar />
        <Circle center={[ubicacion.lat, ubicacion.lng]} radius={radioKm * 1000} pathOptions={{ color: '#2F7C78', weight: 2, dashArray: '6 6', fillOpacity: 0.05 }} />
        <Marker position={[ubicacion.lat, ubicacion.lng]} icon={ICONO_YO}><Popup>Tú ({usuario?.nombre})</Popup></Marker>
        {negocios.map((n) => {
          const Icono = iconoRubro(n.rubro)
          return (
            <Marker key={n.id} position={[n.geo.lat, n.geo.lng]} icon={iconoNegocio(n.rubro)} ref={(m) => { refs.current[n.id] = m }}>
              <Popup>
                <div className="pop-cabecera">
                  <span className="ficha chica"><Icono aria-hidden="true" /></span>
                  <div>
                    <div className="pop-titulo">{n.nombre}</div>
                    <div className="muted">{n.rubro}</div>
                  </div>
                </div>
                <div className="fila-icono muted"><LocateFixed size={16} aria-hidden="true" />A {metros(n.distanciaKm)} de ti</div>
                {n.horario && <div className="fila-icono muted"><Clock3 size={16} aria-hidden="true" />Atiende {n.horario}</div>}
                <div className="pop-recomendado"><Star size={18} aria-hidden="true" />Recomendado por {n.nRecomendaciones || 0} vecinos de tu zona</div>
                {n.resumenIA && <div className="pop-resumen">“{n.resumenIA}”</div>}
                {n.whatsapp && <WhatsApp num={n.whatsapp} msj={msjNegocio(n)} />}
              </Popup>
            </Marker>
          )
        })}
        {agruparPorCelda(pubs).map(({ k, items }) => (
          <Marker key={k} position={[items[0].geo.lat, items[0].geo.lng]} icon={iconoGrupo(items[0].tipo, items.length)} ref={(m) => { refs.current[k] = m }}>
            <Popup>
              {items.length > 1 && <div className="pop-titulo" style={{ marginBottom: 8 }}>{items.length} publicaciones en esta zona</div>}
              <div className="pop-lista">
                {items.map((p) => {
                  const Icono = ICONO_TIPO[p.tipo] || ICONO_TIPO.OFREZCO
                  return (
                    <div key={p.id} className="pop-item">
                      <div className="chips">
                        <span className={`chip ${CLASE_TIPO[p.tipo] || ''}`}><Icono aria-hidden="true" />{NOMBRE_TIPO[p.tipo] || p.tipo}</span>
                        <span className="chip neutro">{p.categoria}</span>
                      </div>
                      {p.fotoBase64 && <img className="pop-foto" src={p.fotoBase64} alt="" />}
                      <div className="texto">{p.texto}</div>
                      <span className="muted">{p.autorId === usuario?.id ? 'Tú' : p.autorNombre}, a {metros(p.distanciaKm)}</span>
                      {p.autorWhatsapp && p.autorId !== usuario?.id && (
                        <div><WhatsApp num={p.autorWhatsapp} msj={msjPublicacion(p)} /></div>
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
