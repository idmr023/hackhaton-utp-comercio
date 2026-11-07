// Perfil: datos, estado de verificacion, WhatsApp opt-in, salir.
import { useEstado } from '../lib/estado'
import { MODO_DEMO_LOCAL } from '../lib/db'

export default function Perfil() {
  const { usuario, setUsuario } = useEstado()
  const salir = () => { localStorage.removeItem('ayni_usuario'); setUsuario(null); window.location.href = '/' }
  return (
    <div className="pantalla">
      <div className="tarjeta">
        <h3>{usuario.nombre}</h3>
        <div>📱 {usuario.telefono} {usuario.whatsappVisible ? '(WhatsApp visible)' : '(WhatsApp oculto)'}</div>
        <div>🪪 DNI: {usuario.verificacion === 'reniec' ? <span className="chip">Validado en RENIEC</span> : <span className="chip pendiente">Pendiente de verificación</span>}</div>
        <div>🤝 Avales: {usuario.avales?.length || 0} / 2 {usuario.verificado ? '· Vecino verificado ✔' : ''}</div>
        <div>⭐ Puntos Ayni: {usuario.puntosAyni || 0}</div>
      </div>
      {MODO_DEMO_LOCAL && <div className="chip pendiente">Modo demo local: sin Firebase (.env vacío). Los datos viven en este navegador.</div>}
      <button className="btn secundario" onClick={salir}>Cerrar sesión</button>
    </div>
  )
}
