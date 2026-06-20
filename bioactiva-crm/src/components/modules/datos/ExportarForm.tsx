'use client'

import { useState, useCallback } from 'react'
import { Download, AlertCircle, Loader2 } from 'lucide-react'
import { useDatos } from '@/hooks/datos/useDatos'
import { EntidadExportable, FiltrosExportacion } from '@/types/datos.types'

const ENTIDADES: { value: EntidadExportable; label: string }[] = [
    { value: 'organizaciones', label: 'Organizaciones' },
    { value: 'contactos', label: 'Contactos' },
    { value: 'leads', label: 'Leads / Pipeline' },
    { value: 'cotizaciones', label: 'Cotizaciones' },
]

export function ExportarForm() {
    const [entidad, setEntidad] = useState<EntidadExportable>('organizaciones')

    const { isLoading, error, clearError, exportar } = useDatos()

    const getFiltros = useCallback((): FiltrosExportacion => ({ entidad }), [entidad])

    const handleEntidadChange = useCallback((nueva: EntidadExportable) => {
        setEntidad(nueva)
        clearError()
    }, [clearError])

    const handleExportar = useCallback(async () => {
        await exportar(getFiltros())
    }, [exportar, getFiltros])

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 p-6 border-b border-gray-100">
                <div>
                    <h3 className="text-base font-bold text-gray-800">Exportación masiva</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Exporta un archivo Excel (.xlsx) con los datos del CRM
                    </p>
                </div>
                <button
                    onClick={handleExportar}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-[#1C7E3C] text-[#1C7E3C] text-sm font-semibold hover:bg-[#F1FFEC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                    {isLoading ? (
                        <><Loader2 size={16} className="animate-spin" />Exportando...</>
                    ) : (
                        <><Download size={16} />Exportar Excel (.xlsx)</>
                    )}
                </button>
            </div>

            {/* Selector */}
            <div className="p-6 space-y-5">
                <div className="space-y-1.5">
                    <label htmlFor="exp-entidad" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Qué exportar
                    </label>
                    <select
                        id="exp-entidad"
                        value={entidad}
                        onChange={e => handleEntidadChange(e.target.value as EntidadExportable)}
                        className="w-full sm:w-72 px-3 py-2.5 text-sm text-gray-800 bg-white border-2 border-gray-200 rounded-xl outline-none focus:border-[#1C7E3C] transition-colors"
                    >
                        {ENTIDADES.map(e => (
                            <option key={e.value} value={e.value}>{e.label}</option>
                        ))}
                    </select>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                        <AlertCircle size={16} className="shrink-0" />
                        {error}
                    </div>
                )}
            </div>
        </div>
    )
}
