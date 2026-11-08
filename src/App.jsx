import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom'
import { Map, Users, Coins, Siren, WifiOff, LogOut } from 'lucide-react'
import { EstadoProvider, useEstado } from './lib/estado'
import { Logo } from './lib/iconos'
import Barrio from './pages/Barrio'
import Publicar from './pages/Publicar'
import Minka from './pages/Minka'
import Ajustes from './pages/Ajustes'
import Registro from './pages/Registro'
import Tutorial from './pages/Tutorial'
import Puntos from './pages/Puntos'

const iniciales = (nombre = '') => nombre.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')
const cls = ({ isActive }) => (isActive ? 'activo' : '')

// Las 3 secciones del Modo Barrio. En celular va abajo; en PC, dentro de la barra superior.
function Nav({ className }) {
  return (
    <nav className={className} aria-label="Secciones">
      <NavLink to="/" className={cls} end><Map aria-hidden="true" />Mapa</NavLink>
      <NavLink to="/vecinos" className={cls}><Users aria-hidden="true" />Vecinos</NavLink>
      <NavLink to="/puntos" className={cls}><Coins aria-hidden="true" />Puntos</NavLink>
    </nav>
  )
}

function Barra() {
  const { modo, setModo, online, aviso, usuario } = useEstado()
  const nav = useNavigate()
  const minka = modo === 'minka'
  // Emergencia es el interruptor del Modo Minka: cambia toda la app, no es una seccion mas
  const cambiarModo = () => {
    if (minka) {
      if (!window.confirm('¿Terminó la emergencia en tu zona?\n\nAceptar = Sí, volver al barrio. Cancelar = Seguir en Minka')) return
      setModo('barrio'); nav('/')
    } else { setModo('minka'); nav('/minka') }
  }
  return (
    <>
      <header className={'barra-superior' + (online ? '' : ' sin-internet')}>
        <div className="marca">
          <Logo size={38} fondo={minka ? '#fff' : 'var(--maiz)'} trazo={minka ? 'var(--rojo)' : 'var(--verde-prof)'} />
          <div className="marca-texto">
            <div className="marca-nombre">{minka ? 'Modo Minka' : 'Ayni'}</div>
            <div className="marca-lema">{minka ? 'emergencia en tu zona' : 'tu barrio se ayuda'}</div>
          </div>
        </div>
        {!minka && <Nav className="nav-arriba" />}
        <div className="barra-acciones">
          {online
            ? <span className="estado en-linea" role="status"><span className="solo-lector">En línea</span></span>
            : <span className="estado offline" role="status"><WifiOff size={16} aria-hidden="true" /><span>Sin internet,<br />se guarda local</span></span>}
          <button className="btn-modo" onClick={cambiarModo} aria-label={minka ? 'Salir de Minka' : 'Emergencia: entrar a Modo Minka'}>
            {minka ? <LogOut size={18} aria-hidden="true" /> : <Siren size={18} aria-hidden="true" />}
            <span className="btn-modo-texto">{minka ? 'Salir' : 'Emergencia'}</span>
          </button>
          <NavLink to="/ajustes" className={({ isActive }) => 'avatar-btn' + (isActive ? ' activo' : '')} aria-label="Ajustes y perfil" title="Ajustes y perfil">
            {iniciales(usuario?.nombre) || '?'}
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
