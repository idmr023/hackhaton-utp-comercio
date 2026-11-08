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
// Subtitulo de los 3 botones: en "mixto" va la frase en quechua; en quechua completo, la espanola
const SUB_QU = { bien: 'Allinllachu?', ayuda: 'Yanapaway!', puedo: 'Yanapasqayki' }
const SUB_ES = { bien: 'Estoy bien', ayuda: 'Necesito ayuda', puedo: 'Puedo ayudar' }
const waLink = (num, msj) => `https://wa.me/51${num}?text=${encodeURIComponent(msj)}`
const Icono = ({ tipo, ...p }) => { const C = ICONO_MINKA[tipo] || ICONO_MINKA.otro; return <C aria-hidden="true" {...p} /> }
const Atras = ({ t, onClick }) => <button className="btn-atras" aria-label={t('Atrás')} onClick={onClick}><ArrowLeft size={22} aria-hidden="true" /></button>
const Confirmada = ({ children }) => <div className="fila-icono" style={{ fontWeight: 700 }}><CircleCheck size={20} style={{ color: 'var(--verde)' }} aria-hidden="true" />{children}</div>
// Uno de los 3 botones gigantes: texto principal (traducido) + subtitulo en el otro idioma si corresponde
const Gigante = ({ clave, cls, onClick, t, sub, disabled }) => (
  <button className={`btn gigante ${cls}`} disabled={disabled} onClick={onClick}>
    <Icono tipo={clave} /><span className="texto">{t(SUB_ES[clave])}{sub && <span className="quechua">{sub[clave]}</span>}</span>
  </button>
)

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
  const { usuario, geoAprox, ubicacion, radioKm, setModo, setAviso, idioma, t } = useEstado()
  const sub = idioma === 'mixto' ? SUB_QU : idioma === 'qu' ? SUB_ES : null // subtitulo de los 3 botones
  // "Gracias" en quechua cuando el idioma es mixto (en quechua completo ya viene traducido por t)
  const avisar = (tx) => setAviso(idioma === 'mixto' ? tx.replace(/^Gracias/, 'Sulpayki, gracias') : tx)
  const etiqueta = (tipo) => t(ETIQUETA[tipo] || tipo || '')
  const min = (tipo) => etiqueta(tipo).toLowerCase()
  const textoUrgencia = (u) => { const x = URGENCIAS.find(([n]) => n === u); return x ? t(x[1]) : '' }
  const aDistancia = (km) => {
    const c = Math.round((km * 1000) / 100) // 1 cuadra ~ 100 m
    return c < 1 ? t('a menos de 1 cuadra') : c === 1 ? t('a 1 cuadra') : t('a {n} cuadras', { n: c })
  }
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

  const quien = (x) => (x.autorId === usuario?.id ? t('Tú') : x.autorNombre)
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
      pedidos: abiertas.map((n) => ({ tipo: (ETIQUETA[n.tipo] || n.tipo).toLowerCase(), urgente: n.urgencia === 3 })),
      ofrecen: rec.map((r) => (ETIQUETA[r.tipo] || r.tipo).toLowerCase()),
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
    catch (e) { console.error('Minka: no se pudo guardar', e); avisar(t('No se pudo enviar. Intenta de nuevo.')) }
    finally { setEnviando(false) }
  }

  const base = () => ({ autorId: usuario.id, autorNombre: usuario.nombre, whatsapp: miWhatsapp })

  const estoyBien = () => accion(async () => {
    const { sinSenal } = await crearSeguro('estados_minka', { ...base(), estado: 'bien', zona: geoAprox })
    avisar(sinSenal ? t('Sin señal: tu aviso se guardó y se enviará solo.') : t('Avisamos que estás bien'))
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
    if (!r) return avisar(sinSenal ? t('Sin señal: tu pedido se guardó y se enviará solo.') : t('Pedido enviado a tus vecinos. Te avisamos cuando alguien pueda ayudar.'))
    await actualizarSeguro('recursos', r.id, {
      disponible: false, asignadoA: id,
      match: { id, autorId: usuario.id, nombre: usuario.nombre, whatsapp: miWhatsapp, tipo: tipoPedido, urgencia, geo: geoAprox },
    })
    avisar(t('¡Match! {nombre}, {dist}, tiene {tipo}.', { nombre: r.autorNombre, dist: aDistancia(r.distanciaKm), tipo: min(r.tipo) }))
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
    if (!n) return avisar(sinSenal ? t('Sin señal: tu ayuda se guardó y se enviará sola.') : t('Gracias. Tu ayuda ya aparece en el mapa (+20 puntos al confirmar).'))
    await actualizarSeguro('necesidades', n.id, {
      estado: 'atendida', asignadoA: id,
      match: { id, autorId: usuario.id, nombre: usuario.nombre, whatsapp: miWhatsapp, tipo, geo: geoAprox },
    })
    avisar(t('¡Match! {nombre}, {dist}, necesita {tipo} ({urg}).', { nombre: n.autorNombre, dist: aDistancia(n.distanciaKm), tipo: min(n.tipo), urg: textoUrgencia(n.urgencia) }))
  })

  // Quien RECIBIO confirma con el codigo de 4 digitos de quien ayudo, estando juntos. Da puntos a quien ayudo.
  const confirmar = (m) => accion(async () => {
    if ((codigos[m.key] || '') !== codigo4(m.otro.id)) return avisar(t('Ese código no es. Pídeselo de nuevo a quien te ayudó.'))
    if (!ubicacion || distanciaKm(ubicacion, m.otro.geo) > DIST_CONFIRMAR_KM) return avisar(t('Tienen que estar juntos para confirmar (menos de 200 m).'))
    const ayudaId = m.otro.autorId || (await obtener('recursos', m.otro.id))?.autorId // matches viejos no guardaban autorId
    if (!ayudaId) return avisar(t('No se pudo enviar. Intenta de nuevo.'))
    const { puntos, motivo } = await calcularPuntos(ayudaId, usuario.id, PUNTOS.MINKA)
    await crearSeguro('ayudas_intercambios', {
      tipo: 'MINKA', autorId: usuario.id, ayudaId, ayudaNombre: m.otro.nombre, recibeId: usuario.id, recibeNombre: usuario.nombre,
      necesidadId: m.key, recursoId: m.otro.id, puntos, motivo, confirmadoPorReceptor: true,
    }, `ayuda_${m.otro.id}`) // id fijo: una sola confirmacion por ayuda
    avisar(motivo === 'pareja' ? t('Gracias. Ayuda confirmada. Esta vez no suma puntos: ya se ayudaron varias veces este mes.')
      : motivo === 'tope_dia' && puntos === 0 ? t('Gracias. Ayuda confirmada. {nombre} ya llegó al máximo de puntos de hoy.', { nombre: m.otro.nombre })
        : t('Gracias. {nombre} recibió +{p} puntos Ayni.', { nombre: m.otro.nombre, p: puntos }))
  })

  // CANCELAR mi pedido (abierto o con vecino asignado pero sin confirmar): el recurso del vecino vuelve a estar disponible
  const cancelarPedido = (n) => {
    if (!window.confirm(t('¿Cancelar tu pedido de {tipo}?', { tipo: min(n.tipo) }))) return
    accion(async () => {
      await actualizarSeguro('necesidades', n.id, { estado: 'cancelada', asignadoA: null, match: null })
      if (n.asignadoA) await actualizarSeguro('recursos', n.asignadoA, { disponible: true, asignadoA: null, match: null })
      avisar(t('Pedido cancelado.'))
    })
  }
  // RETIRAR mi ayuda (disponible o asignada sin confirmar): el pedido del vecino vuelve a quedar abierto
  const retirarAyuda = (r) => {
    if (!window.confirm(t('¿Retirar tu ayuda de {tipo}?', { tipo: min(r.tipo) }))) return
    accion(async () => {
      await actualizarSeguro('recursos', r.id, { disponible: false, estado: 'retirada', asignadoA: null, match: null })
      if (r.asignadoA) await actualizarSeguro('necesidades', r.asignadoA, { estado: 'abierta', asignadoA: null, match: null })
      avisar(t('Ayuda retirada.'))
    })
  }
  // QUITAR DE LA LISTA una ayuda ya confirmada (solo deja de verse; los puntos ya entregados no cambian)
  const quitarDeLista = (m) => accion(async () => {
    await actualizarSeguro(m.rol === 'pedi' ? 'necesidades' : 'recursos', m.key, { oculto: true })
    avisar(t('Quitado de tu lista.'))
  })

  if (paso === 'ayuda') return (
    <div className="pantalla">
      <div className="cabecera"><Atras t={t} onClick={() => setPaso(null)} /><h2>{t('¿Qué necesitas?')}</h2></div>
      <div className="opciones-tipo">
        {CATEGORIAS_MINKA.map((x) => (
          <button key={x} className="btn alto ayuda" onClick={() => { setTipoPedido(x); setPaso('urgencia') }}><Icono tipo={x} />{etiqueta(x)}</button>
        ))}
      </div>
    </div>
  )
  if (paso === 'urgencia') return (
    <div className="pantalla">
      <div className="cabecera">
        <Atras t={t} onClick={() => setPaso('ayuda')} />
        <span className="ficha rojo"><Icono tipo={tipoPedido} /></span>
        <h2>{t('{tipo}: ¿qué tan urgente?', { tipo: etiqueta(tipoPedido) })}</h2>
      </div>
      <div className="minka-botones">
        {URGENCIAS.map(([u, txt]) => (
          <button key={u} className="btn gigante ayuda" style={{ justifyContent: 'center' }} disabled={enviando} onClick={() => necesito(u)}>{t(txt)}</button>
        ))}
      </div>
    </div>
  )
  if (paso === 'puedo') return (
    <div className="pantalla">
      <div className="cabecera"><Atras t={t} onClick={() => setPaso(null)} /><h2>{t('¿Con qué puedes ayudar?')}</h2></div>
      <div className="opciones-tipo">
        {RECURSOS.map((x) => <button key={x} className="btn alto puedo" disabled={enviando} onClick={() => puedo(x)}><Icono tipo={x} />{etiqueta(x)}</button>)}
      </div>
    </div>
  )

  return (
    <div className="pantalla ancha">
      <div className="minka-columnas">
        <div>
          {matches.map((m) => {
            const yo = usuario.nombre.split(' ')[0]
            const dist = distA(m.otro.geo)
            const conf = confirmadas[m.rol === 'pedi' ? m.otro.id : m.key] // ayuda ya confirmada
            const texto = m.rol === 'pedi'
              ? t('{nombre}, {dist}, tiene {tipo}. Toca para coordinar.', { nombre: m.otro.nombre, dist, tipo: min(m.otro.tipo) })
              : t('{nombre}, {dist}, necesita {tipo}{urg}. Toca para coordinar.', { nombre: m.otro.nombre, dist, tipo: min(m.otro.tipo), urg: m.otro.urgencia ? ` (${textoUrgencia(m.otro.urgencia)})` : '' })
            const msj = m.rol === 'pedi'
              ? `Hola ${m.otro.nombre}, soy ${yo} de Ayni. Necesito ${(ETIQUETA[m.miTipo] || m.miTipo).toLowerCase()} y estás ${dist}. ¿Puedes ayudar?`
              : `Hola ${m.otro.nombre}, soy ${yo} de Ayni. Vi que necesitas ${(ETIQUETA[m.otro.tipo] || m.otro.tipo).toLowerCase()} y estoy ${dist}. ¿Te ayudo?`
            const mio = { id: m.key, tipo: m.miTipo, asignadoA: m.otro.id }
            return (
              <div key={m.key} className="tarjeta tarjeta-match">
                <div className="fila">
                  <span className="ficha"><Icono tipo={m.otro.tipo} /></span>
                  <div><h3 style={{ margin: 0 }}>{t('Hay un vecino para ti')}</h3><div>{texto}</div></div>
                </div>
                {m.otro.whatsapp
                  ? <a className="btn whatsapp" style={{ marginTop: 12 }} href={waLink(m.otro.whatsapp, msj)} target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" />{t('Coordinar por WhatsApp')}</a>
                  : <div className="muted" style={{ marginTop: 8 }}>{t('No compartió su WhatsApp: búscalo en el mapa de su zona.')}</div>}
                {/* Confirmar la ayuda en persona (codigo de 4 digitos) */}
                {m.rol === 'pedi' && (conf
                  ? <div style={{ marginTop: 12 }}><Confirmada>{t('Ayuda confirmada')}</Confirmada></div>
                  : <div style={{ marginTop: 12 }}>
                      <b>{t('¿Te ayudaron?')}</b> {t('Pide a quien te ayudó su código de 4 dígitos.')}
                      <div className="btn-fila" style={{ marginTop: 8 }}>
                        <input placeholder={t('Código')} aria-label={t('Código de 4 dígitos')} inputMode="numeric" maxLength={4} style={{ flex: 1 }} value={codigos[m.key] || ''}
                          onChange={(e) => setCodigos({ ...codigos, [m.key]: e.target.value.replace(/\D/g, '') })} />
                        <button className="btn" style={{ flex: 'none', width: 'auto' }} disabled={enviando || (codigos[m.key] || '').length !== 4}
                          onClick={() => confirmar(m)}>{t('Confirmar ayuda')}</button>
                      </div>
                    </div>)}
                {m.rol === 'ofreci' && (conf
                  ? <div style={{ marginTop: 12 }}><Confirmada>{t('{nombre} confirmó tu ayuda: +{p} puntos Ayni', { nombre: conf.recibeNombre, p: conf.puntos || 0 })}</Confirmada></div>
                  : <div style={{ marginTop: 12 }}>
                      <div className="fila-icono"><KeyRound size={18} aria-hidden="true" />{t('Cuando ayudes, dale este código para confirmar:')}</div>
                      <div className="codigo-ayuda">{codigo4(m.key)}</div>
                    </div>)}
                <div className="acciones-match">
                  {conf
                    ? <button className="btn chico secundario" disabled={enviando} onClick={() => quitarDeLista(m)}><X size={18} aria-hidden="true" />{t('Quitar de la lista')}</button>
                    : <button className="btn chico secundario" disabled={enviando} onClick={() => (m.rol === 'pedi' ? cancelarPedido(mio) : retirarAyuda(mio))}>
                        <X size={18} aria-hidden="true" />{m.rol === 'pedi' ? t('Cancelar pedido') : t('Retirar ayuda')}
                      </button>}
                </div>
              </div>
            )
          })}

          <div className="minka-botones">
            <Gigante clave="bien" cls="bien" onClick={estoyBien} t={t} sub={sub} disabled={enviando} />
            <Gigante clave="ayuda" cls="ayuda" onClick={() => setPaso('ayuda')} t={t} sub={sub} />
            <Gigante clave="puedo" cls="puedo" onClick={() => setPaso('puedo')} t={t} sub={sub} />
          </div>

          {(misPedidos.length > 0 || misAyudas.length > 0) && (
            <div className="tarjeta minka-mios">
              <h3>{t('Tus pedidos y ayudas')}</h3>
              <div className="muted" style={{ marginBottom: 6 }}>{t('Aún sin vecino. Puedes cancelarlos cuando quieras.')}</div>
              {misPedidos.map((n) => (
                <div key={n.id} className="mio">
                  <span className="ficha chica rojo"><Icono tipo={n.tipo} /></span>
                  <div className="mio-texto"><b>{t('Pediste {tipo}', { tipo: min(n.tipo) })}</b><div className="muted">{textoUrgencia(n.urgencia)}, {haceCuanto(n.fecha, t)}</div></div>
                  <button className="btn chico secundario" disabled={enviando} onClick={() => cancelarPedido(n)}>{t('Cancelar')}</button>
                </div>
              ))}
              {misAyudas.map((r) => (
                <div key={r.id} className="mio">
                  <span className="ficha chica"><Icono tipo={r.tipo} /></span>
                  <div className="mio-texto"><b>{t('Ofreces {tipo}', { tipo: min(r.tipo) })}</b><div className="muted">{t('Disponible {hace}', { hace: haceCuanto(r.fecha, t) })}</div></div>
                  <button className="btn chico secundario" disabled={enviando} onClick={() => retirarAyuda(r)}>{t('Retirar')}</button>
                </div>
              ))}
            </div>
          )}

          <div className="tarjeta minka-boletin">
            <h3 className="fila-icono"><Newspaper size={20} style={{ color: 'var(--rojo)' }} aria-hidden="true" />{t('Boletín Minka')}</h3>
            {parte && (
              <div className="parte-zona">
                <b>{t('Resumen de tu zona, {h}:', { h: parte.hora })}</b> {parte.texto}
                <div className="fuente">
                  {parte.fuente === 'gemini' ? <><Sparkles aria-hidden="true" />{t('Resumido con IA a partir de los reportes vecinales')}</> : t('Resumen automático de los reportes vecinales')}
                </div>
              </div>
            )}
            {avisos.length === 0 && <div className="muted">{t('Sin avisos por ahora.')}</div>}
            {avisos.map((a) => <div key={a.id} className="aviso-item"><Megaphone aria-hidden="true" /><span>{a.texto}</span></div>)}
          </div>
        </div>

        <div>
          <div className="tarjeta minka-cerca">
            <h3>{t('Cerca de ti ({r} km)', { r: radioKm })}</h3>
            <div className="chips">
              <span className="chip rojo"><Siren aria-hidden="true" />{t('{n} necesidades abiertas', { n: necesidades.length })}</span>
              <span className="chip"><HeartHandshake aria-hidden="true" />{t('{n} recursos disponibles', { n: recursos.length })}</span>
            </div>
            {ubicacion && (
              <div className="mapa-mini">
                <MapContainer center={[ubicacion.lat, ubicacion.lng]} zoom={15} className="mapa" zoomControl={false}>
                  <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Centrar centro={ubicacion} />
                  <Ajustar />
                  <Marker position={[ubicacion.lat, ubicacion.lng]} icon={iconoYo}><Popup>{t('Tú ({nombre})', { nombre: usuario?.nombre })}</Popup></Marker>
                  {agruparPorCelda(necesidades, recursos).map((c) => (
                    <Marker key={c.k} position={[c.geo.lat, c.geo.lng]} icon={iconoCelda(c.nec.length, c.rec.length)}>
                      <Popup>
                        {c.nec.length > 0 && <b style={{ color: 'var(--rojo)' }}>{t('Necesitan ayuda')}</b>}
                        {c.nec.map((n) => <div key={n.id} className="fila-icono"><Icono tipo={n.tipo} size={16} />{etiqueta(n.tipo)}, {textoUrgencia(n.urgencia)}: {quien(n)}</div>)}
                        {c.rec.length > 0 && <b style={{ color: 'var(--verde)', display: 'block', marginTop: c.nec.length ? 6 : 0 }}>{t('Pueden ayudar')}</b>}
                        {c.rec.map((r) => <div key={r.id} className="fila-icono"><Icono tipo={r.tipo} size={16} />{etiqueta(r.tipo)}: {quien(r)}</div>)}
                        <span className="muted">{t('a {m}', { m: `${(c.distanciaKm * 1000).toFixed(0)} m` })}</span>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            )}
            {necesidades.length > 0 && (
              <div className="lista-necesidades">
                {necesidades.slice(0, 5).map((n) => (
                  <div key={n.id}><Icono tipo={n.tipo} /><span>{etiqueta(n.tipo)} ({textoUrgencia(n.urgencia)}) {t('a {m}', { m: `${(n.distanciaKm * 1000).toFixed(0)} m` })}, {quien(n)}</span></div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
