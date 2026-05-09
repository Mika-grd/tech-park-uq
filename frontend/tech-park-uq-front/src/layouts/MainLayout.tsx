import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function MainLayout({ children }: Props) {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {children}
    </main>
  )
}
