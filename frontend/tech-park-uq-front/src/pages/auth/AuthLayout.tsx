import { Link, Outlet } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'

export default function AuthLayout() {
  return (
    <MainLayout>
      <div className="min-h-screen px-6 py-10">
        <header className="mx-auto flex max-w-md justify-between gap-4 text-sm text-white">
          <Link to="/" className="hover:underline">
            ← Inicio
          </Link>
          <span className="font-['Ghastly_Panic'] text-2xl tracking-wider text-white">tech-park-uq</span>
        </header>
        <Outlet />
      </div>
    </MainLayout>
  )
}
