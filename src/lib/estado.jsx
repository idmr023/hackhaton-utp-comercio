// Estado global simple: usuario, modo (barrio | minka), conexion, ubicacion, radio.
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { traducir } from './i18n'
import { ubicacionActual, celdaAprox, RADIO_DEFAULT_KM, RADIO_MINKA_KM, ubicacionDemoActiva, setUbicacionDemoActiva } from './geo'
import { activarAutoSync } from './offlineQueue'
import { inicializarDemoLocal, obtener } from './db'

const Ctx = createContext(null)

export function EstadoProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ayni_usuario')) } catch { return null }
  })
  const [modo, setModo] = useState(() => localStorage.getItem('ayni_modo') || 'barrio')
  const [online, setOnline] = useState(navigator.onLine)
  const [ubicacion, setUbicacion] = useState(null)   // exacta, solo en memoria
  const [radioKm, setRadioKm] = useState(RADIO_DEFAULT_KM)
  const [aviso, setAviso] = useState('')
  const [ubicacionDemo, setUbicacionDemoState] = useState(ubicacionDemoActiva)
  // Accesibilidad e idioma (Perfil): { letraGrande, altoContraste, quechua }
  const [prefs, setPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ayni_prefs')) || {} } catch { return {} }
  })
  const setPref = (k, v) => setPrefs((p) => ({ ...p, [k]: v }))
  useEffect(() => {
    try { localStorage.setItem('ayni_prefs', JSON.stringify(prefs)) } catch { /* sin storage */ }
    document.documentElement.classList.toggle('letra-grande', !!prefs.letraGrande)
    document.documentElement.classList.toggle('alto-contraste', !!prefs.altoContraste)
    document.documentElement.classList.toggle('daltonico', !!prefs.daltonico)
    document.documentElement.lang = prefs.idioma === 'qu' ? 'qu' : 'es'
  }, [prefs])
  // Idioma: 'es' | 'mixto' (espanol con frases en quechua) | 'qu' (todo en quechua). La pref vieja `quechua` = mixto.
  const idioma = prefs.idioma || (prefs.quechua ? 'mixto' : 'es')
  const t = useCallback((texto, vars) => traducir(idioma, texto, vars), [idioma])

  // Activa/apaga la ubicacion fija de Surquillo y vuelve a ubicar
  const setUbicacionDemo = (activa) => {
    setUbicacionDemoActiva(activa); setUbicacionDemoState(activa)
    setUbicacion(null); ubicacionActual().then(setUbicacion)
  }

  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false)
    window.addEventListener('online', on); window.addEventListener('offline', off)
    const quitar = activarAutoSync((n) => setAviso(`Se subieron ${n} publicaciones pendientes`))
    inicializarDemoLocal().then(() => ubicacionActual().then(setUbicacion))
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); quitar() }
  }, [])

  useEffect(() => { localStorage.setItem('ayni_modo', modo); setRadioKm(modo === 'minka' ? RADIO_MINKA_KM : RADIO_DEFAULT_KM) }, [modo])
  useEffect(() => { if (usuario) localStorage.setItem('ayni_usuario', JSON.stringify(usuario)) }, [usuario])
  // Foto y WhatsApp viven en `perfiles` (editable; `usuarios` no): se traen al entrar, por si se cambiaron en otro celular
  useEffect(() => {
    if (!usuario?.id) return
    obtener('perfiles', usuario.id).then((p) => {
      if (!p) return
      setUsuario((u) => (u?.id !== usuario.id ? u : {
        ...u,
        ...('fotoBase64' in p ? { fotoBase64: p.fotoBase64 || null } : {}),
        ...(p.whatsapp ? { whatsapp: p.whatsapp } : {}),
        ...(typeof p.whatsappVisible === 'boolean' ? { whatsappVisible: p.whatsappVisible } : {}),
      }))
    }).catch(() => {})
  }, [usuario?.id])
  useEffect(() => { if (aviso) { const t = setTimeout(() => setAviso(''), 4000); return () => clearTimeout(t) } }, [aviso])

  const value = {
    usuario, setUsuario, modo, setModo, online, ubicacion, radioKm, setRadioKm, aviso, setAviso,
    ubicacionDemo, setUbicacionDemo, prefs, setPref, idioma, t,
    // Ubicacion aproximada (celda ~300 m): es la que se guarda en cualquier documento.
    geoAprox: ubicacion ? celdaAprox(ubicacion) : null,
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useEstado = () => useContext(Ctx)
/** Funcion de traduccion de la UI: t('Texto en español') o t('{n} cosas', { n }). */
export const useT = () => useContext(Ctx).t
