import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import { api } from '../services/api'

interface Atraccion {
  estado: 'ACTIVA' | 'EN_MANTENIMIENTO' | 'CERRADA'
}

export default function HomePage() {
  const [atracciones, setAtracciones] = useState<Atraccion[]>([])
  const [seeding, setSeeding] = useState(false)
  const [seedMsg, setSeedMsg] = useState<string | null>(null)
  const [clearing, setClearing] = useState(false)
  const [clearMsg, setClearMsg] = useState<string | null>(null)

  const loadAtracciones = () =>
    api.get('/atracciones')
      .then(res => setAtracciones(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error(err))

  useEffect(() => {
    loadAtracciones()
  }, [])

  async function handleSeed() {
    setSeedMsg(null)
    setSeeding(true)
    try {
      const res = await api.post('/dev/seed')
      setSeedMsg(`Seed listo: +${res.data?.zonasCreated ?? 0} zonas, +${res.data?.atraccionesCreated ?? 0} atracciones, +${res.data?.usuariosCreated ?? 0} usuarios`)
      loadAtracciones()
    } catch (e: any) {
      console.error('Error seedeando', e)
      setSeedMsg(`Error: ${e?.response?.status ?? ''} ${e?.response?.data?.message ?? JSON.stringify(e?.response?.data) ?? ''}`)
    } finally {
      setSeeding(false)
    }
  }

  async function handleClearDb() {
    const ok = window.confirm('Esto borrará TODAS las tablas (zonas, atracciones, usuarios). ¿Seguro?')
    if (!ok) return

    setClearMsg(null)
    setClearing(true)
    try {
      const res = await api.post('/dev/clear')
      setClearMsg(`DB limpia: zonas=${res.data?.zonaCount ?? 0}, atracciones=${res.data?.atraccionCount ?? 0}, usuarios=${res.data?.usuarioCount ?? 0}`)
      loadAtracciones()
    } catch (e: any) {
      console.error('Error limpiando DB', e)
      setClearMsg(`Error: ${e?.response?.status ?? ''} ${e?.response?.data?.message ?? JSON.stringify(e?.response?.data) ?? ''}`)
    } finally {
      setClearing(false)
    }
  }

  const total = atracciones.length
  const activas = atracciones.filter(a => a.estado === 'ACTIVA').length
  const mantenimiento = atracciones.filter(a => a.estado === 'EN_MANTENIMIENTO').length
  const cerradas = atracciones.filter(a => a.estado === 'CERRADA').length

  return (
    <MainLayout>
      <main className="bg-black text-white min-h-screen">

        {/* Hero */}
        <div className="flex items-center justify-center py-24 px-6">
          <div className="text-center">
            <h1 className="font-['Metal_Mania'] text-7xl md:text-[10rem] uppercase tracking-[0.12em] text-zinc-100 leading-none drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              tech-park-uq
            </h1>
            <p className="font-['Inter'] mt-6 text-sm md:text-base tracking-[0.35em] uppercase text-zinc-500">
              Sistema de gestión del parque
            </p>
            <Link
              to="/atracciones"
              className="inline-block mt-8 px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-zinc-300 transition tracking-widest text-sm uppercase"
            >
              Ver Atracciones
            </Link>

            <div className="mt-6 flex flex-col items-center gap-3">
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="px-6 py-3 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 transition tracking-widest text-xs uppercase disabled:opacity-50"
              >
                {seeding ? 'Cargando datos…' : 'Cargar datos demo (seed)'}
              </button>
              {seedMsg && (
                <p className="text-xs text-zinc-400 max-w-xl break-words">{seedMsg}</p>
              )}

              <button
                onClick={handleClearDb}
                disabled={clearing}
                className="px-6 py-3 rounded-lg border border-red-900/60 bg-red-950/40 text-red-200 hover:bg-red-950/70 transition tracking-widest text-xs uppercase disabled:opacity-50"
                title="Borra todas las tablas (solo dev)"
              >
                {clearing ? 'Limpiando…' : 'Clear DB (dev)'}
              </button>
              {clearMsg && (
                <p className="text-xs text-zinc-400 max-w-xl break-words">{clearMsg}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto px-8 pb-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: total, color: 'border-zinc-600' },
            { label: 'Activas', value: activas, color: 'border-green-600' },
            { label: 'Mantenimiento', value: mantenimiento, color: 'border-yellow-600' },
            { label: 'Cerradas', value: cerradas, color: 'border-red-600' },
          ].map(stat => (
            <div key={stat.label} className={`bg-zinc-900 border ${stat.color} rounded-xl p-6 text-center`}>
              <p className="text-4xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-zinc-500 uppercase tracking-widest mt-2">{stat.label}</p>
            </div>
          ))}
        </div>

      </main>
    </MainLayout>
  )
}