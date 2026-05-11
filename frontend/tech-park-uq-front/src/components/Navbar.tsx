import { Link, useLocation } from 'react-router-dom'

const links = [
    { path: '/', label: 'Inicio' },
    { path: '/atracciones', label: 'Atracciones' },
    { path: '/zonas', label: 'Zonas' },
    { path: '/mapa', label: 'Mapa' },
]

export default function Navbar() {
    const { pathname } = useLocation()

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
        </nav>
    )
}