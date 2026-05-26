import MainLayout from '../layouts/MainLayout'
import { useAuth } from '../context/AuthContext'

export default function OperadorPage() {
  const { usuario } = useAuth()

  return (
    <MainLayout>
      <main className="bg-black text-white min-h-screen relative flex items-center justify-center">
        {usuario?.nombre && (
          <p className="absolute top-6 left-8 text-sm text-white tracking-widest uppercase">
            Bienvenido, {usuario.nombre}
          </p>
        )}
        <div className="text-center">
          <h1 className="font-['Ghastly_Panic'] text-7xl md:text-[10rem] uppercase tracking-[0.12em] text-white leading-none drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            tech-park-uq
          </h1>
          <p className="mt-6 text-sm md:text-base tracking-[0.35em] uppercase text-white">
            Sistema de gestión del parque
          </p>
        </div>
      </main>
    </MainLayout>
  )
}
