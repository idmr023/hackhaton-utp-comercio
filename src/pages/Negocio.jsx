// Pagina de un negocio del barrio: datos, estrellas y recomendaciones de vecinos (con texto), comentarios,
// WhatsApp y ver en el mapa. Recomendar un negocio da +2 puntos Ayni a quien recomienda, una sola vez por negocio.
import { createElement, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, LocateFixed, Clock3, Map, MessageCircle, MessageSquare, Send, Star, Pencil, Trash2, EyeOff } from 'lucide-react'
import { useEstado } from '../lib/estado'
import { obtener, listar, crearSeguro, actualizarSeguro } from '../lib/db'
import { distanciaKm } from '../lib/geo'
import { PUNTOS } from '../lib/puntos'
import { iconoRubro } from '../lib/iconos'
import { waLink, msjNegocio, msFecha, haceCuanto, metros } from '../lib/contacto'
import { Avatar, Estrellas, cargarResenas } from '../lib/social'
import { categoriaNegocio, nombreCategoria, NEGOCIO_ELIMINADO, resenaNegocio } from '../lib/negocios'

const IconoNegocio = ({ rubro }) => createElement(iconoRubro(rubro), { 'aria-hidden': 'true' })
const Atras = ({ t, onClick }) => <button className="btn-atras" aria-label={t('Atrás')} onClick={onClick}><ArrowLeft size={22} aria-hidden="true" /></button>

