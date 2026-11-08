// Publicar en 3 toques: (1) boton + ya se toco  (2) elegir tipo  (3) texto/foto/voz + Publicar
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEstado } from '../lib/estado'
import { crear, conGeo, conTiempo, nuevoId } from '../lib/db'
import { encolar } from '../lib/offlineQueue'
import { clasificar } from '../lib/ia'

const TIPOS = [
  { id: 'OFREZCO', emoji: '🛠️', titulo: 'Ofrezco', sub: 'un servicio o producto', fondo: '#d7eef5' },
  { id: 'NECESITO', emoji: '🙋', titulo: 'Necesito', sub: 'ayuda o algo del barrio', fondo: '#fde7d2' },
  { id: 'RECOMIENDO', emoji: '⭐', titulo: 'Recomiendo', sub: 'un negocio u oficio', fondo: '#fff4cc' },
]

/** Comprime una foto a ~800px / JPEG 0.6 y devuelve base64 (sin Firebase Storage). */
function comprimirFoto(file) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const esc = Math.min(1, 800 / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = img.width * esc; c.height = img.height * esc
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      resolve(c.toDataURL('image/jpeg', 0.6))
    }
    img.src = URL.createObjectURL(file)
  })
}

export default function Publicar() {
  const { usuario, geoAprox, online, setAviso } = useEstado()
  const [tipo, setTipo] = useState(null)
  const [texto, setTexto] = useState('')
  const [foto, setFoto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [grabando, setGrabando] = useState(false)
  const nav = useNavigate()
  const rec = useRef(null)

  // Nota de voz -> texto con el reconocimiento del navegador (Chrome Android lo tiene)
  function dictar() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return setAviso('Tu navegador no tiene dictado por voz; escribe el texto')
    const r = new SR(); r.lang = 'es-PE'; r.interimResults = false
    r.onresult = (e) => setTexto((t) => (t + ' ' + e.results[0][0].transcript).trim())
    r.onend = () => setGrabando(false)
    rec.current = r; setGrabando(true); r.start()
  }

  async function publicar() {
    if (!tipo || !texto.trim() || !geoAprox) return
    setEnviando(true)
    const { categoria, fuente } = await clasificar(texto)
    const docu = conGeo({
      tipo, texto: texto.trim(), categoria, categoriaFuente: fuente, fotoBase64: foto || null,
      autorId: usuario.id, autorNombre: usuario.nombre, estado: online ? 'activa' : 'enCola',
      autorWhatsapp: usuario.whatsappVisible ? usuario.telefono : null, // solo si acepto mostrarlo
    }, geoAprox)
    const id = nuevoId('publicaciones') // mismo id en cualquier reintento: nunca se duplica
    try {
      if (online) {
        try { await conTiempo(crear('publicaciones', docu, id), 6000); setAviso('Publicado en tu barrio ✔') }
        catch (e) {
          if (e.message !== 'timeout') throw e
          // Senal debil: Firestore ya la tiene en su cola local y la sube sola (no encolar = no duplicar)
          setAviso('Señal débil: guardado, se subirá solo')
        }
      } else { await encolar('publicaciones', docu, id); setAviso('Sin internet: guardado, se subirá solo') }
      nav('/')
    } catch (e) {
      await encolar('publicaciones', docu, id); setAviso('Guardado en cola, se subirá luego')
      nav('/')
    } finally { setEnviando(false) }
  }

  // TOQUE 2: elegir tipo
  if (!tipo) return (
    <div className="pantalla">
      <h2>¿Qué quieres publicar?</h2>
      <p className="muted" style={{ marginTop: -8 }}>Tus vecinos de hasta 1 km lo verán en el mapa.</p>
      <div className="opciones-tipo">
        {TIPOS.map((t) => (
          <button key={t.id} className="opcion" onClick={() => setTipo(t.id)}>
            <span className="opcion-icono" style={{ background: t.fondo }}>{t.emoji}</span>
            <span><span className="opcion-titulo">{t.titulo}</span><span className="opcion-sub">{t.sub}</span></span>
            <span className="opcion-flecha">›</span>
          </button>
        ))}
      </div>
      <button className="btn secundario" onClick={() => nav(-1)}>Cancelar</button>
    </div>
  )

  // TOQUE 3: contenido + Publicar
  return (
    <div className="pantalla">
      <div className="fila">
        <span className="opcion-icono" style={{ background: TIPOS.find((t) => t.id === tipo).fondo }}>{TIPOS.find((t) => t.id === tipo).emoji}</span>
        <div><h2>{TIPOS.find((t) => t.id === tipo).titulo}</h2><div className="muted">{TIPOS.find((t) => t.id === tipo).sub}</div></div>
      </div>
      <textarea rows={4} placeholder="Ej: Necesito gasfitero para una fuga hoy" value={texto} onChange={(e) => setTexto(e.target.value)} autoFocus />
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn secundario" onClick={dictar} disabled={grabando}>{grabando ? '🎙️ Escuchando…' : '🎙️ Hablar'}</button>
        <label className="btn secundario" style={{ cursor: 'pointer' }}>📷 Foto
          <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
            onChange={async (e) => e.target.files[0] && setFoto(await comprimirFoto(e.target.files[0]))} />
        </label>
      </div>
      {foto && <img src={foto} alt="" style={{ maxHeight: 180, borderRadius: 14, objectFit: 'cover', boxShadow: 'var(--sombra)' }} />}
      <p className="muted">📍 Se publica con tu ubicación aproximada. {!online && 'Estás sin internet: se guardará y subirá solo.'}</p>
      <button className="btn" disabled={!texto.trim() || enviando} onClick={publicar}>{enviando ? 'Publicando…' : 'Publicar'}</button>
      <button className="btn secundario" onClick={() => setTipo(null)}>Atrás</button>
    </div>
  )
}
