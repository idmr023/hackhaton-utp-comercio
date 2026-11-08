// Modo Minka (emergencia): 3 botones grandes, match automatico, mapa de necesidades (rojo) y recursos (verde), boletin.
// Funciona sin senal: Firestore guarda en el celular y sube solo al volver la conexion.
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEstado } from '../lib/estado'
import { conGeo, listarCerca, listar, obtener, nuevoId, crearSeguro, actualizarSeguro } from '../lib/db'
import { distanciaKm } from '../lib/geo'
import { CATEGORIAS_MINKA, parteLocal, resumirZona } from '../lib/ia'
import { PUNTOS, calcularPuntos, codigo4 } from '../lib/puntos'

// Confirmar en persona: < 200 m entre celulares. Del otro solo tenemos su celda (~300 m), por eso +220 m de margen.
const DIST_CONFIRMAR_KM = 0.42

const RECURSOS = ['enfermera', 'botiquin', 'agua', 'comida', 'generador', 'vehiculo', 'espacio']
const ETIQUETA = {
  agua: 'AGUA', medicina: 'MEDICINA', albergue: 'ALBERGUE', rescate: 'RESCATE', comida: 'COMIDA', otro: 'OTRO',
  enfermera: 'ENFERMERA/O', botiquin: 'BOTIQUÍN', generador: 'GENERADOR', vehiculo: 'VEHÍCULO', espacio: 'ESPACIO',
}
const EMOJI = {
  agua: '💧', medicina: '💊', albergue: '🏠', rescate: '🚒', comida: '🍲', otro: '❓',
  enfermera: '🩺', botiquin: '🩹', generador: '🔋', vehiculo: '🚗', espacio: '🏠',
}
// Que recursos sirven para cada pedido (match automatico)
const SIRVE = {
  agua: ['agua'], comida: ['comida'], medicina: ['botiquin', 'enfermera'],
  albergue: ['espacio'], rescate: ['vehiculo', 'enfermera'], otro: RECURSOS,
}
const URGENCIAS = [[1, 'Puede esperar'], [2, 'Hoy'], [3, '¡Ahora!']]
const textoUrgencia = (u) => URGENCIAS.find(([n]) => n === u)?.[1] || ''
const min = (tipo) => (ETIQUETA[tipo] || tipo || '').toLowerCase()
const aDistancia = (km) => {
  const c = Math.round((km * 1000) / 100) // 1 cuadra ~ 100 m
  return c < 1 ? 'a menos de 1 cuadra' : `a ${c} cuadra${c > 1 ? 's' : ''}`
}
const waLink = (num, msj) => `https://wa.me/51${num}?text=${encodeURIComponent(msj)}`
const msFecha = (f) => (f == null ? Infinity : f.seconds ? f.seconds * 1000 : Number(f) || 0)

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
  const { usuario, geoAprox, ubicacion, radioKm, setModo, setAviso, prefs } = useEstado()
  const q = !!prefs?.quechua // frases en quechua (Perfil)
  const avisar = (t) => setAviso(q ? t.replace(/^Gracias/, 'Sulpayki, gracias') : t)
  const [paso, setPaso] = useState(null) // null | 'ayuda' | 'urgencia' | 'puedo'
  const [tipoPedido, setTipoPedido] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [necesidades, setNecesidades] = useState([])
  const [recursos, setRecursos] = useState([])
  const [avisos, setAvisos] = useState([])
  const [matches, setMatches] = useState([]) // mis pedidos/ayudas que ya tienen pareja
  const [codigos, setCodigos] = useState({}) // codigo escrito por match (quien recibio)
  const [confirmadas, setConfirmadas] = useState({}) // recursoId -> ayuda confirmada (como quien recibe o quien ayuda)
  const [parte, setParte] = useState(null) // { texto, fuente: 'gemini'|'local', hora }

  const quien = (x) => (x.autorId === usuario?.id ? 'Tú' : x.autorNombre)
  const miWhatsapp = usuario?.whatsappVisible ? usuario.telefono : null
  const distA = (geo) => (ubicacion && geo ? aDistancia(distanciaKm(ubicacion, geo)) : '')

  async function cargar() {
    if (!ubicacion) return
    try {
      const [necTodas, rec, avs, misNec, misRec, recibidas, dadas] = await Promise.all([
        listarCerca('necesidades', ubicacion, radioKm),
        listarCerca('recursos', ubicacion, radioKm, { disponible: true }),
        listar('avisos_minka', {}, 10),
        listar('necesidades', { autorId: usuario.id, estado: 'atendida' }, 20),
        listar('recursos', { autorId: usuario.id, disponible: false }, 20),
        listar('ayudas_intercambios', { recibeId: usuario.id }, 100),
        listar('ayudas_intercambios', { ayudaId: usuario.id }, 100),
      ])
      const nec = necTodas.filter((n) => n.estado === 'abierta')
      actualizarParte(nec, rec, necTodas.length - nec.length, avs)
      setConfirmadas(Object.fromEntries([...recibidas, ...dadas].map((a) => [a.recursoId, a])))
      setNecesidades(nec.sort((a, b) => (b.urgencia || 0) - (a.urgencia || 0)))
      setRecursos(rec)
      setAvisos(avs)
      setMatches([
        ...misNec.filter((n) => n.match).map((n) => ({ key: n.id, rol: 'pedi', miTipo: n.tipo, otro: n.match, fecha: n.fecha })),
        ...misRec.filter((r) => r.match).map((r) => ({ key: r.id, rol: 'ofreci', miTipo: r.tipo, otro: r.match, fecha: r.fecha })),
      ].sort((a, b) => msFecha(b.fecha) - msFecha(a.fecha)).slice(0, 3))
    } catch (e) { console.warn('Minka: no se pudo cargar', e) }
  }
  // Modo Minka solo al ENTRAR. Si dependiera de radioKm, al tocar "Salir" (barrio = radio 1 km) esta
  // pantalla, aun visible mientras navega, volvia a activar Minka y no dejaba salir.
  useEffect(() => { setModo('minka') }, []) // eslint-disable-line
  useEffect(() => { cargar() }, [ubicacion, radioKm]) // eslint-disable-line

  // Parte de zona: resumen local al instante; Gemini lo mejora. Se reusa 15 min si los datos no cambian.
  async function actualizarParte(abiertas, rec, coordinadas, avs) {
    const datos = {
      pedidos: abiertas.map((n) => ({ tipo: min(n.tipo), urgente: n.urgencia === 3 })),
      ofrecen: rec.map((r) => min(r.tipo)),
      coordinadas,
      avisos: avs.map((a) => a.texto),
    }
    const clave = JSON.stringify(datos)
    const hora = new Date().toLocaleTimeString('es-PE', { hour: 'numeric', minute: '2-digit' })
    try {
      const c = JSON.parse(localStorage.getItem('ayni_parte_zona'))
      if (c?.clave === clave && Date.now() - c.t < 15 * 60000) return setParte(c.parte)
    } catch { /* sin cache */ }
    setParte({ texto: parteLocal(datos), fuente: 'local', hora })
    const r = await resumirZona(datos)
    const p = { ...r, hora }
    setParte(p)
    if (r.fuente === 'gemini') {
      try { localStorage.setItem('ayni_parte_zona', JSON.stringify({ clave, t: Date.now(), parte: p })) } catch { /* sin storage */ }
    }
  }

  async function accion(fn) {
    setEnviando(true)
    try { await fn(); setPaso(null); setTipoPedido(null); await cargar() }
    catch (e) { console.error('Minka: no se pudo guardar', e); avisar('No se pudo enviar. Intenta de nuevo.') }
    finally { setEnviando(false) }
  }

  const base = () => ({ autorId: usuario.id, autorNombre: usuario.nombre, whatsapp: miWhatsapp })

  const estoyBien = () => accion(async () => {
    const { sinSenal } = await crearSeguro('estados_minka', { ...base(), estado: 'bien', zona: geoAprox })
    avisar(sinSenal ? 'Sin señal: tu aviso se guardó y se enviará solo.' : 'Avisamos que estás bien ✔')
  })

  // NECESITO: busca el recurso disponible mas cercano que sirva; si hay, la necesidad nace "atendida"
  const necesito = (urgencia) => accion(async () => {
    const r = recursos
      .filter((x) => SIRVE[tipoPedido]?.includes(x.tipo) && x.autorId !== usuario.id && !x.asignadoA)
      .sort((a, b) => a.distanciaKm - b.distanciaKm)[0]
    const id = nuevoId('necesidades')
    const { sinSenal } = await crearSeguro('necesidades', conGeo({
      ...base(), tipo: tipoPedido, urgencia, estado: r ? 'atendida' : 'abierta', asignadoA: r?.id || null,
      match: r ? { id: r.id, autorId: r.autorId, nombre: r.autorNombre, whatsapp: r.whatsapp || null, tipo: r.tipo, geo: r.geo } : null,
    }, geoAprox), id)
    if (!r) return avisar(sinSenal ? 'Sin señal: tu pedido se guardó y se enviará solo.' : 'Pedido enviado a tus vecinos. Te avisamos cuando alguien pueda ayudar.')
    await actualizarSeguro('recursos', r.id, {
      disponible: false, asignadoA: id,
      match: { id, autorId: usuario.id, nombre: usuario.nombre, whatsapp: miWhatsapp, tipo: tipoPedido, urgencia, geo: geoAprox },
    })
    avisar(`¡Match! ${r.autorNombre}, ${aDistancia(r.distanciaKm)}, tiene ${min(r.tipo)}.`)
  })

  // PUEDO AYUDAR: busca la necesidad abierta mas urgente (y luego mas cercana) que este recurso cubre
  const puedo = (tipo) => accion(async () => {
    const n = necesidades
      .filter((x) => SIRVE[x.tipo]?.includes(tipo) && x.autorId !== usuario.id && !x.asignadoA)
      .sort((a, b) => (b.urgencia || 0) - (a.urgencia || 0) || a.distanciaKm - b.distanciaKm)[0]
    const id = nuevoId('recursos')
    const { sinSenal } = await crearSeguro('recursos', conGeo({
      ...base(), tipo, disponible: !n, asignadoA: n?.id || null,
      match: n ? { id: n.id, autorId: n.autorId, nombre: n.autorNombre, whatsapp: n.whatsapp || null, tipo: n.tipo, urgencia: n.urgencia, geo: n.geo } : null,
    }, geoAprox), id)
    if (!n) return avisar(sinSenal ? 'Sin señal: tu ayuda se guardó y se enviará sola.' : 'Gracias. Tu ayuda ya aparece en el mapa (+20 puntos al confirmar).')
    await actualizarSeguro('necesidades', n.id, {
      estado: 'atendida', asignadoA: id,
      match: { id, autorId: usuario.id, nombre: usuario.nombre, whatsapp: miWhatsapp, tipo, geo: geoAprox },
    })
    avisar(`¡Match! ${n.autorNombre}, ${aDistancia(n.distanciaKm)}, necesita ${min(n.tipo)} (${textoUrgencia(n.urgencia)}).`)
  })

  // Quien RECIBIO confirma con el codigo de 4 digitos de quien ayudo, estando juntos. Da puntos a quien ayudo.
  const confirmar = (m) => accion(async () => {
    if ((codigos[m.key] || '') !== codigo4(m.otro.id)) return avisar('Ese código no es. Pídeselo de nuevo a quien te ayudó.')
    if (!ubicacion || distanciaKm(ubicacion, m.otro.geo) > DIST_CONFIRMAR_KM) return avisar('Tienen que estar juntos para confirmar (menos de 200 m).')
    const ayudaId = m.otro.autorId || (await obtener('recursos', m.otro.id))?.autorId // matches viejos no guardaban autorId
    if (!ayudaId) return avisar('No se pudo enviar. Intenta de nuevo.')
    const { puntos, motivo } = await calcularPuntos(ayudaId, usuario.id, PUNTOS.MINKA)
    await crearSeguro('ayudas_intercambios', {
      tipo: 'MINKA', autorId: usuario.id, ayudaId, ayudaNombre: m.otro.nombre, recibeId: usuario.id, recibeNombre: usuario.nombre,
      necesidadId: m.key, recursoId: m.otro.id, puntos, motivo, confirmadoPorReceptor: true,
    }, `ayuda_${m.otro.id}`) // id fijo: una sola confirmacion por ayuda
    avisar(motivo === 'pareja' ? 'Gracias. Ayuda confirmada. Esta vez no suma puntos: ya se ayudaron varias veces este mes.'
      : motivo === 'tope_dia' && puntos === 0 ? `Gracias. Ayuda confirmada. ${m.otro.nombre} ya llegó al máximo de puntos de hoy.`
        : `Gracias. ${m.otro.nombre} recibió +${puntos} puntos Ayni.`)
  })

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
      {matches.map((m) => {
        const yo = usuario.nombre.split(' ')[0]
        const dist = distA(m.otro.geo)
        const conf = confirmadas[m.rol === 'pedi' ? m.otro.id : m.key] // ayuda ya confirmada
        const texto = m.rol === 'pedi'
          ? `${m.otro.nombre}, ${dist}, tiene ${min(m.otro.tipo)}. Toca para coordinar.`
          : `${m.otro.nombre}, ${dist}, necesita ${min(m.otro.tipo)}${m.otro.urgencia ? ` (${textoUrgencia(m.otro.urgencia)})` : ''}. Toca para coordinar.`
        const msj = m.rol === 'pedi'
          ? `Hola ${m.otro.nombre}, soy ${yo} de Ayni. Necesito ${min(m.miTipo)} y estás ${dist}. ¿Puedes ayudar?`
          : `Hola ${m.otro.nombre}, soy ${yo} de Ayni. Vi que necesitas ${min(m.otro.tipo)} y estoy ${dist}. ¿Te ayudo?`
        return (
          <div key={m.key} className="tarjeta" style={{ border: '2px solid var(--verde)', background: 'var(--verde-claro)' }}>
            <b>🤝 {EMOJI[m.otro.tipo]} {texto}</b>
            {m.otro.whatsapp
              ? <a className="btn puedo" style={{ marginTop: 10, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  href={waLink(m.otro.whatsapp, msj)} target="_blank" rel="noreferrer">💬 Coordinar por WhatsApp</a>
              : <div className="muted" style={{ marginTop: 6 }}>No compartió su WhatsApp: búscalo en el mapa de su zona.</div>}
            {/* Confirmar la ayuda en persona (codigo de 4 digitos) */}
            {m.rol === 'pedi' && (conf
              ? <div style={{ marginTop: 10 }}>✔ Ayuda confirmada</div>
              : <div style={{ marginTop: 10 }}>
                  <b>¿Te ayudaron?</b> Pide a quien te ayudó su código de 4 dígitos.
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <input placeholder="Código" inputMode="numeric" maxLength={4} style={{ flex: 1 }} value={codigos[m.key] || ''}
                      onChange={(e) => setCodigos({ ...codigos, [m.key]: e.target.value.replace(/\D/g, '') })} />
                    <button className="btn" style={{ width: 'auto' }} disabled={enviando || (codigos[m.key] || '').length !== 4}
                      onClick={() => confirmar(m)}>Confirmar ayuda</button>
                  </div>
                </div>)}
            {m.rol === 'ofreci' && (conf
              ? <div style={{ marginTop: 10 }}>✔ {conf.recibeNombre} confirmó tu ayuda: +{conf.puntos || 0} puntos Ayni</div>
              : <div style={{ marginTop: 10 }}>Cuando ayudes, dale este código para confirmar:{' '}
                  <b style={{ fontSize: 24, letterSpacing: 4 }}>{codigo4(m.key)}</b></div>)}
          </div>
        )
      })}

      <button className="btn gigante bien" style={{ flexDirection: 'column', gap: 2 }} disabled={enviando} onClick={estoyBien}>✅ ESTOY BIEN{q && <span className="quechua">Allinllachu?</span>}</button>
      <button className="btn gigante ayuda" style={{ flexDirection: 'column', gap: 2 }} onClick={() => setPaso('ayuda')}>🆘 NECESITO AYUDA{q && <span className="quechua">Yanapaway!</span>}</button>
      <button className="btn gigante puedo" style={{ flexDirection: 'column', gap: 2 }} onClick={() => setPaso('puedo')}>🤝 PUEDO AYUDAR{q && <span className="quechua">Yanapasqayki</span>}</button>

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
        {parte && (
          <div style={{ background: 'var(--rojo-claro)', padding: 10, borderRadius: 8, marginBottom: 8 }}>
            <b>Resumen de tu zona, {parte.hora}:</b> {parte.texto}
            <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{parte.fuente === 'gemini' ? '✨ Resumido con IA a partir de los reportes vecinales' : 'Resumen automático de los reportes vecinales'}</div>
          </div>
        )}
        {avisos.length === 0 && <div className="muted">Sin avisos por ahora.</div>}
        {avisos.map((a) => <div key={a.id}>• {a.texto}</div>)}
      </div>
    </div>
  )
}
