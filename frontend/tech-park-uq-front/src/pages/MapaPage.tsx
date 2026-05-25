import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import MainLayout from '../layouts/MainLayout'
import { api } from '../services/api'
import { calcularRuta } from '../services/rutaService'

interface Atraccion {
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

    const [origen, setOrigen] = useState('')
    const [destino, setDestino] = useState('')
    const [ruta, setRuta] = useState<string[]>([])
    const [calculando, setCalculando] = useState(false)

    const handleCalcularRuta = async () => {
        if (!origen || !destino || origen === destino) return
        setCalculando(true)
        try {
            const resultado = await calcularRuta(origen, destino)
            setRuta(resultado)
        } catch {
            alert('No se pudo calcular la ruta')
        } finally {
            setCalculando(false)
        }
    }

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

        const sorted = [...atracciones].sort((a, b) => String(a.id).localeCompare(String(b.id)))
        const n = sorted.length
        const cols = Math.ceil(Math.sqrt(n))
        const rows = Math.ceil(n / cols)

        const padX = 90, padY = 90
        const cellW = cols > 1 ? (width - padX * 2) / (cols - 1) : 0
        const cellH = rows > 1 ? (height - padY * 2) / (rows - 1) : 0

        const hashJitter = (id: string, seed: number, scale: number) => {
            let h = seed
            for (const c of id) h = Math.imul(h * 31 + c.charCodeAt(0), 1) | 0
            return ((h & 0xffff) / 0xffff - 0.5) * scale
        }

        const posMap = new Map<string, { x: number, y: number }>()
        sorted.forEach((a, i) => {
            const col = i % cols
            const row = Math.floor(i / cols)
            const stagger = row % 2 === 1 ? cellW * 0.5 : 0
            posMap.set(a.id, {
                x: padX + col * cellW + stagger + hashJitter(a.id, 1, cellW * 0.18),
                y: padY + row * cellH + hashJitter(a.id, 2, cellH * 0.18),
            })
        })

        const aristas: Arista[] = []
        sorted.forEach((a, i) => {
            const col = i % cols
            if (col + 1 < cols && i + 1 < n)
                aristas.push({ source: a.id, target: sorted[i + 1].id })
            if (i + cols < n)
                aristas.push({ source: a.id, target: sorted[i + cols].id })
        })

        const esEnRuta = (src: string, tgt: string) => {
            for (let i = 0; i < ruta.length - 1; i++) {
                if ((ruta[i] === src && ruta[i + 1] === tgt) ||
                    (ruta[i] === tgt && ruta[i + 1] === src)) return true
            }
            return false
        }

        const colorNodo = (estado: string) => {
            if (estado === 'ACTIVA') return '#22c55e'
            if (estado === 'EN_MANTENIMIENTO') return '#eab308'
            return '#ef4444'
        }