export default function Negocio() {
  const { id } = useParams()
  const nav = useNavigate()
  const loc = useLocation()
  const { usuario, ubicacion, setAviso, t } = useEstado()
  const [neg, setNeg] = useState(loc.state?.negocio || null)
  const [estado, setEstado] = useState(neg ? 'ok' : 'cargando')
  const [resenas, setResenas] = useState({ lista: [], n: 0, promedio: 0 })
  const [comentarios, setComentarios] = useState([])
  const [estrellas, setEstrellas] = useState(0)
  const [texto, setTexto] = useState('')
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function cargar() {
    const n = neg || await obtener('negocios_oficios', id)
    if (!n || n.estado === 'eliminado' || (n.estado === 'retirado' && n.autorId !== usuario?.id)) return setEstado('nohay')
    setNeg(n); setEstado('ok')
    const [rs, cs] = await Promise.all([cargarResenas(id).catch(() => ({ lista: [], n: 0, promedio: 0 })), listar('comentarios', { negocioId: id }, 200)])
    setResenas(rs)
    setComentarios(cs.sort((a, b) => msFecha(a.fecha) - msFecha(b.fecha)))
    const mia = rs.lista.find((r) => r.deId === usuario?.id)
    if (mia) { setEstrellas(mia.estrellas || 0); setTexto(mia.texto || '') }
  }
  useEffect(() => { cargar().catch((e) => { console.warn('Negocio: no se pudo cargar', e); if (!neg) setEstado('nohay') }) }, [id]) // eslint-disable-line

  const yaHabia = resenas.lista.some((r) => r.deId === usuario?.id)

  async function recomendar() {
    if (!estrellas) return setAviso(t('Elige de 1 a 5 estrellas.'))
    setEnviando(true)
    try {
      await crearSeguro('recomendaciones', {
        autorId: usuario.id, deId: usuario.id, deNombre: usuario.nombre, paraId: id, paraTipo: 'negocio', paraNombre: neg.nombre, estrellas, texto: texto.trim(),
      }, `rec_${usuario.id}_${id}`)
      if (!yaHabia) {
        // +2 a quien recomienda, una sola vez por negocio (libro de puntos: ayudaId = quien recibe los puntos)
        await crearSeguro('ayudas_intercambios', {
          tipo: 'RECOMENDACION_NEGOCIO', autorId: usuario.id, ayudaId: usuario.id, ayudaNombre: usuario.nombre, recibeId: id, recibeNombre: neg.nombre,
          puntos: PUNTOS.RECOMENDACION, motivo: null,
        }, `recneg_${usuario.id}_${id}`)
      }
      setAviso(yaHabia ? t('Recomendación actualizada.') : t('Gracias. Ganaste +{p} puntos Ayni por recomendar a {nombre}.', { p: PUNTOS.RECOMENDACION, nombre: neg.nombre }))
      await cargar()
    } catch (e) { console.error('Recomendar negocio fallo', e); setAviso(t('No se pudo guardar. Intenta de nuevo.')) }
    finally { setEnviando(false) }
  }

  async function comentar() {
    const tx = comentario.trim()
    if (!tx || enviando) return
    setEnviando(true)
    const docu = { negocioId: id, autorId: usuario.id, autorNombre: usuario.nombre, texto: tx }
    try {
      const { id: cid, sinSenal } = await crearSeguro('comentarios', docu)
      setComentarios((l) => [...l, { id: cid, ...docu, fecha: null }])
      setComentario('')
      setAviso(sinSenal ? t('Sin señal: tu comentario se guardó y se enviará solo.') : t('Comentario publicado'))
    } catch (e) { console.error('Comentar fallo', e); setAviso(t('No se pudo comentar. Intenta de nuevo.')) }
    finally { setEnviando(false) }
  }

  // El dueno puede quitar su negocio del mapa desde aqui (estado "retirado"; volver a guardarlo en Publicar lo reactiva)
  async function quitarNegocio() {
    if (!window.confirm(t('¿Quitar tu negocio del mapa? Podrás volver a ponerlo cuando quieras.'))) return
    setEnviando(true)
    try {
      await actualizarSeguro('negocios_oficios', id, { estado: 'retirado' })
      setNeg({ ...neg, estado: 'retirado' })
      setAviso(t('Negocio quitado del mapa.'))
    } catch (e) { console.error('Quitar negocio fallo', e); setAviso(t('No se pudo guardar. Intenta de nuevo.')) }
    finally { setEnviando(false) }
  }

  async function eliminarNegocio() {
    if (!window.confirm(t('¿Eliminar tu negocio por completo? Se borran sus datos y fotos y no volverá a aparecer. No se puede deshacer.'))) return
    setEnviando(true)
    try {
      await actualizarSeguro('negocios_oficios', id, NEGOCIO_ELIMINADO)
      setAviso(t('Negocio eliminado.'))
      nav('/ajustes', { replace: true })
    } catch (e) { console.error('Eliminar negocio fallo', e); setAviso(t('No se pudo guardar. Intenta de nuevo.')) }
    finally { setEnviando(false) }
  }

  if (estado === 'cargando') return <div className="cargando" role="status"><p>{t('Cargando negocio…')}</p></div>
  if (estado === 'nohay') return (
    <div className="pantalla detalle">
      <div className="cabecera"><Atras t={t} onClick={() => nav(-1)} /><h2>{t('Negocio')}</h2></div>
      <div className="tarjeta"><p>{t('Este negocio ya no está disponible.')}</p></div>
      <button className="btn secundario" onClick={() => nav('/vecinos')}>{t('Volver a Vecinos')}</button>
    </div>
  )

  const dist = neg.distanciaKm ?? (ubicacion && neg.geo ? distanciaKm(ubicacion, neg.geo) : null)
  // Estrellas: las de ejemplo de la semilla + las opiniones reales (la lista de abajo muestra solo las reales)
  const calif = resenaNegocio(neg, resenas)
  const total = calif?.n || 0
  const verMapa = () => nav('/', { state: { foco: { k: neg.id, lat: neg.geo.lat, lng: neg.geo.lng } } })

  return (
    <div className="pantalla detalle">
      <div className="cabecera">
        <Atras t={t} onClick={() => nav(-1)} />
        <h2>{t('Negocio del barrio')}</h2>
      </div>

      <div className="tarjeta perfil-cab">
        <div className="fila">
          <span className={`ficha grande${neg.logoBase64 ? ' logo' : ''}`}>{neg.logoBase64 ? <img src={neg.logoBase64} alt="" /> : <IconoNegocio rubro={neg.rubro} />}</span>
          <div style={{ minWidth: 0 }}>
            <h2>{neg.nombre}</h2>
            <div className="chips" style={{ marginTop: 6 }}>
              {neg.autorId === usuario?.id && <span className="chip teal">{t('Tu negocio')}</span>}
              {neg.estado === 'retirado' && <span className="chip pendiente">{t('Quitado del mapa')}</span>}
              <span className="chip neutro">{neg.rubro}</span>
              <span className="chip">{t(nombreCategoria(categoriaNegocio(neg.rubro, neg.nombre)))}</span>
            </div>
            <div style={{ marginTop: 8 }}><Estrellas valor={calif?.promedio || 0} n={total} vacio="Sin estrellas aún" t={t} /></div>
          </div>
        </div>
        {neg.fotoBase64 && <img className="detalle-foto" src={neg.fotoBase64} alt={t('Foto del negocio')} style={{ marginBottom: 0 }} />}
        {neg.descripcion && <p style={{ margin: 0 }}>{neg.descripcion}</p>}
        <div className="pop-recomendado" style={{ marginTop: 0 }}><Star size={18} aria-hidden="true" />{t('Recomendado por {n} vecinos de tu zona', { n: total })}</div>
        {neg.resumenIA && <p className="pop-resumen" style={{ margin: 0 }}>“{neg.resumenIA}”</p>}
        <div className="muted" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {dist != null && <span className="fila-icono"><LocateFixed size={16} aria-hidden="true" />{t('A {m} de ti', { m: metros(dist) })}</span>}
          {neg.horario && <span className="fila-icono"><Clock3 size={16} aria-hidden="true" />{t('Atiende {h}', { h: neg.horario })}</span>}
        </div>
        <div className="btn-fila">
          {neg.whatsapp && <a className="btn whatsapp" href={waLink(neg.whatsapp, msjNegocio(neg))} target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" />WhatsApp</a>}
          <button className="btn secundario" onClick={verMapa}><Map aria-hidden="true" />{t('Ver en el mapa')}</button>
        </div>
        {neg.autorId === usuario?.id && (
          <div className="acciones-match">
            <button className="btn chico secundario" onClick={() => nav('/publicar', { state: { tipo: 'NEGOCIO', negocioId: id } })}><Pencil size={18} aria-hidden="true" />{t('Editar mi negocio')}</button>
            {neg.estado !== 'retirado' && <button className="btn chico secundario" style={{ marginLeft: 8 }} disabled={enviando} onClick={quitarNegocio}><EyeOff size={18} aria-hidden="true" />{t('Quitar del mapa')}</button>}
            <button className="btn chico secundario" style={{ marginLeft: 8 }} disabled={enviando} onClick={eliminarNegocio}><Trash2 size={18} aria-hidden="true" />{t('Eliminar')}</button>
          </div>
        )}
      </div>

      <h2 className="titulo-seccion">{t('Opiniones de vecinos')}</h2>
      {neg.autorId !== usuario?.id && <div className="tarjeta">
        <h3>{yaHabia ? t('Tu recomendación') : t('¿Conoces este negocio? Recomiéndalo')}</h3>
        <div className="selector-estrellas" role="radiogroup" aria-label={t('Estrellas')}>
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} type="button" role="radio" aria-checked={estrellas === i} aria-label={t(i === 1 ? '{n} estrella' : '{n} estrellas', { n: i })}
              className={i <= estrellas ? 'llena' : ''} onClick={() => setEstrellas(i)}><Star size={30} aria-hidden="true" /></button>
          ))}
        </div>
        <textarea rows={2} placeholder={t('Cuenta cómo te fue (opcional)')} value={texto} maxLength={300} onChange={(e) => setTexto(e.target.value)} style={{ marginTop: 8 }} />
        <button className="btn" style={{ marginTop: 10 }} disabled={enviando || !estrellas} onClick={recomendar}>{yaHabia ? t('Actualizar recomendación') : t('Recomendar')}</button>
        {!yaHabia && <p className="muted" style={{ marginTop: 8 }}>{t('Recomendar te da +{p} puntos Ayni, una sola vez por negocio.', { p: PUNTOS.RECOMENDACION })}</p>}
      </div>}
      {resenas.n === 0 && <div className="muted">{t('Aún nadie opinó sobre este negocio.')}</div>}
      {resenas.n > 0 && (
        <div className="tarjeta lista">
          {resenas.lista.map((r) => (
            <div key={r.id} className="comentario" style={{ borderTop: 0 }}>
              <Avatar nombre={r.deNombre} usuarioId={r.deId} size={36} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="fila" style={{ gap: 8, flexWrap: 'wrap' }}>
                  <b>{r.deId === usuario?.id ? t('Tú') : r.deNombre}</b>
                  <Estrellas valor={r.estrellas || 0} n={1} size={14} texto={false} t={t} />
                  <span className="muted">{haceCuanto(r.fecha, t)}</span>
                </div>
                {r.texto && <p>{r.texto}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <section className="tarjeta" aria-labelledby="t-comentarios">
        <h3 id="t-comentarios" className="fila-icono"><MessageSquare size={20} style={{ color: 'var(--verde)' }} aria-hidden="true" />{t('Comentarios ({n})', { n: comentarios.length })}</h3>
        {comentarios.length === 0 && <p className="muted">{t('Nadie ha comentado todavía. Sé el primero.')}</p>}
        {comentarios.map((c) => (
          <div key={c.id} className="comentario">
            <Avatar nombre={c.autorNombre} usuarioId={c.autorId} size={36} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <b>{c.autorId === usuario?.id ? t('Tú') : c.autorNombre}</b> <span className="muted">{haceCuanto(c.fecha, t)}</span>
              <p>{c.texto}</p>
            </div>
          </div>
        ))}
        <div className="comentar">
          <input aria-label={t('Escribe un comentario')} placeholder={t('Escribe un comentario')} value={comentario} maxLength={300}
            onChange={(e) => setComentario(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && comentar()} />
          <button className="btn chico" disabled={!comentario.trim() || enviando} onClick={comentar}><Send size={18} aria-hidden="true" />{t('Comentar')}</button>
        </div>
      </section>
    </div>
  )
}
