'use client'

import { AlertTriangle, AlertCircle, Copy, CheckCircle2, Loader2 } from 'lucide-react'
import { ImportPreviewResult, TipoConflicto } from '@/types/datos.types'

interface PreviewTablaProps {
    preview: ImportPreviewResult
    omitirConflictos: boolean
    onOmitirChange: (value: boolean) => void
    onConfirmar: () => void
    onVolver: () => void
    isLoading: boolean
}

const CONFLICTO_STYLES: Record<TipoConflicto, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
    error: {
        bg: 'bg-red-50 border-red-200',
        text: 'text-red-700',
        icon: <AlertCircle size={14} className="shrink-0 mt-0.5" />,
        label: 'Error',
    },
    advertencia: {
        bg: 'bg-amber-50 border-amber-200',
        text: 'text-amber-700',
        icon: <AlertTriangle size={14} className="shrink-0 mt-0.5" />,
        label: 'Advertencia',
    },
    duplicado: {
        bg: 'bg-blue-50 border-blue-200',
        text: 'text-blue-700',
        icon: <Copy size={14} className="shrink-0 mt-0.5" />,
        label: 'Duplicado',
    },
}

export function PreviewTabla({
    preview,
    omitirConflictos,
    onOmitirChange,
    onConfirmar,
    onVolver,
    isLoading,
}: PreviewTablaProps) {
    const tieneErrores = preview.conflictos.some(c => c.tipo === 'error')
    const tieneConflictosSalvables = preview.conflictos.some(c => c.tipo !== 'error')
    const puedeConfirmar = !tieneErrores || omitirConflictos
    const columnasPreview = preview.registros.length > 0 ? Object.keys(preview.registros[0]) : []
    const filasConConflicto = new Set(preview.conflictos.map(c => c.fila - 1))

    return (
        <div className="space-y-5">
            {/* Resumen */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                    <p className="text-2xl font-bold text-gray-800">{preview.totalFilas}</p>
                    <p className="text-xs text-gray-500 mt-1">Total filas</p>
                </div>
                <div className="bg-[#F1FFEC] rounded-xl p-4 text-center border border-[#BCF7B3]">
                    <p className="text-2xl font-bold text-[#1C7E3C]">{preview.filasValidas}</p>
                    <p className="text-xs text-[#1C7E3C] mt-1">Válidas</p>
                </div>
                <div className={`rounded-xl p-4 text-center border ${preview.filasConError > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
                    <p className={`text-2xl font-bold ${preview.filasConError > 0 ? 'text-red-600' : 'text-gray-400'}`}>{preview.filasConError}</p>
                    <p className={`text-xs mt-1 ${preview.filasConError > 0 ? 'text-red-500' : 'text-gray-400'}`}>Con conflictos</p>
                </div>
            </div>

            {/* Lista de conflictos */}
            {preview.conflictos.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">Conflictos detectados</p>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {preview.conflictos.map((c, i) => {
                            const style = CONFLICTO_STYLES[c.tipo]
                            return (
                                <div key={i} className={`flex items-start gap-2 border rounded-lg px-3 py-2 text-xs ${style.bg} ${style.text}`}>
                                    {style.icon}
                                    <span>
                                        <span className="font-semibold">Fila {c.fila} · {c.campo}:</span>{' '}
                                        {c.mensaje}
                                        {c.valor && <span className="opacity-60"> (valor: &quot;{c.valor}&quot;)</span>}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Tabla preview */}
            <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">
                    Vista previa <span className="text-gray-400 font-normal">(primeras {Math.min(preview.registros.length, 10)} filas)</span>
                </p>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="min-w-full text-xs">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-3 py-2 text-left text-gray-500 font-semibold w-10">#</th>
                                {columnasPreview.map(col => (
                                    <th key={col} className="px-3 py-2 text-left text-gray-500 font-semibold whitespace-nowrap">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {preview.registros.slice(0, 10).map((row, rowIdx) => {
                                const tieneConflicto = filasConConflicto.has(rowIdx)
                                return (
                                    <tr
                                        key={rowIdx}
                                        className={`border-b border-gray-100 last:border-0 ${tieneConflicto ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                                    >
                                        <td className={`px-3 py-2 font-medium ${tieneConflicto ? 'text-red-500' : 'text-gray-400'}`}>
                                            {rowIdx + 1}
                                        </td>
                                        {columnasPreview.map(col => (
                                            <td key={col} className="px-3 py-2 text-gray-700 whitespace-nowrap max-w-[150px] truncate">
                                                {String(row[col] ?? '—')}
                                            </td>
                                        ))}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Omitir conflictos */}
            {tieneErrores && tieneConflictosSalvables && (
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={omitirConflictos}
                        onChange={e => onOmitirChange(e.target.checked)}
                        className="w-4 h-4 rounded accent-[#1C7E3C]"
                    />
                    <span className="text-sm text-gray-600">
                        Omitir filas con conflictos e importar solo las válidas ({preview.filasValidas})
                    </span>
                </label>
            )}

            {tieneErrores && !omitirConflictos && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <p>Hay errores que deben resolverse antes de importar. Corrija el archivo o active la opción de omitir filas con conflictos.</p>
                </div>
            )}

            {/* Acciones */}
            <div className="flex gap-3 pt-1">
                <button
                    onClick={onVolver}
                    disabled={isLoading}
                    className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                    Volver
                </button>
                <button
                    onClick={onConfirmar}
                    disabled={!puedeConfirmar || isLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1C7E3C] hover:bg-[#16642f] text-white text-sm font-semibold transition-colors disabled:bg-[#BCF7B3] disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <><Loader2 size={16} className="animate-spin" />Importando...</>
                    ) : (
                        <>
                            <CheckCircle2 size={16} />
                            Confirmar importación
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
