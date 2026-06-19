'use client'

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from 'react'
import {
    UploadCloud, FileSpreadsheet, X, CheckCircle, AlertCircle,
    Loader2, Download, FileDown, TriangleAlert,
} from 'lucide-react'
import { useDatos } from '@/hooks/datos/useDatos'
import { formatFileSize, MAX_FILE_SIZE_BYTES } from '@/lib/utils/csv.utils'
import { ValidateImportResult, ImportJobStatus } from '@/types/datos.types'

type Step = 1 | 2 | 3

const STEP_LABELS = ['Subir archivo', 'Validación', 'Importando']

function isValidXlsx(file: File): boolean {
    return file.name.toLowerCase().endsWith('.xlsx')
}

export function ImportarStepper() {
    const [step, setStep] = useState<Step>(1)
    const [archivo, setArchivo] = useState<File | null>(null)
    const [errorArchivo, setErrorArchivo] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [validacion, setValidacion] = useState<ValidateImportResult | null>(null)
    const [jobStatus, setJobStatus] = useState<ImportJobStatus | null>(null)
    const [progreso, setProgreso] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)

    const { isLoading, error, clearError, descargarPlantilla, validarImport, commitImport, pollJob } = useDatos()

    const validarYSetArchivo = useCallback((file: File) => {
        setErrorArchivo(null)
        if (!isValidXlsx(file)) {
            setErrorArchivo('Solo se aceptan archivos .xlsx (usa la plantilla oficial)')
            return
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
            setErrorArchivo(`El archivo supera el límite de 10 MB (${formatFileSize(file.size)})`)
            return
        }
        setArchivo(file)
    }, [])

    const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) validarYSetArchivo(file)
    }, [validarYSetArchivo])

    const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback(() => setIsDragging(false), [])

    const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) validarYSetArchivo(file)
        e.target.value = ''
    }, [validarYSetArchivo])

    const handleValidar = useCallback(async () => {
        if (!archivo) return
        const result = await validarImport(archivo)
        if (result) {
            setValidacion(result)
            setStep(2)
        }
    }, [archivo, validarImport])

    const handleCommit = useCallback(async () => {
        if (!archivo) return
        setStep(3)
        setProgreso(0)
        const commit = await commitImport(archivo)
        if (!commit) return
        const status = await pollJob(commit.jobId, setProgreso)
        if (status) setJobStatus(status)
    }, [archivo, commitImport, pollJob])

    const handleReiniciar = useCallback(() => {
        setStep(1)
        setArchivo(null)
        setValidacion(null)
        setJobStatus(null)
        setProgreso(0)
        setErrorArchivo(null)
        clearError()
    }, [clearError])

    const dropZoneColor = archivo
        ? 'border-[#1C7E3C] bg-[#F1FFEC]'
        : isDragging
            ? 'border-[#1C7E3C] bg-[#F1FFEC]/60'
            : 'border-gray-200 bg-gray-50 hover:border-[#1C7E3C]/50 hover:bg-[#F1FFEC]/30'

    const totalInsertados = jobStatus?.result
        ? Object.values(jobStatus.result.summary.inserted).reduce((a, b) => a + b, 0)
        : 0

    return (
        <div className="space-y-6">
            {/* Step indicator */}
            <div className="flex items-center gap-2">
                {STEP_LABELS.map((label, i) => {
                    const n = (i + 1) as Step
                    const active = step === n
                    const done = step > n
                    return (
                        <div key={n} className="flex items-center gap-2">
                            <div className={`flex items-center gap-2 ${active ? 'text-[#1C7E3C]' : done ? 'text-[#1C7E3C]/60' : 'text-gray-400'}`}>
                                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${active ? 'bg-[#1C7E3C] text-white' : done ? 'bg-[#BCF7B3] text-[#1C7E3C]' : 'bg-gray-100 text-gray-400'}`}>
                                    {done ? <CheckCircle size={14} /> : n}
                                </span>
                                <span className="text-sm font-medium hidden sm:block">{label}</span>
                            </div>
                            {i < STEP_LABELS.length - 1 && (
                                <div className={`flex-1 h-px w-8 sm:w-16 ${done ? 'bg-[#1C7E3C]/40' : 'bg-gray-200'}`} />
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Step 1: Subir archivo */}
            {step === 1 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5 shadow-sm">
                    {/* Descarga plantilla */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#F1FFEC] border border-[#BCF7B3]">
                        <div>
                            <p className="text-sm font-semibold text-gray-800">¿Primera vez?</p>
                            <p className="text-xs text-gray-500 mt-0.5">Descarga la plantilla oficial con las 4 hojas y valores válidos.</p>
                        </div>
                        <button
                            onClick={descargarPlantilla}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#1C7E3C] text-[#1C7E3C] text-sm font-semibold hover:bg-white transition-colors whitespace-nowrap disabled:opacity-50"
                        >
                            <FileDown size={15} />
                            Plantilla .xlsx
                        </button>
                    </div>

                    {/* Zona de drop */}
                    <div
                        role="button"
                        tabIndex={0}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => !archivo && inputRef.current?.click()}
                        onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !archivo) inputRef.current?.click() }}
                        className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed py-14 transition-colors cursor-pointer ${dropZoneColor}`}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".xlsx"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        {archivo ? (
                            <>
                                <FileSpreadsheet size={40} className="text-[#1C7E3C]" />
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-gray-800">{archivo.name}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{formatFileSize(archivo.size)}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={e => { e.stopPropagation(); setArchivo(null); setErrorArchivo(null) }}
                                    className="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                    aria-label="Quitar archivo"
                                >
                                    <X size={16} />
                                </button>
                            </>
                        ) : (
                            <>
                                <UploadCloud size={40} className={`transition-colors ${isDragging ? 'text-[#1C7E3C]' : 'text-gray-300'}`} />
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-gray-700">Arrastra tu archivo aquí</p>
                                    <p className="text-xs text-gray-400 mt-1">Solo .xlsx basado en la plantilla · Máx. 10 MB</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
                                    className="flex items-center gap-2 bg-[#1C7E3C] hover:bg-[#16642f] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors shadow-sm"
                                >
                                    <UploadCloud size={16} />
                                    Seleccionar archivo
                                </button>
                            </>
                        )}
                    </div>

                    {(errorArchivo || error) && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                            <AlertCircle size={16} className="shrink-0" />
                            {errorArchivo ?? error}
                        </div>
                    )}

                    <button
                        onClick={handleValidar}
                        disabled={!archivo || isLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1C7E3C] hover:bg-[#16642f] text-white text-sm font-semibold transition-colors disabled:bg-[#BCF7B3] disabled:cursor-not-allowed"
                    >
                        {isLoading ? <><Loader2 size={16} className="animate-spin" />Validando...</> : 'Validar archivo'}
                    </button>
                </div>
            )}

            {/* Step 2: Resultados de validación */}
            {step === 2 && validacion && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5 shadow-sm">
                    {/* Filas detectadas */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-800 mb-3">Filas detectadas por hoja</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {(Object.entries(validacion.parsedCounts) as [string, number][]).map(([k, v]) => (
                                <div key={k} className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-center">
                                    <p className="text-2xl font-bold text-gray-800">{v}</p>
                                    <p className="text-xs text-gray-500 mt-0.5 capitalize">{k}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Errores bloqueantes */}
                    {validacion.errors.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-semibold text-red-600">
                                <AlertCircle size={15} />
                                {validacion.errors.length} error{validacion.errors.length > 1 ? 'es' : ''} bloqueante{validacion.errors.length > 1 ? 's' : ''}
                            </div>
                            <ul className="space-y-1.5 max-h-40 overflow-y-auto">
                                {validacion.errors.map((e, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                                        <span className="font-semibold shrink-0">{e.sheet} F{e.row}:</span>
                                        {e.message}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Warnings */}
                    {validacion.warnings.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-semibold text-amber-600">
                                <TriangleAlert size={15} />
                                {validacion.warnings.length} advertencia{validacion.warnings.length > 1 ? 's' : ''} (no bloquea)
                            </div>
                            <ul className="space-y-1.5 max-h-32 overflow-y-auto">
                                {validacion.warnings.map((w, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                                        <span className="font-semibold shrink-0">{w.sheet} F{w.row}:</span>
                                        {w.message}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {!validacion.valid && (
                        <p className="text-sm text-red-600 font-medium">Corrige los errores bloqueantes antes de importar.</p>
                    )}

                    <div className="flex gap-3 pt-1">
                        <button onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">
                            Volver
                        </button>
                        <button
                            onClick={handleCommit}
                            disabled={!validacion.valid || isLoading}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1C7E3C] hover:bg-[#16642f] text-white text-sm font-semibold transition-colors disabled:bg-[#BCF7B3] disabled:cursor-not-allowed"
                        >
                            <Download size={15} />
                            Importar ahora
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Procesando / Resultado */}
            {step === 3 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm flex flex-col items-center gap-5 text-center">
                    {!jobStatus ? (
                        <>
                            <Loader2 size={40} className="text-[#1C7E3C] animate-spin" />
                            <div>
                                <h3 className="text-base font-bold text-gray-800">Importando datos...</h3>
                                <p className="text-sm text-gray-500 mt-1">El servidor está procesando el archivo.</p>
                            </div>
                            <div className="w-full max-w-xs bg-gray-100 rounded-full h-2">
                                <div
                                    className="bg-[#1C7E3C] h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${progreso}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-400">{progreso}%</p>
                        </>
                    ) : jobStatus.state === 'failed' ? (
                        <>
                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                                <AlertCircle size={32} className="text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Importación fallida</h3>
                                <p className="text-sm text-gray-500 mt-1">{jobStatus.failedReason ?? 'Error desconocido.'}</p>
                            </div>
                            <button onClick={handleReiniciar} className="flex items-center gap-2 px-6 py-2.5 rounded-xl border-2 border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">
                                Intentar de nuevo
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 rounded-full bg-[#F1FFEC] flex items-center justify-center">
                                <CheckCircle size={32} className="text-[#1C7E3C]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">¡Importación completada!</h3>
                                <p className="text-sm text-gray-500 mt-1">{totalInsertados} registros insertados en total.</p>
                            </div>

                            {/* Detalle insertados */}
                            {jobStatus.result && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-sm">
                                    {(Object.entries(jobStatus.result.summary.inserted) as [string, number][]).map(([k, v]) => (
                                        <div key={k} className="rounded-xl bg-[#F1FFEC] border border-[#BCF7B3] p-3 text-center">
                                            <p className="text-xl font-bold text-[#1C7E3C]">{v}</p>
                                            <p className="text-xs text-gray-500 mt-0.5 capitalize">{k}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Skipped */}
                            {(jobStatus.result?.summary.skipped.length ?? 0) > 0 && (
                                <div className="w-full max-w-sm space-y-1.5">
                                    <p className="text-xs font-semibold text-amber-600 text-left">{jobStatus.result!.summary.skipped.length} filas omitidas</p>
                                    <ul className="space-y-1 max-h-28 overflow-y-auto">
                                        {jobStatus.result!.summary.skipped.map((s, i) => (
                                            <li key={i} className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5 text-left">
                                                <span className="font-semibold">{s.sheet} F{s.row}:</span> {s.message}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <button onClick={handleReiniciar} className="flex items-center gap-2 px-6 py-2.5 rounded-xl border-2 border-[#1C7E3C] text-[#1C7E3C] text-sm font-semibold hover:bg-[#F1FFEC] transition-colors">
                                Importar otro archivo
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
