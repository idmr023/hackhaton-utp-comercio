import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom'
import { Map, Siren, Coins, UserRound, WifiOff, LogOut } from 'lucide-react'
import { EstadoProvider, useEstado } from './lib/estado'
import { Logo } from './lib/iconos'
import Mapa from './pages/Mapa'
import Publicar from './pages/Publicar'
import Minka from './pages/Minka'
import Perfil from './pages/Perfil'
import Registro from './pages/Registro'
import Tutorial from './pages/Tutorial'
import Puntos from './pages/Puntos'

function Barra() {
  const { modo, setModo, online, aviso } = useEstado()
  const nav = useNavigate()
  const minka = modo === 'minka'
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
        <div className="barra-acciones">
          {online
            ? <span className="estado en-linea" role="status"><span className="solo-lector">En línea</span></span>
            : <span className="estado offline" role="status"><WifiOff size={16} aria-hidden="true" /><span>Sin internet,<br />se guarda local</span></span>}
          <button className="btn-modo" onClick={cambiarModo} aria-label={minka ? 'Salir de Minka' : 'Emergencia: entrar a Modo Minka'}>
            {minka ? <LogOut size={18} aria-hidden="true" /> : <Siren size={18} aria-hidden="true" />}
            <span className="btn-modo-texto">{minka ? 'Salir' : 'Emergencia'}</span>
          </button>
        </div>
      </header>
      {aviso && <div className="toast" role="status">{aviso}</div>}
    </>
  )
}

function Nav() {
  const cls = ({ isActive }) => (isActive ? 'activo' : '')
  return (
    <nav className="nav" aria-label="Secciones">
      <NavLink to="/" className={cls} end><Map aria-hidden="true" />Mapa</NavLink>
      <NavLink to="/minka" className={cls}><Siren aria-hidden="true" />Minka</NavLink>
      <NavLink to="/puntos" className={cls}><Coins aria-hidden="true" />Puntos</NavLink>
      <NavLink to="/perfil" className={cls}><UserRound aria-hidden="true" />Perfil</NavLink>
    </nav>
  )
}

function Rutas() {
  const { usuario, modo } = useEstado()
  const vioTutorial = localStorage.getItem('ayni_tutorial') === '1'
  if (!vioTutorial) return <Routes><Route path="*" element={<Tutorial />} /></Routes>
  if (!usuario) return <Routes><Route path="*" element={<Registro />} /></Routes>
  return (
    <div className={'app' + (modo === 'minka' ? ' minka' : '')}>
      <Barra />
      <main className="contenido">
        <Routes>
          <Route path="/" element={modo === 'minka' ? <Navigate to="/minka" /> : <Mapa />} />
          <Route path="/publicar" element={<Publicar />} />
          <Route path="/minka" element={<Minka />} />
          <Route path="/puntos" element={<Puntos />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Nav />
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
