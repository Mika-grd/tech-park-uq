import HomePage from './HomePage'
import AdminDashboard from './AdminPage'
import OperatorDashboard from './OperadorPage'
import { useAuth } from '../context/AuthContext'

export default function RoleLandingPage() {
  const { usuario, ready } = useAuth()

  if (!ready) return null
  if (!usuario) return <HomePage />

  if (usuario.rol === 'Administrador') {
    return <AdminDashboard />
  }

  if (usuario.rol === 'Operador') {
    return <OperatorDashboard />
  }

  return <HomePage />
}
