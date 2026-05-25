import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [cargando, setCargando] = useState(false)
    const navigate = useNavigate()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const { login } = useAuth()

    const handleLogin = () => {
        if (!form.email || !form.password) {
            setError('Completa todos los campos')
            return
        }
        setCargando(true)
        setError('')
        login(form.email, form.password)
            .then((usuario) => {
                if (usuario.rol === 'Administrador' || usuario.rol === 'Operador') {
                    navigate('/')
                } else {
                    navigate('/')
                }
            })
            .catch(() => setError('Credenciales incorrectas'))
            .finally(() => setCargando(false))
    }
    return (
        <div className="bg-black text-white min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md px-8">
                <h1 className="font-['Ghastly_Panic'] text-6xl uppercase tracking-widest text-center mb-2">
                    Tech-Park-UQ
                </h1>
                <p className="text-white text-center text-sm tracking-widest uppercase mb-10">
                    Inicia sesión
                </p>

                <div className="bg-black border border-white rounded-2xl p-8 flex flex-col gap-4">
                    {error && (
                        <p className="text-red-400 text-sm text-center">{error}</p>
                    )}

                    <div>
                        <label className="text-white text-xs mb-1 block">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full bg-black text-white rounded-lg px-3 py-2 text-sm border border-white focus:outline-none focus:border-white"
                        />
                    </div>

                    <div>
                        <label className="text-white text-xs mb-1 block">Contraseña</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full bg-black text-white rounded-lg px-3 py-2 text-sm border border-white focus:outline-none focus:border-white"
                        />
                    </div>

                    <button
                        onClick={handleLogin}
                        disabled={cargando}
                        className="mt-2 w-full bg-white text-black font-bold py-2 rounded-lg hover:bg-white transition disabled:opacity-50"
                    >
                        {cargando ? 'Entrando...' : 'Entrar'}
                    </button>

                    <p className="text-center text-white text-sm">
                        ¿No tienes cuenta?{' '}
                        <Link to="/register" className="text-white hover:underline">
                            Regístrate
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
