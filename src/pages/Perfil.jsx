// Perfil: datos, estado de verificacion, WhatsApp opt-in, salir.
import { useEffect, useState } from 'react'
import { useEstado } from '../lib/estado'
import { MODO_DEMO_LOCAL } from '../lib/db'
import { saldoPuntos } from '../lib/puntos'

export default function Perfil() {
  const { usuario, setUsuario, ubicacionDemo, setUbicacionDemo, setAviso, prefs, setPref } = useEstado()
  const interruptor = (k, texto) => (
    <label style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0' }}>
      <input type="checkbox" style={{ width: 24, height: 24 }} checked={!!prefs[k]} onChange={(e) => setPref(k, e.target.checked)} />
      {texto}
    </label>
  )
  const [saldo, setSaldo] = useState(null)
  useEffect(() => { saldoPuntos(usuario.id).then(setSaldo).catch(() => setSaldo(0)) }, [usuario.id])
  const cambiarDemo = () => {
    setUbicacionDemo(!ubicacionDemo)
    setAviso(ubicacionDemo ? 'Usando tu ubicación real' : 'Ubicación fija en Surquillo')
  }
  const salir = () => { localStorage.removeItem('ayni_usuario'); setUsuario(null); window.location.href = '/' }
  return (
    <div className="pantalla">
      <div className="tarjeta">
        <h3>{usuario.nombre}</h3>
        {prefs.quechua && <span className="quechua" style={{ marginBottom: 6 }}>Wasimasi (vecino/a)</span>}
        <div>📱 {usuario.telefono} {usuario.whatsappVisible ? '(WhatsApp visible)' : '(WhatsApp oculto)'}</div>
        <div>🪪 DNI: {usuario.verificacion === 'reniec' ? <span className="chip">Validado en RENIEC</span> : <span className="chip pendiente">Pendiente de verificación</span>}</div>
        <div>🤝 Avales: {usuario.avales?.length || 0} / 2 {usuario.verificado ? '· Vecino verificado ✔' : ''}</div>
        <div>⭐ Puntos Ayni: {saldo ?? '…'}</div>
      </div>
      <div className="tarjeta">
        <h3>Accesibilidad e idioma</h3>
        {interruptor('letraGrande', '🔠 Letra grande')}
        {interruptor('altoContraste', '🌓 Alto contraste')}
        {interruptor('quechua', '🗣️ Frases en quechua')}
      </div>
      {MODO_DEMO_LOCAL && <div className="chip pendiente">Modo demo local: sin Firebase (.env vacío). Los datos viven en este navegador.</div>}
      <button className="btn secundario" onClick={cambiarDemo}>
        {ubicacionDemo ? '📍 Usar mi ubicación real' : '📍 Fijar ubicación en Surquillo (demo)'}
      </button>
      <button className="btn secundario" onClick={salir}>Cerrar sesión</button>
    </div>
  )
}
