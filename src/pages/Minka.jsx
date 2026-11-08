// Modo Minka (emergencia): 3 botones grandes, match automatico, mapa de necesidades (rojo) y recursos (verde), boletin.
// Funciona sin senal: Firestore guarda en el celular y sube solo al volver la conexion.
// Tus pedidos y ayudas se pueden cancelar/retirar (no se borran: cambian de estado, las reglas no permiten borrar)
// y las ya confirmadas se pueden quitar de la lista (oculto: true); los puntos ya entregados no se tocan.
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ArrowLeft, MessageCircle, CircleCheck, Newspaper, Sparkles, Megaphone, HeartHandshake, Siren, KeyRound, X } from 'lucide-react'
import { useEstado } from '../lib/estado'
import { conGeo, listarCerca, listar, obtener, nuevoId, crearSeguro, actualizarSeguro } from '../lib/db'
import { distanciaKm } from '../lib/geo'
import { CATEGORIAS_MINKA, parteLocal, resumirZona } from '../lib/ia'
import { PUNTOS, calcularPuntos, codigo4 } from '../lib/puntos'
import { ICONO_MINKA, svg } from '../lib/iconos'
import { haceCuanto, msFecha } from '../lib/contacto'

// Confirmar en persona: < 200 m entre celulares. Del otro solo tenemos su celda (~300 m), por eso +220 m de margen.
const DIST_CONFIRMAR_KM = 0.42

