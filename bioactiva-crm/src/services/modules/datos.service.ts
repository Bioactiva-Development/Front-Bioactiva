import { USE_MOCK } from '@/lib/constants/config'
import { ENDPOINTS } from '@/services/api/endpoints'
import { apiClient } from '@/services/api/client'
import {
    mockPreviewImport,
    mockConfirmarImport,
    mockExportar,
    mockContarExportacion,
} from '@/services/mock/datos.mock'
import {
    EntidadExportable,
    ImportPreviewResult,
    ConfirmarImportRequest,
    ConfirmarImportResult,
    FiltrosExportacion,
    ExportarResult,
    ConteoExportacion,
} from '@/types/datos.types'

export const datosService = {
    previewImport: async (file: File, entidad: EntidadExportable): Promise<ImportPreviewResult> => {
        if (USE_MOCK) return mockPreviewImport(entidad)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('entidad', entidad)
        const response = await apiClient.post<ImportPreviewResult>(
            ENDPOINTS.datos.previewImportar,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        return response.data
    },

    confirmarImport: async (data: ConfirmarImportRequest): Promise<ConfirmarImportResult> => {
        if (USE_MOCK) return mockConfirmarImport(data.entidad)
        const response = await apiClient.post<ConfirmarImportResult>(
            ENDPOINTS.datos.importar,
            data
        )
        return response.data
    },

    exportar: async (filtros: FiltrosExportacion): Promise<ExportarResult> => {
        if (USE_MOCK) return mockExportar(filtros)
        const response = await apiClient.get<ExportarResult>(
            ENDPOINTS.datos.exportar,
            { params: { entidad: filtros.entidad, busqueda: filtros.busqueda, ...filtros.filtros } }
        )
        return response.data
    },

    contarExportacion: async (filtros: FiltrosExportacion): Promise<ConteoExportacion> => {
        if (USE_MOCK) return mockContarExportacion(filtros)
        const response = await apiClient.get<ConteoExportacion>(
            ENDPOINTS.datos.contar,
            { params: { entidad: filtros.entidad, busqueda: filtros.busqueda, ...filtros.filtros } }
        )
        return response.data
    },
}
