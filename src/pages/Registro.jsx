// Registro: telefono + DNI. El DNI se valida en RENIEC via el mini servidor (Didit).
// Se guarda solo el HASH del DNI. Si Didit no responde: estado "pendiente".
// TODO (sab): reemplazar el telefono por Firebase Auth con SMS (signInWithPhoneNumber).
import { useState } from 'react'
import { useEstado } from '../lib/estado'
import { crear } from '../lib/db'
import { sha256 } from '../lib/hash'

// Sin senal Firestore guarda local pero no confirma: no esperar para siempre
const conTiempo = (promesa, ms) =>
  Promise.race([promesa, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))])

export default function Registro() {
  const { setUsuario, geoAprox } = useEstado()
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [dni, setDni] = useState('')
  const [consiente, setConsiente] = useState(false)
  const [whatsappVisible, setWhatsappVisible] = useState(true)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const valido = nombre.trim().length >= 2 && /^9\d{8}$/.test(telefono) && /^\d{8}$/.test(dni) && consiente

  async function registrar() {
    setCargando(true); setError('')
    try {
      let verificacion = 'pendiente'
      try {
        const r = await fetch('/api/verificar-dni', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dni, nombre }),
          signal: AbortSignal.timeout(8000),
        })
        const j = await r.json()
        if (j.coincide === true) verificacion = 'reniec'
        if (j.coincide === false) { setError('El DNI no coincide con RENIEC. Revísalo.'); return }
      } catch {
        // servidor apagado o sin internet -> respaldo: pendiente de verificacion
      }
      const dniHash = await sha256(dni)
      const u = {
        nombre: nombre.trim(), telefono, whatsappVisible, dniHash,
        verificacion,              // 'reniec' | 'pendiente'
        verificado: false,          // true cuando tenga 2 avales
        avales: [], puntosAyni: 0, zonaAprox: geoAprox || null, idioma: 'es',
      }
      try { u.id = await conTiempo(crear('usuarios', u), 5000) } catch { u.id = 'local_' + Date.now() }
      setUsuario(u)
    } catch (e) {
      console.error('Registro fallo', e)
      setError('No pudimos crear tu cuenta. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="pantalla" style={{ minHeight: '100dvh', justifyContent: 'center' }}>
      <h1>Crea tu cuenta de vecino</h1>
      <input placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      <input placeholder="Celular (9 dígitos)" inputMode="numeric" maxLength={9} value={telefono} onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))} />
      <input placeholder="DNI (8 dígitos)" inputMode="numeric" maxLength={8} value={dni} onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))} />
      <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 15 }}>
        <input type="checkbox" style={{ width: 24 }} checked={consiente} onChange={(e) => setConsiente(e.target.checked)} />
        Autorizo validar mi DNI en RENIEC. Ayni guarda solo una huella (hash), nunca mi número de DNI.
      </label>
      <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 15 }}>
        <input type="checkbox" style={{ width: 24 }} checked={whatsappVisible} onChange={(e) => setWhatsappVisible(e.target.checked)} />
        Mostrar mi WhatsApp a los vecinos que quieran contactarme
      </label>
      {error && <div style={{ color: 'var(--rojo)' }}>{error}</div>}
      <button className="btn" disabled={!valido || cargando} onClick={registrar}>{cargando ? 'Verificando…' : 'Entrar a mi barrio'}</button>
      <p className="muted">Tu ubicación se guarda aproximada (~300 m). Nadie ve tu casa exacta.</p>
    </div>
  )
}
