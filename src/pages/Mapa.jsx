// Modo Barrio: mapa con radio caminable, publicaciones y negocios cercanos, boton (+).
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useNavigate } from 'react-router-dom'
import { useEstado } from '../lib/estado'
import { listarCerca } from '../lib/db'
import { RADIOS_KM } from '../lib/geo'
import { pendientes } from '../lib/offlineQueue'
import { emojiRubro } from '../lib/rubros'

// Pines del mapa (divIcon con clases de index.css: no dependen de imagenes externas)
const ICONO_YO = L.divIcon({ html: '<div class="pin pin-yo"></div>', className: '', iconSize: [20, 20], iconAnchor: [10, 10] })

const cacheIconos = {}
const iconoNegocio = (rubro) => (cacheIconos[rubro] ??= L.divIcon({
  html: `<div class="pin pin-negocio">${emojiRubro(rubro)}</div>`, className: '', iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -14],
}))
const EMOJI_TIPO = { OFREZCO: '🛠️', NECESITO: '🙋', RECOMIENDO: '⭐' }

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
  html: `<div class="pin pin-pub ${tipo}">${EMOJI_TIPO[tipo] || EMOJI_TIPO.OFREZCO}${n > 1 ? `<span class="pin-contador">${n}</span>` : ''}</div>`,
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

export default function Mapa() {
  const { ubicacion, radioKm, setRadioKm, usuario, ubicacionDemo } = useEstado()
  const [pubs, setPubs] = useState([])
  const [negocios, setNegocios] = useState([])
  const [nPend, setNPend] = useState(0)
  const nav = useNavigate()

  useEffect(() => {
    if (!ubicacion) return
    listarCerca('publicaciones', ubicacion, radioKm).then(setPubs).catch(console.error)
    listarCerca('negocios_oficios', ubicacion, radioKm).then(setNegocios).catch(console.error)
    pendientes().then((l) => setNPend(l.length))
  }, [ubicacion, radioKm])

  if (!ubicacion) return <div className="pantalla" style={{ textAlign: 'center', paddingTop: 60 }}><div style={{ fontSize: 48 }}>📍</div><p className="muted">Buscando tu ubicación…</p></div>

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="barra-mapa">
        <div className="selector-radio" role="group" aria-label="Radio">
          {RADIOS_KM.map((r) => (
            <button key={r} className={r === radioKm ? 'activo' : ''} onClick={() => setRadioKm(r)}>{r < 1 ? `${r * 1000} m` : `${r} km`}</button>
          ))}
        </div>
        {(ubicacionDemo || nPend > 0 || negocios.length > 0) && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {negocios.length > 0 && <span className="chip verde">🏪 {negocios.length} negocios</span>}
            {pubs.length > 0 && <span className="chip">📝 {pubs.length} publicaciones</span>}
            {ubicacionDemo && <span className="chip">📍 Ubicación demo: Surquillo</span>}
            {nPend > 0 && <span className="chip pendiente">{nPend} publicación(es) pendiente(s) de subir</span>}
          </div>
        )}
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer center={[ubicacion.lat, ubicacion.lng]} zoom={ZOOM_RADIO[radioKm] || 16} className="mapa" zoomControl={false}>
          <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Centrar centro={ubicacion} zoom={ZOOM_RADIO[radioKm] || 16} />
          <Circle center={[ubicacion.lat, ubicacion.lng]} radius={radioKm * 1000} pathOptions={{ color: '#1f6f8b', weight: 2, dashArray: '6 6', fillOpacity: 0.04 }} />
          <Marker position={[ubicacion.lat, ubicacion.lng]} icon={ICONO_YO}><Popup>Tú ({usuario?.nombre})</Popup></Marker>
          {negocios.map((n) => (
            <Marker key={n.id} position={[n.geo.lat, n.geo.lng]} icon={iconoNegocio(n.rubro)}>
              <Popup>
                <div className="pop-titulo">{emojiRubro(n.rubro)} {n.nombre}</div>
                <div className="muted">{n.rubro}</div>
                <div className="muted">A {(n.distanciaKm * 1000).toFixed(0)} m de ti{n.horario ? `, atiende ${n.horario}` : ''}</div>
                <div className="recomendado" style={{ marginTop: 6 }}>⭐ Recomendado por {n.nRecomendaciones || 0} vecinos de tu zona</div>
                {n.resumenIA && <div style={{ fontStyle: 'italic', marginTop: 4 }}>"{n.resumenIA}"</div>}
                {n.whatsapp && <a className="pop-wa" href={waLink(n.whatsapp, `Hola, te vi en Ayni como ${n.rubro}. ¿Estás disponible?`)} target="_blank" rel="noreferrer">💬 WhatsApp</a>}
              </Popup>
            </Marker>
          ))}
          {agruparPorCelda(pubs).map(({ k, items }) => (
            <Marker key={k} position={[items[0].geo.lat, items[0].geo.lng]} icon={iconoGrupo(items[0].tipo, items.length)}>
              <Popup>
                {items.length > 1 && <div className="pop-titulo">{items.length} publicaciones en esta zona</div>}
                <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                  {items.map((p, i) => (
                    <div key={p.id} style={{ padding: '6px 0', borderTop: i ? '1px solid var(--linea)' : 'none' }}>
                      <span className="chip">{EMOJI_TIPO[p.tipo]} {p.tipo}</span> <span className="chip verde">{p.categoria}</span>
                      <div style={{ margin: "4px 0 2px", fontWeight: 600 }}>{p.texto}</div>
                      <span className="muted">{p.autorId === usuario?.id ? 'Tú' : p.autorNombre}, a {(p.distanciaKm * 1000).toFixed(0)} m</span>
                      {p.autorWhatsapp && p.autorId !== usuario?.id && (
                        <div><a className="pop-wa" href={waLink(p.autorWhatsapp, (MSJ_PUB[p.tipo] || MSJ_PUB.OFREZCO)(p))} target="_blank" rel="noreferrer">💬 WhatsApp</a></div>
                      )}
                    </div>
                  ))}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        <button className="fab" aria-label="Publicar" onClick={() => nav('/publicar')}>+</button>
      </div>
    </div>
  )
}
