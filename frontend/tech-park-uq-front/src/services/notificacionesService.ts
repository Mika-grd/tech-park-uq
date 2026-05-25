import { api } from './api'

export interface Notificacion {
  id: number
  usuarioId: number
  mensaje: string
  leida: boolean
  fechaCreacion: string
}

export async function getMisNotificaciones(): Promise<Notificacion[]> {
  const res = await api.get('/notificaciones')
  return Array.isArray(res.data) ? res.data : []
}

export async function marcarLeida(id: number): Promise<void> {
  await api.patch(`/notificaciones/${id}/leer`)
}

export async function marcarTodasLeidas(): Promise<void> {
  await api.patch('/notificaciones/leer-todas')
}
