import { api } from './api'

export type TipoTicket = 'GENERAL' | 'FAMILIAR' | 'FAST_PASS'

export interface TicketActivo {
    id: number
    tipo: TipoTicket
    precio: number
    fechaCompra: string
}

export async function getPrecios(): Promise<Record<TipoTicket, number>> {
    const res = await api.get('/tickets/precios')
    return res.data
}

export async function getTicketActivo(): Promise<TicketActivo | null> {
    const res = await api.get('/tickets/activo')
    if (!res.data || !res.data.tipo) return null
    return res.data
}

export async function comprarTicket(tipo: TipoTicket): Promise<TicketActivo> {
    const res = await api.post('/tickets/comprar', { tipo })
    return res.data
}
