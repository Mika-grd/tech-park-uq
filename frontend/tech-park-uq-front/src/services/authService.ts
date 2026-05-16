import type { LoginResponse, RegisterPayload } from '../types/auth'
import { api } from './api'

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/usuarios/login', { email, password })
  return data
}

export async function register(payload: RegisterPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/usuarios/register', {
    email: payload.email,
    password: payload.password,
    nombre: payload.nombre,
    documento: payload.documento,
    edad: payload.edad,
  estatura: payload.estatura,
  })
  return data
}

export async function logout(): Promise<void> {
  await api.post('/usuarios/logout')
}

export async function addSaldo(amount: number): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/usuarios/saldo', { amount })
  return data
}

export async function getUsuarioByEmail(email: string) {
  const { data } = await api.get('/usuarios/por-email', { params: { email } })
  return data as any
}
