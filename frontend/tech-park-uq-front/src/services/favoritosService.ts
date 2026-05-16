import { api } from './api'

export async function getFavoritos(): Promise<string[]> {
    const { data } = await api.get<string[]>('/usuarios/favoritos')
    return data
}

export async function addFavorito(atraccionId: string): Promise<string[]> {
    const { data } = await api.post<string[]>(`/usuarios/favoritos/${atraccionId}`)
    return data
}

export async function removeFavorito(atraccionId: string): Promise<string[]> {
    const { data } = await api.delete<string[]>(`/usuarios/favoritos/${atraccionId}`)
    return data
}

