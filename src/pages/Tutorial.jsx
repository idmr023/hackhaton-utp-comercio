// Tutorial de 3 pantallas. Se muestra solo la primera vez.
import { useState } from 'react'

const PASOS = [
  { icono: '🗺️', fondo: '#d7eef5', titulo: 'Tu barrio en un mapa', texto: 'Mira negocios, oficios y vecinos a menos de 1 km. Cada uno dice cuántos vecinos de tu zona lo recomiendan.' },
  { icono: '➕', fondo: '#fff4cc', titulo: 'Publica en 3 toques', texto: 'Toca el botón +, elige si Ofreces, Necesitas o Recomiendas, agrega foto o voz y listo. Funciona sin internet.' },
  { icono: '🆘', fondo: '#fdecea', titulo: 'Modo Minka en emergencias', texto: 'Si hay un sismo o incendio, la app cambia a 3 botones: Estoy bien, Necesito ayuda, Puedo ayudar. Los vecinos se coordinan solos.' },
]

export default function Tutorial() {
  const [i, setI] = useState(0)
  const p = PASOS[i]
  const terminar = () => { localStorage.setItem('ayni_tutorial', '1'); window.location.href = '/' }
  return (
    <div className="tutorial">
      <div className="muted" style={{ fontWeight: 800, letterSpacing: 1 }}>🤝 AYNI · TU BARRIO SE AYUDA</div>
      <div className="tutorial-ilustracion" style={{ background: p.fondo }}>{p.icono}</div>
      <h1>{p.titulo}</h1>
      <p>{p.texto}</p>
      <div className="puntos-paso" aria-label={`${i + 1} de ${PASOS.length}`}>
        {PASOS.map((_, k) => <i key={k} className={k === i ? 'activo' : ''} />)}
      </div>
      {i < PASOS.length - 1
        ? <button className="btn" onClick={() => setI(i + 1)}>Siguiente</button>
        : <button className="btn" onClick={terminar}>Empezar</button>}
      <button className="btn secundario" onClick={terminar}>Saltar</button>
    </div>
  )
}
