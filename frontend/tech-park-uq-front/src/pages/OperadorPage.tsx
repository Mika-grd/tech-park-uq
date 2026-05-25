import MainLayout from '../layouts/MainLayout'

export default function OperadorPage() {
  return (
    <MainLayout>
      <main className="bg-black min-h-screen p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-['Ghastly_Panic'] text-4xl font-semibold text-white">Panel de Operador</h1>
          <p className="mt-4 text-white">
            Aquí podrás gestionar las atracciones de tu zona y revisar el acceso seguro de visitantes.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <article className="rounded-3xl border border-white bg-black p-6">
              <h2 className="font-['Ghastly_Panic'] text-3xl font-semibold text-white">Atracciones asignadas</h2>
              <p className="mt-2 text-white">Visualiza y actualiza el estado de tus atracciones.</p>
            </article>

            <article className="rounded-3xl border border-white bg-black p-6">
              <h2 className="font-['Ghastly_Panic'] text-3xl font-semibold text-white">Control de acceso</h2>
              <p className="mt-2 text-white">Valida edad, altura y capacidad por ciclo.</p>
            </article>

            <article className="rounded-3xl border border-white bg-black p-6">
              <h2 className="font-['Ghastly_Panic'] text-3xl font-semibold text-white">Cola prioritaria</h2>
              <p className="mt-2 text-white">Procesa primero a los visitantes Fast-Pass.</p>
            </article>

            <article className="rounded-3xl border border-white bg-black p-6">
              <h2 className="font-['Ghastly_Panic'] text-3xl font-semibold text-white">Revisiones técnicas</h2>
              <p className="mt-2 text-white">Registra mantenimientos y cambios de estado.</p>
            </article>
          </div>
        </div>
      </main>
    </MainLayout>
  )
}
