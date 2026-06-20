import { useState, useCallback } from 'react'
import { USE_MOCK } from '@/lib/constants/config'
import { datosService } from '@/services/modules/datos.service'
import { generateCSV, downloadCSV } from '@/lib/utils/csv.utils'
import {
    EntidadExportable,
    FiltrosExportacion,
    ImportPreviewResult,
    ConfirmarImportRequest,
    ConfirmarImportResult,
    ConteoExportacion,
    ValidateImportResult,
    CommitImportResult,
    ImportJobStatus,
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
            if (USE_MOCK) {
                const result = await datosService.exportar(filtros)
                if (result.total === 0) {
                    setError('No hay registros que coincidan con los filtros seleccionados.')
                    return false
                }
                const csv = generateCSV(result.data, result.columnas)
                downloadCSV(result.filename, csv)
            } else {
                await datosService.exportarXlsx(filtros)
            }
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

    // ─── New async import API ────────────────────────────────────────────────

    const descargarPlantilla = useCallback(async (): Promise<void> => {
        try {
            setIsLoading(true)
            await datosService.descargarPlantilla()
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al descargar la plantilla.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    const validarImport = useCallback(async (
        file: File
    ): Promise<ValidateImportResult | null> => {
        try {
            setIsLoading(true)
            setError(null)
            return await datosService.validarImportXlsx(file)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al validar el archivo.')
            return null
        } finally {
            setIsLoading(false)
        }
    }, [])

    const commitImport = useCallback(async (
        file: File
    ): Promise<CommitImportResult | null> => {
        try {
            setIsLoading(true)
            setError(null)
            return await datosService.commitImportXlsx(file)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al iniciar la importación.')
            return null
        } finally {
            setIsLoading(false)
        }
    }, [])

    const pollJob = useCallback(async (
        jobId: string,
        onProgress?: (progress: number) => void
    ): Promise<ImportJobStatus | null> => {
        const MAX_ATTEMPTS = 60
        const INTERVAL_MS = 2000
        for (let i = 0; i < MAX_ATTEMPTS; i++) {
            try {
                const status = await datosService.consultarJob(jobId)
                onProgress?.(status.progress)
                if (status.state === 'completed' || status.state === 'failed') return status
                if (i < MAX_ATTEMPTS - 1) await new Promise(r => setTimeout(r, INTERVAL_MS))
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Error al consultar el estado del job.')
                return null
            }
        }
        setError('Tiempo de espera agotado. Consulta el estado manualmente.')
        return null
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
        descargarPlantilla,
        validarImport,
        commitImport,
        pollJob,
    }
}
