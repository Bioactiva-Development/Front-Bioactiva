import { useState, useCallback } from 'react'
import { datosService } from '@/services/modules/datos.service'
import { generateCSV, downloadCSV } from '@/lib/utils/csv.utils'
import {
    EntidadExportable,
    FiltrosExportacion,
    ImportPreviewResult,
    ConfirmarImportRequest,
    ConfirmarImportResult,
    ConteoExportacion,
} from '@/types/datos.types'

export function useDatos() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [preview, setPreview] = useState<ImportPreviewResult | null>(null)
    const [resultadoImport, setResultadoImport] = useState<ConfirmarImportResult | null>(null)
    const [conteo, setConteo] = useState<ConteoExportacion | null>(null)

    const clearError = useCallback(() => setError(null), [])

    const resetImport = useCallback(() => {
        setPreview(null)
        setResultadoImport(null)
        setError(null)
    }, [])

    const previewImport = useCallback(async (
        file: File,
        entidad: EntidadExportable
    ): Promise<ImportPreviewResult | null> => {
        try {
            setIsLoading(true)
            setError(null)
            const result = await datosService.previewImport(file, entidad)
            setPreview(result)
            return result
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al procesar el archivo.')
            return null
        } finally {
            setIsLoading(false)
        }
    }, [])

    const confirmarImport = useCallback(async (
        data: ConfirmarImportRequest
    ): Promise<ConfirmarImportResult | null> => {
        try {
            setIsLoading(true)
            setError(null)
            const result = await datosService.confirmarImport(data)
            setResultadoImport(result)
            return result
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al confirmar la importación.')
            return null
        } finally {
            setIsLoading(false)
        }
    }, [])

    const exportar = useCallback(async (
        filtros: FiltrosExportacion
    ): Promise<boolean> => {
        try {
            setIsLoading(true)
            setError(null)
            const result = await datosService.exportar(filtros)
            if (result.total === 0) {
                setError('No hay registros que coincidan con los filtros seleccionados.')
                return false
            }
            const csv = generateCSV(result.data, result.columnas)
            downloadCSV(result.filename, csv)
            return true
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al exportar los datos.')
            return false
        } finally {
            setIsLoading(false)
        }
    }, [])

    const actualizarConteo = useCallback(async (filtros: FiltrosExportacion): Promise<void> => {
        try {
            const result = await datosService.contarExportacion(filtros)
            setConteo(result)
        } catch {
            setConteo(null)
        }
    }, [])

    return {
        isLoading,
        error,
        preview,
        resultadoImport,
        conteo,
        clearError,
        resetImport,
        previewImport,
        confirmarImport,
        exportar,
        actualizarConteo,
    }
}
