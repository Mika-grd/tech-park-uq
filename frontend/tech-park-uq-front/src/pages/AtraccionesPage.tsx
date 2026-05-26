import { useEffect, useState } from 'react'
import { api } from '../services/api'
import MainLayout from '../layouts/MainLayout'
import { getFavoritos, addFavorito, removeFavorito } from '../services/favoritosService'
import { registrarVisita } from '../services/historialService'
import { unirseAFila, salirDeFila } from '../services/filaService'
import { useAuth } from '../context/AuthContext'

interface Atraccion {
    id: string
    nombre: string
    tipo: string
    capacidadMaxima: number
    alturaMinima: number
    edadMinima: number
    estado: 'ACTIVA' | 'EN_MANTENIMIENTO' | 'CERRADA'
    tiempoEspera: number
    visitantesAcumulados: number
    costoAdicional: number
    motivoCierre?: string
    zonaId?: string
    operadorId?: number | null
}

const estadoInicial = {
    id: '',
    nombre: '',
    tipo: 'MECANICA_ALTURA',
    capacidadMaxima: 0,
    alturaMinima: 0,
    edadMinima: 0,
    costoAdicional: 0,
    tiempoEspera: 0,
    estado: 'ACTIVA',
    visitantesAcumulados: 0,
    motivoCierre: '',
    zonaId: '',
    operadorId: null as number | null
}

