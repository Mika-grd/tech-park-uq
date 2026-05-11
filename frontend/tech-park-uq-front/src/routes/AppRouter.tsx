import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import AtraccionesPage from '../pages/AtraccionesPage'
import MapaPage from '../pages/MapaPage'
import ZonasPage from '../pages/ZonasPage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/atracciones" element={<AtraccionesPage />} />
        <Route path="/mapa" element={<MapaPage />} />
        <Route path="/zonas" element={<ZonasPage />} />
      </Routes>
    </BrowserRouter>
  )
}