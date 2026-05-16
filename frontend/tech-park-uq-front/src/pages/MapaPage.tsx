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

interface Zona {
    id: string
    nombre: string
}

interface Nodo extends d3.SimulationNodeDatum {
    id: string
    nombre: string
    estado: 'ACTIVA' | 'EN_MANTENIMIENTO' | 'CERRADA'
    tipo: string
    zonaId: string
}

interface Arista {
    source: string
    target: string
}

export default function MapaPage() {
    const svgRef = useRef<SVGSVGElement>(null)
    const [atracciones, setAtracciones] = useState<Atraccion[]>([])
    const [zonas, setZonas] = useState<Zona[]>([])

    useEffect(() => {
        api.get('/atracciones')
            .then(res => setAtracciones(Array.isArray(res.data) ? res.data : []))
            .catch(err => console.error(err))

        api.get('/zonas')
            .then(res => setZonas(Array.isArray(res.data) ? res.data : []))
            .catch(err => console.error(err))
    }, [])

    useEffect(() => {
    if (!atracciones.length || !svgRef.current) return

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

        d3.select(svgRef.current).selectAll('*').remove()

        const zonasSafe: Zona[] = zonas.length
            ? zonas
            : [{ id: 'Z-01', nombre: 'Zona A' }, { id: 'Z-02', nombre: 'Zona B' }, { id: 'Z-03', nombre: 'Zona C' }]

        const zoneIds = zonasSafe.map(z => z.id)

        // Asignar atracciones a zonas (determinístico por id)
        const nodos: Nodo[] = atracciones.map((a, idx) => {
            const n = Number.parseInt(String(a.id).replace(/\D/g, ''), 10)
            const pick = Number.isFinite(n) ? n : idx
            const zonaId = zoneIds[pick % zoneIds.length]
            return { ...a, zonaId }
        })

        // Conexiones:
        // - Dentro de cada zona: chain simple (A -> B -> C ...)
        // - Entre zonas: puentes entre “nodos representativos”
        const nodosPorZona = d3.group(nodos, d => d.zonaId)
        const aristas: Arista[] = []

        for (const [, group] of nodosPorZona) {
            // Orden determinístico para que el grafo sea estable
            const ordered = [...group].sort((a, b) => String(a.id).localeCompare(String(b.id)))
            for (let i = 0; i < ordered.length - 1; i++) {
                aristas.push({ source: ordered[i].id, target: ordered[i + 1].id })
            }
        }

        // Puentes entre zonas (cadena simple en el orden de zoneIds)
        // Elegimos el primer nodo de cada zona (por id) como representante.
        const reps: string[] = zoneIds
            .map(zid => {
                const group = nodosPorZona.get(zid) ?? []
                const ordered = [...group].sort((a, b) => String(a.id).localeCompare(String(b.id)))
                return ordered[0]?.id
            })
            .filter(Boolean) as string[]

        for (let i = 0; i < reps.length - 1; i++) {
            aristas.push({ source: reps[i], target: reps[i + 1] })
        }

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)

        // Root group para zoom/pan
        const root = svg.append('g').attr('class', 'root')

        // Zoom
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.4, 3])
            .on('zoom', (event) => {
                root.attr('transform', event.transform)
            })

        svg.call(zoom as any)
        // doble click para reset
        svg.on('dblclick.zoom', null)
        svg.on('dblclick', () => {
            svg.transition().duration(250).call(zoom.transform as any, d3.zoomIdentity)
        })

        // Centros fijos por zona para formar conglomerados
        const zoneCenters = new Map<string, { x: number, y: number }>()
        const cols = Math.ceil(Math.sqrt(zoneIds.length))
        const pad = 220
        zoneIds.forEach((zid, i) => {
            const col = i % cols
            const row = Math.floor(i / cols)
            zoneCenters.set(zid, {
                x: pad + col * ((width - pad * 2) / Math.max(1, cols - 1 || 1)),
                y: pad + row * ((height - pad * 2) / Math.max(1, Math.ceil(zoneIds.length / cols) - 1 || 1)),
            })
        })

        const sim = d3.forceSimulation(nodos)
            .force(
                'link',
                d3
                    .forceLink<Nodo, any>(aristas)
                    .id((d: any) => d.id)
                    .distance((l: any) => {
                        // si es puente entre zonas, más largo
                        const a = nodos.find(n => n.id === l.source.id)?.zonaId
                        const b = nodos.find(n => n.id === l.target.id)?.zonaId
                        return a && b && a !== b ? 260 : 130
                    })
                    .strength((l: any) => {
                        const a = nodos.find(n => n.id === l.source.id)?.zonaId
                        const b = nodos.find(n => n.id === l.target.id)?.zonaId
                        return a && b && a !== b ? 0.08 : 0.12
                    })
            )
            .force('charge', d3.forceManyBody().strength(-420))
            .force('collide', d3.forceCollide<d3.SimulationNodeDatum>(64).strength(1))
            .force('x', d3.forceX<Nodo>(d => zoneCenters.get(d.zonaId)?.x ?? width / 2).strength(0.55))
            .force('y', d3.forceY<Nodo>(d => zoneCenters.get(d.zonaId)?.y ?? height / 2).strength(0.55))
            .alphaDecay(0.06)

        const colorNodo = (estado: string) => {
            if (estado === 'ACTIVA') return '#22c55e'
            if (estado === 'EN_MANTENIMIENTO') return '#eab308'
            return '#ef4444'
        }

        const zoneColor = d3.scaleOrdinal<string, string>()
            .domain(zoneIds)
            .range(['#60a5fa', '#f472b6', '#34d399', '#fbbf24', '#a78bfa', '#fb7185', '#22d3ee', '#c084fc'])

        // Fondos por zona (cajas suaves)
        const zoneLayer = root.append('g').attr('class', 'zones')
        const zoneBoxes = zoneLayer.selectAll('g')
            .data(zonasSafe)
            .enter()
            .append('g')

        zoneBoxes.append('rect')
            .attr('rx', 24)
            .attr('ry', 24)
            .attr('fill', d => zoneColor(d.id))
            .attr('opacity', 0.10)
            .attr('stroke', d => zoneColor(d.id))
            .attr('stroke-opacity', 0.35)
            .attr('stroke-width', 2)

        zoneBoxes.append('text')
            .text(d => d.nombre)
            .attr('fill', '#e4e4e7')
            .attr('font-family', 'Inter, sans-serif')
            .attr('font-size', 12)
            .attr('font-weight', 700)
            .attr('opacity', 0.85)

        // Aristas
        const link = root.append('g')
            .selectAll('line')
            .data(aristas)
            .enter().append('line')
            .attr('stroke', '#3f3f46')
            .attr('stroke-width', 2)
            .attr('opacity', 0.45)

        // Nodos
    const node = root.append('g')
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
            .attr('stroke', d => zoneColor(d.zonaId))
            .attr('stroke-width', 3)
            .attr('stroke-opacity', 0.65)

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
            // Actualizar cajas por zona tomando el bounding box de sus nodos
            for (const z of zonasSafe) {
                const nodesForZone = nodos.filter(n => n.zonaId === z.id && Number.isFinite(n.x as any) && Number.isFinite(n.y as any))
                const center = zoneCenters.get(z.id) ?? { x: width / 2, y: height / 2 }
                const padding = 80
                let minX = center.x - 160, maxX = center.x + 160, minY = center.y - 120, maxY = center.y + 120
                if (nodesForZone.length) {
                    minX = d3.min(nodesForZone, n => n.x as number) ?? minX
                    maxX = d3.max(nodesForZone, n => n.x as number) ?? maxX
                    minY = d3.min(nodesForZone, n => n.y as number) ?? minY
                    maxY = d3.max(nodesForZone, n => n.y as number) ?? maxY
                }

                const g = zoneBoxes.filter(d => d.id === z.id)
                g.select('rect')
                    .attr('x', minX - padding)
                    .attr('y', minY - padding)
                    .attr('width', (maxX - minX) + padding * 2)
                    .attr('height', (maxY - minY) + padding * 2)

                g.select('text')
                    .attr('x', (minX - padding) + 16)
                    .attr('y', (minY - padding) + 28)
            }

            link
                .attr('x1', (d: any) => (d.source.x ?? 0))
                .attr('y1', (d: any) => (d.source.y ?? 0))
                .attr('x2', (d: any) => (d.target.x ?? 0))
                .attr('y2', (d: any) => (d.target.y ?? 0))

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
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden" style={{ height: '680px' }}>
                    <svg ref={svgRef} className="w-full h-full" />
                </div>

                <p className="text-xs text-zinc-500 mt-3 tracking-widest uppercase">
                    Tip: rueda del mouse para zoom • arrastra para mover • doble click para reset
                </p>

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