import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import AtraccionesPage from '../pages/AtraccionesPage'
import AuthLayout from '../pages/auth/AuthLayout'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Navigate to="/auth/login" replace />} />
        <Route path="/auth" element={<AuthLayout />}>
          <Route index element={<Navigate to="/auth/login" replace />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
        <Route path="/atracciones" element={<AtraccionesPage />} />
      </Routes>
    </BrowserRouter>
  )
}