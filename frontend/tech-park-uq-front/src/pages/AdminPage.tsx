import MainLayout from '../layouts/MainLayout'
import { useAuth } from '../context/AuthContext'

export default function AdminPage() {
  const { usuario, ready } = useAuth()

  if (!ready) return null

  const ocultarZonasYAtracciones = usuario?.rol === 'Administrador'

  return (
    <MainLayout>
      <main className="bg-black min-h-screen p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-semibold text-white">Panel de Administrador</h1>
          <p className="mt-4 text-zinc-400">Bienvenido, {usuario?.nombre}</p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {!ocultarZonasYAtracciones && (
              <article className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
                <h2 className="text-xl font-semibold text-white">Gestión de zonas</h2>
                <p className="mt-2 text-zinc-400">Crea, edita y asigna operadores a las zonas.</p>
              </article>
            )}

            {!ocultarZonasYAtracciones && (
              <article className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
                <h2 className="text-xl font-semibold text-white">Gestión de atracciones</h2>
                <p className="mt-2 text-zinc-400">Administra estados, capacidad y acceso de atracciones.</p>
              </article>
            )}

            <article className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <h2 className="text-xl font-semibold text-white">Gestión de operadores</h2>
              <p className="mt-2 text-zinc-400">Registra nuevos operadores.</p>
            </article>

            <article className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <h2 className="text-xl font-semibold text-white">Reportes</h2>
              <p className="mt-2 text-zinc-400">Consulta ingresos, visitantes y alertas de mantenimiento.</p>
            </article>
          </div>
        </div>
      </main>
    </MainLayout>
  )
}
