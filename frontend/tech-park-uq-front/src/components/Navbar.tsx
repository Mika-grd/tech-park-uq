import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const allLinks = [
    { path: '/', label: 'Inicio', roles: null },
    { path: '/atracciones', label: 'Atracciones', roles: null },
    { path: '/zonas', label: 'Zonas', roles: null },
    { path: '/mapa', label: 'Mapa', roles: null },
    { path: '/estadisticas', label: 'Estadísticas', roles: ['Administrador', 'Operador'] },
]

export default function Navbar() {
    const { pathname } = useLocation()
    const { usuario, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout().then(() => navigate('/login'))
    }

    const links = allLinks.filter(link =>
        !link.roles || (usuario && link.roles.includes(usuario.rol))
    )

    return (
        <nav className="bg-zinc-950 border-b border-zinc-800 px-8 py-4 flex items-center justify-between">
            <span className="font-['Metal_Mania'] text-xl text-white tracking-widest">
                TECH-PARK-UQ
            </span>

            <ul className="flex gap-6">
                {links.map(link => (
                    <li key={link.path}>
                        <Link
                            to={link.path}
                            className={`text-sm tracking-widest uppercase transition ${pathname === link.path
                                ? 'text-white font-bold'
                                : 'text-zinc-500 hover:text-white'
                                }`}
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>

            <div className="flex items-center gap-4">
                {usuario ? (
                    <>
                        <Link to="/perfil" className="text-zinc-400 text-sm hover:text-white transition">
                            {usuario.nombre}
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="text-sm text-red-400 hover:text-red-300 transition uppercase tracking-widest"
                        >
                            Salir
                        </button>
                    </>
                ) : (
                    <Link
                        to="/login"
                        className="text-sm text-zinc-500 hover:text-white transition uppercase tracking-widest"
                    >
                        Iniciar sesión
                    </Link>
                )}
            </div>
        </nav>
    )
}