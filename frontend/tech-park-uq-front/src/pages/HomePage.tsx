import MainLayout from '../layouts/MainLayout'

export default function HomePage() {
  return (
    <MainLayout>
      <main className="bg-black text-white min-h-screen flex items-center justify-center overflow-hidden">
        <div className="text-center px-6">
          <h1
            className="
              font-['Metal_Mania']
              text-7xl
              md:text-[10rem]
              uppercase
              tracking-[0.12em]
              text-zinc-100
              leading-none
              drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]
            "
          >
            tech-park-uq
          </h1>
          <p
            className="
              font-['Inter']
              mt-6
              text-sm
              md:text-base
              tracking-[0.35em]
              uppercase
              text-zinc-500
            "
          >
            Bienvenido
          </p>
        </div>
      </main>
    </MainLayout>
  )
}