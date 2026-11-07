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

// Iconos simples por tipo (emoji en divIcon: no depende de imagenes externas)
const icono = (emoji) => L.divIcon({ html: `<div style="font-size:26px;line-height:1">${emoji}</div>`, className: '', iconSize: [30, 30], iconAnchor: [15, 15] })
const ICONOS = { OFREZCO: icono('🛠️'), NECESITO: icono('🙋'), RECOMIENDO: icono('⭐'), NEGOCIO: icono('🏪'), YO: icono('📍') }

function Centrar({ centro }) {
  const map = useMap()
  useEffect(() => { if (centro) map.setView([centro.lat, centro.lng], 15) }, [centro, map])
  return null
}

export default function Mapa() {
  const { ubicacion, radioKm, setRadioKm, usuario } = useEstado()
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

  if (!ubicacion) return <div className="pantalla"><p>Buscando tu ubicación…</p></div>

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
        <span className="muted">Radio</span>
        <div className="selector-radio" style={{ flex: 1 }}>
          {RADIOS_KM.map((r) => (
            <button key={r} className={r === radioKm ? 'activo' : ''} onClick={() => setRadioKm(r)}>{r < 1 ? `${r * 1000} m` : `${r} km`}</button>
          ))}
        </div>
      </div>
      {nPend > 0 && <div className="chip pendiente" style={{ margin: '0 12px 6px' }}>{nPend} publicación(es) pendiente(s) de subir</div>}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer center={[ubicacion.lat, ubicacion.lng]} zoom={15} className="mapa" zoomControl={false}>
          <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Centrar centro={ubicacion} />
          <Circle center={[ubicacion.lat, ubicacion.lng]} radius={radioKm * 1000} pathOptions={{ color: '#1f6f8b', fillOpacity: 0.05 }} />
          <Marker position={[ubicacion.lat, ubicacion.lng]} icon={ICONOS.YO}><Popup>Tú ({usuario?.nombre})</Popup></Marker>
          {negocios.map((n) => (
            <Marker key={n.id} position={[n.geo.lat, n.geo.lng]} icon={ICONOS.NEGOCIO}>
              <Popup>
                <b>{n.nombre}</b><br />{n.rubro}<br />
                <span className="recomendado">⭐ Recomendado por {n.nRecomendaciones || 0} vecinos de tu zona</span><br />
                {n.resumenIA && <i>"{n.resumenIA}"</i>}<br />
                <span className="muted">{(n.distanciaKm * 1000).toFixed(0)} m</span><br />
                {n.whatsapp && <a href={`https://wa.me/51${n.whatsapp}?text=${encodeURIComponent('Hola, te vi en Ayni. ')}`} target="_blank" rel="noreferrer">💬 WhatsApp</a>}
              </Popup>
            </Marker>
          ))}
          {pubs.map((p) => (
            <Marker key={p.id} position={[p.geo.lat, p.geo.lng]} icon={ICONOS[p.tipo] || ICONOS.OFREZCO}>
              <Popup>
                <span className="chip">{p.tipo}</span> <span className="chip">{p.categoria}</span><br />
                {p.texto}<br />
                <span className="muted">{p.autorNombre} · {(p.distanciaKm * 1000).toFixed(0)} m</span>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        <button className="fab" aria-label="Publicar" onClick={() => nav('/publicar')}>+</button>
      </div>
    </div>
  )
}
