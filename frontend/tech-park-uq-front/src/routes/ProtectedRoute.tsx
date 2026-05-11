import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { usuario, ready } = useAuth()

    if (!ready) return null

    if (!usuario) return <Navigate to="/login" replace />

    return <>{children}</>
}