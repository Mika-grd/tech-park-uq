import { Link, Outlet } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'

export default function AuthLayout() {
  return (
    <MainLayout>
      <div className="min-h-screen px-6 py-10">
        <header className="mx-auto flex max-w-md justify-between gap-4 text-sm text-zinc-500">
          <Link to="/" className="hover:text-zinc-300">
            ← Inicio
          </Link>
          <span className="font-['Metal_Mania'] tracking-wider text-zinc-400">tech-park-uq</span>
        </header>
        <Outlet />
      </div>
    </MainLayout>
  )
}
