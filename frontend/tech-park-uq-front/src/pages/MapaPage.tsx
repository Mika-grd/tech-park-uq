import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import MainLayout from '../layouts/MainLayout'
import { api } from '../services/api'

interface Atraccion {
    id: string
    nombre: string
    estado: 'ACTIVA' | 'EN_MANTENIMIENTO' | 'CERRADA'
    tipo: string
}

interface Nodo extends d3.SimulationNodeDatum {
    id: string
    nombre: string
    estado: 'ACTIVA' | 'EN_MANTENIMIENTO' | 'CERRADA'
    tipo: string
}

interface Arista {
    source: string
    target: string
}

export default function MapaPage() {
    const svgRef = useRef<SVGSVGElement>(null)
    const [atracciones, setAtracciones] = useState<Atraccion[]>([])

    useEffect(() => {
        api.get('/atracciones')
            .then(res => setAtracciones(Array.isArray(res.data) ? res.data : []))
            .catch(err => console.error(err))
    }, [])

    useEffect(() => {
        if (!atracciones.length || !svgRef.current) return

        const width = svgRef.current.clientWidth
        const height = svgRef.current.clientHeight

        d3.select(svgRef.current).selectAll('*').remove()

        const nodos: Nodo[] = atracciones.map(a => ({ ...a }))

        // Generar conexiones automáticas entre nodos consecutivos
        const aristas: Arista[] = nodos.slice(0, -1).map((n, i) => ({
            source: n.id,
            target: nodos[i + 1].id
        }))

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)

        const sim = d3.forceSimulation(nodos)
            .force('link', d3.forceLink(aristas).id((d: any) => d.id).distance(160))
            .force('charge', d3.forceManyBody().strength(-400))
            .force('center', d3.forceCenter(width / 2, height / 2))

        const colorNodo = (estado: string) => {
            if (estado === 'ACTIVA') return '#22c55e'
            if (estado === 'EN_MANTENIMIENTO') return '#eab308'
            return '#ef4444'
        }

        // Aristas
        const link = svg.append('g')
            .selectAll('line')
            .data(aristas)
            .enter().append('line')
            .attr('stroke', '#3f3f46')
            .attr('stroke-width', 2)

        // Nodos
        const node = svg.append('g')
            .selectAll('g')
            .data(nodos)
            .enter().append('g')
            .call(
                d3.drag<SVGGElement, Nodo>()
                    .on('start', (event, d) => {
                        if (!event.active) sim.alphaTarget(0.3).restart()
                        d.fx = d.x; d.fy = d.y
                    })
                    .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y })
                    .on('end', (event, d) => {
                        if (!event.active) sim.alphaTarget(0)
                        d.fx = null; d.fy = null
                    })
            )

        node.append('circle')
            .attr('r', 28)
            .attr('fill', d => colorNodo(d.estado))
            .attr('opacity', 0.9)

        node.append('text')
            .text(d => d.nombre.length > 12 ? d.nombre.slice(0, 12) + '…' : d.nombre)
            .attr('text-anchor', 'middle')
            .attr('dy', 44)
            .attr('fill', 'white')
            .attr('font-size', '11px')
            .attr('font-family', 'Inter, sans-serif')

        node.append('text')
            .text(d => d.tipo === 'MECANICA_ALTURA' ? '🎢' : d.tipo === 'ACUATICA' ? '💧' : '🎠')
            .attr('text-anchor', 'middle')
            .attr('dy', 6)
            .attr('font-size', '16px')

        sim.on('tick', () => {
            link
                .attr('x1', (d: any) => d.source.x)
                .attr('y1', (d: any) => d.source.y)
                .attr('x2', (d: any) => d.target.x)
                .attr('y2', (d: any) => d.target.y)

            node.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
        })

    }, [atracciones])

    const colorEstado = (estado: string) => {
        if (estado === 'ACTIVA') return 'bg-green-500'
        if (estado === 'EN_MANTENIMIENTO') return 'bg-yellow-500'
        return 'bg-red-500'
    }

    return (
        <MainLayout>
            <div className="bg-black text-white min-h-screen p-8">
                <h1 className="text-4xl font-bold tracking-widest uppercase text-zinc-100 mb-8">
                    Mapa del Parque
                </h1>

                {/* Leyenda */}
                <div className="flex gap-6 mb-6">
                    {[
                        { label: 'Activa', color: 'bg-green-500' },
                        { label: 'En mantenimiento', color: 'bg-yellow-500' },
                        { label: 'Cerrada', color: 'bg-red-500' },
                    ].map(l => (
                        <div key={l.label} className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${l.color}`} />
                            <span className="text-xs text-zinc-400 uppercase tracking-widest">{l.label}</span>
                        </div>
                    ))}
                </div>

                {/* Grafo */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden" style={{ height: '500px' }}>
                    <svg ref={svgRef} className="w-full h-full" />
                </div>

                {/* Lista */}
                <div className="mt-6 flex flex-wrap gap-3">
                    {atracciones.map(a => (
                        <div key={a.id} className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
                            <span className={`w-2 h-2 rounded-full ${colorEstado(a.estado)}`} />
                            <span className="text-sm text-zinc-300">{a.nombre}</span>
                        </div>
                    ))}
                </div>
            </div>
        </MainLayout>
    )
}