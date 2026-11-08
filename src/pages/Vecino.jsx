// Perfil publico de un vecino: verificacion, estrellas, puntos, fotos de sus publicaciones, lo que ofrece y pide,
// y recomendaciones de otros vecinos (con estrellas). Recomendar da +2 puntos Ayni al vecino, una sola vez por pareja
// (id fijo rec_{de}_{para}: volver a recomendar solo actualiza).
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, MessageCircle, Star, ChevronRight, ShieldCheck } from 'lucide-react'
import { useEstado } from '../lib/estado'
import { obtener, listar, crearSeguro } from '../lib/db'
import { PUNTOS, saldoPuntos } from '../lib/puntos'
import { ICONO_TIPO } from '../lib/iconos'
import { waLink, NOMBRE_TIPO, CLASE_TIPO, msFecha, haceCuanto } from '../lib/contacto'
import { Avatar, Estrellas, cargarResenas } from '../lib/social'

const nombre1 = (n) => (n || '').split(' ')[0]

export default function Vecino() {
  const { id } = useParams()
  const nav = useNavigate()
  const loc = useLocation()
  const { usuario, setAviso, t } = useEstado()
  const [u, setU] = useState(null)
  const [pubs, setPubs] = useState([])
  const [resenas, setResenas] = useState({ lista: [], n: 0, promedio: 0 })
  const [saldo, setSaldo] = useState(null)
  const [cargado, setCargado] = useState(false)
  const [estrellas, setEstrellas] = useState(0)
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const esYo = id === usuario?.id

  async function cargar() {
    const [usr, ps, rs, s] = await Promise.all([
      obtener('usuarios', id).catch(() => null),
      listar('publicaciones', { autorId: id }, 50),
      cargarResenas(id).catch(() => ({ lista: [], n: 0, promedio: 0 })),
      saldoPuntos(id).catch(() => null),
    ])
    setU(usr); setPubs(ps.filter((p) => p.estado !== 'retirada').sort((a, b) => msFecha(b.fecha) - msFecha(a.fecha))); setResenas(rs); setSaldo(s)
    const mia = rs.lista.find((r) => r.deId === usuario?.id)
    if (mia) { setEstrellas(mia.estrellas || 0); setTexto(mia.texto || '') }
    setCargado(true)
  }
  useEffect(() => { cargar().catch((e) => { console.warn('Vecino: no se pudo cargar', e); setCargado(true) }) }, [id]) // eslint-disable-line

  // Los vecinos de la semilla no tienen documento en `usuarios`: el nombre sale de sus publicaciones
  const nombre = u?.nombre || pubs[0]?.autorNombre || loc.state?.nombre || 'Vecino'
  const yaHabia = resenas.lista.some((r) => r.deId === usuario?.id)
  const fotos = pubs.filter((p) => p.fotoBase64)

  async function recomendar() {
    if (!estrellas) return setAviso(t('Elige de 1 a 5 estrellas.'))
    setEnviando(true)
    try {
      await crearSeguro('recomendaciones', {
        autorId: usuario.id, deId: usuario.id, deNombre: usuario.nombre, paraId: id, paraNombre: nombre, estrellas, texto: texto.trim(),
      }, `rec_${usuario.id}_${id}`)
      if (!yaHabia) {
        // +2 al recomendado, una sola vez por pareja (libro de puntos, ver lib/puntos.js)
        await crearSeguro('ayudas_intercambios', {
          tipo: 'RECOMENDACION', autorId: usuario.id, ayudaId: id, ayudaNombre: nombre, recibeId: usuario.id, recibeNombre: usuario.nombre,
          puntos: PUNTOS.RECOMENDACION, motivo: null,
        }, `recpts_${usuario.id}_${id}`)
      }
      setAviso(yaHabia ? t('Recomendación actualizada.') : t('Gracias. {nombre} recibió +{p} puntos Ayni por tu recomendación.', { nombre: nombre1(nombre), p: PUNTOS.RECOMENDACION }))
      await cargar()
    } catch (e) { console.error('Recomendar fallo', e); setAviso(t('No se pudo guardar. Intenta de nuevo.')) }
    finally { setEnviando(false) }
  }

  if (!cargado) return <div className="cargando" role="status"><p>{t('Cargando perfil…')}</p></div>

  return (
    <div className="pantalla detalle">
      <div className="cabecera">
        <button className="btn-atras" aria-label={t('Atrás')} onClick={() => nav(-1)}><ArrowLeft size={22} aria-hidden="true" /></button>
        <h2>{esYo ? t('Tu perfil público') : t('Perfil de vecino')}</h2>
      </div>

      <div className="tarjeta perfil-cab">
        <div className="fila">
          <Avatar nombre={nombre} usuarioId={id} size={72} />
          <div style={{ minWidth: 0 }}>
            <h2>{nombre}</h2>
            <div className="chips" style={{ marginTop: 6 }}>
              {u?.verificacion === 'reniec' && <span className="chip"><BadgeCheck aria-hidden="true" />{t('Validado en RENIEC')}</span>}
              {u?.verificado && <span className="chip teal"><ShieldCheck aria-hidden="true" />{t('Vecino verificado')}</span>}
              {!u && <span className="chip neutro">{t('Vecino de la demo')}</span>}
            </div>
            <div style={{ marginTop: 8 }}><Estrellas valor={resenas.promedio} n={resenas.n} t={t} /></div>
          </div>
        </div>
        <div className="stats">
          <div className="stat"><b>{pubs.length}</b><span>{t(pubs.length === 1 ? 'publicación' : 'publicaciones')}</span></div>
          <div className="stat"><b>{resenas.n}</b><span>{t(resenas.n === 1 ? 'recomendación' : 'recomendaciones')}</span></div>
          <div className="stat"><b>{saldo ?? '–'}</b><span>{t('puntos Ayni')}</span></div>
        </div>
        {u?.whatsappVisible && u?.telefono && !esYo && (
          <a className="btn whatsapp" href={waLink(u.telefono, t('Hola {nombre}, te vi en Ayni. ¿Podemos coordinar?', { nombre: nombre1(nombre) }))} target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" />WhatsApp</a>
        )}
      </div>

      {fotos.length > 0 && (
        <section className="tarjeta">
          <h3>{t('Fotos')}</h3>
          <div className="galeria">
            {fotos.map((p) => <img key={p.id} src={p.fotoBase64} alt={p.texto} onClick={() => nav(`/publicacion/${p.id}`, { state: { pub: p } })} />)}
          </div>
        </section>
      )}

      <h2 className="titulo-seccion">{t('Lo que ofrece y pide')}</h2>
      {pubs.length === 0 && <div className="muted">{t('Aún no tiene publicaciones.')}</div>}
      {pubs.length > 0 && (
        <div className="tarjeta lista">
          {pubs.map((p) => {
            const Icono = ICONO_TIPO[p.tipo] || ICONO_TIPO.OFREZCO
            return (
              <button key={p.id} className="opcion" onClick={() => nav(`/publicacion/${p.id}`, { state: { pub: p } })}>
                <span className={`ficha chica ${CLASE_TIPO[p.tipo] || ''}`}><Icono aria-hidden="true" /></span>
                <span className="opcion-texto">
                  <span className="opcion-titulo" style={{ fontSize: 'calc(17px * var(--escala))' }}>{p.texto}</span>
                  <span className="opcion-sub">{t(NOMBRE_TIPO[p.tipo] || p.tipo)}, {p.categoria}, {haceCuanto(p.fecha, t)}</span>
                </span>
                <ChevronRight className="opcion-flecha" aria-hidden="true" />
              </button>
            )
          })}
        </div>
      )}

      <h2 className="titulo-seccion">{t('Recomendaciones de vecinos')}</h2>
      {!esYo && (
        <div className="tarjeta">
          <h3>{yaHabia ? t('Tu recomendación') : t('¿Conoces a {nombre}? Recomiéndalo', { nombre: nombre1(nombre) })}</h3>
          <div className="selector-estrellas" role="radiogroup" aria-label={t('Estrellas')}>
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} type="button" role="radio" aria-checked={estrellas === i} aria-label={t(i === 1 ? '{n} estrella' : '{n} estrellas', { n: i })}
                className={i <= estrellas ? 'llena' : ''} onClick={() => setEstrellas(i)}><Star size={30} aria-hidden="true" /></button>
            ))}
          </div>
          <textarea rows={2} placeholder={t('Cuenta cómo te fue (opcional)')} value={texto} maxLength={300} onChange={(e) => setTexto(e.target.value)} style={{ marginTop: 8 }} />
          <button className="btn" style={{ marginTop: 10 }} disabled={enviando || !estrellas} onClick={recomendar}>{yaHabia ? t('Actualizar recomendación') : t('Recomendar')}</button>
          {!yaHabia && <p className="muted" style={{ marginTop: 8 }}>{t('Tu recomendación le da +{p} puntos Ayni, una sola vez.', { p: PUNTOS.RECOMENDACION })}</p>}
        </div>
      )}
      {resenas.n === 0 && <div className="muted">{t('Aún nadie lo recomendó.')}</div>}
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
    </div>
  )
}
