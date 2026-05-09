import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import AtraccionesPage from '../pages/AtraccionesPage'
import MapaPage from '../pages/MapaPage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/atracciones" element={<AtraccionesPage />} />
        <Route path="/mapa" element={<MapaPage />} />
      </Routes>
    </BrowserRouter>
  )
}