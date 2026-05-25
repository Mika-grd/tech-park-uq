import { useEffect, useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import { useAuth } from '../context/AuthContext'
import { addSaldo, getUsuarioByEmail } from '../services/authService'
import { useNavigate } from 'react-router-dom'
import { getFavoritos, removeFavorito } from '../services/favoritosService'
import { getHistorial } from '../services/historialService'
import { getTicketActivo, comprarTicket, type TipoTicket, type TicketActivo } from '../services/ticketService'
import { api } from '../services/api'

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
    const [nombresAtracciones, setNombresAtracciones] = useState<Record<string, string>>({})

    const [historial, setHistorial] = useState<string[]>([])
    const [ticket, setTicket] = useState<TicketActivo | null>(null)
    const [comprandoTicket, setComprandoTicket] = useState(false)

    useEffect(() => {
        api.get('/atracciones')
            .then(res => {
                const mapa: Record<string, string> = {}
                if (Array.isArray(res.data)) {
                    res.data.forEach((a: { id: string; nombre: string }) => { mapa[a.id] = a.nombre })
                }
                setNombresAtracciones(mapa)
            })
            .catch(() => { })
    }, [])

    useEffect(() => {
        getHistorial()
            .then(setHistorial)
            .catch(() => { })
    }, [])

    useEffect(() => {
        getTicketActivo().then(setTicket).catch(() => {})
    }, [])

    const handleComprarTicket = async (tipo: TipoTicket) => {
        setComprandoTicket(true)
        try {
            const t = await comprarTicket(tipo)
            setTicket(t)
            const fresh = await getUsuarioByEmail(usuario!.email)
            if (fresh) setPerfil(fresh)
        } catch (e: any) {
            alert(e?.response?.data?.message ?? 'Error al comprar ticket')
        } finally {
            setComprandoTicket(false)
        }
    }

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
                <p className="text-white">Cargando perfil...</p>
            </div>
        </MainLayout>
    )

    return (
        <MainLayout>
            <div className="bg-black text-white min-h-screen p-8">
                <h1 className="font-['Ghastly_Panic'] text-4xl font-bold tracking-widest uppercase text-white mb-8">
                    Mi Perfil
                </h1>

                <div className="max-w-2xl grid grid-cols-1 gap-6">

                    {/* Tarjeta principal */}
                    <div className="bg-black border border-white rounded-2xl p-8">
                        <div className="flex items-center gap-6 mb-6">
                            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-2xl font-bold text-black">
                                {perfil?.nombre?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="font-['Ghastly_Panic'] text-3xl font-semibold">{perfil?.nombre}</h2>
                                <span className="text-xs bg-white text-black px-2 py-1 rounded-full uppercase tracking-widest">
                                    {perfil?.rol}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Email', value: perfil?.email },
                                { label: 'Documento', value: perfil?.documento ?? '—' },
                                { label: 'Edad', value: perfil?.edad ? `${perfil.edad} años` : '—' },
                                { label: 'Estatura', value: perfil?.estatura ? `${perfil.estatura} cm` : '—' },
                            ].map(item => (
                                <div key={item.label} className="bg-black border border-white rounded-xl p-4">
                                    <p className="text-xs text-white uppercase tracking-widest mb-1">{item.label}</p>
                                    <p className="text-white font-medium">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Saldo virtual */}
                    {(perfil?.rol === 'Visitante' || perfil?.saldoVirtual !== undefined) && (
                        <div className="bg-black border border-white rounded-2xl p-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-white uppercase tracking-widest mb-2">Saldo Virtual</p>
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
                                        className="w-40 rounded-lg border border-white bg-black px-3 py-2 text-white outline-none"
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

                    {/* Ticket */}
                    <div className="bg-black border border-white rounded-2xl p-8">
                        <p className="text-xs text-white uppercase tracking-widest mb-4">Mi Ticket</p>
                        {ticket ? (
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                                        ticket.tipo === 'FAST_PASS' ? 'bg-purple-600 text-white' :
                                        ticket.tipo === 'FAMILIAR' ? 'bg-blue-600 text-white' :
                                        'bg-white text-black'
                                    }`}>
                                        {ticket.tipo.replace('_', ' ')}
                                    </span>
                                    <p className="text-white text-xs mt-2">
                                        Comprado el {new Date(ticket.fechaCompra).toLocaleDateString()}
                                    </p>
                                    <p className="text-white text-xs">Precio: ${ticket.precio.toLocaleString()}</p>
                                </div>
                                <button
                                    onClick={() => handleComprarTicket(ticket.tipo)}
                                    disabled={comprandoTicket}
                                    className="text-xs border border-white text-white px-3 py-1.5 rounded-lg hover:bg-white hover:text-black transition disabled:opacity-50"
                                >
                                    Renovar
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-3">
                                {([
                                    { tipo: 'GENERAL' as TipoTicket, precio: 50000, color: 'border-white hover:bg-white hover:text-black' },
                                    { tipo: 'FAMILIAR' as TipoTicket, precio: 35000, color: 'border-blue-700 hover:bg-blue-950' },
                                    { tipo: 'FAST_PASS' as TipoTicket, precio: 80000, color: 'border-purple-700 hover:bg-purple-950' },
                                ]).map(({ tipo, precio, color }) => (
                                    <button
                                        key={tipo}
                                        onClick={() => handleComprarTicket(tipo)}
                                        disabled={comprandoTicket}
                                        className={`flex flex-col items-center gap-1 border rounded-xl p-4 transition disabled:opacity-50 ${color}`}
                                    >
                                        <span className="text-sm font-bold text-white">{tipo.replace('_', ' ')}</span>
                                        <span className="text-xs text-white">${precio.toLocaleString()}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Cerrar sesión */}
                    <button
                        onClick={handleLogout}
                        className="w-full py-3 rounded-xl border border-red-800 text-red-400 hover:bg-red-950 transition text-sm uppercase tracking-widest"
                    >
                        Cerrar sesión
                    </button>

                    {/* Favoritos */}
                    {favoritos.length > 0 && (
                        <div className="bg-black border border-white rounded-2xl p-8">
                            <p className="text-xs text-white uppercase tracking-widest mb-4">Atracciones Favoritas</p>
                            <div className="flex flex-wrap gap-2">
                                {favoritos.map(id => (
                                    <div key={id} className="flex items-center gap-2 bg-black border border-white rounded-lg px-3 py-2">
                                        <span className="text-sm text-yellow-400">★ {nombresAtracciones[id] ?? id}</span>
                                        <button
                                            onClick={() => handleRemoveFavorito(id)}
                                            className="text-white hover:text-red-400 text-xs"
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
                        <div className="bg-black border border-white rounded-2xl p-8">
                            <p className="text-xs text-white uppercase tracking-widest mb-4">Historial de Visitas</p>
                            <div className="flex flex-col gap-2">
                                {historial.map((id, index) => (
                                    <div key={index} className="flex items-center gap-3 bg-black border border-white rounded-lg px-3 py-2">
                                        <span className="text-white text-xs w-5">{index + 1}</span>
                                        <span className="text-sm text-white">{nombresAtracciones[id] ?? id}</span>
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
