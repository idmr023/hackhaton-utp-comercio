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
  const { usuario, setAviso, t } = useEstado()
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
      if (s < r.costoPuntos) return setAviso(t('Te faltan {n} puntos. Ayuda a un vecino para ganar más.', { n: r.costoPuntos - s }))
      if ((usados[r.id] || 0) >= r.stock) return setAviso(t('Se agotó esta recompensa. Prueba otra.'))
      const mios = await listar('canjes', { usuarioId: usuario.id }, 200)
      if (mios.some((c) => c.negocioId === r.negocioId && Date.now() - msFecha(c.fecha) < 7 * DIA)) {
        return setAviso(t('Ya canjeaste aquí esta semana. Prueba otro negocio.'))
      }
      const codigo6 = String(Math.floor(100000 + Math.random() * 900000))
      await crearSeguro('canjes', {
        autorId: usuario.id, usuarioId: usuario.id, recompensaId: r.id, negocioId: r.negocioId, negocioNombre: r.negocioNombre,
        titulo: r.titulo, costoPuntos: r.costoPuntos, codigo6, estado: 'pendiente',
      })
      setAviso(t('Tu código: {c}. Muéstralo en {neg}. Vence en 7 días.', { c: conEspacio(codigo6), neg: r.negocioNombre }))
      await cargar()
    } catch (e) {
      console.error('Canje fallo', e)
      setAviso(t('No se pudo canjear. Intenta de nuevo.'))
    } finally { setEnviando(false) }
  }

  return (
    <div className="pantalla ancha">
     <div className="columnas-2">
     <div>
      <div className="hero-puntos">
        <div>
          <div className="etiqueta">{t('Tus puntos Ayni')}</div>
          <div className="numero" aria-live="polite">{saldo ?? '…'}</div>
        </div>
        <span className="ficha"><Coins aria-hidden="true" /></span>
        <div className="chips">
          <span className="chip"><HeartHandshake aria-hidden="true" />{t('Ayuda confirmada +10')}</span>
          <span className="chip"><Star aria-hidden="true" />{t('Recomendación +2')}</span>
          <span className="chip"><Siren aria-hidden="true" />{t('Minka +20')}</span>
        </div>
      </div>

      {misCanjes.length > 0 && (
        <div className="tarjeta tarjeta-codigos">
          <h3 className="fila-icono"><Ticket size={20} style={{ color: 'var(--verde)' }} aria-hidden="true" />{t('Tus códigos de canje')}</h3>
          {misCanjes.map((c) => (
            <div key={c.id} style={{ marginTop: 10 }}>
              <div className="codigo-canje">{conEspacio(c.codigo6)}</div>
              <div>{t('{t}, en {neg}', { t: c.titulo, neg: c.negocioNombre })}</div>
              <div className="muted">{t('Vence el {f}', { f: venceEl(c.fecha) })}</div>
            </div>
          ))}
        </div>
      )}
     </div>

     <div>
      <h2 className="titulo-seccion">{t('Canjea en negocios de tu barrio')}</h2>
      {recompensas.length === 0 && <div className="muted">{t('Aún no hay recompensas en tu barrio.')}</div>}
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
                <div className="chips" style={{ marginTop: 6 }}><span className="chip maiz">{t('{n} puntos', { n: r.costoPuntos })}</span><span className="muted">{t('quedan {n}', { n: quedan })}</span></div>
              </div>
              <button className="btn chico" disabled={enviando || quedan === 0} onClick={() => canjear(r)}>
                {quedan === 0 ? t('Agotado') : t('Canjear')}
              </button>
            </div>
          )
        })}
      </div>}
     </div>
     </div>
    </div>
  )
}
