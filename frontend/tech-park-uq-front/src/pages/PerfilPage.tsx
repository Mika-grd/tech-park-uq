import { useEffect, useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { useNavigate } from 'react-router-dom'

interface PerfilData {
    id: number
    email: string
    nombre: string
    rol: string
    activo: boolean
    documento?: string
    edad?: number
    estatura?: number
    saldoVirtual?: number
}

export default function PerfilPage() {
    const { usuario, logout } = useAuth()
    const navigate = useNavigate()
    const [perfil, setPerfil] = useState<PerfilData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!usuario) {
            navigate('/login')
            return
        }
        setPerfil(usuario as any)
        setLoading(false)
    }, [usuario])

    const handleLogout = () => {
        logout().then(() => navigate('/login'))
    }

    if (loading) return (
        <MainLayout>
            <div className="bg-black text-white min-h-screen flex items-center justify-center">
                <p className="text-zinc-500">Cargando perfil...</p>
            </div>
        </MainLayout>
    )

    return (
        <MainLayout>
            <div className="bg-black text-white min-h-screen p-8">
                <h1 className="text-4xl font-bold tracking-widest uppercase text-zinc-100 mb-8">
                    Mi Perfil
                </h1>

                <div className="max-w-2xl grid grid-cols-1 gap-6">

                    {/* Tarjeta principal */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
                        <div className="flex items-center gap-6 mb-6">
                            <div className="w-16 h-16 rounded-full bg-zinc-700 flex items-center justify-center text-2xl font-bold">
                                {perfil?.nombre?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold">{perfil?.nombre}</h2>
                                <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-1 rounded-full uppercase tracking-widest">
                                    {perfil?.rol}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Email', value: perfil?.email },
                                { label: 'Documento', value: perfil?.documento ?? '—' },
                                { label: 'Edad', value: perfil?.edad ? `${perfil.edad} años` : '—' },
                                { label: 'Estatura', value: perfil?.estatura ? `${perfil.estatura} m` : '—' },
                            ].map(item => (
                                <div key={item.label} className="bg-zinc-800 rounded-xl p-4">
                                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">{item.label}</p>
                                    <p className="text-white font-medium">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Saldo virtual */}
                    {perfil?.saldoVirtual !== undefined && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
                            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Saldo Virtual</p>
                            <p className="text-4xl font-bold text-green-400">
                                ${perfil.saldoVirtual.toLocaleString()}
                            </p>
                        </div>
                    )}

                    {/* Cerrar sesión */}
                    <button
                        onClick={handleLogout}
                        className="w-full py-3 rounded-xl border border-red-800 text-red-400 hover:bg-red-950 transition text-sm uppercase tracking-widest"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </MainLayout>
    )
}