        const svg = d3.select(svgRef.current).attr('width', width).attr('height', height)
        const root = svg.append('g').attr('class', 'root')

        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.3, 4])
            .on('zoom', e => root.attr('transform', e.transform))
        svg.call(zoom as any)
        svg.on('dblclick.zoom', null)
        svg.on('dblclick', () =>
            svg.transition().duration(250).call(zoom.transform as any, d3.zoomIdentity))

        root.append('g')
            .selectAll('path')
            .data(aristas)
            .enter().append('path')
            .attr('fill', 'none')
            .attr('stroke', d => esEnRuta(d.source, d.target) ? '#00ffff' : '#ffffff')
            .attr('stroke-width', d => esEnRuta(d.source, d.target) ? 5 : 2)
            .attr('opacity', d => esEnRuta(d.source, d.target) ? 1 : 0.6)
            .attr('stroke-linecap', 'round')
            .attr('d', d => {
                const s = posMap.get(d.source) ?? { x: 0, y: 0 }
                const t = posMap.get(d.target) ?? { x: 0, y: 0 }
                const cx = (s.x + t.x) / 2 + (t.y - s.y) * 0.2
                const cy = (s.y + t.y) / 2 - (t.x - s.x) * 0.2
                return `M${s.x},${s.y} Q${cx},${cy} ${t.x},${t.y}`
            })

        const nodeG = root.append('g')
            .selectAll('g')
            .data(sorted)
            .enter().append('g')
            .attr('transform', d => {
                const p = posMap.get(d.id)!
                return `translate(${p.x},${p.y})`
            })

        nodeG.append('circle')
            .attr('r', 36)
            .attr('fill', 'none')
            .attr('stroke', d => ruta.includes(d.id) ? '#00ffff' : 'none')
            .attr('stroke-width', 3)

        nodeG.append('circle')
            .attr('r', 26)
            .attr('fill', d => colorNodo(d.estado))
            .attr('opacity', 0.9)
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 2)

        nodeG.append('text')
            .text(d => d.tipo === 'MECANICA_ALTURA' ? '🎢' : d.tipo === 'ACUATICA' ? '💧' : '🎠')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('font-size', '16px')

        nodeG.append('text')
            .text(d => d.nombre.length > 10 ? d.nombre.slice(0, 10) + '…' : d.nombre)
            .attr('text-anchor', 'middle')
            .attr('dy', 42)
            .attr('fill', 'white')
            .attr('font-size', '11px')
            .attr('font-family', 'Metal Mania, cursive')

        const rutaNodeG = nodeG.filter(d => ruta.includes(d.id))
        rutaNodeG.append('circle')
            .attr('r', 12)
            .attr('cx', 22)
            .attr('cy', -22)
            .attr('fill', '#00ffff')
        rutaNodeG.append('text')
            .text(d => String(ruta.indexOf(d.id) + 1))
            .attr('x', 22)
            .attr('y', -22)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('fill', '#000')
            .attr('font-size', '11px')
            .attr('font-weight', 'bold')
            .attr('font-family', 'Metal Mania, cursive')

    }, [atracciones, ruta])

    const colorEstado = (estado: string) => {
        if (estado === 'ACTIVA') return 'bg-green-500'
        if (estado === 'EN_MANTENIMIENTO') return 'bg-yellow-500'
        return 'bg-red-500'
    }

    return (
        <MainLayout>
            <div className="bg-black text-white min-h-screen p-8">
                <h1 className="font-['Ghastly_Panic'] text-4xl font-bold tracking-widest uppercase text-white mb-8">
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
                            <span className="text-xs text-white uppercase tracking-widest">{l.label}</span>
                        </div>
                    ))}
                </div>

                {/* Selector de ruta */}
                <div className="flex flex-wrap items-end gap-4 mb-6 bg-black border border-white rounded-2xl p-5">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-white uppercase tracking-widest">Origen</label>
                        <select
                            value={origen}
                            onChange={e => setOrigen(e.target.value)}
                            className="bg-black text-white rounded-lg px-3 py-2 text-sm border border-white focus:outline-none focus:border-white"
                        >
                            <option value="">Selecciona una atracción</option>
                            {atracciones.map(a => (
                                <option key={a.id} value={a.id}>{a.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-white uppercase tracking-widest">Destino</label>
                        <select
                            value={destino}
                            onChange={e => setDestino(e.target.value)}
                            className="bg-black text-white rounded-lg px-3 py-2 text-sm border border-white focus:outline-none focus:border-white"
                        >
                            <option value="">Selecciona una atracción</option>
                            {atracciones.map(a => (
                                <option key={a.id} value={a.id}>{a.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleCalcularRuta}
                        disabled={calculando || !origen || !destino || origen === destino}
                        className="px-4 py-2 rounded-lg bg-amber-500 text-black font-bold hover:bg-amber-400 transition text-sm disabled:opacity-50"
                    >
                        {calculando ? 'Calculando…' : 'Calcular ruta'}
                    </button>
                    {ruta.length > 0 && (
                        <button
                            onClick={() => { setRuta([]); setOrigen(''); setDestino('') }}
                            className="px-4 py-2 rounded-lg border border-white text-white hover:bg-white hover:text-black transition text-sm"
                        >
                            Limpiar
                        </button>
                    )}
                    {ruta.length > 0 && (
                        <div className="flex items-center gap-2 ml-auto">
                            <span className="w-3 h-1 rounded bg-amber-500 inline-block" />
                            <span className="text-xs text-amber-400 uppercase tracking-widest">Ruta óptima ({ruta.length - 1} pasos)</span>
                        </div>
                    )}
                </div>

                {/* Grafo */}
                <div className="bg-black border border-white rounded-2xl overflow-hidden" style={{ height: '680px' }}>
                    <svg ref={svgRef} className="w-full h-full" />
                </div>

                <p className="text-xs text-white mt-3 tracking-widest uppercase">
                    Tip: rueda del mouse para zoom • arrastra para mover • doble click para reset
                </p>

                {/* Lista */}
                <div className="mt-6 flex flex-wrap gap-3">
                    {atracciones.map(a => (
                        <div key={a.id} className="flex items-center gap-2 bg-black border border-white rounded-lg px-3 py-2">
                            <span className={`w-2 h-2 rounded-full ${colorEstado(a.estado)}`} />
                            <span className="text-sm text-white">{a.nombre}</span>
                        </div>
                    ))}
                </div>
            </div>
        </MainLayout>
    )
}
