// Publicar en 3 toques: (1) boton Publicar ya se toco  (2) elegir tipo  (3) texto/foto/voz + Publicar
// Cuarta opcion "Mi negocio": registra (o edita) el negocio u oficio del vecino en el mapa. Un negocio por cuenta,
// con id fijo neg_{usuarioId}: volver a guardar lo actualiza (permitido porque autorId no cambia).
import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Mic, Camera, MapPin, WifiOff, Store, Trash2, EyeOff, LocateFixed, Plus } from 'lucide-react'
import { useEstado } from '../lib/estado'
import { crear, conGeo, conTiempo, nuevoId, listar, crearSeguro, actualizarSeguro } from '../lib/db'
import { encolar } from '../lib/offlineQueue'
import { clasificar } from '../lib/ia'
import { ICONO_TIPO, svg } from '../lib/iconos'
import { comprimirFoto, recortarCuadrado } from '../lib/foto'
import { NEGOCIO_ELIMINADO } from '../lib/negocios'

const TIPOS = [
  { id: 'OFREZCO', titulo: 'Ofrezco', sub: 'un servicio o producto', color: '', ejemplo: 'Ej: Arreglo lavadoras a domicilio, S/ 30 la visita' },
  { id: 'NECESITO', titulo: 'Necesito', sub: 'ayuda o algo del barrio', color: 'terracota', ejemplo: 'Ej: Necesito gasfitero para una fuga hoy' },
  { id: 'RECOMIENDO', titulo: 'Recomiendo', sub: 'un negocio u oficio', color: 'maiz', ejemplo: 'Ej: La bodega de Doña Rosa fía y abre temprano' },
]
export const RUBROS = [
  'Abarrotes / Bodega', 'Panadería / Pastelería', 'Restaurante / Menú', 'Pollería', 'Frutas y Verduras', 'Salud / Farmacia', 'Veterinaria / Mascotas',
  'Ferretería', 'Gasfitería / Electricidad', 'Técnico / Reparaciones', 'Costura / Enmiendas', 'Lavandería', 'Mecánica / Llantas', 'Reparación de Calzado',
  'Peluquería / Barbería', 'Bazar / Regalos', 'Otro',
]
// Negocios: varios por cuenta. Se buscan por `autorId`; los nuevos llevan `nuevoId()` (los primeros tenian id fijo `neg_{usuarioId}` y siguen valiendo).
const NEGOCIO_VACIO = (telefono) => ({ nombre: '', rubro: RUBROS[0], rubroOtro: '', horario: '', whatsapp: telefono || '', descripcion: '' })

// Pin del negocio en el formulario: se arrastra, o se toca el mapa, hasta el punto exacto del local
const ICONO_LOCAL = L.divIcon({ html: `<div class="pin pin-negocio">${svg(Store, { size: 18 })}</div>`, className: '', iconSize: [34, 34], iconAnchor: [17, 17] })
function PinLocal({ pos, setPos }) {
  useMapEvents({ click: (e) => setPos({ lat: e.latlng.lat, lng: e.latlng.lng }) })
  return <Marker position={[pos.lat, pos.lng]} icon={ICONO_LOCAL} draggable eventHandlers={{ dragend: (e) => { const p = e.target.getLatLng(); setPos({ lat: p.lat, lng: p.lng }) } }} />
}
function CentrarEn({ pos }) {
  const map = useMap()
  useEffect(() => { map.setView([pos.lat, pos.lng], Math.max(map.getZoom(), 17)) }, [pos.lat, pos.lng]) // eslint-disable-line
  return null
}

const Atras = ({ t, onClick }) => <button className="btn-atras" aria-label={t('Atrás')} onClick={onClick}><ArrowLeft size={22} aria-hidden="true" /></button>

// Los 3 toques como barra de progreso (el toque 1 fue el boton Publicar del mapa)
const Pasos = ({ actual, t }) => (
  <div className="pasos" aria-label={t('Paso {n} de 3', { n: actual })}>
    {[1, 2, 3].map((n) => <i key={n} className={n < actual ? 'hecho' : n === actual ? 'actual' : ''} />)}
  </div>
)

