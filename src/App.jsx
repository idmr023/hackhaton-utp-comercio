import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom'
import { Map, Users, Coins, Siren, WifiOff, LogOut } from 'lucide-react'
import { EstadoProvider, useEstado } from './lib/estado'
import { listarCerca } from './lib/db'
import { RADIO_MINKA_KM } from './lib/geo'
import { Logo } from './lib/iconos'
import { useFotoPerfil } from './lib/social'
import Barrio from './pages/Barrio'
import Publicar from './pages/Publicar'
import Minka from './pages/Minka'
import Ajustes from './pages/Ajustes'
import Registro from './pages/Registro'
import Tutorial from './pages/Tutorial'
import Puntos from './pages/Puntos'
import Publicacion from './pages/Publicacion'
import Vecino from './pages/Vecino'
import Negocio from './pages/Negocio'

const iniciales = (nombre = '') => nombre.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')
const cls = ({ isActive }) => (isActive ? 'activo' : '')

// Las 3 secciones del Modo Barrio. En celular va abajo; en PC, dentro de la barra superior.
function Nav({ className }) {
  const { t } = useEstado()
  return (
    <nav className={className} aria-label={t('Secciones')}>
      <NavLink to="/" className={cls} end><Map aria-hidden="true" />{t('Mapa')}</NavLink>
      <NavLink to="/vecinos" className={cls}><Users aria-hidden="true" />{t('Vecinos')}</NavLink>
      <NavLink to="/puntos" className={cls}><Coins aria-hidden="true" />{t('Puntos')}</NavLink>
    </nav>
  )
}

function Barra() {
  const { modo, setModo, online, aviso, usuario, ubicacion, t } = useEstado()
  const nav = useNavigate()
  const minka = modo === 'minka'
  const fotoPerfil = useFotoPerfil(usuario?.id)
  // Desde el Modo Barrio: cuantos vecinos piden ayuda en Minka (necesidades abiertas a 3 km, igual que Minka).
  // Se cuenta al cargar, al volver de Minka y cada minuto; sin senal, Firestore responde con su cache.
  const [nNecesidades, setNNecesidades] = useState(0)
  useEffect(() => {
    if (minka || !ubicacion) return
    let vivo = true
    const contar = () => listarCerca('necesidades', ubicacion, RADIO_MINKA_KM)
      .then((l) => { if (vivo) setNNecesidades(l.filter((n) => n.estado === 'abierta').length) })
      .catch(() => {})
    contar()
    const id = setInterval(contar, 60000)
    return () => { vivo = false; clearInterval(id) }
  }, [minka, ubicacion])
  // Emergencia es el interruptor del Modo Minka: cambia toda la app, no es una seccion mas
  const cambiarModo = () => {
    if (minka) {
      if (!window.confirm(t('¿Terminó la emergencia en tu zona?\n\nAceptar = Sí, volver al barrio. Cancelar = Seguir en Minka'))) return
      setModo('barrio'); nav('/')
    } else { setModo('minka'); nav('/minka') }
  }
  return (
    <>
      <header className={'barra-superior' + (online ? '' : ' sin-internet')}>
        <div className="marca">
          <Logo size={42} fondo={minka ? '#fff' : 'var(--marfil)'} />
          <div className="marca-texto">
            <div className="marca-nombre">{minka ? t('Modo Minka') : 'Ayni'}</div>
            <div className="marca-lema">{minka ? t('emergencia en tu zona') : t('tu barrio se ayuda')}</div>
          </div>
        </div>
        {!minka && <Nav className="nav-arriba" />}
        <div className="barra-acciones">
          {/* Solo se avisa cuando NO hay internet (dom 16:10: se quito el punto de "En linea") */}
          {!online && <span className="estado offline" role="status"><WifiOff size={16} aria-hidden="true" /><span>{t('Sin internet,')}<br />{t('se guarda local')}</span></span>}
          <button className="btn-modo" onClick={cambiarModo}
            aria-label={minka ? t('Salir de Minka') : t('Emergencia: entrar a Modo Minka') + (nNecesidades > 0 ? '. ' + t('{n} necesidades abiertas', { n: nNecesidades }) : '')}
            title={!minka && nNecesidades > 0 ? t('{n} necesidades abiertas', { n: nNecesidades }) : undefined}>
            {minka ? <LogOut size={18} aria-hidden="true" /> : <Siren size={18} aria-hidden="true" />}
            <span className="btn-modo-texto">{minka ? t('Salir') : t('Emergencia')}</span>
            {!minka && nNecesidades > 0 && <span className="btn-modo-cuenta" aria-hidden="true">{nNecesidades > 99 ? '99+' : nNecesidades}</span>}
          </button>
          <NavLink to="/ajustes" className={({ isActive }) => 'avatar-btn' + (isActive ? ' activo' : '')} aria-label={t('Ajustes y perfil')} title={t('Ajustes y perfil')}>
            {fotoPerfil ? <img src={fotoPerfil} alt="" /> : (iniciales(usuario?.nombre) || '?')}
          </NavLink>
        </div>
      </header>
      {aviso && <div className="toast" role="status">{aviso}</div>}
    </>
  )
}

function Rutas() {
  const { usuario, modo } = useEstado()
  const vioTutorial = localStorage.getItem('ayni_tutorial') === '1'
  if (!vioTutorial) return <Routes><Route path="*" element={<Tutorial />} /></Routes>
  if (!usuario) return <Routes><Route path="*" element={<Registro />} /></Routes>
  const minka = modo === 'minka'
  return (
    <div className={'app' + (minka ? ' minka' : '')}>
      <Barra />
      <main className="contenido">
        <Routes>
          <Route path="/" element={minka ? <Navigate to="/minka" /> : <Barrio vista="mapa" />} />
          <Route path="/vecinos" element={minka ? <Navigate to="/minka" /> : <Barrio vista="lista" />} />
          <Route path="/publicar" element={<Publicar />} />
          <Route path="/publicacion/:id" element={<Publicacion />} />
          <Route path="/vecino/:id" element={<Vecino />} />
          <Route path="/negocio/:id" element={<Negocio />} />
          <Route path="/minka" element={<Minka />} />
          <Route path="/puntos" element={<Puntos />} />
          <Route path="/ajustes" element={<Ajustes />} />
          <Route path="/perfil" element={<Navigate to="/ajustes" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {!minka && <Nav className="nav nav-abajo" />}
    </div>
  )
}

export default function App() {
  return (
    <EstadoProvider>
      <BrowserRouter>
        <Rutas />
      </BrowserRouter>
    </EstadoProvider>
  )
}
