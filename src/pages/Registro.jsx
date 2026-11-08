// Entrar / Crear cuenta.
// Crear cuenta: nombre + celular + DNI (validado en RENIEC via Didit; se guarda solo el hash) + PIN de 4 a 6 digitos.
// Entrar: celular + PIN. La huella del PIN vive en la coleccion `accesos` (id = usuario.id, autorId = usuario.id),
// porque los documentos de `usuarios` no tienen autorId y las reglas no dejan editarlos.
// Si la cuenta ya existe (mismo celular + DNI), "Crear cuenta" la recupera y fija un PIN nuevo: asi se recupera un PIN olvidado.
import { useState } from 'react'
import { Lock, CircleAlert, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react'
import { useEstado } from '../lib/estado'
import { crear, listar, obtener, conTiempo, crearSeguro } from '../lib/db'
import { sha256 } from '../lib/hash'
import { Logo } from '../lib/iconos'

const KEY_ULTIMO = 'ayni_ultimo_celular'
const hashPin = (pin, dniHash) => sha256(`${pin}|${dniHash}`) // el hash del DNI hace de sal

export default function Registro() {
  const { setUsuario, geoAprox, setAviso, t } = useEstado()
  const ultimo = (() => { try { return localStorage.getItem(KEY_ULTIMO) || '' } catch { return '' } })()
  const [modo, setModo] = useState(ultimo ? 'entrar' : 'crear') // 'entrar' | 'crear'
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState(ultimo)
  const [dni, setDni] = useState('')
  const [pin, setPin] = useState('')
  const [verPin, setVerPin] = useState(false)
  const [consiente, setConsiente] = useState(false)
  const [whatsappVisible, setWhatsappVisible] = useState(true)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const celularOk = /^9\d{8}$/.test(telefono)
  const pinOk = /^\d{4,6}$/.test(pin)
  const validoCrear = nombre.trim().length >= 2 && celularOk && /^\d{8}$/.test(dni) && pinOk && consiente
  const validoEntrar = celularOk && pinOk

  function entrarCon(u) {
    try { localStorage.setItem(KEY_ULTIMO, u.telefono) } catch { /* sin storage */ }
    setUsuario(u)
  }

  // ENTRAR: celular + PIN. Puede haber mas de una cuenta con el mismo celular (pruebas): entra la que coincida.
  async function entrar() {
    setCargando(true); setError('')
    try {
      const cuentas = await conTiempo(listar('usuarios', { telefono }, 10), 8000)
      if (!cuentas.length) return setError(t('No hay ninguna cuenta con ese celular. Crea una.'))
      let sinPin = 0
      for (const u of cuentas) {
        const acceso = await obtener('accesos', u.id).catch(() => null)
        if (!acceso?.pinHash) { sinPin++; continue }
        if (acceso.pinHash === await hashPin(pin, u.dniHash)) {
          entrarCon(u)
          setAviso(t('¡Hola de nuevo, {nombre}!', { nombre: u.nombre.split(' ')[0] }))
          return
        }
      }
      setError(sinPin === cuentas.length
        ? t('Esta cuenta aún no tiene PIN. Toca "Crear cuenta", escribe tu mismo celular y DNI y elige tu PIN.')
        : t('El PIN no coincide. Si lo olvidaste, crea uno nuevo con tu DNI en "Crear cuenta".'))
    } catch (e) {
      console.error('Entrar fallo', e)
      setError(t('No pudimos entrar. Revisa tu internet e intenta de nuevo.'))
    } finally { setCargando(false) }
  }

  // CREAR CUENTA (o recuperar la existente con el mismo celular + DNI, fijando un PIN nuevo)
  async function registrar() {
    setCargando(true); setError('')
    try {
      const dniHash = await sha256(dni)
      const pinHash = await hashPin(pin, dniHash)
      // Mismo celular + DNI = ya tiene cuenta (otro celular u otro link): entra a esa, sin duplicar ni gastar Didit
      try {
        const [existente] = await conTiempo(listar('usuarios', { telefono, dniHash }, 1), 5000)
        if (existente) {
          await crearSeguro('accesos', { autorId: existente.id, usuarioId: existente.id, telefono, pinHash }, existente.id)
          entrarCon(existente)
          setAviso(t('¡Hola de nuevo, {nombre}! Tu PIN quedó guardado.', { nombre: existente.nombre.split(' ')[0] }))
          return
        }
      } catch { /* sin senal: sigue el registro normal */ }

      let verificacion = 'pendiente'
      try {
        const r = await fetch('/api/verificar-dni', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dni, nombre }),
          signal: AbortSignal.timeout(8000),
        })
        const j = await r.json()
        if (j.coincide === true) verificacion = 'reniec'
        if (j.coincide === false) { setError(t('El DNI no coincide con RENIEC. Revísalo.')); return }
      } catch {
        // servidor apagado o sin internet -> respaldo: pendiente de verificacion
      }
      const u = {
        nombre: nombre.trim(), telefono, whatsappVisible, dniHash,
        verificacion,              // 'reniec' | 'pendiente'
        verificado: false,          // true cuando tenga 2 avales
        avales: [], puntosAyni: 0, zonaAprox: geoAprox || null, idioma: 'es',
      }
      try { u.id = await conTiempo(crear('usuarios', u), 5000) } catch { u.id = 'local_' + Date.now() }
      await crearSeguro('accesos', { autorId: u.id, usuarioId: u.id, telefono, pinHash }, u.id)
      entrarCon(u)
    } catch (e) {
      console.error('Registro fallo', e)
      setError(t('No pudimos crear tu cuenta. Intenta de nuevo.'))
    } finally {
      setCargando(false)
    }
  }

  const campoPin = (id) => (
    <div className="campo">
      <label htmlFor={id}>{t('PIN')} <span className="muted">{t('(4 a 6 números, para entrar después)')}</span></label>
      <div className="campo-pin">
        <input id={id} type={verPin ? 'text' : 'password'} inputMode="numeric" maxLength={6} autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
          placeholder="••••" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} />
        <button type="button" className="btn-atras" aria-label={verPin ? t('Ocultar PIN') : t('Ver PIN')} onClick={() => setVerPin(!verPin)}>
          {verPin ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
        </button>
      </div>
    </div>
  )

  return (
    <div className="portada">
      <div className="portada-cabecera">
        <div className="marca">
          <Logo size={40} />
          <div className="marca-texto"><div className="marca-nombre">Ayni</div><div className="marca-lema">{t('tu barrio se ayuda')}</div></div>
        </div>
        <h1>{modo === 'entrar' ? t('Entra a tu barrio') : t('Crea tu cuenta de vecino')}</h1>
        <p>{t('Con tu celular y tu DNI entras a tu barrio. Lo que necesitas está a unas cuadras.')}</p>
      </div>
      <div className="portada-cuerpo">
        <div className="segmentos" role="tablist" style={{ background: 'var(--superficie)', boxShadow: 'var(--flota)' }}>
          <button role="tab" aria-selected={modo === 'entrar'} className={modo === 'entrar' ? 'activo' : ''} onClick={() => { setModo('entrar'); setError('') }}><LogIn size={18} aria-hidden="true" />{t('Entrar')}</button>
          <button role="tab" aria-selected={modo === 'crear'} className={modo === 'crear' ? 'activo' : ''} onClick={() => { setModo('crear'); setError('') }}><UserPlus size={18} aria-hidden="true" />{t('Crear cuenta')}</button>
        </div>

        {modo === 'entrar' ? (
          <form className="tarjeta" onSubmit={(e) => { e.preventDefault(); if (validoEntrar && !cargando) entrar() }}>
            <div className="campo">
              <label htmlFor="ent-celular">{t('Celular')}</label>
              <input id="ent-celular" placeholder={t('9 dígitos')} inputMode="numeric" autoComplete="tel-national" maxLength={9} value={telefono} onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))} />
            </div>
            {campoPin('ent-pin')}
            {error && <div className="error" role="alert"><CircleAlert size={20} aria-hidden="true" />{error}</div>}
            <button type="submit" className="btn" disabled={!validoEntrar || cargando}>{cargando ? t('Entrando…') : t('Entrar')}</button>
            <button type="button" className="btn secundario" onClick={() => { setModo('crear'); setError('') }}>{t('¿Olvidaste tu PIN? Crea uno nuevo con tu DNI')}</button>
          </form>
        ) : (
          <form className="tarjeta" onSubmit={(e) => { e.preventDefault(); if (validoCrear && !cargando) registrar() }}>
            <div className="campo">
              <label htmlFor="reg-nombre">{t('Tu nombre')}</label>
              <input id="reg-nombre" autoComplete="name" placeholder={t('Ej: Rosa Quispe')} value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            <div className="campo">
              <label htmlFor="reg-celular">{t('Celular')}</label>
              <input id="reg-celular" placeholder={t('9 dígitos')} inputMode="numeric" autoComplete="tel-national" maxLength={9} value={telefono} onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))} />
            </div>
            <div className="campo">
              <label htmlFor="reg-dni">{t('DNI')}</label>
              <input id="reg-dni" placeholder={t('8 dígitos')} inputMode="numeric" maxLength={8} value={dni} onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))} />
            </div>
            {campoPin('reg-pin')}
            <label className="check">
              <input type="checkbox" checked={consiente} onChange={(e) => setConsiente(e.target.checked)} />
              <span>{t('Autorizo validar mi DNI en RENIEC. Ayni guarda solo una huella (hash), nunca mi número de DNI.')}</span>
            </label>
            <label className="check">
              <input type="checkbox" checked={whatsappVisible} onChange={(e) => setWhatsappVisible(e.target.checked)} />
              <span>{t('Mostrar mi WhatsApp a los vecinos que quieran contactarme')}</span>
            </label>
            {error && <div className="error" role="alert"><CircleAlert size={20} aria-hidden="true" />{error}</div>}
            <button type="submit" className="btn" disabled={!validoCrear || cargando}>{cargando ? t('Verificando…') : t('Entrar a mi barrio')}</button>
            <p className="muted" style={{ margin: 0 }}>{t('¿Ya tienes cuenta? Con el mismo celular y DNI la recuperas y eliges un PIN nuevo.')}</p>
          </form>
        )}
        <p className="nota"><Lock aria-hidden="true" /><span>{t('Tu ubicación se guarda aproximada (~300 m). Nadie ve tu casa exacta.')}</span></p>
      </div>
    </div>
  )
}
