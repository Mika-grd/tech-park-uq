import type { ReactNode } from 'react'
import Navbar from '../components/Navbar'

interface Props {
  children: ReactNode
}

export default function MainLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      {children}
    </div>
  )
}