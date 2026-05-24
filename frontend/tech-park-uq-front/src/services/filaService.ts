import { api } from './api'

export async function unirseAFila(atraccionId: string): Promise<{ posicion: number }> {
    const res = await api.post(`/visitante/fila/${atraccionId}`)
    return res.data
}

export async function getPosicionEnFila(atraccionId: string): Promise<{ posicion: number }> {
    const res = await api.get(`/visitante/fila/${atraccionId}/posicion`)
    return res.data
}

export async function salirDeFila(atraccionId: string): Promise<void> {
    await api.delete(`/visitante/fila/${atraccionId}`)
}