export default function AtraccionesPage() {
    const { usuario } = useAuth()
    const puedeEditar = usuario?.rol === 'Administrador' || usuario?.rol === 'Operador'
    const [atracciones, setAtracciones] = useState<Atraccion[]>([])
    const [loading, setLoading] = useState(true)
    const [modalAbierto, setModalAbierto] = useState(false)
    const [editando, setEditando] = useState(false)
    const [form, setForm] = useState(estadoInicial)
    const [guardando, setGuardando] = useState(false)

    const [favoritos, setFavoritos] = useState<string[]>([])
    const [busqueda, setBusqueda] = useState('')
    const [buscando, setBuscando] = useState(false)
    const [filtroTipo, setFiltroTipo] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('')

    const [posicionFila, setPosicionFila] = useState<Record<string, number>>({})
    const [zonasDisponibles, setZonasDisponibles] = useState<{ id: string; nombre: string }[]>([])
    const [operadoresDisponibles, setOperadoresDisponibles] = useState<{ id: number; nombre: string; zonaAsignada: string | null }[]>([])

    const handleBuscar = async (q: string) => {
        setBusqueda(q)
        if (q.trim() === '') {
            cargarAtracciones()
            return
        }
        setBuscando(true)
        api.get(`/atracciones/buscar?q=${encodeURIComponent(q)}`)
            .then(res => setAtracciones(Array.isArray(res.data) ? res.data : []))
            .catch(err => console.error(err))
            .finally(() => setBuscando(false))
    }

    useEffect(() => {
        getFavoritos()
            .then(setFavoritos)
            .catch(() => { })
    }, [])

    const toggleFavorito = async (id: string) => {
        if (favoritos.includes(id)) {
            const updated = await removeFavorito(id)
            setFavoritos(updated)
        } else {
            const updated = await addFavorito(id)
            setFavoritos(updated)
        }
    }

    const handleVisitar = async (id: string) => {
        try {
            const res = await unirseAFila(id)
            await registrarVisita(id)
            setPosicionFila(prev => ({ ...prev, [id]: res.posicion }))
            cargarAtracciones()
        } catch (e: any) {
            alert(e?.response?.data?.message ?? 'Error al unirse a la fila')
        }
    }

    const handleSalirFila = async (id: string) => {
        try {
            await salirDeFila(id)
            setPosicionFila(prev => { const s = { ...prev }; delete s[id]; return s })
        } catch (e: any) {
            alert(e?.response?.data?.message ?? 'Error al salir de la fila')
        }
    }

    const cargarAtracciones = () => {
        setLoading(true)
        const zonaOp = usuario?.rol === 'Operador' ? usuario?.zonaAsignada : null
        const url = zonaOp ? `/atracciones/zona/${zonaOp}` : '/atracciones'
        api.get(url)
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : []
                setAtracciones(data)
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }

    useEffect(() => { cargarAtracciones() }, [usuario])

    useEffect(() => {
        if (usuario?.rol === 'Administrador') {
            api.get('/zonas').then(res => setZonasDisponibles(Array.isArray(res.data) ? res.data : [])).catch(() => {})
            api.get('/usuarios/operadores').then(res => setOperadoresDisponibles(Array.isArray(res.data) ? res.data : [])).catch(() => {})
        }
    }, [usuario])

    const colorEstado = (estado: string) => {
        if (estado === 'ACTIVA') return 'bg-green-500'
        if (estado === 'EN_MANTENIMIENTO') return 'bg-yellow-500'
        return 'bg-red-500'
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const abrirEditar = (a: Atraccion) => {
        setForm({ ...a, motivoCierre: a.motivoCierre ?? '' })
        setEditando(true)
        setModalAbierto(true)
    }

    const abrirNuevo = () => {
        const zonaId = usuario?.rol === 'Operador' ? (usuario?.zonaAsignada ?? '') : ''
        setForm({ ...estadoInicial, zonaId })
        setEditando(false)
        setModalAbierto(true)
    }

    const handleGuardar = () => {
        if (!form.id || !form.nombre) return
        setGuardando(true)

        const payload = {
            ...form,
            capacidadMaxima: Number(form.capacidadMaxima),
            alturaMinima: Number(form.alturaMinima),
            edadMinima: Number(form.edadMinima),
            costoAdicional: Number(form.costoAdicional),
            tiempoEspera: Number(form.tiempoEspera),
            visitantesAcumulados: Number(form.visitantesAcumulados),
        }

        const peticion = editando
            ? api.put(`/atracciones/${form.id}`, payload)
            : api.post('/atracciones', payload)

        peticion
            .then(() => {
                cargarAtracciones()
                setModalAbierto(false)
                setForm(estadoInicial)
            })
            .catch(err => console.error(err))
            .finally(() => setGuardando(false))
    }

    const handleEliminar = (id: string) => {
        if (!confirm('¿Seguro que quieres eliminar esta atracción?')) return
        api.delete(`/atracciones/${id}`)
            .then(() => cargarAtracciones())
            .catch(err => console.error(err))
    }

    return (
        <MainLayout>
            <div className="bg-black text-white min-h-screen p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="font-['Ghastly_Panic'] text-4xl font-bold tracking-widest uppercase text-white">
                        Atracciones
                    </h1>
                    {puedeEditar && (
                        <button
                            onClick={abrirNuevo}
                            className="bg-white text-black font-bold px-4 py-2 rounded-lg hover:bg-white transition"
                        >
                            + Nueva
                        </button>
                    )}
                </div>

                {/* Barra de búsqueda */}
                <div className="mb-6">
                    <input
                        type="text"
                        value={busqueda}
                        onChange={e => handleBuscar(e.target.value)}
                        placeholder="Buscar atracción por nombre..."
                        className="w-full max-w-md bg-black text-white rounded-lg px-4 py-2 border border-white focus:outline-none focus:border-white text-sm"
                    />
                    {buscando && <p className="text-white text-xs mt-1">Buscando...</p>}
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-white uppercase tracking-widest">Tipo:</span>
                        {['', 'MECANICA_ALTURA', 'ACUATICA', 'OTRO'].map(tipo => (
                            <button
                                key={tipo}
                                onClick={() => setFiltroTipo(tipo)}
                                className={`text-xs px-3 py-1.5 rounded-lg border transition ${filtroTipo === tipo ? 'bg-white text-black border-white' : 'border-white text-white hover:bg-white hover:text-black'}`}
                            >
                                {tipo === '' ? 'Todos' : tipo === 'MECANICA_ALTURA' ? 'Mecánica' : tipo === 'ACUATICA' ? 'Acuática' : 'Otro'}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-white uppercase tracking-widest">Estado:</span>
                        {['', 'ACTIVA', 'EN_MANTENIMIENTO', 'CERRADA'].map(estado => (
                            <button
                                key={estado}
                                onClick={() => setFiltroEstado(estado)}
                                className={`text-xs px-3 py-1.5 rounded-lg border transition ${filtroEstado === estado ? 'bg-white text-black border-white' : 'border-white text-white hover:bg-white hover:text-black'}`}
                            >
                                {estado === '' ? 'Todos' : estado === 'ACTIVA' ? 'Activas' : estado === 'EN_MANTENIMIENTO' ? 'Mantenimiento' : 'Cerradas'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Lista */}
                {loading ? (
                    <p className="text-white">Cargando...</p>
                ) : atracciones.length === 0 ? (
                    <p className="text-white">No hay atracciones registradas.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {atracciones.filter(a =>
                            (filtroTipo === '' || a.tipo === filtroTipo) &&
                            (filtroEstado === '' || a.estado === filtroEstado)
                        ).map(a => (
                            <div key={a.id} className="bg-black rounded-xl p-6 border border-white">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-['Ghastly_Panic'] text-3xl font-semibold">{a.nombre}</h2>
                                    <span className={`text-xs px-2 py-1 rounded-full text-black font-bold ${colorEstado(a.estado)}`}>
                                        {a.estado}
                                    </span>
                                </div>
                                <p className="text-white text-sm mb-1">Tipo: {a.tipo}</p>
                                <p className="text-white text-sm mb-1">Capacidad: {a.capacidadMaxima}</p>
                                <p className="text-white text-sm mb-1">Altura mínima: {a.alturaMinima}cm</p>
                                <p className="text-white text-sm mb-1">Edad mínima: {a.edadMinima} años</p>
                                <p className="text-white text-sm mb-4">⏱ Espera: {a.tiempoEspera} min</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleFavorito(a.id)}
                                        className={`flex-1 text-sm py-1.5 rounded-lg border transition ${favoritos.includes(a.id)
                                            ? 'border-yellow-500 text-yellow-400 hover:bg-yellow-950'
                                            : 'border-white text-white hover:bg-white hover:text-black'
                                            }`}
                                    >
                                        {favoritos.includes(a.id) ? '★ Favorito' : '☆ Favorito'}
                                    </button>
                                    {puedeEditar && (
                                        <>
                                            <button
                                                onClick={() => abrirEditar(a)}
                                                className="flex-1 text-sm py-1.5 rounded-lg border border-white text-white hover:bg-white hover:text-black transition"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleEliminar(a.id)}
                                                className="flex-1 text-sm py-1.5 rounded-lg border border-red-800 text-red-400 hover:bg-red-950 transition"
                                            >
                                                Eliminar
                                            </button>
                                        </>
                                    )}
                                    {posicionFila[a.id] ? (
                                        <button
                                            onClick={() => handleSalirFila(a.id)}
                                            className="flex-1 text-sm py-1.5 rounded-lg border border-orange-800 text-orange-400 hover:bg-orange-950 transition"
                                        >
                                            #{posicionFila[a.id]} — Salir
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleVisitar(a.id)}
                                            className="flex-1 text-sm py-1.5 rounded-lg border border-blue-800 text-blue-400 hover:bg-blue-950 transition"
                                        >
                                            Visitar
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {modalAbierto && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                        <div className="bg-black border border-white rounded-2xl p-8 w-full max-w-lg">
                            <h2 className="font-['Ghastly_Panic'] text-3xl font-bold mb-6 tracking-wide">
                                {editando ? 'Editar Atracción' : 'Nueva Atracción'}
                            </h2>

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'ID', name: 'id', type: 'text' },
                                    { label: 'Nombre', name: 'nombre', type: 'text' },
                                    { label: 'Capacidad máxima', name: 'capacidadMaxima', type: 'number' },
                                    { label: 'Altura mínima (cm)', name: 'alturaMinima', type: 'number' },
                                    { label: 'Edad mínima', name: 'edadMinima', type: 'number' },
                                    { label: 'Costo adicional', name: 'costoAdicional', type: 'number' },
                                    { label: 'Tiempo de espera (min)', name: 'tiempoEspera', type: 'number' },
                                ].map(campo => (
                                    <div key={campo.name}>
                                        <label className="text-white text-xs mb-1 block">{campo.label}</label>
                                        <input
                                            type={campo.type}
                                            name={campo.name}
                                            value={(form as any)[campo.name]}
                                            onChange={handleChange}
                                            disabled={editando && campo.name === 'id'}
                                            className="w-full bg-black text-white rounded-lg px-3 py-2 text-sm border border-white focus:outline-none focus:border-white disabled:opacity-50"
                                        />
                                    </div>
                                ))}

                                <div>
                                    <label className="text-white text-xs mb-1 block">Tipo</label>
                                    <select name="tipo" value={form.tipo} onChange={handleChange}
                                        className="w-full bg-black text-white rounded-lg px-3 py-2 text-sm border border-white focus:outline-none">
                                        <option value="MECANICA_ALTURA">Mecánica de altura</option>
                                        <option value="ACUATICA">Acuática</option>
                                        <option value="OTRO">Otro</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-white text-xs mb-1 block">Estado</label>
                                    <select name="estado" value={form.estado} onChange={handleChange}
                                        className="w-full bg-black text-white rounded-lg px-3 py-2 text-sm border border-white focus:outline-none">
                                        <option value="ACTIVA">Activa</option>
                                        <option value="EN_MANTENIMIENTO">En mantenimiento</option>
                                        <option value="CERRADA">Cerrada</option>
                                    </select>
                                </div>

                                <div className="col-span-2">
                                    <label className="text-white text-xs mb-1 block">Zona</label>
                                    {usuario?.rol === 'Operador' ? (
                                        <input
                                            type="text"
                                            value={usuario?.zonaAsignada ?? ''}
                                            disabled
                                            className="w-full bg-black text-white rounded-lg px-3 py-2 text-sm border border-white opacity-50"
                                        />
                                    ) : (
                                        <select
                                            name="zonaId"
                                            value={form.zonaId ?? ''}
                                            onChange={handleChange}
                                            className="w-full bg-black text-white rounded-lg px-3 py-2 text-sm border border-white focus:outline-none"
                                        >
                                            <option value="">— Sin zona —</option>
                                            {zonasDisponibles.map(z => (
                                                <option key={z.id} value={z.id}>{z.nombre} ({z.id})</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {usuario?.rol === 'Administrador' && (
                                    <div className="col-span-2">
                                        <label className="text-white text-xs mb-1 block">Operador asignado *</label>
                                        <select
                                            name="operadorId"
                                            value={form.operadorId ?? ''}
                                            onChange={e => setForm(prev => ({ ...prev, operadorId: e.target.value ? Number(e.target.value) : null }))}
                                            className="w-full bg-black text-white rounded-lg px-3 py-2 text-sm border border-white focus:outline-none"
                                        >
                                            <option value="">— Selecciona un operador —</option>
                                            {operadoresDisponibles.map(op => (
                                                <option key={op.id} value={op.id}>{op.nombre} {op.zonaAsignada ? `(Zona: ${op.zonaAsignada})` : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => { setModalAbierto(false); setForm(estadoInicial) }}
                                    className="px-4 py-2 rounded-lg border border-white text-white hover:bg-white hover:text-black transition text-sm">
                                    Cancelar
                                </button>
                                <button onClick={handleGuardar} disabled={guardando}
                                    className="px-4 py-2 rounded-lg bg-white text-black font-bold hover:bg-white transition text-sm disabled:opacity-50">
                                    {guardando ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    )
}
