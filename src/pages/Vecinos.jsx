// Vecinos: lista de lo que publican los vecinos cerca (y los negocios recomendados), de lo mas reciente a lo mas viejo,
// con filtro por tipo, foto, autor, distancia y WhatsApp. Tocar una publicacion abre su detalle (comentarios, perfil);
// el boton "Mapa" la centra en el mapa. Los negocios se abren en el mapa.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, MessageCircle, Star, Megaphone, LocateFixed, Clock3, Map, MessageSquare } from 'lucide-react'
import { useEstado } from '../lib/estado'
import { iconoRubro, ICONO_TIPO } from '../lib/iconos'
import { waLink, msjPublicacion, msjNegocio, NOMBRE_TIPO, CLASE_TIPO, msFecha, haceCuanto, metros, textoRadio, claveCelda } from '../lib/contacto'
import { Avatar } from '../lib/social'

const FILTROS = [['todo', 'Todo'], ['OFREZCO', 'Ofrezco'], ['NECESITO', 'Necesito'], ['RECOMIENDO', 'Recomiendo'], ['negocios', 'Negocios']]
const parar = (e) => e.stopPropagation()

const BotonWa = ({ num, msj }) => (
  <a className="btn chico whatsapp" href={waLink(num, msj)} target="_blank" rel="noreferrer" onClick={parar}>
    <MessageCircle size={18} aria-hidden="true" />WhatsApp
  </a>
)

export default function Vecinos({ pubs, negocios, cargado, onElegir }) {
  const { usuario, radioKm, t } = useEstado()
  const [filtro, setFiltro] = useState('todo')
  const nav = useNavigate()

  const lista = filtro === 'negocios' ? [] : [...pubs].filter((p) => filtro === 'todo' || p.tipo === filtro).sort((a, b) => msFecha(b.fecha) - msFecha(a.fecha))
  const tiendas = filtro === 'negocios' ? [...negocios].sort((a, b) => (b.nRecomendaciones || 0) - (a.nRecomendaciones || 0)) : []
  const total = filtro === 'negocios' ? tiendas.length : lista.length
  const abrir = (p) => nav(`/publicacion/${p.id}`, { state: { pub: p } })
  const conteo = filtro === 'negocios' ? t('{n} negocios', { n: total }) : t(total === 1 ? '{n} publicación' : '{n} publicaciones', { n: total })

  return (
    <div className="vecinos">
      <div className="vecinos-cabecera">
        <div className="fila" style={{ justifyContent: 'space-between' }}>
          <div>
            <h2>{t('Vecinos cerca de ti')}</h2>
            <div className="muted">{t('A {r} de tu casa', { r: textoRadio(radioKm) })}{cargado && `, ${conteo}`}</div>
          </div>
          <button className="btn chico" onClick={() => nav('/publicar')}><Plus size={20} aria-hidden="true" />{t('Publicar')}</button>
        </div>
        <div className="filtros" role="group" aria-label={t('Filtrar')}>
          {FILTROS.map(([id, txt]) => (
            <button key={id} className={filtro === id ? 'activo' : ''} aria-pressed={filtro === id} onClick={() => setFiltro(id)}>{t(txt)}</button>
          ))}
        </div>
      </div>

      {cargado && total === 0 && (
        <div className="vecinos-vacio">
          <span className="ficha"><Megaphone aria-hidden="true" /></span>
          <p>{filtro === 'negocios' ? t('Aún no hay negocios recomendados a {r} de ti.', { r: textoRadio(radioKm) }) : t('Aún no hay publicaciones a {r} de ti. Sé el primero: toca Publicar.', { r: textoRadio(radioKm) })}</p>
        </div>
      )}

      <div className="vecinos-lista">
        {lista.map((p) => {
          const Icono = ICONO_TIPO[p.tipo] || ICONO_TIPO.OFREZCO
          const mia = p.autorId === usuario?.id
          return (
            <article key={p.id} className="pub" onClick={() => abrir(p)} role="link" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && abrir(p)}>
              <Link to={`/vecino/${p.autorId}`} state={{ nombre: p.autorNombre }} onClick={parar} className="pub-avatar" aria-label={t('Perfil de {nombre}', { nombre: p.autorNombre })}>
                <Avatar nombre={p.autorNombre} size={44} />
              </Link>
              <div className="pub-cuerpo">
                <div className="pub-autor">
                  <Link to={`/vecino/${p.autorId}`} state={{ nombre: p.autorNombre }} onClick={parar}><b>{mia ? t('Tú') : p.autorNombre}</b></Link>
                  <span className="muted">{haceCuanto(p.fecha, t)}</span>
                </div>
                <div className="chips">
                  <span className={`chip ${CLASE_TIPO[p.tipo] || ''}`}><Icono aria-hidden="true" />{t(NOMBRE_TIPO[p.tipo] || p.tipo)}</span>
                  <span className="chip neutro">{p.categoria}</span>
                </div>
                <p className="pub-texto">{p.texto}</p>
                {p.fotoBase64 && <img className="pub-foto" src={p.fotoBase64} alt="" loading="lazy" />}
                <div className="pub-pie">
                  <span className="fila-icono muted"><LocateFixed size={16} aria-hidden="true" />{t('a {m}', { m: metros(p.distanciaKm) })}</span>
                  <div className="pub-acciones">
                    <button className="btn chico secundario" onClick={(e) => { parar(e); onElegir({ k: claveCelda(p.geo), lat: p.geo.lat, lng: p.geo.lng }) }}><Map size={18} aria-hidden="true" />{t('Mapa')}</button>
                    <button className="btn chico secundario" onClick={(e) => { parar(e); abrir(p) }}><MessageSquare size={18} aria-hidden="true" />{t('Comentar')}</button>
                    {p.autorWhatsapp && !mia && <BotonWa num={p.autorWhatsapp} msj={msjPublicacion(p)} />}
                  </div>
                </div>
              </div>
            </article>
          )
        })}
        {tiendas.map((n) => {
          const Icono = iconoRubro(n.rubro)
          return (
            <article key={n.id} className="pub" onClick={() => onElegir({ k: n.id, lat: n.geo.lat, lng: n.geo.lng })} role="link" tabIndex={0}>
              <span className="ficha chica"><Icono aria-hidden="true" /></span>
              <div className="pub-cuerpo">
                <div>
                  <h3>{n.nombre}</h3>
                  <div className="muted">{n.rubro}</div>
                </div>
                <div className="pop-recomendado" style={{ marginTop: 0 }}><Star size={18} aria-hidden="true" />{t('Recomendado por {n} vecinos de tu zona', { n: n.nRecomendaciones || 0 })}</div>
                {n.resumenIA && <p className="pop-resumen">“{n.resumenIA}”</p>}
                <div className="pub-pie">
                  <span className="fila-icono muted"><LocateFixed size={16} aria-hidden="true" />{t('A {m}', { m: metros(n.distanciaKm) })}{n.horario && <><Clock3 size={16} aria-hidden="true" />{n.horario}</>}</span>
                  <div className="pub-acciones">
                    <button className="btn chico secundario" onClick={(e) => { parar(e); onElegir({ k: n.id, lat: n.geo.lat, lng: n.geo.lng }) }}><Map size={18} aria-hidden="true" />{t('Mapa')}</button>
                    {n.whatsapp && <BotonWa num={n.whatsapp} msj={msjNegocio(n)} />}
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
