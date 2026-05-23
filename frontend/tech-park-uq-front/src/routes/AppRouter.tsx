import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import AtraccionesPage from '../pages/AtraccionesPage'
import MapaPage from '../pages/MapaPage'
import ZonasPage from '../pages/ZonasPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import PerfilPage from '../pages/PerfilPage'
import ProtectedRoute from './ProtectedRoute'
import EstadisticasPage from '../pages/EstadisticasPage'
import RoleLandingPage from '../pages/RoleLandingPage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<ProtectedRoute><RoleLandingPage /></ProtectedRoute>} />
        <Route path="/atracciones" element={<ProtectedRoute><AtraccionesPage /></ProtectedRoute>} />
        <Route path="/zonas" element={<ProtectedRoute><ZonasPage /></ProtectedRoute>} />
        <Route path="/mapa" element={<ProtectedRoute><MapaPage /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><PerfilPage /></ProtectedRoute>} />
        <Route path="/estadisticas" element={<ProtectedRoute roles={['Administrador', 'Operador']}><EstadisticasPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}