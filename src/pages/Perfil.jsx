// Perfil: datos, estado de verificacion, puntos, accesibilidad e idioma, ubicacion demo, salir.
import { useEffect, useState } from 'react'
import { useEstado } from '../lib/estado'
import { MODO_DEMO_LOCAL } from '../lib/db'
import { saldoPuntos } from '../lib/puntos'

const iniciales = (nombre = '') => nombre.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')

export default function Perfil() {
  const { usuario, setUsuario, ubicacionDemo, setUbicacionDemo, setAviso, prefs, setPref } = useEstado()
  const [saldo, setSaldo] = useState(null)
  useEffect(() => { saldoPuntos(usuario.id).then(setSaldo).catch(() => setSaldo(0)) }, [usuario.id])

  const interruptor = (k, texto) => (
    <label className="switch">
      <span>{texto}</span>
      <input type="checkbox" role="switch" checked={!!prefs[k]} onChange={(e) => setPref(k, e.target.checked)} />
    </label>
  )
  const cambiarDemo = () => {
    setUbicacionDemo(!ubicacionDemo)
    setAviso(ubicacionDemo ? 'Usando tu ubicación real' : 'Ubicación fija en Surquillo')
  }
  const salir = () => { localStorage.removeItem('ayni_usuario'); setUsuario(null); window.location.href = '/' }

  return (
    <div className="pantalla">
      <div className="tarjeta">
        <div className="fila">
          <div className="avatar">{iniciales(usuario.nombre)}</div>
          <div style={{ minWidth: 0 }}>
            <h2>{usuario.nombre}</h2>
            {prefs.quechua && <span className="quechua">Wasimasi (vecino/a)</span>}
            <div style={{ marginTop: 4 }}>
              {usuario.verificacion === 'reniec'
                ? <span className="chip verde">✔ Validado en RENIEC</span>
                : <span className="chip pendiente">Pendiente de verificación</span>}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <div className="dato">📱 <span>{usuario.telefono} <span className="muted">{usuario.whatsappVisible ? '(WhatsApp visible)' : '(WhatsApp oculto)'}</span></span></div>
          <div className="dato">🤝 <span>Avales: {usuario.avales?.length || 0} / 2 {usuario.verificado ? '· Vecino verificado ✔' : ''}</span></div>
          <div className="dato">⭐ <span>Puntos Ayni: <b>{saldo ?? '…'}</b></span></div>
        </div>
      </div>

      <div className="titulo-seccion">Accesibilidad e idioma</div>
      <div className="tarjeta" style={{ paddingTop: 6, paddingBottom: 6 }}>
        {interruptor('letraGrande', '🔠 Letra grande')}
        {interruptor('altoContraste', '🌓 Alto contraste')}
        {interruptor('quechua', '🗣️ Frases en quechua')}
      </div>

      {MODO_DEMO_LOCAL && <div className="chip pendiente">Modo demo local: sin Firebase (.env vacío). Los datos viven en este navegador.</div>}
      <button className="btn secundario" onClick={cambiarDemo}>
        {ubicacionDemo ? '📍 Usar mi ubicación real' : '📍 Fijar ubicación en Surquillo (demo)'}
      </button>
      <button className="btn secundario" style={{ color: 'var(--rojo)' }} onClick={salir}>Cerrar sesión</button>
    </div>
  )
}
