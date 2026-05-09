import MainLayout from '../layouts/MainLayout'
import { useTitle } from '../hooks/useTitle'

export default function HomePage() {
  useTitle('Tech Park UQ')

  return (
    <MainLayout>
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-8 text-white">

        {/* Ambient glow */}
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.03] blur-3xl" />

        {/* Noise grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:120px_120px]" />

        <div className="relative z-10 w-full max-w-6xl">

          {/* Top label */}
          <div className="mb-12 flex items-center justify-between border-b border-white/10 pb-4">

            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-600">
                Tech Park Operational System
              </p>
            </div>

            <div className="h-2 w-2 animate-pulse rounded-full bg-white/40" />
          </div>

          {/* Hero */}
          <div className="max-w-4xl">

            <p className="mb-6 text-xs font-light uppercase tracking-[0.6em] text-zinc-700">
              Universidad del Quindío
            </p>

            <h1 className="text-6xl font-thin tracking-[-0.08em] text-white md:text-8xl">
              TECH PARK
            </h1>

            <h2 className="mt-2 text-5xl font-extralight tracking-[0.4em] text-zinc-700 md:text-6xl">
              UQ
            </h2>

            <div className="mt-10 h-px w-32 bg-white/10" />

            <p className="mt-10 max-w-2xl text-sm font-light leading-8 tracking-[0.08em] text-zinc-500">
              Plataforma de simulación y administración operativa para parques
              temáticos. Arquitectura multicapa construida con Spring Boot,
              React, TypeScript y estructuras de datos personalizadas.
            </p>
          </div>

          {/* Bottom panels */}
          <div className="mt-24 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3">

            <div className="bg-black p-8 transition-colors duration-300 hover:bg-white/[0.02]">
              <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-700">
                Backend
              </p>

              <h3 className="mt-4 text-xl font-thin text-white">
                Spring Boot
              </h3>

              <p className="mt-6 text-sm font-light leading-7 text-zinc-600">
                API REST, persistencia JPA y gestión operativa del sistema.
              </p>
            </div>

            <div className="bg-black p-8 transition-colors duration-300 hover:bg-white/[0.02]">
              <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-700">
                Structures
              </p>

              <h3 className="mt-4 text-xl font-thin text-white">
                Data Models
              </h3>

              <p className="mt-6 text-sm font-light leading-7 text-zinc-600">
                Grafos, árboles BST, listas enlazadas y colas de prioridad.
              </p>
            </div>

            <div className="bg-black p-8 transition-colors duration-300 hover:bg-white/[0.02]">
              <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-700">
                Frontend
              </p>

              <h3 className="mt-4 text-xl font-thin text-white">
                React + Vite
              </h3>

              <p className="mt-6 text-sm font-light leading-7 text-zinc-600">
                Interfaz moderna minimalista desarrollada con Tailwind CSS.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-10 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-zinc-700">

            <p>System Online</p>

            <p>v0.1</p>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}
