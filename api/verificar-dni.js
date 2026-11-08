// Funcion serverless de Vercel: POST /api/verificar-dni  { dni, nombre } -> { coincide: true|false|null, fuente }
// La API key de Didit se configura en Vercel como variable de entorno DIDIT_API_KEY (nunca VITE_, para que no llegue al navegador).
import { verificarDni } from '../server/didit.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ coincide: null, error: 'Usa POST' })
  let body = req.body
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
  const { dni, nombre } = body || {}
  const r = await verificarDni(dni, nombre, process.env.DIDIT_API_KEY)
  if (r.fuente === 'dni_invalido') return res.status(400).json({ coincide: null, error: 'DNI invalido' })
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json(r)
}
