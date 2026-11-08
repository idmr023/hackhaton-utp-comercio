// Puntos Ayni: saldo (libro de movimientos, ver lib/puntos.js), catalogo de recompensas y canje con codigo de 6 digitos.
// Antifraude del canje: no alcanza el saldo, 1 canje por negocio por semana, stock = stock - canjes hechos.
import { useEffect, useState } from 'react'
import { Coins, Ticket, HeartHandshake, Star, Siren } from 'lucide-react'
import { useEstado } from '../lib/estado'
import { listar, crearSeguro } from '../lib/db'
import { saldoPuntos, msFecha } from '../lib/puntos'
import { iconoRubro } from '../lib/iconos'

const DIA = 864e5
const conEspacio = (c) => `${c.slice(0, 3)} ${c.slice(3)}`
const venceEl = (f) => new Date(msFecha(f) + 7 * DIA).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })

export default function Puntos() {
  const { usuario, setAviso } = useEstado()
  const [saldo, setSaldo] = useState(null)
  const [recompensas, setRecompensas] = useState([])
  const [usados, setUsados] = useState({}) // recompensaId -> canjes hechos
  const [misCanjes, setMisCanjes] = useState([])
  const [enviando, setEnviando] = useState(false)

  async function cargar() {
    try {
      const [s, recs, todos] = await Promise.all([saldoPuntos(usuario.id), listar('recompensas'), listar('canjes', {}, 1000)])
      setSaldo(s)
      setRecompensas(recs)
      const u = {}
      for (const c of todos) u[c.recompensaId] = (u[c.recompensaId] || 0) + 1
      setUsados(u)
      setMisCanjes(todos.filter((c) => c.usuarioId === usuario.id).sort((a, b) => msFecha(b.fecha) - msFecha(a.fecha)).slice(0, 3))
    } catch (e) { console.warn('Puntos: no se pudo cargar', e) }
  }
  useEffect(() => { cargar() }, []) // eslint-disable-line

  async function canjear(r) {
    setEnviando(true)
    try {
      const s = await saldoPuntos(usuario.id)
      if (s < r.costoPuntos) return setAviso(`Te faltan ${r.costoPuntos - s} puntos. Ayuda a un vecino para ganar más.`)
      if ((usados[r.id] || 0) >= r.stock) return setAviso('Se agotó esta recompensa. Prueba otra.')
      const mios = await listar('canjes', { usuarioId: usuario.id }, 200)
      if (mios.some((c) => c.negocioId === r.negocioId && Date.now() - msFecha(c.fecha) < 7 * DIA)) {
        return setAviso('Ya canjeaste aquí esta semana. Prueba otro negocio.')
      }
      const codigo6 = String(Math.floor(100000 + Math.random() * 900000))
      await crearSeguro('canjes', {
        autorId: usuario.id, usuarioId: usuario.id, recompensaId: r.id, negocioId: r.negocioId, negocioNombre: r.negocioNombre,
        titulo: r.titulo, costoPuntos: r.costoPuntos, codigo6, estado: 'pendiente',
      })
      setAviso(`Tu código: ${conEspacio(codigo6)}. Muéstralo en ${r.negocioNombre}. Vence en 7 días.`)
      await cargar()
    } catch (e) {
      console.error('Canje fallo', e)
      setAviso('No se pudo canjear. Intenta de nuevo.')
    } finally { setEnviando(false) }
  }

  return (
    <div className="pantalla">
      <div className="hero-puntos">
        <div>
          <div className="etiqueta">Tus puntos Ayni</div>
          <div className="numero" aria-live="polite">{saldo ?? '…'}</div>
        </div>
        <span className="ficha"><Coins aria-hidden="true" /></span>
        <div className="chips">
          <span className="chip"><HeartHandshake aria-hidden="true" />Ayuda confirmada +10</span>
          <span className="chip"><Star aria-hidden="true" />Recomendación +2</span>
          <span className="chip"><Siren aria-hidden="true" />Minka +20</span>
        </div>
      </div>

      {misCanjes.length > 0 && (
        <div className="tarjeta tarjeta-codigos">
          <h3 className="fila-icono"><Ticket size={20} style={{ color: 'var(--verde)' }} aria-hidden="true" />Tus códigos de canje</h3>
          {misCanjes.map((c) => (
            <div key={c.id} style={{ marginTop: 10 }}>
              <div className="codigo-canje">{conEspacio(c.codigo6)}</div>
              <div>{c.titulo}, en {c.negocioNombre}</div>
              <div className="muted">Vence el {venceEl(c.fecha)}</div>
            </div>
          ))}
        </div>
      )}

      <h2 className="titulo-seccion">Canjea en negocios de tu barrio</h2>
      {recompensas.length === 0 && <div className="muted">Aún no hay recompensas en tu barrio.</div>}
      {recompensas.length > 0 && <div className="tarjeta lista">
        {recompensas.map((r) => {
          const quedan = Math.max(0, r.stock - (usados[r.id] || 0))
          const Icono = iconoRubro(r.negocioNombre)
          return (
            <div key={r.id} className="recompensa">
              <span className="ficha"><Icono aria-hidden="true" /></span>
              <div className="recompensa-info">
                <h3>{r.titulo}</h3>
                <div className="muted">{r.negocioNombre}</div>
                <div className="chips" style={{ marginTop: 6 }}><span className="chip maiz">{r.costoPuntos} puntos</span><span className="muted">quedan {quedan}</span></div>
              </div>
              <button className="btn chico" disabled={enviando || quedan === 0} onClick={() => canjear(r)}>
                {quedan === 0 ? 'Agotado' : 'Canjear'}
              </button>
            </div>
          )
        })}
      </div>}
    </div>
  )
}
