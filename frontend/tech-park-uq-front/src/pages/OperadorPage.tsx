import MainLayout from '../layouts/MainLayout'

export default function OperadorPage() {
  return (
    <MainLayout>
      <main className="bg-black min-h-screen p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-semibold text-white">Panel de Operador</h1>
          <p className="mt-4 text-zinc-400">
            Aquí podrás gestionar las atracciones de tu zona y revisar el acceso seguro de visitantes.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <article className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <h2 className="text-xl font-semibold text-white">Atracciones asignadas</h2>
              <p className="mt-2 text-zinc-400">Visualiza y actualiza el estado de tus atracciones.</p>
            </article>

            <article className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <h2 className="text-xl font-semibold text-white">Control de acceso</h2>
              <p className="mt-2 text-zinc-400">Valida edad, altura y capacidad por ciclo.</p>
            </article>

            <article className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <h2 className="text-xl font-semibold text-white">Cola prioritaria</h2>
              <p className="mt-2 text-zinc-400">Procesa primero a los visitantes Fast-Pass.</p>
            </article>

            <article className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <h2 className="text-xl font-semibold text-white">Revisiones técnicas</h2>
              <p className="mt-2 text-zinc-400">Registra mantenimientos y cambios de estado.</p>
            </article>
          </div>
        </div>
      </main>
    </MainLayout>
  )
}
