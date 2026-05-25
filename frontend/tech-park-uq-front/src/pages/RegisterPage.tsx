import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
    const [form, setForm] = useState({
        email: '',
        password: '',
        nombre: '',
        documento: '',
        edad: '',
        estatura: ''
    })
    const [error, setError] = useState('')
    const [cargando, setCargando] = useState(false)
    const navigate = useNavigate()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const { register } = useAuth()

    const handleRegister = () => {
        if (!form.email || !form.password || !form.nombre || !form.documento) {
            setError('Completa todos los campos obligatorios')
            return
        }
        setCargando(true)
        setError('')
        register({
            email: form.email,
            password: form.password,
            nombre: form.nombre,
            documento: form.documento,
            edad: Number(form.edad),
            estatura: Number(form.estatura),
        })
            .then((usuario) => {
                if (usuario?.rol === 'Administrador' || usuario?.rol === 'Operador') {
                    navigate('/')
                } else {
                    navigate('/')
                }
            })
            .catch(err => {
                if (err.response?.status === 409) {
                    setError('Este email ya está registrado')
                } else {
                    setError('Error al registrarse')
                }
            })
            .finally(() => setCargando(false))
    }

    return (
        <div className="bg-black text-white min-h-screen flex items-center justify-center py-12">
            <div className="w-full max-w-md px-8">
                <h1 className="font-['Ghastly_Panic'] text-6xl uppercase tracking-widest text-center mb-2">
                    Tech-Park-UQ
                </h1>
                <p className="text-white text-center text-sm tracking-widest uppercase mb-10">
                    Crear cuenta
                </p>

                <div className="bg-black border border-white rounded-2xl p-8 flex flex-col gap-4">
                    {error && (
                        <p className="text-red-400 text-sm text-center">{error}</p>
                    )}

                    {[
                        { label: 'Nombre', name: 'nombre', type: 'text' },
                        { label: 'Email', name: 'email', type: 'email' },
                        { label: 'Contraseña', name: 'password', type: 'password' },
                        { label: 'Documento', name: 'documento', type: 'text' },
                        { label: 'Edad', name: 'edad', type: 'number' },
                        { label: 'Estatura (m)', name: 'estatura', type: 'number' },
                    ].map(campo => (
                        <div key={campo.name}>
                            <label className="text-white text-xs mb-1 block">{campo.label}</label>
                            <input
                                type={campo.type}
                                name={campo.name}
                                value={(form as any)[campo.name]}
                                onChange={handleChange}
                                className="w-full bg-black text-white rounded-lg px-3 py-2 text-sm border border-white focus:outline-none focus:border-white"
                            />
                        </div>
                    ))}

                    <button
                        onClick={handleRegister}
                        disabled={cargando}
                        className="mt-2 w-full bg-white text-black font-bold py-2 rounded-lg hover:bg-white transition disabled:opacity-50"
                    >
                        {cargando ? 'Registrando...' : 'Registrarse'}
                    </button>

                    <p className="text-center text-white text-sm">
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" className="text-white hover:underline">
                            Inicia sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
