'use client'

import { useState, useEffect, useCallback } from 'react'
import { Download, Search, X, AlertCircle, Loader2 } from 'lucide-react'
import { useDatos } from '@/hooks/datos/useDatos'
import { Sector, TipoEmpresa, TamanoEmpresa, LeadState, EstadoCot } from '@/types/enums'
import {
    EntidadExportable,
    FiltrosExportacion,
    FiltrosOrganizacion,
    FiltrosContacto,
    FiltrosLead,
    FiltrosCotizacion,
    FiltrosEspecificos,
} from '@/types/datos.types'

const ENTIDADES: { value: EntidadExportable; label: string }[] = [
    { value: 'organizaciones', label: 'Organizaciones' },
    { value: 'contactos', label: 'Contactos' },
    { value: 'leads', label: 'Leads / Pipeline' },
    { value: 'cotizaciones', label: 'Cotizaciones' },
]

const DEFAULT_FILTROS: Record<EntidadExportable, FiltrosEspecificos> = {
    organizaciones: { sector: '', tipo: '', tamano: '' },
    contactos: { organizacion: '' },
    leads: { estado: '' },
    cotizaciones: { estado: '' },
}

export function ExportarForm() {
    const [entidad, setEntidad] = useState<EntidadExportable>('organizaciones')
    const [busqueda, setBusqueda] = useState('')
    const [filtros, setFiltros] = useState<FiltrosEspecificos>(DEFAULT_FILTROS.organizaciones)

    const { isLoading, error, conteo, clearError, exportar, actualizarConteo } = useDatos()

    const getFiltrosActuales = useCallback((): FiltrosExportacion => ({
        entidad,
        busqueda,
        filtros,
    }), [entidad, busqueda, filtros])

    useEffect(() => {
        actualizarConteo(getFiltrosActuales())
    }, [entidad, busqueda, filtros, actualizarConteo, getFiltrosActuales])

    const handleEntidadChange = useCallback((nueva: EntidadExportable) => {
        setEntidad(nueva)
        setBusqueda('')
        setFiltros(DEFAULT_FILTROS[nueva])
        clearError()
    }, [clearError])

    const handleLimpiarFiltros = useCallback(() => {
        setBusqueda('')
        setFiltros(DEFAULT_FILTROS[entidad])
        clearError()
    }, [entidad, clearError])

    const handleExportar = useCallback(async () => {
        await exportar(getFiltrosActuales())
    }, [exportar, getFiltrosActuales])

    const hayFiltrosActivos =
        busqueda.trim() !== '' ||
        Object.values(filtros).some(v => v !== '')

    const orgFiltros = filtros as FiltrosOrganizacion
    const contactoFiltros = filtros as FiltrosContacto
    const leadFiltros = filtros as FiltrosLead
    const cotFiltros = filtros as FiltrosCotizacion

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 p-6 border-b border-gray-100">
                <div>
                    <h3 className="text-base font-bold text-gray-800">Exportación masiva</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Exporta un CSV filtrado de los datos del CRM
                    </p>
                </div>
                <button
                    onClick={handleExportar}
                    disabled={isLoading || (conteo?.total ?? 0) === 0}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-[#1C7E3C] text-[#1C7E3C] text-sm font-semibold hover:bg-[#F1FFEC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                    {isLoading ? (
                        <><Loader2 size={16} className="animate-spin" />Exportando...</>
                    ) : (
                        <><Download size={16} />Exportar CSV filtrado</>
                    )}
                </button>
            </div>

            {/* Filtros */}
            <div className="p-6 space-y-5">
                {/* Fila 1: Entidad + Búsqueda */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label htmlFor="exp-entidad" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Qué exportar
                        </label>
                        <select
                            id="exp-entidad"
                            value={entidad}
                            onChange={e => handleEntidadChange(e.target.value as EntidadExportable)}
                            className="w-full px-3 py-2.5 text-sm text-gray-800 bg-white border-2 border-gray-200 rounded-xl outline-none focus:border-[#1C7E3C] transition-colors"
                        >
                            {ENTIDADES.map(e => (
                                <option key={e.value} value={e.value}>{e.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="exp-busqueda" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Buscar
                        </label>
                        <div className="relative">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                id="exp-busqueda"
                                type="text"
                                value={busqueda}
                                onChange={e => setBusqueda(e.target.value)}
                                placeholder={
                                    entidad === 'organizaciones' ? 'Nombre, RUC...' :
                                    entidad === 'contactos' ? 'Nombre, correo...' :
                                    entidad === 'leads' ? 'Organización, servicio...' :
                                    'Cliente, servicio...'
                                }
                                className="w-full pl-9 pr-9 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 bg-white border-2 border-gray-200 rounded-xl outline-none focus:border-[#1C7E3C] transition-colors"
                            />
                            {busqueda && (
                                <button
                                    onClick={() => setBusqueda('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    aria-label="Limpiar búsqueda"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Fila 2: Filtros específicos por entidad */}
                {entidad === 'organizaciones' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label htmlFor="exp-sector" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Sector</label>
                            <select
                                id="exp-sector"
                                value={orgFiltros.sector}
                                onChange={e => setFiltros({ ...orgFiltros, sector: e.target.value as Sector | '' })}
                                className="w-full px-3 py-2.5 text-sm text-gray-800 bg-white border-2 border-gray-200 rounded-xl outline-none focus:border-[#1C7E3C] transition-colors"
                            >
                                <option value="">Todos</option>
                                {Object.values(Sector).map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="exp-tipo" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</label>
                            <select
                                id="exp-tipo"
                                value={orgFiltros.tipo}
                                onChange={e => setFiltros({ ...orgFiltros, tipo: e.target.value as TipoEmpresa | '' })}
                                className="w-full px-3 py-2.5 text-sm text-gray-800 bg-white border-2 border-gray-200 rounded-xl outline-none focus:border-[#1C7E3C] transition-colors"
                            >
                                <option value="">Todos</option>
                                {Object.values(TipoEmpresa).map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="exp-tamano" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Tamaño</label>
                            <select
                                id="exp-tamano"
                                value={orgFiltros.tamano}
                                onChange={e => setFiltros({ ...orgFiltros, tamano: e.target.value as TamanoEmpresa | '' })}
                                className="w-full px-3 py-2.5 text-sm text-gray-800 bg-white border-2 border-gray-200 rounded-xl outline-none focus:border-[#1C7E3C] transition-colors"
                            >
                                <option value="">Todos</option>
                                {Object.values(TamanoEmpresa).map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>
                    </div>
                )}

                {entidad === 'contactos' && (
                    <div className="space-y-1.5">
                        <label htmlFor="exp-org" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Organización asociada</label>
                        <div className="relative">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                id="exp-org"
                                type="text"
                                value={contactoFiltros.organizacion}
                                onChange={e => setFiltros({ organizacion: e.target.value })}
                                placeholder="Nombre de la organización..."
                                className="w-full sm:w-80 pl-9 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 bg-white border-2 border-gray-200 rounded-xl outline-none focus:border-[#1C7E3C] transition-colors"
                            />
                        </div>
                    </div>
                )}

                {entidad === 'leads' && (
                    <div className="space-y-1.5">
                        <label htmlFor="exp-lead-estado" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</label>
                        <select
                            id="exp-lead-estado"
                            value={leadFiltros.estado}
                            onChange={e => setFiltros({ estado: e.target.value as LeadState | '' })}
                            className="w-full sm:w-64 px-3 py-2.5 text-sm text-gray-800 bg-white border-2 border-gray-200 rounded-xl outline-none focus:border-[#1C7E3C] transition-colors"
                        >
                            <option value="">Todos</option>
                            {Object.values(LeadState).map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>
                )}

                {entidad === 'cotizaciones' && (
                    <div className="space-y-1.5">
                        <label htmlFor="exp-cot-estado" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</label>
                        <select
                            id="exp-cot-estado"
                            value={cotFiltros.estado}
                            onChange={e => setFiltros({ estado: e.target.value as EstadoCot | '' })}
                            className="w-full sm:w-64 px-3 py-2.5 text-sm text-gray-800 bg-white border-2 border-gray-200 rounded-xl outline-none focus:border-[#1C7E3C] transition-colors"
                        >
                            <option value="">Todos</option>
                            {Object.values(EstadoCot).map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                        <AlertCircle size={16} className="shrink-0" />
                        {error}
                    </div>
                )}

                {/* Footer: conteo + limpiar */}
                <div className="flex items-center gap-4 pt-1">
                    {conteo !== null && (
                        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${conteo.total > 0 ? 'bg-[#F1FFEC] text-[#1C7E3C]' : 'bg-gray-100 text-gray-500'}`}>
                            {conteo.total} {conteo.label} {conteo.total === 1 ? 'listo' : 'listos'} para exportar
                        </span>
                    )}
                    {hayFiltrosActivos && (
                        <button
                            onClick={handleLimpiarFiltros}
                            className="text-xs text-[#1C7E3C] hover:text-[#16642f] hover:underline"
                        >
                            Limpiar filtros
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
