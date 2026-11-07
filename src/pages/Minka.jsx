// Modo Minka (emergencia): 3 botones grandes, mapa de necesidades (rojo) y recursos (verde), boletin.
// Funciona sin senal: Firestore guarda en el celular y sube solo al volver la conexion.
// Pendiente (columna 5): match automatico necesidad <-> recurso mas cercano.
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEstado } from '../lib/estado'
import { crear, conGeo, listarCerca, listar, conTiempo, nuevoId } from '../lib/db'
import { CATEGORIAS_MINKA } from '../lib/ia'

const RECURSOS = ['enfermera', 'botiquin', 'agua', 'comida', 'generador', 'vehiculo', 'espacio']
const ETIQUETA = {
  agua: 'AGUA', medicina: 'MEDICINA', albergue: 'ALBERGUE', rescate: 'RESCATE', comida: 'COMIDA', otro: 'OTRO',
  enfermera: 'ENFERMERA/O', botiquin: 'BOTIQUÍN', generador: 'GENERADOR', vehiculo: 'VEHÍCULO', espacio: 'ESPACIO',
}
const EMOJI = {
  agua: '💧', medicina: '💊', albergue: '🏠', rescate: '🚒', comida: '🍲', otro: '❓',
  enfermera: '🩺', botiquin: '🩹', generador: '🔋', vehiculo: '🚗', espacio: '🏠',
}
const URGENCIAS = [[1, 'Puede esperar'], [2, 'Hoy'], [3, '¡Ahora!']]
const textoUrgencia = (u) => URGENCIAS.find(([n]) => n === u)?.[1] || ''

const iconoYo = L.divIcon({ html: '<div style="font-size:26px;line-height:1">📍</div>', className: '', iconSize: [30, 30], iconAnchor: [15, 15] })

// Una pastilla por celda (~300 m): rojo = cuantas necesidades, verde = cuantos recursos
function iconoCelda(nNec, nRec) {
  const ancho = (nNec ? 54 : 0) + (nRec ? 54 : 0)
  const parte = (color, emoji, n) => `<span style="background:${color};padding:4px 8px">${emoji} ${n}</span>`
  return L.divIcon({
    className: '', iconSize: [ancho, 28], iconAnchor: [ancho / 2, 14],
    html: `<div style="display:inline-flex;border-radius:14px;overflow:hidden;box-shadow:0 2px 6px rgba(0,0,0,.35);font:700 14px sans-serif;color:#fff;white-space:nowrap">${
      nNec ? parte('#c0392b', '🆘', nNec) : ''}${nRec ? parte('#2e8b57', '🤝', nRec) : ''}</div>`,
  })
}

function agruparPorCelda(necesidades, recursos) {
  const g = new Map()
  const meter = (x, campo) => {
    const k = `${x.geo.lat.toFixed(5)},${x.geo.lng.toFixed(5)}`
    if (!g.has(k)) g.set(k, { k, geo: x.geo, distanciaKm: x.distanciaKm, nec: [], rec: [] })
    g.get(k)[campo].push(x)
  }
  necesidades.forEach((n) => meter(n, 'nec'))
  recursos.forEach((r) => meter(r, 'rec'))
  return [...g.values()]
}

function Centrar({ centro }) {
  const map = useMap()
  useEffect(() => { if (centro) map.setView([centro.lat, centro.lng], 15) }, [centro, map])
  return null
}

