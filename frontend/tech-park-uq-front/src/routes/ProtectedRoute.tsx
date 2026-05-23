import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface Props {
  children: React.ReactNode
  roles?: string[]
}

export default function ProtectedRoute({ children, roles }: Props) {
    const { usuario, ready } = useAuth()

    if (!ready) return null

    if (!usuario) return <Navigate to="/login" replace />

    if (roles && !roles.includes(usuario.rol)) return <Navigate to="/" replace />

    return <>{children}</>
}
