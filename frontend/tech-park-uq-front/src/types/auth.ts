export type Usuario = {
  id: number
  email: string
  nombre: string
  rol: string
  activo: boolean
  documento?: string | null
  edad?: number | null
  estatura?: number | null
  saldoVirtual?: number | null
  zonaAsignada?: string | null
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
