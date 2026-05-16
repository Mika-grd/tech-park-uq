import { api } from './api'

export async function getHistorial(): Promise<string[]> {
    const { data } = await api.get<string[]>('/visitante/historial')
    return data
}

export async function registrarVisita(atraccionId: string): Promise<string[]> {
    const { data } = await api.post<string[]>(`/visitante/historial/${atraccionId}`)
    return data
}
