import { api } from './api'

export async function calcularRuta(origen: string, destino: string): Promise<string[]> {
    const res = await api.get('/ruta', { params: { origen, destino } })
    return res.data.ruta ?? []
}

