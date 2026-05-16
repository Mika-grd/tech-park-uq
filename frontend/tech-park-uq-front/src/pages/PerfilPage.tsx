import { useEffect, useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import { useAuth } from '../context/AuthContext'
import { addSaldo, getUsuarioByEmail } from '../services/authService'
import { useNavigate } from 'react-router-dom'
import { getFavoritos, removeFavorito } from '../services/favoritosService'
import { getHistorial } from '../services/historialService'


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
    const [adding, setAdding] = useState(false)
    const [amount, setAmount] = useState('')
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)
    const [favoritos, setFavoritos] = useState<string[]>([])

    const [historial, setHistorial] = useState<string[]>([])

    useEffect(() => {
        getHistorial()
            .then(setHistorial)
            .catch(() => { })
    }, [])

    useEffect(() => {
        getFavoritos()
            .then(setFavoritos)
            .catch(() => { })
    }, [])

    useEffect(() => {
        if (!usuario) {
            navigate('/login')
            return
        }
        setPerfil(usuario as any)
        setLoading(false)
            ; (async () => {
                try {
                    const fresh = await getUsuarioByEmail(usuario.email)
                    if (fresh) {
                        setPerfil(fresh)
                        try {
                            sessionStorage.setItem('techpark_usuario', JSON.stringify(fresh))
                        } catch { }
                    }
                } catch (e) {
                    console.debug('No se pudo refrescar perfil', e)
                }
            })()
    }, [usuario])

    const handleLogout = () => {
        logout().then(() => navigate('/login'))
    }

    const handleRemoveFavorito = async (id: string) => {
        const updated = await removeFavorito(id)
        setFavoritos(updated)
    }

    async function handleAddSaldo() {
        setErrorMsg(null)
        setSuccessMsg(null)
        if (!amount) return
        const v = Number.parseFloat(amount)
        if (Number.isNaN(v) || v <= 0) {
            setErrorMsg('Monto inválido')
            return
        }
        setAdding(true)
        try {
            const res = await addSaldo(v)
            const usuario = res.usuario
            setPerfil(usuario as any)
            try {
                sessionStorage.setItem('techpark_usuario', JSON.stringify(usuario))
            } catch { }
            setAmount('')
            setSuccessMsg('Saldo agregado')

            try {
                const fresh = await getUsuarioByEmail(usuario.email)
                if (fresh) {
                    setPerfil(fresh)
                    try {
                        sessionStorage.setItem('techpark_usuario', JSON.stringify(fresh))
                    } catch { }
                }
            } catch { }
        } catch (e: any) {
            console.error('Error agregando saldo', e)
            const status = e?.response?.status
            const body = e?.response?.data
            setErrorMsg(`Error ${status ?? ''}: ${body?.message ?? JSON.stringify(body) ?? 'Error agregando saldo'}`)
        } finally {
            setAdding(false)
        }

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
                    {(perfil?.rol === 'Visitante' || perfil?.saldoVirtual !== undefined) && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Saldo Virtual</p>
                                    <p className="text-4xl font-bold text-green-400">
                                        ${((perfil?.saldoVirtual ?? 0)).toLocaleString()}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min={0.01}
                                        step="0.01"
                                        placeholder="Monto a agregar"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-40 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none"
                                    />
                                    <button
                                        onClick={handleAddSaldo}
                                        disabled={adding}
                                        className="rounded-lg bg-green-600 px-4 py-2 text-black font-semibold disabled:opacity-50"
                                    >
                                        {adding ? 'Procesando…' : 'Agregar'}
                                    </button>
                                </div>
                            </div>

                            {errorMsg && <p className="text-sm text-red-400 mt-3">{errorMsg}</p>}
                            {successMsg && <p className="text-sm text-green-300 mt-3">{successMsg}</p>}
                        </div>
                    )}

                    {/* Cerrar sesión */}
                    <button
                        onClick={handleLogout}
                        className="w-full py-3 rounded-xl border border-red-800 text-red-400 hover:bg-red-950 transition text-sm uppercase tracking-widest"
                    >
                        Cerrar sesión
                    </button>
                    {/* Favoritos */}
                    {favoritos.length > 0 && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
                            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Atracciones Favoritas</p>
                            <div className="flex flex-wrap gap-2">
                                {favoritos.map(id => (
                                    <div key={id} className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2">
                                        <span className="text-sm text-yellow-400">★ {id}</span>
                                        <button
                                            onClick={() => handleRemoveFavorito(id)}
                                            className="text-zinc-500 hover:text-red-400 text-xs"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* Historial */}
                    {historial.length > 0 && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
                            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Historial de Visitas</p>
                            <div className="flex flex-col gap-2">
                                {historial.map((id, index) => (
                                    <div key={index} className="flex items-center gap-3 bg-zinc-800 rounded-lg px-3 py-2">
                                        <span className="text-zinc-500 text-xs w-5">{index + 1}</span>
                                        <span className="text-sm text-zinc-300">{id}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </MainLayout>
    )
}