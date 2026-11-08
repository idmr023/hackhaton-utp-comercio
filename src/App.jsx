import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom'
import { EstadoProvider, useEstado } from './lib/estado'
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
  const cambiarModo = () => {
    if (modo === 'minka') {
      if (!window.confirm('¿Terminó la emergencia en tu zona?\n\nAceptar = Sí, volver al barrio · Cancelar = Seguir en Minka')) return
      setModo('barrio'); nav('/')
    } else { setModo('minka'); nav('/minka') }
  }
  return (
    <>
      <header className="barra-superior">
        <div className="marca">
          <div className="marca-logo">{modo === 'minka' ? '🆘' : '🤝'}</div>
          <div>
            <div className="marca-nombre">{modo === 'minka' ? 'Modo Minka' : 'Ayni'}</div>
            <div className="marca-lema">{modo === 'minka' ? 'emergencia en tu zona' : 'tu barrio se ayuda'}</div>
          </div>
        </div>
        <div className="barra-acciones">
          <span className={'estado' + (online ? ' en-linea' : ' offline')} title={online ? 'En línea' : undefined}>
            {online ? <span className="solo-lector">En línea</span> : <span>Sin internet<br />se guarda local</span>}
          </span>
          <button className="btn-modo" onClick={cambiarModo}>{modo === 'minka' ? 'Salir' : '🆘 Emergencia'}</button>
        </div>
      </header>
      {aviso && <div className="toast">{aviso}</div>}
    </>
  )
}

function Nav() {
  const cls = ({ isActive }) => (isActive ? 'activo' : '')
  return (
    <nav className="nav">
      <NavLink to="/" className={cls} end><span>🗺️</span>Mapa</NavLink>
      <NavLink to="/minka" className={cls}><span>🆘</span>Minka</NavLink>
      <NavLink to="/puntos" className={cls}><span>⭐</span>Puntos</NavLink>
      <NavLink to="/perfil" className={cls}><span>👤</span>Perfil</NavLink>
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
