// Mini servidor Node: unico lugar donde vive la API key de Didit (RENIEC).
// Correr con: npm run server   (puerto 3001; Vite hace proxy de /api -> aqui)
import express from 'express'
import 'dotenv/config'

const app = express()
app.use(express.json())

const DIDIT_KEY = process.env.DIDIT_API_KEY
const cacheDni = new Map() // evita gastar verificaciones repetidas en la demo

app.get('/api/salud', (_, res) => res.json({ ok: true, didit: Boolean(DIDIT_KEY) }))

// POST /api/verificar-dni  { dni, nombre }  ->  { coincide: true|false|null, fuente }
app.post('/api/verificar-dni', async (req, res) => {
  const { dni, nombre } = req.body || {}
  if (!/^\d{8}$/.test(dni || '')) return res.status(400).json({ coincide: null, error: 'DNI invalido' })
  if (!DIDIT_KEY) return res.json({ coincide: null, fuente: 'sin_clave' })        // respaldo: pendiente
  if (cacheDni.has(dni)) return res.json({ coincide: cacheDni.get(dni), fuente: 'cache' })
  try {
    const form = new FormData()
    form.append('issuing_state', 'PER')
    form.append('services', 'per_dni')
    form.append('personal_number', dni)
    if (nombre) form.append('first_name', nombre.split(' ')[0])
    const r = await fetch('https://verification.didit.me/v3/database-validation/', {
      method: 'POST', headers: { 'x-api-key': DIDIT_KEY }, body: form, signal: AbortSignal.timeout(10000),
    })
    const j = await r.json()
    // match_type: full_match | partial_match | no_match
    const coincide = j.match_type === 'full_match' || j.match_type === 'partial_match' ? true
      : j.match_type === 'no_match' ? false : null
    if (coincide !== null) cacheDni.set(dni, coincide)
    res.json({ coincide, fuente: 'didit', match_type: j.match_type })
  } catch (e) {
    console.warn('Didit no respondio:', e.message)
    res.json({ coincide: null, fuente: 'error' }) // respaldo: pendiente
  }
})

app.listen(3001, () => console.log('Servidor Ayni en http://localhost:3001  (Didit:', DIDIT_KEY ? 'activo' : 'sin clave, modo respaldo', ')'))
