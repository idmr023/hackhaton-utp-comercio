import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
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
  return (
    <>
      <header className="barra-superior">
        <div>{modo === 'minka' ? '🆘 MODO MINKA' : '🤝 Ayni'}</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className={'estado' + (online ? '' : ' offline')}>{online ? 'En línea' : 'Sin internet · se guarda local'}</span>
          <button className="btn secundario" style={{ width: 'auto', minHeight: 34, padding: '4px 10px', fontSize: 13 }}
            onClick={() => setModo(modo === 'minka' ? 'barrio' : 'minka')}>
            {modo === 'minka' ? 'Salir' : 'Emergencia'}
          </button>
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
