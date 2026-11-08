// Modo Barrio: carga publicaciones y negocios cercanos una sola vez y los reparte entre sus dos secciones,
// Mapa ("/") y Vecinos ("/vecinos"). Tocar algo en la lista lleva al mapa, lo centra y abre su popup.
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { useEstado } from '../lib/estado'
import { listarCerca } from '../lib/db'
import { pendientes } from '../lib/offlineQueue'
import Mapa from './Mapa'
import Vecinos from './Vecinos'

export default function Barrio({ vista }) {
  const { ubicacion, radioKm, t } = useEstado()
  const nav = useNavigate()
  const [pubs, setPubs] = useState([])
  const [negocios, setNegocios] = useState([])
  const [nPend, setNPend] = useState(0)
  const [cargado, setCargado] = useState(false)
  const [foco, setFoco] = useState(null) // { k, lat, lng, n }: lo elegido en la lista, para centrarlo en el mapa
  const loc = useLocation()
  // "Ver en el mapa" desde el detalle de una publicacion llega como state de la navegacion
  useEffect(() => { if (loc.state?.foco) setFoco({ ...loc.state.foco, n: Date.now() }) }, [loc.state])

  useEffect(() => {
    if (!ubicacion) return
    listarCerca('publicaciones', ubicacion, radioKm).then(setPubs).catch(console.error).finally(() => setCargado(true))
    listarCerca('negocios_oficios', ubicacion, radioKm).then(setNegocios).catch(console.error)
    pendientes().then((l) => setNPend(l.length))
  }, [ubicacion, radioKm])

  if (!ubicacion) return (
    <div className="cargando" role="status">
      <div className="ficha grande teal"><MapPin aria-hidden="true" /></div>
      <p>{t('Buscando tu ubicación…')}</p>
    </div>
  )

  // Ambas rutas renderizan este mismo componente, asi que el foco sobrevive al cambio de pestana
  const elegir = (f) => { setFoco({ ...f, n: Date.now() }); nav('/') }
  const datos = { pubs, negocios, nPend, cargado }
  return (
    <div className={`barrio vista-${vista}`}>
      {vista === 'lista'
        ? <div className="barrio-lista"><Vecinos {...datos} onElegir={elegir} /></div>
        : <div className="barrio-mapa"><Mapa {...datos} foco={foco} /></div>}
    </div>
  )
}
