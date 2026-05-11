import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import AtraccionesPage from '../pages/AtraccionesPage'
import MapaPage from '../pages/MapaPage'
import ZonasPage from '../pages/ZonasPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import PerfilPage from '../pages/PerfilPage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/atracciones" element={<AtraccionesPage />} />
        <Route path="/mapa" element={<MapaPage />} />
        <Route path="/zonas" element={<ZonasPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/perfil" element={<PerfilPage />} />
      </Routes>
    </BrowserRouter>
  )
}