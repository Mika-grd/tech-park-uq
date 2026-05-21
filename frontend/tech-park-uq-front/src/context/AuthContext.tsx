import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as authService from '../services/authService'
import type { RegisterPayload, Usuario } from '../types/auth'

const STORAGE_KEY = 'techpark_usuario'

type AuthContextValue = {
  usuario: Usuario | null
  ready: boolean
  login: (email: string, password: string) => Promise<Usuario>
  register: (payload: RegisterPayload) => Promise<Usuario>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (raw) {
        setUsuario(JSON.parse(raw) as Usuario)
      }
    } catch {
      sessionStorage.removeItem(STORAGE_KEY)
    } finally {
      setReady(true)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await authService.login(email, password)
    setUsuario(res.usuario)
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(res.usuario))
    return res.usuario
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await authService.register(payload)
    setUsuario(res.usuario)
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(res.usuario))
    return res.usuario
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUsuario(null)
    sessionStorage.removeItem(STORAGE_KEY)
  }, [])

  const value = useMemo(
    () => ({ usuario, ready, login, register, logout }),
    [usuario, ready, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return ctx
}
