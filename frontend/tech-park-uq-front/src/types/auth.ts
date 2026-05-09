export type Usuario = {
  id: number
  email: string
  nombre: string
  rol: string
  activo: boolean
}

export type LoginResponse = {
  usuario: Usuario
}

export type RegisterPayload = {
  email: string
  password: string
  nombre: string
  documento: string
  edad: number
  estatura: number
  saldoVirtual?: number
}
