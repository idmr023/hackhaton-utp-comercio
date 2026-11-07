// Puntos Ayni: saldo, catalogo de recompensas y canje con codigo de 6 digitos.
// ESQUELETO para P3: falta confirmar ayudas (codigo de 4 digitos + < 200 m) y reglas antifraude.
import { useEffect, useState } from 'react'
import { useEstado } from '../lib/estado'
import { listar, crear } from '../lib/db'

export default function Puntos() {
  const { usuario, setAviso } = useEstado()
  const [recompensas, setRecompensas] = useState([])
  useEffect(() => { listar('recompensas').then(setRecompensas) }, [])

  async function canjear(r) {
    if ((usuario.puntosAyni || 0) < r.costoPuntos) return setAviso('Te faltan puntos. Ayuda a un vecino para ganar más.')
    const codigo6 = String(Math.floor(100000 + Math.random() * 900000))
    await crear('canjes', { usuarioId: usuario.id, recompensaId: r.id, negocioId: r.negocioId, codigo6, estado: 'pendiente' })
    setAviso(`Código ${codigo6}: muéstralo en ${r.negocioNombre || 'el negocio'}`)
    // TODO P3: restar puntos al usuario (actualizar('usuarios', ...)) y limite 1 canje/negocio/semana
  }

  return (
    <div className="pantalla">
      <div className="tarjeta" style={{ textAlign: 'center' }}>
        <div className="muted">Tus puntos Ayni</div>
        <div style={{ fontSize: 48, fontWeight: 800 }}>{usuario.puntosAyni || 0}</div>
        <div className="muted">Ayuda confirmada +10 · Recomendación +2 · Minka +20</div>
      </div>
      <h3>Canjea en negocios de tu barrio</h3>
      {recompensas.length === 0 && <div className="muted">Aún no hay recompensas. (P3: cargar 3 de ejemplo en `recompensas`)</div>}
      {recompensas.map((r) => (
        <div key={r.id} className="tarjeta">
          <h3>{r.titulo}</h3>
          <div className="muted">{r.negocioNombre} · {r.costoPuntos} puntos · stock {r.stock}</div>
          <button className="btn" style={{ marginTop: 8 }} onClick={() => canjear(r)}>Canjear</button>
        </div>
      ))}
    </div>
  )
}