export default function Minka() {
  const { usuario, geoAprox, ubicacion, radioKm, setModo, setAviso } = useEstado()
  const [paso, setPaso] = useState(null) // null | 'ayuda' | 'urgencia' | 'puedo'
  const [tipoPedido, setTipoPedido] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [necesidades, setNecesidades] = useState([])
  const [recursos, setRecursos] = useState([])
  const [avisos, setAvisos] = useState([])

  const quien = (x) => (x.autorId === usuario?.id ? 'Tú' : x.autorNombre)

  async function cargar() {
    if (!ubicacion) return
    try {
      const nec = await listarCerca('necesidades', ubicacion, radioKm, { estado: 'abierta' })
      setNecesidades(nec.sort((a, b) => (b.urgencia || 0) - (a.urgencia || 0)))
      setRecursos(await listarCerca('recursos', ubicacion, radioKm, { disponible: true }))
      setAvisos(await listar('avisos_minka', {}, 10))
    } catch (e) { console.warn('Minka: no se pudo cargar', e) }
  }
  useEffect(() => { setModo('minka'); cargar() }, [ubicacion, radioKm]) // eslint-disable-line

  // Sin senal no esperar a Firestore: queda guardado en el celular y sube solo. Id fijo = no duplica.
  async function guardar(col, docu, msjOk, msjSinSenal) {
    setEnviando(true)
    try {
      try { await conTiempo(crear(col, docu, nuevoId(col)), 4000); setAviso(msjOk) }
      catch (e) { if (e.message !== 'timeout') throw e; setAviso(msjSinSenal) }
      setPaso(null); setTipoPedido(null); cargar()
    } catch (e) {
      console.error('Minka: no se pudo guardar', e)
      setAviso('No se pudo enviar. Intenta de nuevo.')
    } finally { setEnviando(false) }
  }

  const base = () => ({ autorId: usuario.id, autorNombre: usuario.nombre, whatsapp: usuario.whatsappVisible ? usuario.telefono : null })

  const estoyBien = () => guardar('estados_minka', { ...base(), estado: 'bien', zona: geoAprox },
    'Avisamos que estás bien ✔', 'Sin señal: tu aviso se guardó y se enviará solo.')
  const necesito = (urgencia) => guardar('necesidades',
    conGeo({ ...base(), tipo: tipoPedido, urgencia, estado: 'abierta', asignadoA: null }, geoAprox),
    'Pedido enviado a tus vecinos. Te avisamos cuando alguien pueda ayudar.', 'Sin señal: tu pedido se guardó y se enviará solo.')
  const puedo = (tipo) => guardar('recursos',
    conGeo({ ...base(), tipo, disponible: true, asignadoA: null }, geoAprox),
    'Gracias. Tu ayuda ya aparece en el mapa (+20 puntos al confirmar).', 'Sin señal: tu ayuda se guardó y se enviará sola.')

  if (paso === 'ayuda') return (
    <div className="pantalla">
      <h2>¿Qué necesitas?</h2>
      <div className="opciones-tipo">
        {CATEGORIAS_MINKA.map((t) => (
          <button key={t} className="btn ayuda" onClick={() => { setTipoPedido(t); setPaso('urgencia') }}>{EMOJI[t]} {ETIQUETA[t]}</button>
        ))}
      </div>
      <button className="btn secundario" onClick={() => setPaso(null)}>Atrás</button>
    </div>
  )
  if (paso === 'urgencia') return (
    <div className="pantalla">
      <h2>{EMOJI[tipoPedido]} {ETIQUETA[tipoPedido]}: ¿qué tan urgente?</h2>
      {URGENCIAS.map(([u, txt]) => (
        <button key={u} className="btn gigante ayuda" disabled={enviando} onClick={() => necesito(u)}>{txt}</button>
      ))}
      <button className="btn secundario" onClick={() => setPaso('ayuda')}>Atrás</button>
    </div>
  )
  if (paso === 'puedo') return (
    <div className="pantalla">
      <h2>¿Con qué puedes ayudar?</h2>
      <div className="opciones-tipo">
        {RECURSOS.map((t) => <button key={t} className="btn puedo" disabled={enviando} onClick={() => puedo(t)}>{EMOJI[t]} {ETIQUETA[t]}</button>)}
      </div>
      <button className="btn secundario" onClick={() => setPaso(null)}>Atrás</button>
    </div>
  )

  return (
    <div className="pantalla">
      <button className="btn gigante bien" disabled={enviando} onClick={estoyBien}>✅ ESTOY BIEN</button>
      <button className="btn gigante ayuda" onClick={() => setPaso('ayuda')}>🆘 NECESITO AYUDA</button>
      <button className="btn gigante puedo" onClick={() => setPaso('puedo')}>🤝 PUEDO AYUDAR</button>

      <div className="tarjeta">
        <h3>Cerca de ti ({radioKm} km)</h3>
        <div>🔴 {necesidades.length} necesidades abiertas · 🟢 {recursos.length} recursos disponibles</div>
        {ubicacion && (
          <div style={{ height: 260, marginTop: 10, borderRadius: 10, overflow: 'hidden' }}>
            <MapContainer center={[ubicacion.lat, ubicacion.lng]} zoom={15} className="mapa" zoomControl={false}>
              <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Centrar centro={ubicacion} />
              <Marker position={[ubicacion.lat, ubicacion.lng]} icon={iconoYo}><Popup>Tú ({usuario?.nombre})</Popup></Marker>
              {agruparPorCelda(necesidades, recursos).map((c) => (
                <Marker key={c.k} position={[c.geo.lat, c.geo.lng]} icon={iconoCelda(c.nec.length, c.rec.length)}>
                  <Popup>
                    {c.nec.length > 0 && <b style={{ color: 'var(--rojo)' }}>Necesitan ayuda</b>}
                    {c.nec.map((n) => <div key={n.id}>{EMOJI[n.tipo]} {ETIQUETA[n.tipo] || n.tipo} · {textoUrgencia(n.urgencia)} — {quien(n)}</div>)}
                    {c.rec.length > 0 && <b style={{ color: 'var(--verde)' }}>Pueden ayudar</b>}
                    {c.rec.map((r) => <div key={r.id}>{EMOJI[r.tipo]} {ETIQUETA[r.tipo] || r.tipo} — {quien(r)}</div>)}
                    <span className="muted">a {(c.distanciaKm * 1000).toFixed(0)} m</span>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
        {necesidades.slice(0, 5).map((n) => (
          <div key={n.id} className="muted">• {EMOJI[n.tipo]} {ETIQUETA[n.tipo] || n.tipo} ({textoUrgencia(n.urgencia)}) a {(n.distanciaKm * 1000).toFixed(0)} m — {quien(n)}</div>
        ))}
      </div>

      <div className="tarjeta">
        <h3>📰 Boletín Minka</h3>
        {avisos.length === 0 && <div className="muted">Sin avisos por ahora.</div>}
        {avisos.map((a) => <div key={a.id}>• {a.texto}</div>)}
      </div>
    </div>
  )
}
