// Tutorial de 3 pantallas. Se muestra solo la primera vez.
import { useState } from 'react'
import { Map, Plus, Siren } from 'lucide-react'
import { Logo } from '../lib/iconos'
import { useEstado } from '../lib/estado'

const PASOS = [
  { Icono: Map, color: '', titulo: 'Tu barrio en un mapa', texto: 'Mira negocios, oficios y vecinos a menos de 1 km. Cada uno dice cuántos vecinos de tu zona lo recomiendan.' },
  { Icono: Plus, color: 'maiz', titulo: 'Publica en 3 toques', texto: 'Toca Publicar, elige si Ofreces, Necesitas o Recomiendas, agrega foto o voz y listo. Funciona sin internet.' },
  { Icono: Siren, color: 'rojo', titulo: 'Modo Minka en emergencias', texto: 'Si hay un sismo o incendio, la app cambia a 3 botones: Estoy bien, Necesito ayuda, Puedo ayudar. Los vecinos se coordinan solos.' },
]

export default function Tutorial() {
  const { t } = useEstado()
  const [i, setI] = useState(0)
  const p = PASOS[i]
  const terminar = () => { localStorage.setItem('ayni_tutorial', '1'); window.location.href = '/' }
  return (
    <div className="tutorial">
      <div className="tutorial-marca">
        <Logo size={36} />
        <div className="marca-nombre">Ayni</div>
        <div className="faja" aria-hidden="true" />
      </div>
      <div className={`tutorial-ilustracion ficha ${p.color}`} aria-hidden="true"><p.Icono strokeWidth={1.75} /></div>
      <h1>{t(p.titulo)}</h1>
      <p>{t(p.texto)}</p>
      <div className="puntos-paso" role="img" aria-label={t('Paso {n} de {t}', { n: i + 1, t: PASOS.length })}>
        {PASOS.map((_, k) => <i key={k} className={k === i ? 'activo' : ''} />)}
      </div>
      {i < PASOS.length - 1
        ? <button className="btn" onClick={() => setI(i + 1)}>{t('Siguiente')}</button>
        : <button className="btn" onClick={terminar}>{t('Empezar')}</button>}
      <button className="btn secundario" onClick={terminar}>{t('Saltar')}</button>
    </div>
  )
}
