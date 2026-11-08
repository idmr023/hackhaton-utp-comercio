// Mini servidor Node para desarrollo local: unico lugar (junto con api/ en Vercel) donde vive la API key de Didit.
// Correr con: npm run server   (puerto 3001; Vite hace proxy de /api -> aqui)
// En produccion (Vercel) no se usa: las rutas /api/* son funciones serverless en la carpeta api/.
import express from 'express'
import 'dotenv/config'
import { verificarDni } from './didit.js'

const app = express()
app.use(express.json())

const DIDIT_KEY = process.env.DIDIT_API_KEY

app.get('/api/salud', (_, res) => res.json({ ok: true, didit: Boolean(DIDIT_KEY) }))

// POST /api/verificar-dni  { dni, nombre }  ->  { coincide: true|false|null, fuente }
app.post('/api/verificar-dni', async (req, res) => {
  const { dni, nombre } = req.body || {}
  const r = await verificarDni(dni, nombre, DIDIT_KEY)
  if (r.fuente === 'dni_invalido') return res.status(400).json({ coincide: null, error: 'DNI invalido' })
  res.json(r)
})

app.listen(3001, () => console.log('Servidor Ayni en http://localhost:3001  (Didit:', DIDIT_KEY ? 'activo' : 'sin clave, modo respaldo', ')'))
