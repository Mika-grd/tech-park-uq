import { api } from './api'

export async function getHistorial(): Promise<string[]> {
    const { data } = await api.get<string[]>('/usuarios/historial')
    return data
}

export async function registrarVisita(atraccionId: string): Promise<string[]> {
    const { data } = await api.post<string[]>(`/usuarios/historial/${atraccionId}`)
    return data
}
