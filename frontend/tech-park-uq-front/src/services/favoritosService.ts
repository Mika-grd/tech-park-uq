import { api } from './api'

export async function getFavoritos(): Promise<string[]> {
    const { data } = await api.get<string[]>('/visitante/favoritos')
    return data
}

export async function addFavorito(atraccionId: string): Promise<string[]> {
    const { data } = await api.post<string[]>(`/visitante/favoritos/${atraccionId}`)
    return data
}

export async function removeFavorito(atraccionId: string): Promise<string[]> {
    const { data } = await api.delete<string[]>(`/visitante/favoritos/${atraccionId}`)
    return data
}

