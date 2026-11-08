// Publicar en 3 toques: (1) boton Publicar ya se toco  (2) elegir tipo  (3) texto/foto/voz + Publicar
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Mic, Camera, MapPin, WifiOff } from 'lucide-react'
import { useEstado } from '../lib/estado'
import { crear, conGeo, conTiempo, nuevoId } from '../lib/db'
import { encolar } from '../lib/offlineQueue'
import { clasificar } from '../lib/ia'
import { ICONO_TIPO } from '../lib/iconos'

const TIPOS = [
  { id: 'OFREZCO', titulo: 'Ofrezco', sub: 'un servicio o producto', color: '', ejemplo: 'Ej: Arreglo lavadoras a domicilio, S/ 30 la visita' },
  { id: 'NECESITO', titulo: 'Necesito', sub: 'ayuda o algo del barrio', color: 'terracota', ejemplo: 'Ej: Necesito gasfitero para una fuga hoy' },
  { id: 'RECOMIENDO', titulo: 'Recomiendo', sub: 'un negocio u oficio', color: 'maiz', ejemplo: 'Ej: La bodega de Doña Rosa fía y abre temprano' },
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

// Los 3 toques como barra de progreso (el toque 1 fue el boton Publicar del mapa)
const Pasos = ({ actual, t }) => (
  <div className="pasos" aria-label={t('Paso {n} de 3', { n: actual })}>
    {[1, 2, 3].map((n) => <i key={n} className={n < actual ? 'hecho' : n === actual ? 'actual' : ''} />)}
  </div>
)

export default function Publicar() {
  const { usuario, geoAprox, online, setAviso, t } = useEstado()
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
    if (!SR) return setAviso(t('Tu navegador no tiene dictado por voz; escribe el texto'))
    const r = new SR(); r.lang = 'es-PE'; r.interimResults = false
    r.onresult = (e) => setTexto((tx) => (tx + ' ' + e.results[0][0].transcript).trim())
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
        try { await conTiempo(crear('publicaciones', docu, id), 6000); setAviso(t('Publicado en tu barrio')) }
        catch (e) {
          if (e.message !== 'timeout') throw e
          // Senal debil: Firestore ya la tiene en su cola local y la sube sola (no encolar = no duplicar)
          setAviso(t('Señal débil: guardado, se subirá solo'))
        }
      } else { await encolar('publicaciones', docu, id); setAviso(t('Sin internet: guardado, se subirá solo')) }
      nav('/')
    } catch (e) {
      await encolar('publicaciones', docu, id); setAviso(t('Guardado en cola, se subirá luego'))
      nav('/')
    } finally { setEnviando(false) }
  }

  // TOQUE 2: elegir tipo
  if (!tipo) return (
    <div className="pantalla">
      <Pasos actual={2} t={t} />
      <h2>{t('¿Qué quieres publicar?')}</h2>
      <p className="muted">{t('Tus vecinos de hasta 1 km lo verán en el mapa.')}</p>
      <div className="tarjeta lista">
        {TIPOS.map((x) => {
          const Icono = ICONO_TIPO[x.id]
          return (
            <button key={x.id} className="opcion" onClick={() => setTipo(x.id)}>
              <span className={`ficha ${x.color}`}><Icono aria-hidden="true" /></span>
              <span className="opcion-texto"><span className="opcion-titulo">{t(x.titulo)}</span><span className="opcion-sub">{t(x.sub)}</span></span>
              <ChevronRight className="opcion-flecha" aria-hidden="true" />
            </button>
          )
        })}
      </div>
      <button className="btn secundario" onClick={() => nav(-1)}>{t('Cancelar')}</button>
    </div>
  )

  // TOQUE 3: contenido + Publicar
  const x = TIPOS.find((y) => y.id === tipo)
  const Icono = ICONO_TIPO[tipo]
  return (
    <div className="pantalla">
      <Pasos actual={3} t={t} />
      <div className="cabecera">
        <button className="btn-atras" aria-label={t('Atrás')} onClick={() => setTipo(null)}><ArrowLeft size={22} aria-hidden="true" /></button>
        <span className={`ficha ${x.color}`}><Icono aria-hidden="true" /></span>
        <div><h2>{t(x.titulo)}</h2><div className="muted">{t(x.sub)}</div></div>
      </div>
      <div className="campo">
        <label htmlFor="texto-pub">{t('¿Qué quieres decir?')}</label>
        <textarea id="texto-pub" rows={4} placeholder={t(x.ejemplo)} value={texto} onChange={(e) => setTexto(e.target.value)} autoFocus />
      </div>
      <div className="btn-fila">
        <button className="btn secundario" onClick={dictar} disabled={grabando}><Mic aria-hidden="true" />{grabando ? t('Escuchando…') : t('Hablar')}</button>
        <label className="btn secundario"><Camera aria-hidden="true" />{t('Foto')}
          <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
            onChange={async (e) => e.target.files[0] && setFoto(await comprimirFoto(e.target.files[0]))} />
        </label>
      </div>
      {foto && <img src={foto} alt={t('Foto que acompaña tu publicación')} className="foto-previa" />}
      <p className="nota">
        {online ? <MapPin aria-hidden="true" /> : <WifiOff aria-hidden="true" />}
        <span>{t('Se publica con tu ubicación aproximada.')}{!online && t(' Estás sin internet: se guardará y subirá solo.')}</span>
      </p>
      <button className="btn" disabled={!texto.trim() || enviando} onClick={publicar}>{enviando ? t('Publicando…') : t('Publicar')}</button>
    </div>
  )
}
