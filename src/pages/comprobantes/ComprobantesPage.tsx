import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Eye, CheckCircle, Ban, Loader2, Filter } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { cn, formatFecha, formatMoneda } from '../../lib/utils'
import type { LpComprobante } from '../../types/conta'

const ESTADO_STYLE = {
    borrador:   { bg: 'bg-slate-100',  text: 'text-slate-600',  label: 'Borrador' },
    confirmado: { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Confirmado' },
    anulado:    { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Anulado' },
}

export function ComprobantesPage() {
    const { empresaActiva } = useAuth()
    const [comprobantes, setComprobantes] = useState<LpComprobante[]>([])
    const [loading, setLoading] = useState(true)
    const [busqueda, setBusqueda] = useState('')
    const [filtroEstado, setFiltroEstado] = useState<string>('todos')
    const [accionando, setAccionando] = useState<string | null>(null)

    useEffect(() => { if (empresaActiva) cargar() }, [empresaActiva])

    async function cargar() {
        if (!empresaActiva) return
        setLoading(true)
        const { data } = await supabase
            .from('lp_comprobantes')
            .select(`*, tipo_comprobante:lp_tipos_comprobante(codigo, nombre)`)
            .eq('empresa_id', empresaActiva.id)
            .order('fecha', { ascending: false })
            .order('numero', { ascending: false })
        setComprobantes(data ?? [])
        setLoading(false)
    }

    async function confirmar(id: string) {
        setAccionando(id)
        const { error } = await supabase.from('lp_comprobantes')
            .update({ estado: 'confirmado', updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('estado', 'borrador')
        if (!error) await supabase.rpc('lp_actualizar_saldos', {
            p_comprobante_id: id, p_operacion: 'sumar'
        })
        setAccionando(null)
        cargar()
    }

    async function anular(id: string) {
        if (!confirm('¿Anular este comprobante? La acción no se puede deshacer.')) return
        setAccionando(id)
        const comp = comprobantes.find(c => c.id === id)
        const { error } = await supabase.from('lp_comprobantes')
            .update({ estado: 'anulado', updated_at: new Date().toISOString() })
            .eq('id', id)
        if (!error && comp?.estado === 'confirmado') {
            await supabase.rpc('lp_actualizar_saldos', {
                p_comprobante_id: id, p_operacion: 'restar'
            })
        }
        setAccionando(null)
        cargar()
    }

    const filtrados = comprobantes.filter(c => {
        const matchEstado = filtroEstado === 'todos' || c.estado === filtroEstado
        const matchBusqueda = !busqueda ||
            c.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
            c.glosa.toLowerCase().includes(busqueda.toLowerCase())
        return matchEstado && matchBusqueda
    })

    const sym = empresaActiva?.moneda?.simbolo ?? '$'

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Diarios Contables</h1>
                    <p className="text-slate-500 text-sm mt-0.5">{comprobantes.length} comprobantes</p>
                </div>
                <Link to="/comprobantes/nuevo" className="btn btn-primary gap-2 text-sm">
                    <Plus className="w-4 h-4" /> Nuevo Asiento
                </Link>
            </div>

            {/* Filtros */}
            <div className="card px-4 py-3 flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input className="input pl-9" placeholder="Buscar número o glosa..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    {(['todos','borrador','confirmado','anulado'] as const).map(e => (
                        <button
                            key={e}
                            onClick={() => setFiltroEstado(e)}
                            className={cn('text-xs px-3 py-1.5 rounded-lg font-medium transition-colors',
                                filtroEstado === e
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            )}
                        >
                            {e === 'todos' ? 'Todos' : ESTADO_STYLE[e].label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tabla */}
            <div className="card overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wide">Número</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wide">Fecha</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wide">Glosa</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wide">Estado</th>
                            <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wide">Debe</th>
                            <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wide">Haber</th>
                            <th className="py-3 px-4 w-28" />
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" /></td></tr>
                        ) : filtrados.length === 0 ? (
                            <tr><td colSpan={7} className="py-12 text-center text-slate-400">
                                {comprobantes.length === 0 ? 'No hay comprobantes. Crea el primero.' : 'Sin resultados con los filtros actuales.'}
                            </td></tr>
                        ) : filtrados.map(c => {
                            const est = ESTADO_STYLE[c.estado]
                            return (
                                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="py-3 px-4">
                                        <span className="font-mono text-xs font-semibold text-slate-700">{c.numero}</span>
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">{formatFecha(c.fecha)}</td>
                                    <td className="py-3 px-4 text-slate-700 max-w-[280px] truncate">{c.glosa}</td>
                                    <td className="py-3 px-4">
                                        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', est.bg, est.text)}>
                                            {est.label}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right font-mono text-slate-700">{formatMoneda(c.total_debe, sym)}</td>
                                    <td className="py-3 px-4 text-right font-mono text-slate-700">{formatMoneda(c.total_haber, sym)}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1 justify-end">
                                            <Link to={`/comprobantes/${c.id}`} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-md">
                                                <Eye className="w-3.5 h-3.5" />
                                            </Link>
                                            {c.estado === 'borrador' && (
                                                <button
                                                    onClick={() => confirmar(c.id)}
                                                    disabled={accionando === c.id}
                                                    className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-md"
                                                    title="Confirmar"
                                                >
                                                    {accionando === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                                </button>
                                            )}
                                            {c.estado !== 'anulado' && (
                                                <button
                                                    onClick={() => anular(c.id)}
                                                    disabled={accionando === c.id}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                                                    title="Anular"
                                                >
                                                    <Ban className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
