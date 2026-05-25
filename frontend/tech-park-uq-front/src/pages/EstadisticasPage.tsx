import { useEffect, useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import { api } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

interface Atraccion {
    id: string
    nombre: string
    tipo: string
    estado: 'ACTIVA' | 'EN_MANTENIMIENTO' | 'CERRADA'
    visitantesAcumulados: number
    tiempoEspera: number
    capacidadMaxima: number
}

const COLORES = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function EstadisticasPage() {
    const [atracciones, setAtracciones] = useState<Atraccion[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/atracciones')
            .then(res => setAtracciones(Array.isArray(res.data) ? res.data : []))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [])

    const porEstado = [
        { name: 'Activas', value: atracciones.filter(a => a.estado === 'ACTIVA').length },
        { name: 'Mantenimiento', value: atracciones.filter(a => a.estado === 'EN_MANTENIMIENTO').length },
        { name: 'Cerradas', value: atracciones.filter(a => a.estado === 'CERRADA').length },
    ].filter(d => d.value > 0)

    const porTipo = [
        { name: 'Mecánica', value: atracciones.filter(a => a.tipo === 'MECANICA_ALTURA').length },
        { name: 'Acuática', value: atracciones.filter(a => a.tipo === 'ACUATICA').length },
        { name: 'Otro', value: atracciones.filter(a => a.tipo === 'OTRO').length },
    ].filter(d => d.value > 0)

    const topVisitantes = [...atracciones]
        .sort((a, b) => b.visitantesAcumulados - a.visitantesAcumulados)
        .slice(0, 5)

    const topCapacidad = [...atracciones]
        .sort((a, b) => b.capacidadMaxima - a.capacidadMaxima)
        .slice(0, 5)

    const topEspera = [...atracciones]
        .sort((a, b) => b.tiempoEspera - a.tiempoEspera)
        .slice(0, 5)

    return (
        <MainLayout>
            <div className="bg-black text-white min-h-screen p-8">
                <h1 className="font-['Ghastly_Panic'] text-6xl font-bold tracking-widest uppercase text-white mb-8">
                    Estadísticas
                </h1>

                {loading ? (
                    <p className="text-white">Cargando...</p>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Visitantes por atracción */}
                        <div className="bg-black border border-white rounded-2xl p-6">
                            <h2 className="font-['Ghastly_Panic'] text-3xl font-semibold mb-6 tracking-wide">Visitantes acumulados</h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={topVisitantes}>
                                    <XAxis dataKey="nombre" tick={{ fill: '#ffffff', fontSize: 11 }} />
                                    <YAxis tick={{ fill: '#ffffff', fontSize: 11 }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#000000', border: '1px solid #ffffff', borderRadius: 8 }} />
                                    <Bar dataKey="visitantesAcumulados" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Tiempo de espera */}
                        <div className="bg-black border border-white rounded-2xl p-6">
                            <h2 className="font-['Ghastly_Panic'] text-3xl font-semibold mb-6 tracking-wide">Tiempo de espera (min)</h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={topEspera}>
                                    <XAxis dataKey="nombre" tick={{ fill: '#ffffff', fontSize: 11 }} />
                                    <YAxis tick={{ fill: '#ffffff', fontSize: 11 }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#000000', border: '1px solid #ffffff', borderRadius: 8 }} />
                                    <Bar dataKey="tiempoEspera" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Por estado */}
                        <div className="bg-black border border-white rounded-2xl p-6">
                            <h2 className="font-['Ghastly_Panic'] text-3xl font-semibold mb-6 tracking-wide">Atracciones por estado</h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={porEstado} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                        {porEstado.map((_, i) => (
                                            <Cell key={i} fill={COLORES[i % COLORES.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#000000', border: '1px solid #ffffff', borderRadius: 8 }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Por tipo */}
                        <div className="bg-black border border-white rounded-2xl p-6">
                            <h2 className="font-['Ghastly_Panic'] text-3xl font-semibold mb-6 tracking-wide">Atracciones por tipo</h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={porTipo} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                        {porTipo.map((_, i) => (
                                            <Cell key={i} fill={COLORES[i % COLORES.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#000000', border: '1px solid #ffffff', borderRadius: 8 }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Ranking de más visitadas */}
                        <div className="bg-black border border-white rounded-2xl p-6 lg:col-span-2">
                            <h2 className="font-['Ghastly_Panic'] text-3xl font-semibold mb-6 tracking-wide">Ranking de atracciones más visitadas</h2>
                            <div className="flex flex-col gap-3">
                                {[...atracciones]
                                    .sort((a, b) => b.visitantesAcumulados - a.visitantesAcumulados)
                                    .map((a, index) => {
                                        const max = atracciones.reduce((m, x) => Math.max(m, x.visitantesAcumulados), 1)
                                        const pct = Math.round((a.visitantesAcumulados / max) * 100)
                                        return (
                                            <div key={a.id} className="flex items-center gap-4">
                                                <span className="text-white text-xs w-5 text-right">{index + 1}</span>
                                                <span className="text-sm text-white w-40 truncate">{a.nombre}</span>
                                                <div className="flex-1 bg-white rounded-full h-2">
                                                    <div
                                                        className="bg-amber-500 h-2 rounded-full transition-all"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-white w-16 text-right">{a.visitantesAcumulados} visitas</span>
                                            </div>
                                        )
                                    })}
                            </div>
                        </div>

                        {/* Tabla resumen */}
                        <div className="bg-black border border-white rounded-2xl p-6 lg:col-span-2">
                            <h2 className="font-['Ghastly_Panic'] text-3xl font-semibold mb-6 tracking-wide">Resumen de atracciones</h2>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-white uppercase tracking-widest text-xs border-b border-white">
                                        <th className="text-left pb-3">Nombre</th>
                                        <th className="text-left pb-3">Tipo</th>
                                        <th className="text-left pb-3">Estado</th>
                                        <th className="text-left pb-3">Visitantes</th>
                                        <th className="text-left pb-3">Espera</th>
                                        <th className="text-left pb-3">Capacidad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {atracciones.map(a => (
                                        <tr key={a.id} className="border-b border-white hover:bg-white hover:text-black transition">
                                            <td className="py-3">{a.nombre}</td>
                                            <td className="py-3">{a.tipo}</td>
                                            <td className="py-3">
                                                <span className={`text-xs px-2 py-1 rounded-full font-bold ${a.estado === 'ACTIVA' ? 'bg-green-500 text-black' :
                                                    a.estado === 'EN_MANTENIMIENTO' ? 'bg-yellow-500 text-black' :
                                                        'bg-red-500 text-black'
                                                    }`}>
                                                    {a.estado}
                                                </span>
                                            </td>
                                            <td className="py-3">{a.visitantesAcumulados}</td>
                                            <td className="py-3">{a.tiempoEspera} min</td>
                                            <td className="py-3">{a.capacidadMaxima}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    )
}
