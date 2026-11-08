// Fotos sin Firebase Storage: se comprimen en el celular y se guardan como base64 en Firestore.
// comprimirFoto: foto de publicacion o del local (~800 px de lado mayor). recortarCuadrado: avatar o logo (256 x 256, centrado).

function cargarImagen(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(img.src); resolve(img) }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

/** Comprime a `max` px de lado mayor, JPEG `calidad`. */
export async function comprimirFoto(file, max = 800, calidad = 0.6) {
  const img = await cargarImagen(file)
  const esc = Math.min(1, max / Math.max(img.width, img.height))
  const c = document.createElement('canvas')
  c.width = Math.round(img.width * esc); c.height = Math.round(img.height * esc)
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
  return c.toDataURL('image/jpeg', calidad)
}

/** Recorta el centro en cuadrado y lo deja de `lado` px (para avatar y logo). */
export async function recortarCuadrado(file, lado = 256, calidad = 0.75) {
  const img = await cargarImagen(file)
  const l = Math.min(img.width, img.height)
  const sx = (img.width - l) / 2, sy = (img.height - l) / 2
  const c = document.createElement('canvas')
  c.width = lado; c.height = lado
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, lado, lado) // por si el logo es PNG transparente
  ctx.drawImage(img, sx, sy, l, l, 0, 0, lado, lado)
  return c.toDataURL('image/jpeg', calidad)
}