const RECURSOS = ['enfermera', 'botiquin', 'agua', 'comida', 'generador', 'vehiculo', 'espacio']
const ETIQUETA = {
  agua: 'AGUA', medicina: 'MEDICINA', albergue: 'ALBERGUE', rescate: 'RESCATE', comida: 'COMIDA', otro: 'OTRO',
  enfermera: 'ENFERMERA/O', botiquin: 'BOTIQUÍN', generador: 'GENERADOR', vehiculo: 'VEHÍCULO', espacio: 'ESPACIO',
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
const Icono = ({ tipo, ...p }) => { const C = ICONO_MINKA[tipo] || ICONO_MINKA.otro; return <C aria-hidden="true" {...p} /> }
const Atras = ({ onClick }) => <button className="btn-atras" aria-label="Atrás" onClick={onClick}><ArrowLeft size={22} aria-hidden="true" /></button>

const iconoYo = L.divIcon({ html: '<div class="pin pin-yo"></div>', className: '', iconSize: [20, 20], iconAnchor: [10, 10] })

// Una pastilla por celda (~300 m): rojo = cuantas necesidades, verde = cuantos recursos
function iconoCelda(nNec, nRec) {
  const ancho = (nNec ? 58 : 0) + (nRec ? 58 : 0)
  const parte = (cls, Ic, n) => `<span class="${cls}">${svg(Ic, { size: 15 })}${n}</span>`
  return L.divIcon({
    className: '', iconSize: [ancho, 30], iconAnchor: [ancho / 2, 15],
    html: `<div class="pastilla">${nNec ? parte('nec', Siren, nNec) : ''}${nRec ? parte('rec', HeartHandshake, nRec) : ''}</div>`,
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

export default function Minka() {
  const { usuario, geoAprox, ubicacion, radioKm, setModo, setAviso, prefs } = useEstado()
  const q = !!prefs?.quechua // frases en quechua (Ajustes)
  const avisar = (t) => setAviso(q ? t.replace(/^Gracias/, 'Sulpayki, gracias') : t)
  const [paso, setPaso] = useState(null) // null | 'ayuda' | 'urgencia' | 'puedo'
  const [tipoPedido, setTipoPedido] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [necesidades, setNecesidades] = useState([])
  const [recursos, setRecursos] = useState([])
  const [avisos, setAvisos] = useState([])
  const [matches, setMatches] = useState([]) // mis pedidos/ayudas que ya tienen pareja
  const [misPedidos, setMisPedidos] = useState([]) // mis pedidos abiertos, aun sin vecino
  const [misAyudas, setMisAyudas] = useState([]) // mis ayudas disponibles, aun sin pedido
  const [codigos, setCodigos] = useState({}) // codigo escrito por match (quien recibio)
  const [confirmadas, setConfirmadas] = useState({}) // recursoId -> ayuda confirmada (como quien recibe o quien ayuda)
  const [parte, setParte] = useState(null) // { texto, fuente: 'gemini'|'local', hora }

  const quien = (x) => (x.autorId === usuario?.id ? 'Tú' : x.autorNombre)
  const miWhatsapp = usuario?.whatsappVisible ? usuario.telefono : null
  const distA = (geo) => (ubicacion && geo ? aDistancia(distanciaKm(ubicacion, geo)) : '')

  async function cargar() {
    if (!ubicacion) return
    try {
      const [necTodas, rec, avs, misNec, misRec, abiertas, disponibles, recibidas, dadas] = await Promise.all([
        listarCerca('necesidades', ubicacion, radioKm),
        listarCerca('recursos', ubicacion, radioKm, { disponible: true }),
        listar('avisos_minka', {}, 10),
        listar('necesidades', { autorId: usuario.id, estado: 'atendida' }, 20),
        listar('recursos', { autorId: usuario.id, disponible: false }, 20),
        listar('necesidades', { autorId: usuario.id, estado: 'abierta' }, 20),
        listar('recursos', { autorId: usuario.id, disponible: true }, 20),
        listar('ayudas_intercambios', { recibeId: usuario.id }, 100),
        listar('ayudas_intercambios', { ayudaId: usuario.id }, 100),
      ])
      const nec = necTodas.filter((n) => n.estado === 'abierta')
      actualizarParte(nec, rec, necTodas.filter((n) => n.estado === 'atendida').length, avs)
      setConfirmadas(Object.fromEntries([...recibidas, ...dadas].map((a) => [a.recursoId, a])))
      setNecesidades(nec.sort((a, b) => (b.urgencia || 0) - (a.urgencia || 0)))
      setRecursos(rec)
      setAvisos(avs)
      setMisPedidos(abiertas.sort((a, b) => msFecha(b.fecha) - msFecha(a.fecha)))
      setMisAyudas(disponibles.sort((a, b) => msFecha(b.fecha) - msFecha(a.fecha)))
      setMatches([
        ...misNec.filter((n) => n.match && !n.oculto).map((n) => ({ key: n.id, rol: 'pedi', miTipo: n.tipo, otro: n.match, fecha: n.fecha })),
        ...misRec.filter((r) => r.match && !r.oculto).map((r) => ({ key: r.id, rol: 'ofreci', miTipo: r.tipo, otro: r.match, fecha: r.fecha })),
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
    avisar(sinSenal ? 'Sin señal: tu aviso se guardó y se enviará solo.' : 'Avisamos que estás bien')
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

  // CANCELAR mi pedido (abierto o con vecino asignado pero sin confirmar): el recurso del vecino vuelve a estar disponible
  const cancelarPedido = (n) => {
    if (!window.confirm(`¿Cancelar tu pedido de ${min(n.tipo)}?`)) return
    accion(async () => {
      await actualizarSeguro('necesidades', n.id, { estado: 'cancelada', asignadoA: null, match: null })
      if (n.asignadoA) await actualizarSeguro('recursos', n.asignadoA, { disponible: true, asignadoA: null, match: null })
      avisar('Pedido cancelado.')
    })
  }
  // RETIRAR mi ayuda (disponible o asignada sin confirmar): el pedido del vecino vuelve a quedar abierto
  const retirarAyuda = (r) => {
    if (!window.confirm(`¿Retirar tu ayuda de ${min(r.tipo)}?`)) return
    accion(async () => {
      await actualizarSeguro('recursos', r.id, { disponible: false, estado: 'retirada', asignadoA: null, match: null })
      if (r.asignadoA) await actualizarSeguro('necesidades', r.asignadoA, { estado: 'abierta', asignadoA: null, match: null })
      avisar('Ayuda retirada.')
    })
  }
  // QUITAR DE LA LISTA una ayuda ya confirmada (solo deja de verse; los puntos ya entregados no cambian)
  const quitarDeLista = (m) => accion(async () => {
    await actualizarSeguro(m.rol === 'pedi' ? 'necesidades' : 'recursos', m.key, { oculto: true })
    avisar('Quitado de tu lista.')
  })

  if (paso === 'ayuda') return (
    <div className="pantalla">
      <div className="cabecera"><Atras onClick={() => setPaso(null)} /><h2>¿Qué necesitas?</h2></div>
      <div className="opciones-tipo">
        {CATEGORIAS_MINKA.map((t) => (
          <button key={t} className="btn alto ayuda" onClick={() => { setTipoPedido(t); setPaso('urgencia') }}><Icono tipo={t} />{ETIQUETA[t]}</button>
        ))}
      </div>
    </div>
  )
  if (paso === 'urgencia') return (
    <div className="pantalla">
      <div className="cabecera">
        <Atras onClick={() => setPaso('ayuda')} />
        <span className="ficha rojo"><Icono tipo={tipoPedido} /></span>
        <h2>{ETIQUETA[tipoPedido]}: ¿qué tan urgente?</h2>
      </div>
      <div className="minka-botones">
        {URGENCIAS.map(([u, txt]) => (
          <button key={u} className="btn gigante ayuda" style={{ justifyContent: 'center' }} disabled={enviando} onClick={() => necesito(u)}>{txt}</button>
        ))}
      </div>
    </div>
  )
  if (paso === 'puedo') return (
    <div className="pantalla">
      <div className="cabecera"><Atras onClick={() => setPaso(null)} /><h2>¿Con qué puedes ayudar?</h2></div>
      <div className="opciones-tipo">
        {RECURSOS.map((t) => <button key={t} className="btn alto puedo" disabled={enviando} onClick={() => puedo(t)}><Icono tipo={t} />{ETIQUETA[t]}</button>)}
      </div>
    </div>
  )

  const Confirmada = ({ children }) => <div className="fila-icono" style={{ fontWeight: 700 }}><CircleCheck size={20} style={{ color: 'var(--verde)' }} aria-hidden="true" />{children}</div>

  return (
    <div className="pantalla ancha">
      <div className="minka-columnas">
        <div>
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
            const mio = { id: m.key, tipo: m.miTipo, asignadoA: m.otro.id }
            return (
              <div key={m.key} className="tarjeta tarjeta-match">
                <div className="fila">
                  <span className="ficha"><Icono tipo={m.otro.tipo} /></span>
                  <div><h3 style={{ margin: 0 }}>Hay un vecino para ti</h3><div>{texto}</div></div>
                </div>
                {m.otro.whatsapp
                  ? <a className="btn whatsapp" style={{ marginTop: 12 }} href={waLink(m.otro.whatsapp, msj)} target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" />Coordinar por WhatsApp</a>
                  : <div className="muted" style={{ marginTop: 8 }}>No compartió su WhatsApp: búscalo en el mapa de su zona.</div>}
                {/* Confirmar la ayuda en persona (codigo de 4 digitos) */}
                {m.rol === 'pedi' && (conf
                  ? <div style={{ marginTop: 12 }}><Confirmada>Ayuda confirmada</Confirmada></div>
                  : <div style={{ marginTop: 12 }}>
                      <b>¿Te ayudaron?</b> Pide a quien te ayudó su código de 4 dígitos.
                      <div className="btn-fila" style={{ marginTop: 8 }}>
                        <input placeholder="Código" aria-label="Código de 4 dígitos" inputMode="numeric" maxLength={4} style={{ flex: 1 }} value={codigos[m.key] || ''}
                          onChange={(e) => setCodigos({ ...codigos, [m.key]: e.target.value.replace(/\D/g, '') })} />
                        <button className="btn" style={{ flex: 'none', width: 'auto' }} disabled={enviando || (codigos[m.key] || '').length !== 4}
                          onClick={() => confirmar(m)}>Confirmar ayuda</button>
                      </div>
                    </div>)}
                {m.rol === 'ofreci' && (conf
                  ? <div style={{ marginTop: 12 }}><Confirmada>{conf.recibeNombre} confirmó tu ayuda: +{conf.puntos || 0} puntos Ayni</Confirmada></div>
                  : <div style={{ marginTop: 12 }}>
                      <div className="fila-icono"><KeyRound size={18} aria-hidden="true" />Cuando ayudes, dale este código para confirmar:</div>
                      <div className="codigo-ayuda">{codigo4(m.key)}</div>
                    </div>)}
                <div className="acciones-match">
                  {conf
                    ? <button className="btn chico secundario" disabled={enviando} onClick={() => quitarDeLista(m)}><X size={18} aria-hidden="true" />Quitar de la lista</button>
                    : <button className="btn chico secundario" disabled={enviando} onClick={() => (m.rol === 'pedi' ? cancelarPedido(mio) : retirarAyuda(mio))}>
                        <X size={18} aria-hidden="true" />{m.rol === 'pedi' ? 'Cancelar pedido' : 'Retirar ayuda'}
                      </button>}
                </div>
              </div>
            )
          })}

          <div className="minka-botones">
            <button className="btn gigante bien" disabled={enviando} onClick={estoyBien}>
              <Icono tipo="bien" /><span className="texto">Estoy bien{q && <span className="quechua">Allinllachu?</span>}</span>
            </button>
            <button className="btn gigante ayuda" onClick={() => setPaso('ayuda')}>
              <Icono tipo="ayuda" /><span className="texto">Necesito ayuda{q && <span className="quechua">Yanapaway!</span>}</span>
            </button>
            <button className="btn gigante puedo" onClick={() => setPaso('puedo')}>
              <Icono tipo="puedo" /><span className="texto">Puedo ayudar{q && <span className="quechua">Yanapasqayki</span>}</span>
            </button>
          </div>

          {(misPedidos.length > 0 || misAyudas.length > 0) && (
            <div className="tarjeta minka-mios">
              <h3>Tus pedidos y ayudas</h3>
              <div className="muted" style={{ marginBottom: 6 }}>Aún sin vecino. Puedes cancelarlos cuando quieras.</div>
              {misPedidos.map((n) => (
                <div key={n.id} className="mio">
                  <span className="ficha chica rojo"><Icono tipo={n.tipo} /></span>
                  <div className="mio-texto"><b>Pediste {min(n.tipo)}</b><div className="muted">{textoUrgencia(n.urgencia)}, {haceCuanto(n.fecha)}</div></div>
                  <button className="btn chico secundario" disabled={enviando} onClick={() => cancelarPedido(n)}>Cancelar</button>
                </div>
              ))}
              {misAyudas.map((r) => (
                <div key={r.id} className="mio">
                  <span className="ficha chica"><Icono tipo={r.tipo} /></span>
                  <div className="mio-texto"><b>Ofreces {min(r.tipo)}</b><div className="muted">Disponible {haceCuanto(r.fecha)}</div></div>
                  <button className="btn chico secundario" disabled={enviando} onClick={() => retirarAyuda(r)}>Retirar</button>
                </div>
              ))}
            </div>
          )}

          <div className="tarjeta minka-boletin">
            <h3 className="fila-icono"><Newspaper size={20} style={{ color: 'var(--rojo)' }} aria-hidden="true" />Boletín Minka</h3>
            {parte && (
              <div className="parte-zona">
                <b>Resumen de tu zona, {parte.hora}:</b> {parte.texto}
                <div className="fuente">
                  {parte.fuente === 'gemini' ? <><Sparkles aria-hidden="true" />Resumido con IA a partir de los reportes vecinales</> : 'Resumen automático de los reportes vecinales'}
                </div>
              </div>
            )}
            {avisos.length === 0 && <div className="muted">Sin avisos por ahora.</div>}
            {avisos.map((a) => <div key={a.id} className="aviso-item"><Megaphone aria-hidden="true" /><span>{a.texto}</span></div>)}
          </div>
        </div>

        <div>
          <div className="tarjeta minka-cerca">
            <h3>Cerca de ti ({radioKm} km)</h3>
            <div className="chips">
              <span className="chip rojo"><Siren aria-hidden="true" />{necesidades.length} necesidades abiertas</span>
              <span className="chip"><HeartHandshake aria-hidden="true" />{recursos.length} recursos disponibles</span>
            </div>
            {ubicacion && (
              <div className="mapa-mini">
                <MapContainer center={[ubicacion.lat, ubicacion.lng]} zoom={15} className="mapa" zoomControl={false}>
                  <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Centrar centro={ubicacion} />
                  <Ajustar />
                  <Marker position={[ubicacion.lat, ubicacion.lng]} icon={iconoYo}><Popup>Tú ({usuario?.nombre})</Popup></Marker>
                  {agruparPorCelda(necesidades, recursos).map((c) => (
                    <Marker key={c.k} position={[c.geo.lat, c.geo.lng]} icon={iconoCelda(c.nec.length, c.rec.length)}>
                      <Popup>
                        {c.nec.length > 0 && <b style={{ color: 'var(--rojo)' }}>Necesitan ayuda</b>}
                        {c.nec.map((n) => <div key={n.id} className="fila-icono"><Icono tipo={n.tipo} size={16} />{ETIQUETA[n.tipo] || n.tipo}, {textoUrgencia(n.urgencia)}: {quien(n)}</div>)}
                        {c.rec.length > 0 && <b style={{ color: 'var(--verde)', display: 'block', marginTop: c.nec.length ? 6 : 0 }}>Pueden ayudar</b>}
                        {c.rec.map((r) => <div key={r.id} className="fila-icono"><Icono tipo={r.tipo} size={16} />{ETIQUETA[r.tipo] || r.tipo}: {quien(r)}</div>)}
                        <span className="muted">a {(c.distanciaKm * 1000).toFixed(0)} m</span>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            )}
            {necesidades.length > 0 && (
              <div className="lista-necesidades">
                {necesidades.slice(0, 5).map((n) => (
                  <div key={n.id}><Icono tipo={n.tipo} /><span>{ETIQUETA[n.tipo] || n.tipo} ({textoUrgencia(n.urgencia)}) a {(n.distanciaKm * 1000).toFixed(0)} m, {quien(n)}</span></div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
