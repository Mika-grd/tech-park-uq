import { useEffect, useState } from 'react'
import { api } from '../services/api'
import MainLayout from '../layouts/MainLayout'
import { getFavoritos, addFavorito, removeFavorito } from '../services/favoritosService'
import { registrarVisita } from '../services/historialService'
import { unirseAFila } from '../services/filaService'

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
    motivoCierre: ''
}

export default function AtraccionesPage() {
    const [atracciones, setAtracciones] = useState<Atraccion[]>([])
    const [loading, setLoading] = useState(true)
    const [modalAbierto, setModalAbierto] = useState(false)
    const [editando, setEditando] = useState(false)
    const [form, setForm] = useState(estadoInicial)
    const [guardando, setGuardando] = useState(false)

    const [favoritos, setFavoritos] = useState<string[]>([])

    const [posicionFila, setPosicionFila] = useState<Record<string, number>>({})

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
        } catch (e: any) {
            alert(e?.response?.data?.message ?? 'Error al unirse a la fila')
        }
    }


    const cargarAtracciones = () => {
        setLoading(true)
        api.get('/atracciones')
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : []
                setAtracciones(data)
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }

    useEffect(() => { cargarAtracciones() }, [])

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
        setForm(estadoInicial)
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
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-bold tracking-widest uppercase text-zinc-100">
                        Atracciones
                    </h1>
                    <button
                        onClick={abrirNuevo}
                        className="bg-white text-black font-bold px-4 py-2 rounded-lg hover:bg-zinc-300 transition"
                    >
                        + Nueva
                    </button>
                </div>

                {/* Lista */}
                {loading ? (
                    <p className="text-zinc-500">Cargando...</p>
                ) : atracciones.length === 0 ? (
                    <p className="text-zinc-500">No hay atracciones registradas.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {atracciones.map(a => (
                            <div key={a.id} className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold">{a.nombre}</h2>
                                    <span className={`text-xs px-2 py-1 rounded-full text-black font-bold ${colorEstado(a.estado)}`}>
                                        {a.estado}
                                    </span>
                                </div>
                                <p className="text-zinc-400 text-sm mb-1">Tipo: {a.tipo}</p>
                                <p className="text-zinc-400 text-sm mb-1">Capacidad: {a.capacidadMaxima}</p>
                                <p className="text-zinc-400 text-sm mb-1">Altura mínima: {a.alturaMinima}cm</p>
                                <p className="text-zinc-400 text-sm mb-1">Edad mínima: {a.edadMinima} años</p>
                                <p className="text-zinc-400 text-sm mb-4">⏱ Espera: {a.tiempoEspera} min</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleFavorito(a.id)}
                                        className={`flex-1 text-sm py-1.5 rounded-lg border transition ${favoritos.includes(a.id)
                                            ? 'border-yellow-500 text-yellow-400 hover:bg-yellow-950'
                                            : 'border-zinc-600 text-zinc-400 hover:bg-zinc-800'
                                            }`}
                                    >
                                        {favoritos.includes(a.id) ? '★ Favorito' : '☆ Favorito'}
                                    </button>
                                    <button
                                        onClick={() => abrirEditar(a)}
                                        className="flex-1 text-sm py-1.5 rounded-lg border border-zinc-600 text-zinc-300 hover:bg-zinc-800 transition"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleEliminar(a.id)}
                                        className="flex-1 text-sm py-1.5 rounded-lg border border-red-800 text-red-400 hover:bg-red-950 transition"
                                    >
                                        Eliminar
                                    </button>
                                    <button
                                        onClick={() => handleVisitar(a.id)}
                                        className="flex-1 text-sm py-1.5 rounded-lg border border-blue-800 text-blue-400 hover:bg-blue-950 transition"
                                    >
                                        {posicionFila[a.id] ? `#${posicionFila[a.id]} en fila` : 'Visitar'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {modalAbierto && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 w-full max-w-lg">
                            <h2 className="text-2xl font-bold mb-6 tracking-wide">
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
                                        <label className="text-xs text-zinc-400 mb-1 block">{campo.label}</label>
                                        <input
                                            type={campo.type}
                                            name={campo.name}
                                            value={(form as any)[campo.name]}
                                            onChange={handleChange}
                                            disabled={editando && campo.name === 'id'}
                                            className="w-full bg-zinc-800 text-white rounded-lg px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:border-zinc-400 disabled:opacity-50"
                                        />
                                    </div>
                                ))}

                                <div>
                                    <label className="text-xs text-zinc-400 mb-1 block">Tipo</label>
                                    <select name="tipo" value={form.tipo} onChange={handleChange}
                                        className="w-full bg-zinc-800 text-white rounded-lg px-3 py-2 text-sm border border-zinc-700 focus:outline-none">
                                        <option value="MECANICA_ALTURA">Mecánica de altura</option>
                                        <option value="ACUATICA">Acuática</option>
                                        <option value="OTRO">Otro</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs text-zinc-400 mb-1 block">Estado</label>
                                    <select name="estado" value={form.estado} onChange={handleChange}
                                        className="w-full bg-zinc-800 text-white rounded-lg px-3 py-2 text-sm border border-zinc-700 focus:outline-none">
                                        <option value="ACTIVA">Activa</option>
                                        <option value="EN_MANTENIMIENTO">En mantenimiento</option>
                                        <option value="CERRADA">Cerrada</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => { setModalAbierto(false); setForm(estadoInicial) }}
                                    className="px-4 py-2 rounded-lg border border-zinc-600 text-zinc-300 hover:bg-zinc-800 transition text-sm">
                                    Cancelar
                                </button>
                                <button onClick={handleGuardar} disabled={guardando}
                                    className="px-4 py-2 rounded-lg bg-white text-black font-bold hover:bg-zinc-300 transition text-sm disabled:opacity-50">
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