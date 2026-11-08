// Mapa del barrio: radio caminable, negocios con pin por rubro, publicaciones agrupadas por celda, boton Publicar.
// Recibe los datos de Barrio.jsx (que tambien alimenta la lista de vecinos).
import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useNavigate, Link } from 'react-router-dom'
import { Plus, Star, MessageCircle, Store, MapPin, LocateFixed, CloudUpload, Megaphone, Clock3, Search, SlidersHorizontal, X, Utensils, HeartPulse, Wrench, Scissors } from 'lucide-react'

// Icono por categoria de negocio (panel de filtros)
const ICONO_CATEGORIA = { comida: Utensils, salud: HeartPulse, hogar: Wrench, belleza: Scissors, tiendas: Store }
import { useEstado } from '../lib/estado'
import { RADIOS_KM } from '../lib/geo'
import { iconoRubro, ICONO_TIPO, svg } from '../lib/iconos'
import { waLink, msjPublicacion, msjNegocio, NOMBRE_TIPO, CLASE_TIPO, msFecha, metros, textoRadio, claveCelda } from '../lib/contacto'
import { Estrellas } from '../lib/social'
import { totalRecomendaciones, CATEGORIAS_NEGOCIO, categoriaNegocio } from '../lib/negocios'

// Busqueda sin tildes ni mayusculas
const normal = (s) => (s || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

// Pines del mapa (divIcon con clases de index.css: no dependen de imagenes externas)
const ICONO_YO = L.divIcon({ html: '<div class="pin pin-yo"></div>', className: '', iconSize: [20, 20], iconAnchor: [10, 10] })
const cacheIconos = {}
const iconoNegocio = (rubro) => (cacheIconos[rubro] ??= L.divIcon({
  html: `<div class="pin pin-negocio">${svg(iconoRubro(rubro), { size: 18 })}</div>`,
  className: '', iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -14],
}))
// Negocio con logo: el pin muestra el logo en vez del icono del rubro (cache por id)
const cacheLogos = {}
const iconoNegocioLogo = (n) => (cacheLogos[n.id] ??= L.divIcon({
  html: `<div class="pin pin-negocio pin-logo"><img src="${n.logoBase64}" alt=""></div>`,
  className: '', iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -15],
}))
// Grupo de publicaciones: circulo del color del tipo de la mas reciente + contador si hay varias
const iconoGrupo = (tipo, n) => L.divIcon({
  html: `<div class="pin pin-pub ${tipo}">${svg(ICONO_TIPO[tipo] || ICONO_TIPO.OFREZCO, { size: 20 })}${n > 1 ? `<span class="pin-contador">${n}</span>` : ''}</div>`,
  className: '', iconSize: [38, 38], iconAnchor: [19, 19], popupAnchor: [0, -16],
})

// Las publicaciones se guardan en una celda aproximada (~300 m), asi que varias caen en el
// mismo punto y se taparian: un icono por celda, con la lista completa en el popup.
export function agruparPorCelda(pubs) {
  const grupos = new Map()
  for (const p of pubs) {
    const k = claveCelda(p.geo)
    if (!grupos.has(k)) grupos.set(k, [])
    grupos.get(k).push(p)
  }
  return [...grupos].map(([k, items]) => ({ k, items: items.sort((a, b) => msFecha(b.fecha) - msFecha(a.fecha)) }))
}

// Zoom segun el radio: con 1 km los pines se distinguen (el circulo puede salir del borde; se puede alejar)
const ZOOM_RADIO = { 0.5: 17, 1: 16, 2: 15, 5: 13 }
function Centrar({ centro, zoom }) {
  const map = useMap()
  useEffect(() => { if (centro) map.setView([centro.lat, centro.lng], zoom) }, [centro, zoom, map])
  return null
}
// Lo elegido en la lista: acercar y abrir su popup
function Enfocar({ foco, refs }) {
  const map = useMap()
  useEffect(() => {
    if (!foco) return
    map.setView([foco.lat, foco.lng], Math.max(map.getZoom(), 17), { animate: true })
    const t = setTimeout(() => {
      refs.current[foco.k]?.openPopup()
      if (!foco.pubId) return
      // El popup agrupa varias publicaciones: llevar la lista hasta la tocada (si no, siempre se ve la de arriba)
      setTimeout(() => {
        const el = document.querySelector(`.leaflet-popup .pop-item[data-id="${foco.pubId}"]`)
        if (!el) return
        el.scrollIntoView({ block: 'nearest' })
        el.classList.add('resaltado')
        setTimeout(() => el.classList.remove('resaltado'), 2500)
      }, 120)
    }, 350)
    return () => clearTimeout(t)
  }, [foco, map, refs])
  return null
}
// Cuando el contenedor cambia de tamano (celular <-> PC) Leaflet necesita recalcular
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

