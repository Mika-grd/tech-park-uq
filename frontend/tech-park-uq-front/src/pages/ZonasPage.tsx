import { useEffect, useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import { api } from '../services/api'

interface Zona {
    id: string
    nombre: string
    capacidadMaxima: number
    visitantesActuales: number
}

const estadoInicial = {
    id: '',
    nombre: '',
    capacidadMaxima: 0,
    visitantesActuales: 0
}

export default function ZonasPage() {
    const [zonas, setZonas] = useState<Zona[]>([])
    const [loading, setLoading] = useState(true)
    const [modalAbierto, setModalAbierto] = useState(false)
    const [editando, setEditando] = useState(false)
    const [form, setForm] = useState(estadoInicial)
    const [guardando, setGuardando] = useState(false)

    const cargarZonas = () => {
        setLoading(true)
        api.get('/zonas')
            .then(res => setZonas(Array.isArray(res.data) ? res.data : []))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }

    useEffect(() => { cargarZonas() }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const abrirNuevo = () => {
        setForm(estadoInicial)
        setEditando(false)
        setModalAbierto(true)
    }

    const abrirEditar = (z: Zona) => {
        setForm(z)
        setEditando(true)
        setModalAbierto(true)
    }

    const handleGuardar = () => {
        if (!form.id || !form.nombre) return
        setGuardando(true)

        const payload = {
            ...form,
            capacidadMaxima: Number(form.capacidadMaxima),
            visitantesActuales: Number(form.visitantesActuales)
        }

        const peticion = editando
            ? api.put(`/zonas/${form.id}`, payload)
            : api.post('/zonas', payload)

        peticion
            .then(() => {
                cargarZonas()
                setModalAbierto(false)
                setForm(estadoInicial)
            })
            .catch(err => {
                const msg = err.response?.data
                alert(msg || 'Error al guardar la zona')
            })
            .finally(() => setGuardando(false))
    }

    const handleEliminar = (id: string) => {
        if (!confirm('¿Seguro que quieres eliminar esta zona?')) return
        api.delete(`/zonas/${id}`)
            .then(() => cargarZonas())
            .catch(err => console.error(err))
    }

    const porcentaje = (actual: number, max: number) =>
        max > 0 ? Math.min(Math.round((actual / max) * 100), 100) : 0

    return (
        <MainLayout>
            <div className="bg-black text-white min-h-screen p-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-bold tracking-widest uppercase text-zinc-100">
                        Zonas
                    </h1>
                    <button onClick={abrirNuevo}
                        className="bg-white text-black font-bold px-4 py-2 rounded-lg hover:bg-zinc-300 transition">
                        + Nueva
                    </button>
                </div>

                {loading ? (
                    <p className="text-zinc-500">Cargando...</p>
                ) : zonas.length === 0 ? (
                    <p className="text-zinc-500">No hay zonas registradas.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {zonas.map(z => (
                            <div key={z.id} className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                                <h2 className="text-xl font-semibold mb-1">{z.nombre}</h2>
                                <p className="text-zinc-500 text-xs mb-4 uppercase tracking-widest">{z.id}</p>

                                <div className="mb-4">
                                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                                        <span>Visitantes</span>
                                        <span>{z.visitantesActuales} / {z.capacidadMaxima}</span>
                                    </div>
                                    <div className="w-full bg-zinc-800 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full transition-all"
                                            style={{ width: `${porcentaje(z.visitantesActuales, z.capacidadMaxima)}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button onClick={() => abrirEditar(z)}
                                        className="flex-1 text-sm py-1.5 rounded-lg border border-zinc-600 text-zinc-300 hover:bg-zinc-800 transition">
                                        Editar
                                    </button>
                                    <button onClick={() => handleEliminar(z.id)}
                                        className="flex-1 text-sm py-1.5 rounded-lg border border-red-800 text-red-400 hover:bg-red-950 transition">
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {modalAbierto && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 w-full max-w-md">
                            <h2 className="text-2xl font-bold mb-6 tracking-wide">
                                {editando ? 'Editar Zona' : 'Nueva Zona'}
                            </h2>

                            <div className="flex flex-col gap-4">
                                {[
                                    { label: 'ID', name: 'id' },
                                    { label: 'Nombre', name: 'nombre' },
                                    { label: 'Capacidad máxima', name: 'capacidadMaxima' },
                                    { label: 'Visitantes actuales', name: 'visitantesActuales' },
                                ].map(campo => (
                                    <div key={campo.name}>
                                        <label className="text-xs text-zinc-400 mb-1 block">{campo.label}</label>
                                        <input
                                            type="text"
                                            name={campo.name}
                                            value={(form as any)[campo.name]}
                                            onChange={handleChange}
                                            disabled={editando && campo.name === 'id'}
                                            className="w-full bg-zinc-800 text-white rounded-lg px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:border-zinc-400 disabled:opacity-50"
                                        />
                                    </div>
                                ))}
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