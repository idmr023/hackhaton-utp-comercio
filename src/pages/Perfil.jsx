// Perfil: datos, estado de verificacion, puntos, accesibilidad e idioma, ubicacion demo, salir.
import { useEffect, useState } from 'react'
import { Smartphone, Users, Coins, BadgeCheck, Type, Contrast, Languages, LocateFixed, LogOut } from 'lucide-react'
import { useEstado } from '../lib/estado'
import { MODO_DEMO_LOCAL } from '../lib/db'
import { saldoPuntos } from '../lib/puntos'

const iniciales = (nombre = '') => nombre.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')

export default function Perfil() {
  const { usuario, setUsuario, ubicacionDemo, setUbicacionDemo, setAviso, prefs, setPref } = useEstado()
  const [saldo, setSaldo] = useState(null)
  useEffect(() => { saldoPuntos(usuario.id).then(setSaldo).catch(() => setSaldo(0)) }, [usuario.id])

  const interruptor = (k, Icono, texto, ayuda) => (
    <label className="switch">
      <span className="fila-icono"><Icono size={22} aria-hidden="true" /><span>{texto}{ayuda && <span className="muted" style={{ display: 'block' }}>{ayuda}</span>}</span></span>
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
          <div className="avatar" aria-hidden="true">{iniciales(usuario.nombre)}</div>
          <div style={{ minWidth: 0 }}>
            <h2>{usuario.nombre}</h2>
            {prefs.quechua && <span className="quechua">Wasimasi (vecino/a)</span>}
            <div style={{ marginTop: 6 }}>
              {usuario.verificacion === 'reniec'
                ? <span className="chip"><BadgeCheck aria-hidden="true" />Validado en RENIEC</span>
                : <span className="chip pendiente">Pendiente de verificación</span>}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <div className="dato"><Smartphone aria-hidden="true" /><span>{usuario.telefono} <span className="muted">{usuario.whatsappVisible ? '(WhatsApp visible)' : '(WhatsApp oculto)'}</span></span></div>
          <div className="dato"><Users aria-hidden="true" /><span>Avales: {usuario.avales?.length || 0} de 2{usuario.verificado ? ', vecino verificado' : ''}</span></div>
          <div className="dato"><Coins aria-hidden="true" /><span>Puntos Ayni: <b>{saldo ?? '…'}</b></span></div>
        </div>
      </div>

      <h2 className="titulo-seccion">Accesibilidad e idioma</h2>
      <div className="tarjeta" style={{ paddingTop: 4, paddingBottom: 4 }}>
        {interruptor('letraGrande', Type, 'Letra grande', 'Toda la letra un 25 % más grande')}
        {interruptor('altoContraste', Contrast, 'Alto contraste', 'Colores oscuros y bordes marcados')}
        {interruptor('quechua', Languages, 'Frases en quechua', 'Subtítulos en Minka y saludos')}
      </div>

      {MODO_DEMO_LOCAL && <div className="chip pendiente">Modo demo local: sin Firebase (.env vacío). Los datos viven en este navegador.</div>}
      <button className="btn secundario" onClick={cambiarDemo}>
        <LocateFixed aria-hidden="true" />{ubicacionDemo ? 'Usar mi ubicación real' : 'Fijar ubicación en Surquillo (demo)'}
      </button>
      <button className="btn peligro" onClick={salir}><LogOut aria-hidden="true" />Cerrar sesión</button>
    </div>
  )
}
