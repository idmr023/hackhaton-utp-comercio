// Ajustes (se abre desde el avatar de la barra): tu cuenta y verificacion, accesibilidad (letra grande, alto contraste,
// modo para daltonicos), idioma (espanol / espanol con frases en quechua / quechua), ubicacion demo, salir.
import { useEffect, useState } from 'react'
import { Smartphone, Users, Coins, BadgeCheck, Type, Contrast, Languages, LocateFixed, LogOut, Eye } from 'lucide-react'
import { useEstado } from '../lib/estado'
import { MODO_DEMO_LOCAL } from '../lib/db'
import { saldoPuntos } from '../lib/puntos'
import { IDIOMAS } from '../lib/i18n'

const iniciales = (nombre = '') => nombre.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')

export default function Ajustes() {
  const { usuario, setUsuario, ubicacionDemo, setUbicacionDemo, setAviso, prefs, setPref, idioma, t } = useEstado()
  const [saldo, setSaldo] = useState(null)
  useEffect(() => { saldoPuntos(usuario.id).then(setSaldo).catch(() => setSaldo(0)) }, [usuario.id])

  const interruptor = (k, Icono, texto, ayuda) => (
    <label className="switch">
      <span className="fila-icono"><Icono size={22} aria-hidden="true" /><span>{t(texto)}{ayuda && <span className="muted" style={{ display: 'block' }}>{t(ayuda)}</span>}</span></span>
      <input type="checkbox" role="switch" checked={!!prefs[k]} onChange={(e) => setPref(k, e.target.checked)} />
    </label>
  )
  const cambiarDemo = () => {
    setUbicacionDemo(!ubicacionDemo)
    setAviso(ubicacionDemo ? t('Usando tu ubicación real') : t('Ubicación fija en Surquillo'))
  }
  const salir = () => { localStorage.removeItem('ayni_usuario'); setUsuario(null); window.location.href = '/' }

  return (
    <div className="pantalla ancha">
      <h2>{t('Ajustes')}</h2>
      <div className="columnas-2">
        <div>
          <div className="tarjeta">
            <div className="fila">
              <div className="avatar" aria-hidden="true">{iniciales(usuario.nombre)}</div>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ fontSize: 'calc(22px * var(--escala))', fontFamily: 'var(--titular)', fontWeight: 800, color: 'var(--verde-prof)', margin: 0 }}>{usuario.nombre}</h3>
                {idioma === 'mixto' && <span className="quechua">Wasimasi (vecino/a)</span>}
                <div style={{ marginTop: 6 }}>
                  {usuario.verificacion === 'reniec'
                    ? <span className="chip"><BadgeCheck aria-hidden="true" />{t('Validado en RENIEC')}</span>
                    : <span className="chip pendiente">{t('Pendiente de verificación')}</span>}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <div className="dato"><Smartphone aria-hidden="true" /><span>{usuario.telefono} <span className="muted">{usuario.whatsappVisible ? t('(WhatsApp visible)') : t('(WhatsApp oculto)')}</span></span></div>
              <div className="dato"><Users aria-hidden="true" /><span>{t('Avales: {n} de 2', { n: usuario.avales?.length || 0 })}{usuario.verificado ? t(', vecino verificado') : ''}</span></div>
              <div className="dato"><Coins aria-hidden="true" /><span>{t('Puntos Ayni:')} <b>{saldo ?? '…'}</b></span></div>
            </div>
          </div>
          {MODO_DEMO_LOCAL && <div className="chip pendiente">Modo demo local: sin Firebase (.env vacío). Los datos viven en este navegador.</div>}
        </div>

        <div>
          <h2 className="titulo-seccion">{t('Accesibilidad e idioma')}</h2>
          <div className="tarjeta" style={{ paddingTop: 4, paddingBottom: 4 }}>
            {interruptor('letraGrande', Type, 'Letra grande', 'Toda la letra un 25 % más grande')}
            {interruptor('altoContraste', Contrast, 'Alto contraste', 'Colores oscuros y bordes marcados')}
            {interruptor('daltonico', Eye, 'Modo para daltónicos', 'Azul y naranja en vez de verde y rojo')}
          </div>
          <div className="tarjeta">
            <h3 className="fila-icono" id="t-idioma"><Languages size={22} style={{ color: 'var(--verde)' }} aria-hidden="true" />{t('Idioma')}</h3>
            <div className="selector-idioma" role="radiogroup" aria-labelledby="t-idioma">
              {IDIOMAS.map(([id, nombre]) => (
                <button key={id} type="button" role="radio" aria-checked={idioma === id} className={idioma === id ? 'activo' : ''}
                  onClick={() => setPref('idioma', id)}>
                  <span>{t(nombre)}</span>
                  {id !== 'es' && <span className="muted">{id === 'qu' ? 'Llapan runasimipi' : 'Minka: Allinllachu? Yanapaway!'}</span>}
                </button>
              ))}
            </div>
            {idioma !== 'es' && <p className="muted" style={{ marginTop: 10 }}>{t('Las traducciones al quechua son del equipo y faltan validar con un hablante.')}</p>}
          </div>
          <h2 className="titulo-seccion">{t('Ubicación y cuenta')}</h2>
          <button className="btn secundario" onClick={cambiarDemo}>
            <LocateFixed aria-hidden="true" />{ubicacionDemo ? t('Usar mi ubicación real') : t('Fijar ubicación en Surquillo (demo)')}
          </button>
          <button className="btn peligro" onClick={salir}><LogOut aria-hidden="true" />{t('Cerrar sesión')}</button>
        </div>
      </div>
    </div>
  )
}
