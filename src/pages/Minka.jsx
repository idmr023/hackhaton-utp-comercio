// Modo Minka (emergencia): 3 botones grandes + lista de necesidades/recursos cercanos.
// ESQUELETO para P3: falta el mapa Minka, el match automatico y el boletin (avisos_minka).
import { useEffect, useState } from 'react'
import { useEstado } from '../lib/estado'
import { crear, conGeo, listarCerca, listar } from '../lib/db'
import { CATEGORIAS_MINKA } from '../lib/ia'

const RECURSOS = ['enfermera', 'botiquin', 'generador', 'vehiculo', 'espacio', 'agua', 'comida']

export default function Minka() {
  const { usuario, geoAprox, ubicacion, radioKm, setModo, setAviso } = useEstado()
  const [paso, setPaso] = useState(null) // null | 'ayuda' | 'puedo'
  const [necesidades, setNecesidades] = useState([])
  const [recursos, setRecursos] = useState([])
  const [avisos, setAvisos] = useState([])

  async function cargar() {
    if (!ubicacion) return
    setNecesidades(await listarCerca('necesidades', ubicacion, radioKm, { estado: 'abierta' }))
    setRecursos(await listarCerca('recursos', ubicacion, radioKm, { disponible: true }))
    setAvisos(await listar('avisos_minka', {}, 10))
  }
  useEffect(() => { setModo('minka'); cargar() }, [ubicacion]) // eslint-disable-line

  async function estoyBien() {
    await crear('estados_minka', { autorId: usuario.id, autorNombre: usuario.nombre, estado: 'bien', zona: geoAprox })
    setAviso('Avisamos que estás bien ✔')
  }
  async function necesito(tipo, urgencia) {
    await crear('necesidades', conGeo({ autorId: usuario.id, autorNombre: usuario.nombre, tipo, urgencia, estado: 'abierta', asignadoA: null }, geoAprox))
    setAviso('Pedido enviado a tus vecinos'); setPaso(null); cargar()
    // TODO P3: match automatico -> buscar en `recursos` el mas cercano del mismo tipo y asignar
  }
  async function puedo(tipo) {
    await crear('recursos', conGeo({ autorId: usuario.id, autorNombre: usuario.nombre, tipo, disponible: true, asignadoA: null }, geoAprox))
    setAviso('Gracias, tu ayuda ya aparece en el mapa (+20 puntos al confirmar)'); setPaso(null); cargar()
  }

  if (paso === 'ayuda') return (
    <div className="pantalla">
      <h2>¿Qué necesitas?</h2>
      <div className="opciones-tipo">
        {CATEGORIAS_MINKA.map((t) => <button key={t} className="btn ayuda" onClick={() => necesito(t, 2)}>{t.toUpperCase()}</button>)}
      </div>
      <button className="btn secundario" onClick={() => setPaso(null)}>Atrás</button>
    </div>
  )
  if (paso === 'puedo') return (
    <div className="pantalla">
      <h2>¿Con qué puedes ayudar?</h2>
      <div className="opciones-tipo">
        {RECURSOS.map((t) => <button key={t} className="btn puedo" onClick={() => puedo(t)}>{t.toUpperCase()}</button>)}
      </div>
      <button className="btn secundario" onClick={() => setPaso(null)}>Atrás</button>
    </div>
  )

  return (
    <div className="pantalla">
      <button className="btn gigante bien" onClick={estoyBien}>✅ ESTOY BIEN</button>
      <button className="btn gigante ayuda" onClick={() => setPaso('ayuda')}>🆘 NECESITO AYUDA</button>
      <button className="btn gigante puedo" onClick={() => setPaso('puedo')}>🤝 PUEDO AYUDAR</button>

      <div className="tarjeta">
        <h3>Cerca de ti ({radioKm} km)</h3>
        <div>🔴 {necesidades.length} necesidades abiertas · 🟢 {recursos.length} recursos disponibles</div>
        {necesidades.slice(0, 5).map((n) => <div key={n.id} className="muted">• {n.tipo} (urgencia {n.urgencia}) a {(n.distanciaKm * 1000).toFixed(0)} m — {n.autorNombre}</div>)}
      </div>

      <div className="tarjeta">
        <h3>📰 Boletín Minka</h3>
        {avisos.length === 0 && <div className="muted">Sin avisos aún. (P3: cargar avisos_minka de ejemplo)</div>}
        {avisos.map((a) => <div key={a.id}>• {a.texto}</div>)}
      </div>
    </div>
  )
}
