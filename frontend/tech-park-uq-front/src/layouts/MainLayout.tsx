import type { ReactNode } from 'react'
import Navbar from '../components/Navbar'
import NotificacionBanner from '../components/NotificacionBanner'

interface Props {
  children: ReactNode
}

export default function MainLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <NotificacionBanner />
      {children}
    </div>
  )
}