const WhatsApp = ({ num, msj }) => (
  <a className="pop-wa" href={waLink(num, msj)} target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" />WhatsApp</a>
)

export default function Mapa({ pubs: todasPubs, negocios: todosNeg, nPend, cargado, foco, resenasNeg = {} }) {
  const { ubicacion, radioKm, setRadioKm, usuario, ubicacionDemo, t } = useEstado()
  const nav = useNavigate()
  const refs = useRef({}) // marcadores por clave, para abrir el popup desde la lista
  // Buscador y filtros del mapa
  const [busqueda, setBusqueda] = useState('')
  const [ver, setVer] = useState('todo') // 'todo' | 'negocios' | 'publicaciones'
  const [categoria, setCategoria] = useState('todo') // categoria de negocio
  const [conOpiniones, setConOpiniones] = useState(false)
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 900)
  const [focoLista, setFocoLista] = useState(null) // publicacion tocada en el panel: el mapa se centra y abre su popup
  const q = normal(busqueda.trim())
  const coincide = (...campos) => !q || campos.some((c) => normal(c).includes(q))
  const negocios = todosNeg.filter((n) => ver !== 'publicaciones'
    && (categoria === 'todo' || categoriaNegocio(n.rubro, n.nombre) === categoria)
    && (!conOpiniones || (resenasNeg[n.id]?.n || 0) > 0)
    && coincide(n.nombre, n.rubro, n.descripcion, n.resumenIA))
  // Las categorias y "con opiniones" son de negocios: al elegirlas se ocultan las publicaciones
  const pubs = todasPubs.filter((p) => ver !== 'negocios' && categoria === 'todo' && !conOpiniones && coincide(p.texto, p.categoria, p.autorNombre))
  const hayFiltro = !!q || ver !== 'todo' || categoria !== 'todo' || conOpiniones
  const limpiar = () => { setBusqueda(''); setVer('todo'); setCategoria('todo'); setConOpiniones(false) }
  // Para el panel: solo las categorias que tienen negocios (dentro del radio y de la busqueda), con su cantidad
  const baseNeg = todosNeg.filter((n) => coincide(n.nombre, n.rubro, n.descripcion, n.resumenIA))
  const tieneOpiniones = (n) => (resenasNeg[n.id]?.n || 0) > 0
  const categoriasConAlgo = CATEGORIAS_NEGOCIO.filter(([id]) => id !== 'todo')
    .map(([id, txt]) => [id, txt, baseNeg.filter((n) => categoriaNegocio(n.rubro, n.nombre) === id && (!conOpiniones || tieneOpiniones(n))).length])
    .filter(([, , n]) => n > 0)
  // Panel "Publicaciones": grupos por zona (misma celda que el pin del mapa), del mas cercano al mas lejano
  const gruposPubs = agruparPorCelda(pubs)
    .map((g) => ({ ...g, dist: Math.min(...g.items.map((p) => p.distanciaKm ?? 99)) }))
    .sort((a, b) => a.dist - b.dist)
  const irAPublicacion = (g, p) => {
    setFocoLista({ lat: g.items[0].geo.lat, lng: g.items[0].geo.lng, k: g.k, pubId: p?.id || null, n: Date.now() })
    if (window.innerWidth < 900) setFiltrosAbiertos(false) // en celular el panel tapa el mapa
  }
  const nConOpiniones = baseNeg.filter((n) => (categoria === 'todo' || categoriaNegocio(n.rubro, n.nombre) === categoria) && tieneOpiniones(n)).length

  return (
    <div className="mapa-pantalla">
      <MapContainer center={[ubicacion.lat, ubicacion.lng]} zoom={ZOOM_RADIO[radioKm] || 16} className="mapa" zoomControl={false}>
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Centrar centro={ubicacion} zoom={ZOOM_RADIO[radioKm] || 16} />
        <Enfocar foco={focoLista || foco} refs={refs} />
        <Ajustar />
        <Circle center={[ubicacion.lat, ubicacion.lng]} radius={radioKm * 1000} pathOptions={{ color: '#2F7C78', weight: 2, dashArray: '6 6', fillOpacity: 0.05 }} />
        <Marker position={[ubicacion.lat, ubicacion.lng]} icon={ICONO_YO}><Popup>{t('Tú ({nombre})', { nombre: usuario?.nombre })}</Popup></Marker>
        {negocios.map((n) => {
          const Icono = iconoRubro(n.rubro)
          return (
            <Marker key={n.id} position={[n.geo.lat, n.geo.lng]} icon={n.logoBase64 ? iconoNegocioLogo(n) : iconoNegocio(n.rubro)} ref={(m) => { refs.current[n.id] = m }}>
              <Popup>
                <div className="pop-cabecera">
                  <span className={`ficha chica${n.logoBase64 ? ' logo' : ''}`}>{n.logoBase64 ? <img src={n.logoBase64} alt="" /> : <Icono aria-hidden="true" />}</span>
                  <div>
                    <div className="pop-titulo">{n.nombre}</div>
                    <div className="muted">{n.rubro}</div>
                  </div>
                </div>
                <div className="fila-icono muted"><LocateFixed size={16} aria-hidden="true" />{t('A {m} de ti', { m: metros(n.distanciaKm) })}</div>
                {n.horario && <div className="fila-icono muted"><Clock3 size={16} aria-hidden="true" />{t('Atiende {h}', { h: n.horario })}</div>}
                <div className="pop-recomendado"><Star size={18} aria-hidden="true" />{t('Recomendado por {n} vecinos de tu zona', { n: totalRecomendaciones(n, resenasNeg) })}</div>
                {resenasNeg[n.id] && <Estrellas valor={resenasNeg[n.id].promedio} n={resenasNeg[n.id].n} size={14} t={t} />}
                {n.resumenIA && <div className="pop-resumen">“{n.resumenIA}”</div>}
                <div className="btn-fila" style={{ marginTop: 8 }}>
                  {n.whatsapp && <WhatsApp num={n.whatsapp} msj={msjNegocio(n)} />}
                  <Link className="pop-wa secundario" to={`/negocio/${n.id}`} state={{ negocio: n }}><Star aria-hidden="true" />{t('Opinar')}</Link>
                </div>
              </Popup>
            </Marker>
          )
        })}
        {agruparPorCelda(pubs).map(({ k, items }) => (
          <Marker key={k} position={[items[0].geo.lat, items[0].geo.lng]} icon={iconoGrupo(items[0].tipo, items.length)} ref={(m) => { refs.current[k] = m }}>
            <Popup>
              {items.length > 1 && <div className="pop-titulo" style={{ marginBottom: 8 }}>{t('{n} publicaciones en esta zona', { n: items.length })}</div>}
              <div className="pop-lista">
                {items.map((p) => {
                  const Icono = ICONO_TIPO[p.tipo] || ICONO_TIPO.OFREZCO
                  return (
                    <div key={p.id} className="pop-item" data-id={p.id}>
                      <div className="chips">
                        <span className={`chip ${CLASE_TIPO[p.tipo] || ''}`}><Icono aria-hidden="true" />{t(NOMBRE_TIPO[p.tipo] || p.tipo)}</span>
                        <span className="chip neutro">{p.categoria}</span>
                      </div>
                      {p.fotoBase64 && <img className="pop-foto" src={p.fotoBase64} alt="" />}
                      <div className="texto">{p.texto}</div>
                      <span className="muted">{p.autorId === usuario?.id ? t('Tú') : p.autorNombre}, {t('a {m}', { m: metros(p.distanciaKm) })}</span>
                      {p.autorWhatsapp && p.autorId !== usuario?.id && (
                        <div><WhatsApp num={p.autorWhatsapp} msj={msjPublicacion(p)} /></div>
                      )}
                    </div>
                  )
                })}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="mapa-controles">
        <div className="selector-radio" role="group" aria-label={t('Radio del barrio')}>
          {RADIOS_KM.map((r) => (
            <button key={r} className={r === radioKm ? 'activo' : ''} aria-pressed={r === radioKm} onClick={() => setRadioKm(r)}>{textoRadio(r)}</button>
          ))}
        </div>
        <div className="buscador">
          <Search size={20} aria-hidden="true" />
          <input type="search" placeholder={t('Buscar negocio o publicación')} aria-label={t('Buscar negocio o publicación')} value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          <button type="button" className={filtrosAbiertos || hayFiltro ? 'activo' : ''} aria-expanded={filtrosAbiertos} aria-label={t('Filtrar')} onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}><SlidersHorizontal size={20} aria-hidden="true" /></button>
        </div>
        {filtrosAbiertos && (
          <div className="panel-filtros" role="group" aria-label={t('Filtrar')}>
            <div className="panel-filtros-cab">
              <b>{t('Filtrar')}</b>
              <button type="button" className="cerrar" aria-label={t('Cerrar filtros')} onClick={() => setFiltrosAbiertos(false)}><X size={18} aria-hidden="true" /></button>
            </div>
            <div className="segmentos" role="group" aria-label={t('Ver')}>
              {[['todo', 'Todo'], ['negocios', 'Negocios'], ['publicaciones', 'Publicaciones']].map(([id, txt]) => (
                <button key={id} type="button" className={ver === id ? 'activo' : ''} aria-pressed={ver === id} onClick={() => setVer(ver === id ? 'todo' : id)}>{t(txt)}</button>
              ))}
            </div>
            {ver !== 'publicaciones' && (
              <>
                <h4>{t('Categorías de negocio')}</h4>
                {categoriasConAlgo.map(([id, txt, n]) => {
                  const Icono = ICONO_CATEGORIA[id] || Store
                  return (
                    <button key={id} type="button" className={'opcion-filtro' + (categoria === id ? ' activo' : '')} aria-pressed={categoria === id} onClick={() => setCategoria(categoria === id ? 'todo' : id)}>
                      <Icono size={18} aria-hidden="true" />{t(txt)}<span className="cuenta">{n}</span>
                    </button>
                  )
                })}
                {categoriasConAlgo.length === 0 && <p className="muted">{t('Ningún negocio a {r} de ti.', { r: textoRadio(radioKm) })}</p>}
                {(nConOpiniones > 0 || conOpiniones) && (
                  <button type="button" className={'opcion-filtro' + (conOpiniones ? ' activo' : '')} aria-pressed={conOpiniones} onClick={() => setConOpiniones(!conOpiniones)}>
                    <Star size={18} aria-hidden="true" />{t('Con opiniones')}<span className="cuenta">{nConOpiniones}</span>
                  </button>
                )}
              </>
            )}
            {ver === 'publicaciones' && (
              <>
                <h4>{t('Publicaciones, de la más cercana a la más lejana')}</h4>
                {gruposPubs.length === 0 && <p className="muted">{t('Ninguna publicación a {r} de ti.', { r: textoRadio(radioKm) })}</p>}
                <div className="grupos-pubs">
                  {gruposPubs.map((g) => (
                    <div key={g.k} className="grupo-pubs">
                      <button type="button" className="grupo-pubs-cab" onClick={() => irAPublicacion(g)}>
                        <MapPin size={16} aria-hidden="true" />
                        <span>{t('A {m} de ti', { m: metros(g.dist) })}</span>
                        {g.items.length > 1 && <span className="cuenta">{g.items.length}</span>}
                      </button>
                      {g.items.map((p) => {
                        const Icono = ICONO_TIPO[p.tipo] || ICONO_TIPO.OFREZCO
                        return (
                          <button key={p.id} type="button" className="item-pub-panel" onClick={() => irAPublicacion(g, p)}>
                            <span className={`ficha chica ${CLASE_TIPO[p.tipo] || ''}`}><Icono size={16} aria-hidden="true" /></span>
                            <span className="item-pub-texto">
                              <span className="item-pub-cuerpo">{p.texto}</span>
                              <span className="muted">{p.autorId === usuario?.id ? t('Tú') : p.autorNombre} · {t(NOMBRE_TIPO[p.tipo] || p.tipo)}</span>
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </>
            )}
            {hayFiltro && <button type="button" className="btn chico secundario" onClick={limpiar}><X size={16} aria-hidden="true" />{t('Borrar filtros')}</button>}
          </div>
        )}
        <div className="chips">
          {hayFiltro && !filtrosAbiertos && <button type="button" className="chip limpiar" onClick={limpiar}><X aria-hidden="true" />{t('Borrar filtros')}</button>}
          {negocios.length > 0 && <span className="chip"><Store aria-hidden="true" />{t(negocios.length === 1 ? '{n} negocio' : '{n} negocios', { n: negocios.length })}</span>}
          {pubs.length > 0 && <span className="chip teal"><Megaphone aria-hidden="true" />{t(pubs.length === 1 ? '{n} publicación' : '{n} publicaciones', { n: pubs.length })}</span>}
          {nPend > 0 && <span className="chip pendiente"><CloudUpload aria-hidden="true" />{t(nPend > 1 ? '{n} pendientes de subir' : '{n} pendiente de subir', { n: nPend })}</span>}
          {ubicacionDemo && <span className="chip neutro"><MapPin aria-hidden="true" />{t('Ubicación demo: Surquillo')}</span>}
        </div>
      </div>

      {cargado && hayFiltro && pubs.length === 0 && negocios.length === 0 && (
        <div className="mapa-vacio" role="status">
          <Search size={22} aria-hidden="true" />
          <span>{q ? t('Nada coincide con «{q}» a {r} de ti.', { q: busqueda.trim(), r: textoRadio(radioKm) }) : t('Nada con esos filtros a {r} de ti.', { r: textoRadio(radioKm) })}</span>
        </div>
      )}
      {cargado && !hayFiltro && todasPubs.length === 0 && (
        <div className="mapa-vacio" role="status">
          <Megaphone size={22} aria-hidden="true" />
          <span>{t('Aún no hay publicaciones a {r} de ti. Sé el primero: toca Publicar.', { r: textoRadio(radioKm) })}</span>
        </div>
      )}

      <button className="fab" onClick={() => nav('/publicar')}><Plus aria-hidden="true" />{t('Publicar')}</button>
    </div>
  )
}
