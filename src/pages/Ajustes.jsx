// Ajustes (se abre desde el avatar de la barra): tu cuenta y verificacion, accesibilidad (letra grande, alto contraste,
// modo para daltonicos), idioma (espanol / espanol con frases en quechua / quechua), ubicacion demo, salir.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Smartphone, Users, Coins, BadgeCheck, Type, Contrast, Languages, LocateFixed, LogOut, Eye, EyeOff, Store, Camera, Trash2, Pencil, MessageCircle } from 'lucide-react'
import { whatsappDe } from '../lib/contacto'
import { hashPin, cuentasConCelular } from '../lib/cuenta'
import { Avatar, setFotoPerfilCache } from '../lib/social'
import { recortarCuadrado } from '../lib/foto'
import { useEstado } from '../lib/estado'
import { MODO_DEMO_LOCAL, listar, obtener, crearSeguro, actualizarSeguro } from '../lib/db'
import { NEGOCIO_ELIMINADO } from '../lib/negocios'
import { saldoPuntos } from '../lib/puntos'
import { IDIOMAS } from '../lib/i18n'


export default function Ajustes() {
  const { usuario, setUsuario, ubicacionDemo, setUbicacionDemo, setAviso, prefs, setPref, idioma, t } = useEstado()
  const [saldo, setSaldo] = useState(null)
  const [misNegocios, setMisNegocios] = useState([]) // mis negocios (varios por cuenta), sin los eliminados
  const nav = useNavigate()
  useEffect(() => {
    saldoPuntos(usuario.id).then(setSaldo).catch(() => setSaldo(0))
    listar('negocios_oficios', { autorId: usuario.id }).then((l) => setMisNegocios(l.filter((n) => n.estado !== 'eliminado'))).catch(() => {}) // retirado se muestra con chip; eliminado es como si no existiera
  }, [usuario.id])

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
  const [guardandoFoto, setGuardandoFoto] = useState(false)
  // El documento de perfiles se escribe entero: foto y WhatsApp van siempre juntos para no borrar uno al cambiar el otro
  const perfilBase = () => ({
    autorId: usuario.id, usuarioId: usuario.id, nombre: usuario.nombre, fotoBase64: usuario.fotoBase64 || null,
    whatsapp: usuario.whatsapp || null, whatsappVisible: usuario.whatsappVisible !== false,
  })
  // Cambiar el celular para ENTRAR: va en accesos.telefono (usuarios no se puede editar); se confirma con el PIN actual.
  // El WhatsApp no cambia solo: queda fijo en perfiles y se cambia aparte en "Mi WhatsApp".
  const [cambiandoCel, setCambiandoCel] = useState(false)
  const [celNuevo, setCelNuevo] = useState('')
  const [pinCel, setPinCel] = useState('')
  const [guardandoCel, setGuardandoCel] = useState(false)
  async function guardarCelular(e) {
    e.preventDefault()
    if (!/^9\d{8}$/.test(celNuevo)) return setAviso(t('El celular debe tener 9 dígitos y empezar con 9.'))
    if (celNuevo === usuario.telefono) return setAviso(t('Ese ya es tu celular para entrar.'))
    setGuardandoCel(true)
    try {
      const acceso = await obtener('accesos', usuario.id)
      if (!acceso?.pinHash) return setAviso(t('Tu cuenta aún no tiene PIN. Sal y toca "Crear cuenta" con tu celular y DNI para crear uno.'))
      const dniHash = usuario.dniHash || (await obtener('usuarios', usuario.id))?.dniHash
      if (acceso.pinHash !== await hashPin(pinCel, dniHash)) return setAviso(t('El PIN no coincide.'))
      const otras = (await cuentasConCelular(celNuevo)).filter(({ u }) => u.id !== usuario.id)
      if (otras.length) return setAviso(t('Ese celular ya es de otra cuenta.'))
      const wa = whatsappDe(usuario) // el WhatsApp sigue siendo el de antes
      await crearSeguro('perfiles', { ...perfilBase(), whatsapp: wa }, usuario.id)
      await actualizarSeguro('accesos', usuario.id, { telefono: celNuevo })
      try { localStorage.setItem('ayni_ultimo_celular', celNuevo) } catch { /* sin storage */ }
      setUsuario({ ...usuario, telefono: celNuevo, whatsapp: wa })
      setCambiandoCel(false); setCelNuevo(''); setPinCel('')
      setAviso(t('Celular actualizado. Desde ahora entras con {cel}.', { cel: celNuevo }))
    } catch (err) { console.error('Cambiar celular fallo', err); setAviso(t('No se pudo guardar. Intenta de nuevo.')) }
    finally { setGuardandoCel(false) }
  }
  // Mi WhatsApp: se puede cambiar (el celular de registro sigue siendo el de entrar)
  const [wa, setWa] = useState(whatsappDe(usuario))
  const [waVisible, setWaVisible] = useState(usuario.whatsappVisible !== false)
  const [guardandoWa, setGuardandoWa] = useState(false)
  // Si el perfil llega de Firestore despues de abrir Ajustes (estado.jsx lo trae al entrar), mostrar ese numero
  useEffect(() => { setWa(whatsappDe(usuario)); setWaVisible(usuario.whatsappVisible !== false) }, [usuario.whatsapp, usuario.whatsappVisible]) // eslint-disable-line
  const waSinCambios = wa === whatsappDe(usuario) && waVisible === (usuario.whatsappVisible !== false)
  async function guardarWhatsapp(e) {
    e.preventDefault()
    if (!/^9\d{8}$/.test(wa)) return setAviso(t('El WhatsApp debe tener 9 dígitos y empezar con 9.'))
    setGuardandoWa(true)
    try {
      await crearSeguro('perfiles', { ...perfilBase(), whatsapp: wa, whatsappVisible: waVisible }, usuario.id)
      setUsuario({ ...usuario, whatsapp: wa, whatsappVisible: waVisible })
      // Lo que ya publique: que su boton de WhatsApp lleve al numero nuevo (o se oculte)
      const mias = await listar('publicaciones', { autorId: usuario.id }, 100).catch(() => [])
      await Promise.all(mias.map((p) => actualizarSeguro('publicaciones', p.id, { autorWhatsapp: waVisible ? wa : null }).catch(() => {})))
      setAviso(t('WhatsApp actualizado.'))
    } catch (err) { console.error('WhatsApp fallo', err); setAviso(t('No se pudo guardar. Intenta de nuevo.')) }
    finally { setGuardandoWa(false) }
  }
  // Foto de perfil: cuadrada de 256 px, en la coleccion perfiles (id = usuario.id); tambien en la sesion local
  async function guardarFoto(file) {
    setGuardandoFoto(true)
    try {
      const foto = file ? await recortarCuadrado(file) : null
      await crearSeguro('perfiles', { ...perfilBase(), fotoBase64: foto }, usuario.id)
      setFotoPerfilCache(usuario.id, foto)
      setUsuario({ ...usuario, fotoBase64: foto })
      setAviso(foto ? t('Foto actualizada.') : t('Foto quitada.'))
    } catch (e) { console.error('Foto de perfil fallo', e); setAviso(t('No se pudo guardar. Intenta de nuevo.')) }
    finally { setGuardandoFoto(false) }
  }
  // Quitar mi negocio del mapa (estado "retirado"; volver a guardarlo en Publicar lo reactiva)
  async function quitarNegocio(n) {
    if (!window.confirm(t('¿Quitar tu negocio del mapa? Podrás volver a ponerlo cuando quieras.'))) return
    try {
      await actualizarSeguro('negocios_oficios', n.id, { estado: 'retirado' })
      setMisNegocios(misNegocios.map((x) => (x.id === n.id ? { ...x, estado: 'retirado' } : x)))
      setAviso(t('Negocio quitado del mapa.'))
    } catch (e) { console.error('Quitar negocio fallo', e); setAviso(t('No se pudo guardar. Intenta de nuevo.')) }
  }
  // Eliminar mi negocio por completo (estado "eliminado" y datos en blanco; no se puede deshacer)
  async function eliminarNegocio(n) {
    if (!window.confirm(t('¿Eliminar tu negocio por completo? Se borran sus datos y fotos y no volverá a aparecer. No se puede deshacer.'))) return
    try {
      await actualizarSeguro('negocios_oficios', n.id, NEGOCIO_ELIMINADO)
      setMisNegocios(misNegocios.filter((x) => x.id !== n.id))
      setAviso(t('Negocio eliminado.'))
    } catch (e) { console.error('Eliminar negocio fallo', e); setAviso(t('No se pudo guardar. Intenta de nuevo.')) }
  }
  const salir = () => { localStorage.removeItem('ayni_usuario'); setUsuario(null); window.location.href = '/' }

  return (
    <div className="pantalla ancha">
      <h2>{t('Ajustes')}</h2>
      <div className="columnas-2">
        <div>
          <div className="tarjeta">
            <div className="fila">
              <Avatar nombre={usuario.nombre} usuarioId={usuario.id} size={72} />
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
            <div className="btn-fila" style={{ marginTop: 12 }}>
              <label className="btn chico secundario" style={{ flex: 'none' }}><Camera size={18} aria-hidden="true" />{usuario.fotoBase64 ? t('Cambiar foto') : t('Poner foto de perfil')}
                <input type="file" accept="image/*" style={{ display: 'none' }} disabled={guardandoFoto} onChange={(e) => e.target.files[0] && guardarFoto(e.target.files[0])} />
              </label>
              {usuario.fotoBase64 && <button className="btn chico secundario" disabled={guardandoFoto} onClick={() => guardarFoto(null)}><Trash2 size={18} aria-hidden="true" />{t('Quitar foto')}</button>}
            </div>
            <div style={{ marginTop: 12 }}>
              <div className="dato"><Smartphone aria-hidden="true" /><span style={{ flex: 1 }}>{t('Celular para entrar:')} {usuario.telefono}</span>
                {!cambiandoCel && <button type="button" className="btn chico secundario" style={{ flex: 'none' }} onClick={() => setCambiandoCel(true)}><Pencil size={16} aria-hidden="true" />{t('Cambiar')}</button>}
              </div>
              {cambiandoCel && (
                <form className="form-whatsapp" style={{ marginTop: 0, borderTop: 0, paddingTop: 4 }} onSubmit={guardarCelular}>
                  <div className="campo">
                    <label htmlFor="cel-nuevo">{t('Celular nuevo para entrar')}</label>
                    <input id="cel-nuevo" type="tel" placeholder={t('9 dígitos')} inputMode="numeric" autoComplete="tel-national" maxLength={9} value={celNuevo} onChange={(e) => setCelNuevo(e.target.value.replace(/\D/g, ''))} />
                  </div>
                  <div className="campo">
                    <label htmlFor="pin-cel">{t('Tu PIN actual (para confirmar)')}</label>
                    <input id="pin-cel" type="password" placeholder="••••" inputMode="numeric" autoComplete="current-password" maxLength={6} value={pinCel} onChange={(e) => setPinCel(e.target.value.replace(/\D/g, ''))} />
                  </div>
                  <p className="muted" style={{ margin: 0 }}>{t('Tu WhatsApp no cambia; si también es nuevo, cámbialo abajo.')}</p>
                  <div className="btn-fila">
                    <button className="btn chico" type="submit" disabled={guardandoCel || !/^9\d{8}$/.test(celNuevo) || !/^\d{4,6}$/.test(pinCel)}><Smartphone size={18} aria-hidden="true" />{guardandoCel ? t('Guardando…') : t('Guardar celular')}</button>
                    <button className="btn chico secundario" type="button" onClick={() => { setCambiandoCel(false); setCelNuevo(''); setPinCel('') }}>{t('Cancelar')}</button>
                  </div>
                </form>
              )}
              <div className="dato"><Users aria-hidden="true" /><span>{t('Avales: {n} de 2', { n: usuario.avales?.length || 0 })}{usuario.verificado ? t(', vecino verificado') : ''}</span></div>
              <div className="dato"><Coins aria-hidden="true" /><span>{t('Puntos Ayni:')} <b>{saldo ?? '…'}</b></span></div>
            </div>
            <form className="form-whatsapp" onSubmit={guardarWhatsapp}>
              <div className="campo">
                <label htmlFor="mi-whatsapp">{t('Mi WhatsApp')}</label>
                <input id="mi-whatsapp" type="tel" placeholder={t('9 dígitos')} inputMode="numeric" autoComplete="tel-national" maxLength={9} value={wa} onChange={(e) => setWa(e.target.value.replace(/\D/g, ''))} />
              </div>
              <label className="check">
                <input type="checkbox" checked={waVisible} onChange={(e) => setWaVisible(e.target.checked)} />
                <span>{t('Mostrar mi WhatsApp a los vecinos que quieran contactarme')}</span>
              </label>
              <p className="muted" style={{ margin: 0 }}>{t('Se cambia también en lo que ya publicaste.')}</p>
              <button className="btn chico" type="submit" disabled={guardandoWa || waSinCambios} style={{ alignSelf: 'flex-start' }}><MessageCircle size={18} aria-hidden="true" />{guardandoWa ? t('Guardando…') : t('Guardar WhatsApp')}</button>
            </form>
          </div>
          <h2 className="titulo-seccion">{t('Mi negocio')}</h2>
          <div className="tarjeta">
            {misNegocios.length === 0 && <p className="muted">{t('¿Tienes un negocio u oficio? Ponlo en el mapa para que tus vecinos lo encuentren.')}</p>}
            {misNegocios.map((n) => (
              <div key={n.id} className="mi-negocio">
                <div className="fila"><span className={`ficha teal${n.logoBase64 ? ' logo' : ''}`}>{n.logoBase64 ? <img src={n.logoBase64} alt="" /> : <Store aria-hidden="true" />}</span><div style={{ flex: 1, minWidth: 0 }}><b>{n.nombre}</b><div className="muted">{n.rubro}</div></div>{n.estado === 'retirado' && <span className="chip pendiente">{t('Quitado del mapa')}</span>}</div>
                <div className="btn-fila envuelve" style={{ marginTop: 8 }}>
                  <button className="btn chico secundario" onClick={() => nav('/publicar', { state: { tipo: 'NEGOCIO', negocioId: n.id } })}><Pencil size={18} aria-hidden="true" />{t('Editar')}</button>
                  <button className="btn chico secundario" onClick={() => nav(`/negocio/${n.id}`, { state: { negocio: n } })}>{t('Ver página')}</button>
                  {n.estado !== 'retirado' && <button className="btn chico peligro" onClick={() => quitarNegocio(n)}><EyeOff size={18} aria-hidden="true" />{t('Quitar del mapa')}</button>}
                  <button className="btn chico peligro" onClick={() => eliminarNegocio(n)}><Trash2 size={18} aria-hidden="true" />{t('Eliminar')}</button>
                </div>
              </div>
            ))}
            <button className="btn secundario" style={{ marginTop: 12 }} onClick={() => nav('/publicar', { state: { tipo: 'NEGOCIO', negocioId: 'nuevo' } })}><Store aria-hidden="true" />{misNegocios.length ? t('Registrar otro negocio') : t('Registrar mi negocio')}</button>
            {misNegocios.length > 0 && <p className="nota" style={{ marginTop: 8 }}><span>{t('Quitar del mapa lo oculta y guarda tus datos para volver a ponerlo. Eliminar lo borra para siempre.')}</span></p>}
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
