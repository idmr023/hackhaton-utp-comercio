// Asistente "¿Cómo uso Ayni?": boton flotante con signo de pregunta que abre un chat. Responde con Gemini
// (contexto: lib/guia.js) y, sin internet o si falla, con el respaldo local. Puede llevar a la pantalla que explica.
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleHelp, X, Send, ArrowRight, Sparkles } from 'lucide-react'
import { useEstado } from './lib/estado'
import { preguntarGuia, nombreRuta } from './lib/guia'

const SUGERENCIAS = ['¿Cómo publico algo?', '¿Cómo gano puntos?', '¿Cómo pido ayuda en una emergencia?', '¿Cómo registro mi negocio?']

export default function Asistente() {
  const { t, idioma, usuario } = useEstado()
  const nav = useNavigate()
  const [abierto, setAbierto] = useState(false)
  const [mensajes, setMensajes] = useState([]) // { rol: 'usuario' | 'ayni', texto, ruta?, fuente? }
  const [texto, setTexto] = useState('')
  const [pensando, setPensando] = useState(false)
  const fin = useRef(null)
  const input = useRef(null)

  useEffect(() => { if (abierto) { fin.current?.scrollIntoView({ block: 'end' }); input.current?.focus() } }, [abierto, mensajes, pensando])

  async function preguntar(q) {
    const pregunta = (q || texto).trim()
    if (!pregunta || pensando) return
    setTexto('')
    const historial = [...mensajes, { rol: 'usuario', texto: pregunta }]
    setMensajes(historial); setPensando(true)
    const r = await preguntarGuia(mensajes, pregunta, idioma)
    setMensajes([...historial, { rol: 'ayni', ...r }])
    setPensando(false)
  }
  const ir = (ruta) => { setAbierto(false); nav(ruta) }

  return (
    <>
      <button type="button" className="btn-ayuda" aria-label={t('Ayuda: ¿cómo uso Ayni?')} aria-expanded={abierto} onClick={() => setAbierto(!abierto)}>
        {abierto ? <X aria-hidden="true" /> : <CircleHelp aria-hidden="true" />}
      </button>
      {abierto && (
        <section className="asistente" role="dialog" aria-label={t('Asistente de Ayni')}>
          <header className="asistente-cab">
            <span className="ficha chica"><Sparkles aria-hidden="true" /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <b>{t('¿Cómo uso Ayni?')}</b>
              <div className="muted">{t('Pregunta y te digo dónde tocar')}</div>
            </div>
            <button type="button" className="cerrar" aria-label={t('Cerrar')} onClick={() => setAbierto(false)}><X size={18} aria-hidden="true" /></button>
          </header>
          <div className="asistente-mensajes">
            <div className="msj ayni">{t('Hola, {nombre}. Soy la ayuda de Ayni. Pregúntame cómo hacer algo en la app.', { nombre: (usuario?.nombre || '').split(' ')[0] })}</div>
            {mensajes.length === 0 && (
              <div className="asistente-sugerencias">
                {SUGERENCIAS.map((s) => <button key={s} type="button" className="chip" onClick={() => preguntar(t(s))}>{t(s)}</button>)}
              </div>
            )}
            {mensajes.map((m, i) => (
              <div key={i} className={`msj ${m.rol}`}>
                {m.texto}
                {m.ruta && nombreRuta(m.ruta) && (
                  <button type="button" className="btn chico" style={{ marginTop: 8 }} onClick={() => ir(m.ruta)}><ArrowRight size={16} aria-hidden="true" />{t('Ir a {pantalla}', { pantalla: t(nombreRuta(m.ruta)) })}</button>
                )}
              </div>
            ))}
            {pensando && <div className="msj ayni pensando" aria-live="polite">{t('Pensando…')}</div>}
            <div ref={fin} />
          </div>
          <form className="asistente-form" onSubmit={(e) => { e.preventDefault(); preguntar() }}>
            <input ref={input} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={t('Escribe tu pregunta')} aria-label={t('Tu pregunta')} maxLength={200} />
            <button type="submit" className="btn" disabled={!texto.trim() || pensando} aria-label={t('Enviar')}><Send size={20} aria-hidden="true" /></button>
          </form>
        </section>
      )}
    </>
  )
}
