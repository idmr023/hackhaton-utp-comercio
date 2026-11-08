// Detalle de una publicacion: quien la hizo (con sus estrellas), texto y foto grandes, WhatsApp, ver en el mapa
// y comentarios de los vecinos. Los comentarios se guardan con id fijo (sin senal quedan en cola y suben solos).
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronRight, LocateFixed, Map, MessageCircle, MessageSquare, Send, BadgeCheck } from 'lucide-react'
import { useEstado } from '../lib/estado'
import { obtener, listar, crearSeguro } from '../lib/db'
import { distanciaKm } from '../lib/geo'
import { ICONO_TIPO } from '../lib/iconos'
import { waLink, msjPublicacion, NOMBRE_TIPO, CLASE_TIPO, msFecha, haceCuanto, metros, claveCelda } from '../lib/contacto'
import { Avatar, Estrellas, cargarResenas } from '../lib/social'

const Atras = ({ t, onClick }) => <button className="btn-atras" aria-label={t('Atrás')} onClick={onClick}><ArrowLeft size={22} aria-hidden="true" /></button>

export default function Publicacion() {
  const { id } = useParams()
  const nav = useNavigate()
  const loc = useLocation()
  const { usuario, ubicacion, setAviso, t } = useEstado()
  const [pub, setPub] = useState(loc.state?.pub || null)
  const [estado, setEstado] = useState(pub ? 'ok' : 'cargando') // 'cargando' | 'ok' | 'nohay'
  const [autor, setAutor] = useState(null)
  const [resenas, setResenas] = useState(null)
  const [comentarios, setComentarios] = useState([])
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    let vivo = true
    ;(async () => {
      try {
        const p = loc.state?.pub || await obtener('publicaciones', id)
        if (!vivo) return
        if (!p) return setEstado('nohay')
        setPub(p); setEstado('ok')
        const [c, u, r] = await Promise.all([
          listar('comentarios', { publicacionId: id }, 200),
          obtener('usuarios', p.autorId).catch(() => null),
          cargarResenas(p.autorId).catch(() => null),
        ])
        if (!vivo) return
        setComentarios(c.sort((a, b) => msFecha(a.fecha) - msFecha(b.fecha)))
        setAutor(u); setResenas(r)
      } catch (e) { console.warn('Publicacion: no se pudo cargar', e); if (vivo && !pub) setEstado('nohay') }
    })()
    return () => { vivo = false }
  }, [id]) // eslint-disable-line

  async function comentar() {
    const tx = texto.trim()
    if (!tx || enviando) return
    setEnviando(true)
    const docu = { publicacionId: id, autorId: usuario.id, autorNombre: usuario.nombre, texto: tx }
    try {
      const { id: cid, sinSenal } = await crearSeguro('comentarios', docu)
      setComentarios((l) => [...l, { id: cid, ...docu, fecha: null }])
      setTexto('')
      setAviso(sinSenal ? t('Sin señal: tu comentario se guardó y se enviará solo.') : t('Comentario publicado'))
    } catch (e) { console.error('Comentar fallo', e); setAviso(t('No se pudo comentar. Intenta de nuevo.')) }
    finally { setEnviando(false) }
  }

  if (estado === 'cargando') return <div className="cargando" role="status"><p>{t('Cargando publicación…')}</p></div>
  if (estado === 'nohay') return (
    <div className="pantalla detalle">
      <div className="cabecera"><Atras t={t} onClick={() => nav(-1)} /><h2>{t('Publicación')}</h2></div>
      <div className="tarjeta"><p>{t('Esta publicación ya no está disponible.')}</p></div>
      <button className="btn secundario" onClick={() => nav('/vecinos')}>{t('Volver a Vecinos')}</button>
    </div>
  )

  const Icono = ICONO_TIPO[pub.tipo] || ICONO_TIPO.OFREZCO
  const mia = pub.autorId === usuario?.id
  const dist = pub.distanciaKm ?? (ubicacion && pub.geo ? distanciaKm(ubicacion, pub.geo) : null)
  const verMapa = () => nav('/', { state: { foco: { k: claveCelda(pub.geo), lat: pub.geo.lat, lng: pub.geo.lng } } })

  return (
    <div className="pantalla detalle">
      <div className="cabecera">
        <Atras t={t} onClick={() => nav(-1)} />
        <span className={`ficha chica ${CLASE_TIPO[pub.tipo] || ''}`}><Icono aria-hidden="true" /></span>
        <h2>{t(NOMBRE_TIPO[pub.tipo] || pub.tipo)}</h2>
      </div>

      <article className="tarjeta">
        <Link to={`/vecino/${pub.autorId}`} state={{ nombre: pub.autorNombre }} className="autor">
          <Avatar nombre={pub.autorNombre} size={48} />
          <div style={{ minWidth: 0 }}>
            <b>{mia ? t('{nombre} (tú)', { nombre: pub.autorNombre }) : pub.autorNombre}</b>
            {autor?.verificacion === 'reniec' && <span className="chip" style={{ marginLeft: 8 }}><BadgeCheck aria-hidden="true" />RENIEC</span>}
            <div className="muted">{haceCuanto(pub.fecha, t)}{dist != null && `, ${t('a {m} de ti', { m: metros(dist) })}`}</div>
            {resenas && <Estrellas valor={resenas.promedio} n={resenas.n} size={15} t={t} />}
          </div>
          <ChevronRight className="opcion-flecha" aria-hidden="true" />
        </Link>
        <div className="chips"><span className={`chip ${CLASE_TIPO[pub.tipo] || ''}`}>{t(NOMBRE_TIPO[pub.tipo] || pub.tipo)}</span><span className="chip neutro">{pub.categoria}</span></div>
        <p className="detalle-texto">{pub.texto}</p>
        {pub.fotoBase64 && <img className="detalle-foto" src={pub.fotoBase64} alt={t('Foto de la publicación')} />}
        <div className="btn-fila">
          {pub.autorWhatsapp && !mia && <a className="btn whatsapp" href={waLink(pub.autorWhatsapp, msjPublicacion(pub))} target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" />WhatsApp</a>}
          <button className="btn secundario" onClick={verMapa}><Map aria-hidden="true" />{t('Ver en el mapa')}</button>
        </div>
      </article>

      <section className="tarjeta" aria-labelledby="t-comentarios">
        <h3 id="t-comentarios" className="fila-icono"><MessageSquare size={20} style={{ color: 'var(--verde)' }} aria-hidden="true" />{t('Comentarios ({n})', { n: comentarios.length })}</h3>
        {comentarios.length === 0 && <p className="muted">{t('Nadie ha comentado todavía. Sé el primero.')}</p>}
        {comentarios.map((c) => (
          <div key={c.id} className="comentario">
            <Avatar nombre={c.autorNombre} size={36} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <b>{c.autorId === usuario?.id ? t('Tú') : c.autorNombre}</b> <span className="muted">{haceCuanto(c.fecha, t)}</span>
              <p>{c.texto}</p>
            </div>
          </div>
        ))}
        <div className="comentar">
          <input aria-label={t('Escribe un comentario')} placeholder={t('Escribe un comentario')} value={texto} maxLength={300}
            onChange={(e) => setTexto(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && comentar()} />
          <button className="btn chico" disabled={!texto.trim() || enviando} onClick={comentar}><Send size={18} aria-hidden="true" />{t('Comentar')}</button>
        </div>
      </section>
    </div>
  )
}
