// GET /api/salud -> { ok, didit }: para comprobar que el despliegue en Vercel tiene la clave de Didit configurada.
export default function handler(_req, res) {
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json({ ok: true, didit: Boolean(process.env.DIDIT_API_KEY) })
}