export default function Publicar() {
  const { usuario, geoAprox, ubicacion, online, setAviso, t } = useEstado()
  const loc = useLocation()
  const [tipo, setTipo] = useState(loc.state?.tipo || new URLSearchParams(loc.search).get('tipo') || null) // 'OFREZCO' | 'NECESITO' | 'RECOMIENDO' | 'NEGOCIO'
  const [texto, setTexto] = useState('')
  const [foto, setFoto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [grabando, setGrabando] = useState(false)
  // Mi negocio
  const [misNegocios, setMisNegocios] = useState([]) // los que ya registre (sin los eliminados)
  const [editando, setEditando] = useState(undefined) // undefined = todavia no elegi, null = negocio nuevo, objeto = el que estoy editando
  const [logo, setLogo] = useState('') // logo cuadrado del negocio (reemplaza al icono del rubro)
  const [fotoLocal, setFotoLocal] = useState('') // foto del local; aparte de `foto` para que no aparezca al publicar Ofrezco/Necesito/Recomiendo
  const [pos, setPos] = useState(null) // ubicacion EXACTA del local (los negocios son lugares publicos): la del negocio guardado o la actual
  const [centrar, setCentrar] = useState(0)
  const [neg, setNeg] = useState(NEGOCIO_VACIO(usuario?.telefono))
  const nav = useNavigate()
  const rec = useRef(null)

  // Precarga el formulario con uno de mis negocios para editarlo (si esta retirado, el boton vuelve a decir "Poner mi negocio en el mapa")
  function abrirNegocio(n) {
    setEditando(n)
    const conocido = RUBROS.includes(n.rubro)
    setNeg({ nombre: n.nombre || '', rubro: conocido ? n.rubro : 'Otro', rubroOtro: conocido ? '' : (n.rubro || ''), horario: n.horario || '', whatsapp: n.whatsapp || usuario.telefono || '', descripcion: n.descripcion || '' })
    setFotoLocal(n.fotoBase64 || ''); setLogo(n.logoBase64 || '')
    if (n.geo) setPos({ lat: n.geo.lat, lng: n.geo.lng })
  }
  // Formulario vacio para registrar otro negocio
  function nuevoNegocio() {
    setEditando(null); setNeg(NEGOCIO_VACIO(usuario?.telefono)); setFotoLocal(''); setLogo('')
    setPos(ubicacion ? { lat: ubicacion.lat, lng: ubicacion.lng } : null); setCentrar((c) => c + 1)
  }
  useEffect(() => {
    listar('negocios_oficios', { autorId: usuario.id }).then((l) => {
      const mios = l.filter((n) => n.estado !== 'eliminado') // los eliminados no existen para el usuario
      setMisNegocios(mios)
      const pedido = loc.state?.negocioId
      if (pedido === 'nuevo') nuevoNegocio()
      else if (pedido && mios.find((n) => n.id === pedido)) abrirNegocio(mios.find((n) => n.id === pedido))
      else if (mios.length === 0) setEditando(null) // sin negocios: directo al formulario vacio
    }).catch(() => setEditando(null))
  }, [usuario.id]) // eslint-disable-line
  useEffect(() => { if (!pos && ubicacion) setPos({ lat: ubicacion.lat, lng: ubicacion.lng }) }, [ubicacion, pos])

  // Nota de voz -> texto con el reconocimiento del navegador. Lo tienen Chrome (Android y PC) y Edge; Opera, Brave y Firefox
  // exponen la API pero no tienen el servicio detras y devuelven error "network": por eso se avisa en vez de quedarse "Escuchando".
  function dictar() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return setAviso(t('Tu navegador no tiene dictado por voz; escribe el texto'))
    const r = new SR(); r.lang = 'es-PE'; r.interimResults = false; r.maxAlternatives = 1
    r.onresult = (e) => setTexto((tx) => (tx + ' ' + e.results[0][0].transcript).trim())
    r.onerror = (e) => {
      const msj = e.error === 'not-allowed' || e.error === 'service-not-allowed' ? 'Permite el micrófono en el navegador para dictar'
        : e.error === 'no-speech' ? 'No se escuchó nada; intenta otra vez cerca del micrófono'
          : e.error === 'audio-capture' ? 'No se encontró micrófono'
            : 'El dictado no funciona en este navegador; en PC usa Chrome o Edge, o escribe el texto'
      setAviso(t(msj)); setGrabando(false)
    }
    r.onend = () => setGrabando(false)
    rec.current = r; setGrabando(true)
    try { r.start() } catch { setGrabando(false); setAviso(t('El dictado no funciona en este navegador; en PC usa Chrome o Edge, o escribe el texto')) }
    setTimeout(() => { try { r.stop() } catch { /* ya termino */ } }, 15000) // por si el navegador nunca dispara onend
  }

  async function publicar() {
    if (!tipo || !texto.trim() || !geoAprox) return
    setEnviando(true)
    const { categoria, fuente } = await clasificar(texto)
    const docu = conGeo({
      tipo, texto: texto.trim(), categoria, categoriaFuente: fuente, fotoBase64: foto || null,
      autorId: usuario.id, autorNombre: usuario.nombre, estado: online ? 'activa' : 'enCola',
      autorWhatsapp: usuario.whatsappVisible ? usuario.telefono : null, // solo si acepto mostrarlo
    }, geoAprox)
    const id = nuevoId('publicaciones') // mismo id en cualquier reintento: nunca se duplica
    try {
      if (online) {
        try { await conTiempo(crear('publicaciones', docu, id), 6000); setAviso(t('Publicado en tu barrio')) }
        catch (e) {
          if (e.message !== 'timeout') throw e
          // Senal debil: Firestore ya la tiene en su cola local y la sube sola (no encolar = no duplicar)
          setAviso(t('Señal débil: guardado, se subirá solo'))
        }
      } else { await encolar('publicaciones', docu, id); setAviso(t('Sin internet: guardado, se subirá solo')) }
      nav('/')
    } catch (e) {
      await encolar('publicaciones', docu, id); setAviso(t('Guardado en cola, se subirá luego'))
      nav('/')
    } finally { setEnviando(false) }
  }

  const rubroFinal = neg.rubro === 'Otro' ? neg.rubroOtro.trim() : neg.rubro
  const negocioValido = neg.nombre.trim().length >= 3 && rubroFinal.length >= 3 && (!neg.whatsapp || /^9\d{8}$/.test(neg.whatsapp))

  const activo = !!editando && editando.estado !== 'retirado' // el negocio que edito esta visible en el mapa
  // QUITAR mi negocio del mapa: no se borra, pasa a estado "retirado"; volver a guardar lo reactiva con los mismos datos
  async function quitarNegocio() {
    if (!window.confirm(t('¿Quitar tu negocio del mapa? Podrás volver a ponerlo cuando quieras.'))) return
    setEnviando(true)
    try {
      await actualizarSeguro('negocios_oficios', editando.id, { estado: 'retirado' })
      setAviso(t('Negocio quitado del mapa.'))
      nav('/ajustes', { replace: true })
    } catch (e) { console.error('Quitar negocio fallo', e); setAviso(t('No se pudo guardar. Intenta de nuevo.')) }
    finally { setEnviando(false) }
  }
  // ELIMINAR mi negocio: queda en estado "eliminado" y sin datos (ver NEGOCIO_ELIMINADO); no se puede deshacer
  async function eliminarNegocio() {
    if (!window.confirm(t('¿Eliminar tu negocio por completo? Se borran sus datos y fotos y no volverá a aparecer. No se puede deshacer.'))) return
    setEnviando(true)
    try {
      await actualizarSeguro('negocios_oficios', editando.id, NEGOCIO_ELIMINADO)
      setAviso(t('Negocio eliminado.'))
      nav('/ajustes', { replace: true })
    } catch (e) { console.error('Eliminar negocio fallo', e); setAviso(t('No se pudo guardar. Intenta de nuevo.')) }
    finally { setEnviando(false) }
  }
  // MI NEGOCIO: crea otro negocio (id nuevo) o actualiza el que edito (conserva su id)
  async function guardarNegocio() {
    if (!negocioValido || !pos) return
    setEnviando(true)
    try {
      const docu = conGeo({
        nombre: neg.nombre.trim(), rubro: rubroFinal, horario: neg.horario.trim() || null, whatsapp: neg.whatsapp || null,
        descripcion: neg.descripcion.trim() || null, fotoBase64: fotoLocal || null, logoBase64: logo || null,
        autorId: usuario.id, autorNombre: usuario.nombre, nRecomendaciones: editando?.nRecomendaciones || 0, resumenIA: editando?.resumenIA || null, estado: 'activo',
      }, { lat: pos.lat, lng: pos.lng })
      const id = editando?.id || nuevoId('negocios_oficios')
      const { sinSenal } = await crearSeguro('negocios_oficios', docu, id)
      setAviso(sinSenal ? t('Sin señal: tu negocio se guardó y se subirá solo.') : activo ? t('Negocio actualizado.') : t('Tu negocio ya está en el mapa del barrio.'))
      nav(`/negocio/${id}`, { replace: true })
    } catch (e) { console.error('Guardar negocio fallo', e); setAviso(t('No se pudo guardar. Intenta de nuevo.')) }
    finally { setEnviando(false) }
  }

  // TOQUE 2: elegir tipo
  if (!tipo) return (
    <div className="pantalla">
      <Pasos actual={2} t={t} />
      <h2>{t('¿Qué quieres publicar?')}</h2>
      <p className="muted">{t('Tus vecinos de hasta 1 km lo verán en el mapa.')}</p>
      <div className="tarjeta lista">
        {TIPOS.map((x) => {
          const Icono = ICONO_TIPO[x.id]
          return (
            <button key={x.id} className="opcion" onClick={() => setTipo(x.id)}>
              <span className={`ficha ${x.color}`}><Icono aria-hidden="true" /></span>
              <span className="opcion-texto"><span className="opcion-titulo">{t(x.titulo)}</span><span className="opcion-sub">{t(x.sub)}</span></span>
              <ChevronRight className="opcion-flecha" aria-hidden="true" />
            </button>
          )
        })}
        <button className="opcion" onClick={() => setTipo('NEGOCIO')}>
          <span className="ficha teal"><Store aria-hidden="true" /></span>
          <span className="opcion-texto">
            <span className="opcion-titulo">{t('Mi negocio')}</span>
            <span className="opcion-sub">{misNegocios.length ? t('editar o registrar otro') : t('pon tu negocio u oficio en el mapa')}</span>
          </span>
          <ChevronRight className="opcion-flecha" aria-hidden="true" />
        </button>
      </div>
      <button className="btn secundario" onClick={() => nav(-1)}>{t('Cancelar')}</button>
    </div>
  )

  // TOQUE 3 (negocio): si ya tengo negocios, elijo cual editar o registro otro
  if (tipo === 'NEGOCIO' && editando === undefined) return misNegocios.length === 0
    ? <div className="cargando" role="status"><p>{t('Cargando negocio…')}</p></div>
    : (
      <div className="pantalla">
        <Pasos actual={3} t={t} />
        <div className="cabecera">
          <Atras t={t} onClick={loc.state?.tipo ? () => nav(-1) : () => setTipo(null)} />
          <span className="ficha teal"><Store aria-hidden="true" /></span>
          <div><h2>{t('Mis negocios')}</h2><div className="muted">{t('Toca uno para editarlo o registra otro')}</div></div>
        </div>
        <div className="tarjeta lista">
          {misNegocios.map((n) => (
            <button key={n.id} className="opcion" onClick={() => abrirNegocio(n)}>
              <span className={`ficha teal${n.logoBase64 ? ' logo' : ''}`}>{n.logoBase64 ? <img src={n.logoBase64} alt="" /> : <Store aria-hidden="true" />}</span>
              <span className="opcion-texto"><span className="opcion-titulo">{n.nombre}</span><span className="opcion-sub">{n.rubro}{n.estado === 'retirado' ? ' · ' + t('Quitado del mapa') : ''}</span></span>
              <ChevronRight className="opcion-flecha" aria-hidden="true" />
            </button>
          ))}
        </div>
        <button className="btn" onClick={nuevoNegocio}><Plus aria-hidden="true" />{t('Registrar otro negocio')}</button>
      </div>
    )

  // TOQUE 3 (negocio): formulario de un negocio (nuevo o el que edito)
  if (tipo === 'NEGOCIO') return (
    <div className="pantalla">
      <Pasos actual={3} t={t} />
      <div className="cabecera">
        <Atras t={t} onClick={() => (loc.state?.negocioId ? nav(-1) : misNegocios.length ? setEditando(undefined) : loc.state?.tipo ? nav(-1) : setTipo(null))} />
        <span className="ficha teal"><Store aria-hidden="true" /></span>
        <div><h2>{editando ? t('Editar negocio') : t('Nuevo negocio')}</h2><div className="muted">{activo ? t('Edita los datos y guarda') : t('Aparecerá en el mapa y en Negocios')}</div></div>
      </div>
      <div className="campo">
        <label htmlFor="neg-nombre">{t('Nombre del negocio u oficio')}</label>
        <input id="neg-nombre" placeholder={t('Ej: Bodega Don Lucho')} value={neg.nombre} onChange={(e) => setNeg({ ...neg, nombre: e.target.value })} />
      </div>
      <div className="campo">
        <label htmlFor="neg-rubro">{t('Rubro')}</label>
        <select id="neg-rubro" value={neg.rubro} onChange={(e) => setNeg({ ...neg, rubro: e.target.value })}>
          {RUBROS.map((r) => <option key={r} value={r}>{r === 'Otro' ? t('Otro') : r}</option>)}
        </select>
      </div>
      {neg.rubro === 'Otro' && (
        <div className="campo">
          <label htmlFor="neg-rubro-otro">{t('¿Cuál?')}</label>
          <input id="neg-rubro-otro" placeholder={t('Ej: Cerrajería')} value={neg.rubroOtro} onChange={(e) => setNeg({ ...neg, rubroOtro: e.target.value })} />
        </div>
      )}
      <div className="campo">
        <label htmlFor="neg-horario">{t('Horario')}</label>
        <input id="neg-horario" placeholder={t('Ej: 8am-8pm, lunes a sábado')} value={neg.horario} onChange={(e) => setNeg({ ...neg, horario: e.target.value })} />
      </div>
      <div className="campo">
        <label htmlFor="neg-wa">{t('WhatsApp del negocio')}</label>
        <input id="neg-wa" inputMode="numeric" maxLength={9} placeholder={t('9 dígitos')} value={neg.whatsapp} onChange={(e) => setNeg({ ...neg, whatsapp: e.target.value.replace(/\D/g, '') })} />
      </div>
      <div className="campo">
        <label htmlFor="neg-desc">{t('¿Qué ofreces? (corto)')}</label>
        <textarea id="neg-desc" rows={2} maxLength={160} placeholder={t('Ej: Pan fresco desde las 6am, también tortas por encargo')} value={neg.descripcion} onChange={(e) => setNeg({ ...neg, descripcion: e.target.value })} />
      </div>
      <div className="fila" style={{ alignItems: 'center' }}>
        <span className={`ficha grande teal${logo ? ' logo' : ''}`}>{logo ? <img src={logo} alt="" /> : <Store aria-hidden="true" />}</span>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="btn-fila" style={{ flexWrap: 'wrap' }}>
            <label className="btn chico secundario" style={{ flex: 'none' }}><Camera size={18} aria-hidden="true" />{logo ? t('Cambiar logo') : t('Logo del negocio')}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => e.target.files[0] && setLogo(await recortarCuadrado(e.target.files[0]))} />
            </label>
            {logo && <button type="button" className="btn chico secundario" style={{ flex: 'none' }} onClick={() => setLogo('')}><Trash2 size={18} aria-hidden="true" />{t('Quitar logo')}</button>}
          </div>
          <span className="muted">{t('Cuadrado. Se ve en el mapa y en la lista en vez del ícono del rubro.')}</span>
        </div>
      </div>
      <label className="btn secundario"><Camera aria-hidden="true" />{fotoLocal ? t('Cambiar foto del local') : t('Foto del local')}
        <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
          onChange={async (e) => e.target.files[0] && setFotoLocal(await comprimirFoto(e.target.files[0]))} />
      </label>
      {fotoLocal && <img src={fotoLocal} alt={t('Foto del local')} className="foto-previa" />}
      {fotoLocal && <button type="button" className="btn chico secundario" style={{ width: 'fit-content' }} onClick={() => setFotoLocal('')}><Trash2 size={18} aria-hidden="true" />{t('Quitar foto del local')}</button>}
      <div className="campo">
        <label>{t('Ubicación del local')}</label>
        <span className="muted">{t('Arrastra el pin o toca el mapa hasta el punto exacto. Los negocios se muestran con su ubicación real.')}</span>
        {pos && (
          <div className="mapa-mini mapa-form">
            <MapContainer center={[pos.lat, pos.lng]} zoom={17} className="mapa" zoomControl={false}>
              <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <PinLocal pos={pos} setPos={setPos} />
              {centrar > 0 && <CentrarEn key={centrar} pos={pos} />}
            </MapContainer>
          </div>
        )}
        {ubicacion && <button type="button" className="btn chico secundario" style={{ width: 'fit-content' }} onClick={() => { setPos({ lat: ubicacion.lat, lng: ubicacion.lng }); setCentrar((c) => c + 1) }}><LocateFixed size={18} aria-hidden="true" />{t('Usar mi ubicación actual')}</button>}
      </div>
      <button className="btn" disabled={!negocioValido || !pos || enviando} onClick={guardarNegocio}>{enviando ? t('Guardando…') : activo ? t('Guardar cambios') : t('Poner mi negocio en el mapa')}</button>
      {activo && <button type="button" className="btn peligro" disabled={enviando} onClick={quitarNegocio}><EyeOff aria-hidden="true" />{t('Quitar mi negocio del mapa')}</button>}
      {editando && <button type="button" className="btn peligro" disabled={enviando} onClick={eliminarNegocio}><Trash2 aria-hidden="true" />{t('Eliminar mi negocio')}</button>}
      {editando && <p className="nota"><span>{t('Quitar del mapa lo oculta y guarda tus datos para volver a ponerlo. Eliminar lo borra para siempre.')}</span></p>}
    </div>
  )

  // TOQUE 3: contenido + Publicar
  const x = TIPOS.find((y) => y.id === tipo)
  const Icono = ICONO_TIPO[tipo]
  return (
    <div className="pantalla">
      <Pasos actual={3} t={t} />
      <div className="cabecera">
        <Atras t={t} onClick={() => setTipo(null)} />
        <span className={`ficha ${x.color}`}><Icono aria-hidden="true" /></span>
        <div><h2>{t(x.titulo)}</h2><div className="muted">{t(x.sub)}</div></div>
      </div>
      <div className="campo">
        <label htmlFor="texto-pub">{t('¿Qué quieres decir?')}</label>
        <textarea id="texto-pub" rows={4} placeholder={t(x.ejemplo)} value={texto} onChange={(e) => setTexto(e.target.value)} autoFocus />
      </div>
      <div className="btn-fila">
        <button className="btn secundario" onClick={dictar} disabled={grabando}><Mic aria-hidden="true" />{grabando ? t('Escuchando…') : t('Hablar')}</button>
        <label className="btn secundario"><Camera aria-hidden="true" />{t('Foto')}
          <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
            onChange={async (e) => e.target.files[0] && setFoto(await comprimirFoto(e.target.files[0]))} />
        </label>
      </div>
      {foto && <img src={foto} alt={t('Foto que acompaña tu publicación')} className="foto-previa" />}
      <p className="nota">
        {online ? <MapPin aria-hidden="true" /> : <WifiOff aria-hidden="true" />}
        <span>{t('Se publica con tu ubicación aproximada.')}{!online && t(' Estás sin internet: se guardará y subirá solo.')}</span>
      </p>
      <button className="btn" disabled={!texto.trim() || enviando} onClick={publicar}>{enviando ? t('Publicando…') : t('Publicar')}</button>
    </div>
  )
}
