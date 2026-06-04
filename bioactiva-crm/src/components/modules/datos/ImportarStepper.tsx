'use client'

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from 'react'
import { UploadCloud, FileSpreadsheet, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { PreviewTabla } from '@/components/modules/datos/PreviewTabla'
import { useDatos } from '@/hooks/datos/useDatos'
import { isValidFileType, formatFileSize, MAX_FILE_SIZE_BYTES } from '@/lib/utils/csv.utils'
import { EntidadExportable } from '@/types/datos.types'

type Step = 1 | 2 | 3

const ENTIDADES: { value: EntidadExportable; label: string }[] = [
    { value: 'organizaciones', label: 'Organizaciones' },
    { value: 'contactos', label: 'Contactos' },
    { value: 'leads', label: 'Leads / Pipeline' },
    { value: 'cotizaciones', label: 'Cotizaciones' },
]

const STEP_LABELS = ['Subir archivo', 'Preview y conflictos', 'Confirmar importación']

export function ImportarStepper() {
    const [step, setStep] = useState<Step>(1)
    const [archivo, setArchivo] = useState<File | null>(null)
    const [entidad, setEntidad] = useState<EntidadExportable>('organizaciones')
    const [errorArchivo, setErrorArchivo] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [omitirConflictos, setOmitirConflictos] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const { isLoading, error, preview, resultadoImport, resetImport, previewImport, confirmarImport } = useDatos()

    const validarYSetArchivo = useCallback((file: File) => {
        setErrorArchivo(null)
        if (!isValidFileType(file)) {
            setErrorArchivo('Formato no válido. Solo se aceptan archivos .xlsx, .xls o .csv')
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

    const handleContinuar = useCallback(async () => {
        if (!archivo) return
        const result = await previewImport(archivo, entidad)
        if (result) setStep(2)
    }, [archivo, entidad, previewImport])

    const handleConfirmar = useCallback(async () => {
        if (!preview) return
        const registrosAImportar = omitirConflictos
            ? preview.registros.filter((_, i) => {
                const filasConError = new Set(preview.conflictos.map(c => c.fila - 1))
                return !filasConError.has(i)
            })
            : preview.registros
        const result = await confirmarImport({ entidad, registros: registrosAImportar, omitirConflictos })
        if (result) setStep(3)
    }, [preview, omitirConflictos, entidad, confirmarImport])

    const handleReiniciar = useCallback(() => {
        setStep(1)
        setArchivo(null)
        setOmitirConflictos(false)
        setErrorArchivo(null)
        resetImport()
    }, [resetImport])

    let dropZoneColor = 'border-gray-200 bg-gray-50 hover:border-[#1C7E3C]/50 hover:bg-[#F1FFEC]/30'
    if (archivo) dropZoneColor = 'border-[#1C7E3C] bg-[#F1FFEC]'
    else if (isDragging) dropZoneColor = 'border-[#1C7E3C] bg-[#F1FFEC]/60'

    return (
        <div className="space-y-6">
            {/* Step indicator */}
            <div className="flex items-center gap-2">
                {STEP_LABELS.map((label, i) => {
                    const n = (i + 1) as Step
                    const active = step === n
                    const done = step > n
                    let labelColor = 'text-gray-400'
                    if (active) labelColor = 'text-[#1C7E3C]'
                    else if (done) labelColor = 'text-[#1C7E3C]/60'
                    let dotColor = 'bg-gray-100 text-gray-400'
                    if (active) dotColor = 'bg-[#1C7E3C] text-white'
                    else if (done) dotColor = 'bg-[#BCF7B3] text-[#1C7E3C]'
                    return (
                        <div key={n} className="flex items-center gap-2">
                            <div className={`flex items-center gap-2 ${labelColor}`}>
                                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${dotColor}`}>
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
                    {/* Selector de entidad */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            ¿Qué vas a importar?
                        </label>
                        <select
                            value={entidad}
                            onChange={e => setEntidad(e.target.value as EntidadExportable)}
                            className="w-full sm:w-64 px-3 py-2.5 text-sm text-gray-800 bg-[#F1FFEC] border-2 border-[#BCF7B3] rounded-xl outline-none focus:border-[#1C7E3C] transition-colors"
                        >
                            {ENTIDADES.map(e => (
                                <option key={e.value} value={e.value}>{e.label}</option>
                            ))}
                        </select>
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
                            accept=".xlsx,.xls,.csv"
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
                                    <p className="text-xs text-gray-400 mt-1">Formatos aceptados: .xlsx, .xls o .csv · Máx. 10 MB</p>
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

                    {errorArchivo && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                            <AlertCircle size={16} className="shrink-0" />
                            {errorArchivo}
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                            <AlertCircle size={16} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleContinuar}
                        disabled={!archivo || isLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1C7E3C] hover:bg-[#16642f] text-white text-sm font-semibold transition-colors disabled:bg-[#BCF7B3] disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <><Loader2 size={16} className="animate-spin" />Analizando archivo...</>
                        ) : (
                            'Continuar'
                        )}
                    </button>
                </div>
            )}

            {/* Step 2: Preview y conflictos */}
            {step === 2 && preview && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <PreviewTabla
                        preview={preview}
                        omitirConflictos={omitirConflictos}
                        onOmitirChange={setOmitirConflictos}
                        onConfirmar={handleConfirmar}
                        onVolver={() => setStep(1)}
                        isLoading={isLoading}
                    />
                    {error && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                            <AlertCircle size={16} className="shrink-0" />
                            {error}
                        </div>
                    )}
                </div>
            )}

            {/* Step 3: Éxito */}
            {step === 3 && resultadoImport && (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm flex flex-col items-center gap-5 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#F1FFEC] flex items-center justify-center">
                        <CheckCircle size={32} className="text-[#1C7E3C]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">¡Importación completada!</h3>
                        <p className="text-sm text-gray-500 mt-1">{resultadoImport.mensaje}</p>
                    </div>
                    <div className="flex gap-6">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-[#1C7E3C]">{resultadoImport.exitosos}</p>
                            <p className="text-xs text-gray-500 mt-0.5">Registros importados</p>
                        </div>
                        {resultadoImport.errores > 0 && (
                            <div className="text-center">
                                <p className="text-3xl font-bold text-red-500">{resultadoImport.errores}</p>
                                <p className="text-xs text-gray-500 mt-0.5">Omitidos</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleReiniciar}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl border-2 border-[#1C7E3C] text-[#1C7E3C] text-sm font-semibold hover:bg-[#F1FFEC] transition-colors"
                    >
                        Importar otro archivo
                    </button>
                </div>
            )}
        </div>
    )
}
