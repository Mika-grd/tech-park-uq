import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

interface Atraccion {
  estado: 'ACTIVA' | 'EN_MANTENIMIENTO' | 'CERRADA'
}

const adminFormInicial = { nombre: '', email: '', password: '' }
const operadorFormInicial = { nombre: '', email: '', password: '', zonaAsignada: '' }

const TIPOS_CLIMA = ['Tormenta eléctrica', 'Lluvia fuerte', 'Vientos extremos', 'Granizo', 'Otro']

export default function AdminPage() {
  const { usuario, ready } = useAuth()
  const [atracciones, setAtracciones] = useState<Atraccion[]>([])
  const [seeding, setSeeding] = useState(false)
  const [seedMsg, setSeedMsg] = useState<string | null>(null)
  const [clearing, setClearing] = useState(false)
  const [clearMsg, setClearMsg] = useState<string | null>(null)

  const [modalAdmin, setModalAdmin] = useState(false)
  const [adminForm, setAdminForm] = useState(adminFormInicial)
  const [guardandoAdmin, setGuardandoAdmin] = useState(false)
  const [adminMsg, setAdminMsg] = useState<string | null>(null)

  const [modalOperador, setModalOperador] = useState(false)
  const [operadorForm, setOperadorForm] = useState(operadorFormInicial)
  const [guardandoOperador, setGuardandoOperador] = useState(false)
  const [operadorMsg, setOperadorMsg] = useState<string | null>(null)

  const [modalAlerta, setModalAlerta] = useState(false)
  const [tipoClima, setTipoClima] = useState(TIPOS_CLIMA[0])
  const [motivoPersonalizado, setMotivoPersonalizado] = useState('')
  const [activandoAlerta, setActivandoAlerta] = useState(false)
  const [desactivandoAlerta, setDesactivandoAlerta] = useState(false)
  const [alertaMsg, setAlertaMsg] = useState<string | null>(null)

  const [zonas, setZonas] = useState<{ id: string; nombre: string }[]>([])
  const [recaudacion, setRecaudacion] = useState<{ totalHoy: number; ventasHoy: number } | null>(null)

  const loadRecaudacion = () =>
    api.get('/tickets/recaudacion-hoy')
      .then(res => setRecaudacion(res.data))
      .catch(() => {})

  const loadAtracciones = () =>
    api.get('/atracciones')
      .then(res => setAtracciones(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error(err))

  useEffect(() => {
    loadAtracciones()
    loadRecaudacion()
  }, [])

  async function handleSeed() {
    setSeedMsg(null)
    setSeeding(true)
    try {
      const res = await api.post('/dev/seed')
      setSeedMsg(`Seed listo: +${res.data?.zonasCreated ?? 0} zonas, +${res.data?.atraccionesCreated ?? 0} atracciones, +${res.data?.usuariosCreated ?? 0} usuarios`)
      loadAtracciones()
    } catch (e: any) {
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
      setClearMsg(`Error: ${e?.response?.status ?? ''} ${e?.response?.data?.message ?? JSON.stringify(e?.response?.data) ?? ''}`)
    } finally {
      setClearing(false)
    }
  }

  const total = atracciones.length
  const activas = atracciones.filter(a => a.estado === 'ACTIVA').length
  const mantenimiento = atracciones.filter(a => a.estado === 'EN_MANTENIMIENTO').length
  const cerradas = atracciones.filter(a => a.estado === 'CERRADA').length

  async function handleCrearAdmin() {
    if (!adminForm.nombre || !adminForm.email || !adminForm.password) {
      setAdminMsg('Completa todos los campos')
      return
    }
    setGuardandoAdmin(true)
    setAdminMsg(null)
    try {
      await api.post('/usuarios/admin', {
        nombre: adminForm.nombre,
        email: adminForm.email,
        password: adminForm.password,
        documento: '',
        edad: 0,
        estatura: 0,
      })
      setAdminMsg('Administrador creado correctamente')
      setAdminForm(adminFormInicial)
    } catch (e: any) {
      const msg = e?.response?.data?.message
      if (e?.response?.status === 409) {
        setAdminMsg('Error: ese email ya está registrado')
      } else {
        setAdminMsg(`Error: ${msg ?? 'no se pudo crear el administrador'}`)
      }
    } finally {
      setGuardandoAdmin(false)
    }
  }

  async function handleCrearOperador() {
    if (!operadorForm.nombre || !operadorForm.email || !operadorForm.password) {
      setOperadorMsg('Completa los campos obligatorios')
      return
    }
    setGuardandoOperador(true)
    setOperadorMsg(null)
    try {
      await api.post('/usuarios/operador', {
        nombre: operadorForm.nombre,
        email: operadorForm.email,
        password: operadorForm.password,
        zonaAsignada: operadorForm.zonaAsignada || null,
      })
      setOperadorMsg('Operador creado correctamente')
      setOperadorForm(operadorFormInicial)
    } catch (e: any) {
      if (e?.response?.status === 409) {
        setOperadorMsg('Error: ese email ya está registrado')
      } else {
        const detail = e?.response?.data?.message ?? e?.response?.data?.error ?? `HTTP ${e?.response?.status ?? 'sin respuesta'}`
        setOperadorMsg(`Error: ${detail}`)
      }
    } finally {
      setGuardandoOperador(false)
    }
  }

  async function handleDesactivarAlerta() {
    setDesactivandoAlerta(true)
    setAlertaMsg(null)
    try {
      const res = await api.post('/alertas/climatica/desactivar')
      setAlertaMsg(`Alerta desactivada: ${res.data.atraccionesReabiertas} atracción(es) reabiertas.`)
      loadAtracciones()
    } catch (e: any) {
      setAlertaMsg(`Error: ${e?.response?.data?.message ?? 'no se pudo desactivar la alerta'}`)
    } finally {
      setDesactivandoAlerta(false)
    }
  }

  async function handleActivarAlerta() {
    const motivo = tipoClima === 'Otro' ? motivoPersonalizado.trim() : tipoClima
    if (!motivo) {
      setAlertaMsg('Especifica el motivo de la alerta')
      return
    }
    setActivandoAlerta(true)
    setAlertaMsg(null)
    try {
      const res = await api.post('/alertas/climatica', { motivo })
      setAlertaMsg(
        `Alerta activada: ${res.data.atraccionesAfectadas} atracción(es) cerrada(s) y visitantes notificados.`
      )
      loadAtracciones()
    } catch (e: any) {
      setAlertaMsg(`Error: ${e?.response?.data?.message ?? 'no se pudo activar la alerta'}`)
    } finally {
      setActivandoAlerta(false)
    }
  }

  if (!ready) return null
  return (
    <MainLayout>
      <main className="bg-black min-h-screen text-white relative">
        {usuario?.nombre && (
          <p className="absolute top-6 left-8 text-sm text-white tracking-widest uppercase">
            Bienvenido, {usuario.nombre}
          </p>
        )}

        {/* Hero */}
        <div className="flex items-center justify-center py-24 px-6">
          <div className="text-center">
            <h1 className="font-['Ghastly_Panic'] text-7xl md:text-[10rem] uppercase tracking-[0.12em] text-white leading-none drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              tech-park-uq
            </h1>
            <p className="mt-6 text-sm md:text-base tracking-[0.35em] uppercase text-white">
              Sistema de gestión del parque
            </p>

            <div className="mt-8 flex flex-col items-center gap-3">
              <Link
                to="/atracciones"
                className="inline-block px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-white transition tracking-widest text-sm uppercase"
              >
                Ver Atracciones
              </Link>

              <button
                onClick={handleSeed}
                disabled={seeding}
                className="px-6 py-3 rounded-lg border border-white bg-black text-white hover:bg-white hover:text-black transition tracking-widest text-xs uppercase disabled:opacity-50"
              >
                {seeding ? 'Cargando datos…' : 'Cargar datos demo (seed)'}
              </button>
              {seedMsg && <p className="text-xs text-white max-w-xl break-words">{seedMsg}</p>}

              <button
                onClick={handleClearDb}
                disabled={clearing}
                className="px-6 py-3 rounded-lg border border-red-900/60 bg-red-950/40 text-red-200 hover:bg-red-950/70 transition tracking-widest text-xs uppercase disabled:opacity-50"
                title="Borra todas las tablas (solo dev)"
              >
                {clearing ? 'Limpiando…' : 'Clear DB (dev)'}
              </button>
              {clearMsg && <p className="text-xs text-white max-w-xl break-words">{clearMsg}</p>}
            </div>
          </div>
        </div>

        {/* Tarjetas de gestión */}
        <div className="max-w-5xl mx-auto px-8 grid gap-6 sm:grid-cols-2">
          <button
            onClick={() => { setModalAdmin(true); setAdminMsg(null) }}
            className="rounded-3xl border border-white bg-black p-6 text-left hover:bg-white hover:text-black transition w-full"
          >
            <h2 className="font-['Ghastly_Panic'] text-3xl font-semibold">Gestión de Administradores</h2>
            <p className="mt-2">Registra nuevos administradores.</p>
          </button>

          <button
            onClick={() => {
              setModalOperador(true)
              setOperadorMsg(null)
              api.get('/zonas').then(res => setZonas(Array.isArray(res.data) ? res.data : [])).catch(() => {})
            }}
            className="rounded-3xl border border-white bg-black p-6 text-left hover:bg-white hover:text-black transition w-full"
          >
            <h2 className="font-['Ghastly_Panic'] text-3xl font-semibold">Gestión de Operadores</h2>
            <p className="mt-2">Registra nuevos operadores y asígnalos a una zona.</p>
          </button>

          <button
            onClick={() => { setModalAlerta(true); setAlertaMsg(null) }}
            className="rounded-3xl border border-amber-600 bg-black p-6 text-left hover:bg-amber-950/40 transition w-full"
          >
            <h2 className="font-['Ghastly_Panic'] text-3xl font-semibold text-amber-400">Alerta Climática</h2>
            <p className="mt-2 text-amber-200/80">Cierra atracciones acuáticas y de altura y notifica a todos los visitantes.</p>
          </button>

          <Link
            to="/estadisticas"
            className="rounded-3xl border border-white bg-black p-6 text-left hover:bg-white hover:text-black transition block"
          >
            <h2 className="font-['Ghastly_Panic'] text-3xl font-semibold">Reportes</h2>
            <p className="mt-2">Consulta ingresos, visitantes y alertas de mantenimiento.</p>
          </Link>
        </div>

        {/* Stats atracciones */}
        <div className="max-w-5xl mx-auto px-8 mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: total, color: 'border-white' },
            { label: 'Activas', value: activas, color: 'border-green-600' },
            { label: 'Mantenimiento', value: mantenimiento, color: 'border-yellow-600' },
            { label: 'Cerradas', value: cerradas, color: 'border-red-600' },
          ].map(stat => (
            <div key={stat.label} className={`bg-black border ${stat.color} rounded-xl p-6 text-center`}>
              <p className="text-4xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-white uppercase tracking-widest mt-2">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Stats recaudación */}
        <div className="max-w-5xl mx-auto px-8 mt-4 pb-16 grid grid-cols-2 gap-4">
          <div className="bg-black border border-green-700 rounded-xl p-6 text-center">
            <p className="text-4xl font-bold text-green-400">
              ${recaudacion ? recaudacion.totalHoy.toLocaleString('es-CO') : '—'}
            </p>
            <p className="text-xs text-white uppercase tracking-widest mt-2">Recaudado hoy</p>
          </div>
          <div className="bg-black border border-blue-700 rounded-xl p-6 text-center">
            <p className="text-4xl font-bold text-blue-400">
              {recaudacion ? recaudacion.ventasHoy : '—'}
            </p>
            <p className="text-xs text-white uppercase tracking-widest mt-2">Tickets vendidos hoy</p>
          </div>
        </div>

        {/* Modal Admin */}
        {modalAdmin && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-black border border-white rounded-2xl p-8 w-full max-w-md">
              <h2 className="font-['Ghastly_Panic'] text-3xl font-bold mb-6 tracking-wide">Nuevo Administrador</h2>

              <div className="flex flex-col gap-4">
                {[
                  { label: 'Nombre', name: 'nombre', type: 'text' },
                  { label: 'Email', name: 'email', type: 'email' },
                  { label: 'Contraseña (mín. 8 caracteres)', name: 'password', type: 'password' },
                ].map(campo => (
                  <div key={campo.name}>
                    <label className="text-xs text-white mb-1 block">{campo.label}</label>
                    <input
                      type={campo.type}
                      name={campo.name}
                      value={(adminForm as any)[campo.name]}
                      onChange={e => setAdminForm(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                      className="w-full bg-black text-white rounded-lg px-3 py-2 text-sm border border-white focus:outline-none focus:border-white"
                    />
                  </div>
                ))}
              </div>

              {adminMsg && (
                <p className={`mt-4 text-xs ${adminMsg.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
                  {adminMsg}
                </p>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => { setModalAdmin(false); setAdminForm(adminFormInicial); setAdminMsg(null) }}
                  className="px-4 py-2 rounded-lg border border-white text-white hover:bg-white hover:text-black transition text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCrearAdmin}
                  disabled={guardandoAdmin}
                  className="px-4 py-2 rounded-lg bg-white text-black font-bold hover:bg-white transition text-sm disabled:opacity-50"
                >
                  {guardandoAdmin ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Alerta Climática */}
        {modalAlerta && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-black border border-amber-600 rounded-2xl p-8 w-full max-w-md relative">

              {/* Botón cerrar X */}
              <button
                onClick={() => { setModalAlerta(false); setAlertaMsg(null); setMotivoPersonalizado('') }}
                className="absolute top-4 right-4 text-white hover:text-amber-400 transition text-xl leading-none"
                aria-label="Cerrar"
              >
                ✕
              </button>

              <h2 className="font-['Ghastly_Panic'] text-3xl font-bold mb-2 tracking-wide text-amber-400">
                Alerta Climática
              </h2>
              <p className="text-sm text-amber-200/70 mb-6">
                Se cerrarán <strong>todas</strong> las atracciones del parque y todos los visitantes registrados recibirán una notificación.
              </p>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-amber-300 mb-1 block uppercase tracking-widest">Tipo de alerta</label>
                  <select
                    value={tipoClima}
                    onChange={e => setTipoClima(e.target.value)}
                    className="w-full bg-black text-white rounded-lg px-3 py-2 text-sm border border-amber-600 focus:outline-none"
                  >
                    {TIPOS_CLIMA.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {tipoClima === 'Otro' && (
                  <div>
                    <label className="text-xs text-amber-300 mb-1 block uppercase tracking-widest">Descripción del motivo</label>
                    <input
                      type="text"
                      value={motivoPersonalizado}
                      onChange={e => setMotivoPersonalizado(e.target.value)}
                      placeholder="Ej: Niebla densa"
                      className="w-full bg-black text-white rounded-lg px-3 py-2 text-sm border border-amber-600 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {alertaMsg && (
                <p className={`mt-4 text-xs ${alertaMsg.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
                  {alertaMsg}
                </p>
              )}

              <div className="flex justify-between gap-3 mt-6">
                <button
                  onClick={handleDesactivarAlerta}
                  disabled={desactivandoAlerta || activandoAlerta}
                  className="px-4 py-2 rounded-lg border border-red-700 text-red-400 hover:bg-red-950/40 transition text-sm disabled:opacity-50"
                >
                  {desactivandoAlerta ? 'Quitando...' : 'Quitar alerta'}
                </button>

                <button
                  onClick={handleActivarAlerta}
                  disabled={activandoAlerta || desactivandoAlerta}
                  className="px-4 py-2 rounded-lg bg-amber-600 text-black font-bold hover:bg-amber-500 transition text-sm disabled:opacity-50"
                >
                  {activandoAlerta ? 'Activando...' : 'Activar alerta'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Operador */}
        {modalOperador && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-black border border-white rounded-2xl p-8 w-full max-w-md">
              <h2 className="font-['Ghastly_Panic'] text-3xl font-bold mb-6 tracking-wide">Nuevo Operador</h2>

              <div className="flex flex-col gap-4">
                {[
                  { label: 'Nombre', name: 'nombre', type: 'text' },
                  { label: 'Email', name: 'email', type: 'email' },
                  { label: 'Contraseña (mín. 8 caracteres)', name: 'password', type: 'password' },
                ].map(campo => (
                  <div key={campo.name}>
                    <label className="text-xs text-white mb-1 block">{campo.label}</label>
                    <input
                      type={campo.type}
                      name={campo.name}
                      value={(operadorForm as any)[campo.name]}
                      onChange={e => setOperadorForm(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                      className="w-full bg-black text-white rounded-lg px-3 py-2 text-sm border border-white focus:outline-none focus:border-white"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-xs text-white mb-1 block">Zona asignada</label>
                  <select
                    name="zonaAsignada"
                    value={operadorForm.zonaAsignada}
                    onChange={e => setOperadorForm(prev => ({ ...prev, zonaAsignada: e.target.value }))}
                    className="w-full bg-black text-white rounded-lg px-3 py-2 text-sm border border-white focus:outline-none"
                  >
                    <option value="">— Sin zona —</option>
                    {zonas.map(z => (
                      <option key={z.id} value={z.id}>{z.nombre} ({z.id})</option>
                    ))}
                  </select>
                </div>
              </div>

              {operadorMsg && (
                <p className={`mt-4 text-xs ${operadorMsg.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
                  {operadorMsg}
                </p>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => { setModalOperador(false); setOperadorForm(operadorFormInicial); setOperadorMsg(null) }}
                  className="px-4 py-2 rounded-lg border border-white text-white hover:bg-white hover:text-black transition text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCrearOperador}
                  disabled={guardandoOperador}
                  className="px-4 py-2 rounded-lg bg-white text-black font-bold hover:bg-white transition text-sm disabled:opacity-50"
                >
                  {guardandoOperador ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </MainLayout>
  )
}
