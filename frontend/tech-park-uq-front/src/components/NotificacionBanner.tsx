import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

interface EstadoAlerta {
  activa: boolean
  motivo: string
  atraccionesCerradas?: number
}

export default function NotificacionBanner() {
  const { usuario } = useAuth()
  const [alerta, setAlerta] = useState<EstadoAlerta | null>(null)

  const consultar = useCallback(async () => {
    try {
      const res = await api.get('/alertas/climatica/activa')
      setAlerta(res.data)
    } catch (e) {
      console.error('[NotificacionBanner]', e)
    }
  }, [])

  useEffect(() => {
    if (!usuario || usuario.rol !== 'Visitante') return
    consultar()
    const intervalo = setInterval(consultar, 30_000)
    return () => clearInterval(intervalo)
  }, [usuario, consultar])

  if (!usuario || usuario.rol !== 'Visitante' || !alerta?.activa) return null

  return (
    <div className="bg-amber-900/90 border-b border-amber-600 text-amber-100 px-8 py-4 flex items-start gap-4">
      <span className="text-xl shrink-0">⚠</span>
      <div>
        <p className="font-bold tracking-widest uppercase text-sm">Alerta climática activa: {alerta.motivo}</p>
        {alerta.atraccionesCerradas != null && (
          <p className="text-xs text-amber-200/80 mt-1">
            {alerta.atraccionesCerradas} atracciones cerradas temporalmente por tu seguridad.
          </p>
        )}
      </div>
    </div>
  )
}
