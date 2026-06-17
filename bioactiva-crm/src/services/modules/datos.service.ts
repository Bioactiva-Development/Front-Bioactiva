import { USE_MOCK } from '@/lib/constants/config'
import { ENDPOINTS } from '@/services/api/endpoints'
import { apiClient } from '@/services/api/client'
import {
    mockPreviewImport,
    mockConfirmarImport,
    mockExportar,
    mockContarExportacion,
    mockValidateImport,
    mockCommitImport,
    mockConsultarJob,
} from '@/services/mock/datos.mock'
import {
    EntidadExportable,
    ImportPreviewResult,
    ConfirmarImportRequest,
    ConfirmarImportResult,
    FiltrosExportacion,
    ExportarResult,
    ConteoExportacion,
    FiltrosOrganizacion,
    FiltrosContacto,
    FiltrosLead,
    FiltrosCotizacion,
    ValidateImportResult,
    CommitImportResult,
    ImportJobStatus,
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

    exportarXlsx: async (filtros: FiltrosExportacion): Promise<void> => {
        const endpointMap: Record<EntidadExportable, string> = {
            organizaciones: ENDPOINTS.datos.exportXlsx.organizaciones,
            contactos:      ENDPOINTS.datos.exportXlsx.contactos,
            leads:          ENDPOINTS.datos.exportXlsx.leads,
            cotizaciones:   ENDPOINTS.datos.exportXlsx.cotizaciones,
        }

        const params: Record<string, string> = {}
        if (filtros.busqueda.trim() && filtros.entidad !== 'leads' && filtros.entidad !== 'organizaciones' && filtros.entidad !== 'contactos') params.nombre = filtros.busqueda

        const f = filtros.filtros
        if (filtros.entidad === 'organizaciones') {
            const o = f as FiltrosOrganizacion
            if (o.sector)  params.sector = o.sector
            if (o.tipo)    params.tipo   = o.tipo
            if (o.tamano)  params.tamano = o.tamano
        } else if (filtros.entidad === 'leads') {
            const l = f as FiltrosLead
            if (l.estado) params.estado = l.estado
        } else if (filtros.entidad === 'cotizaciones') {
            const c = f as FiltrosCotizacion
            if (c.estado) params.estado = c.estado
        } else if (filtros.entidad === 'contactos') {
            const c = f as FiltrosContacto
            if (c.organizacion) params.organizacion = c.organizacion
        }

        const response = await apiClient.get(endpointMap[filtros.entidad], {
            params,
            responseType: 'blob',
        })

        const disposition = response.headers['content-disposition'] as string | undefined
        let filename = `${filtros.entidad}-${new Date().toISOString().split('T')[0]}.xlsx`
        if (disposition) {
            const match = disposition.match(/filename="([^"]+)"/)
            if (match?.[1]) filename = match[1]
        }

        const url = URL.createObjectURL(response.data as Blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    },

    contarExportacion: async (filtros: FiltrosExportacion): Promise<ConteoExportacion> => {
        if (USE_MOCK) return mockContarExportacion(filtros)
        // Real API has no count endpoint; hook catches and sets conteo to null
        throw new Error('COUNT_NOT_SUPPORTED')
    },

    descargarPlantilla: async (): Promise<void> => {
        const response = await apiClient.get(ENDPOINTS.datos.importXlsx.template, {
            responseType: 'blob',
        })
        const disposition = response.headers['content-disposition'] as string | undefined
        let filename = 'plantilla-bioactiva.xlsx'
        if (disposition) {
            const match = disposition.match(/filename="([^"]+)"/)
            if (match?.[1]) filename = match[1]
        }
        const url = URL.createObjectURL(response.data as Blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    },

    validarImportXlsx: async (file: File): Promise<ValidateImportResult> => {
        if (USE_MOCK) return mockValidateImport()
        const formData = new FormData()
        formData.append('file', file)
        const response = await apiClient.post<ValidateImportResult>(
            ENDPOINTS.datos.importXlsx.validate,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        return response.data
    },

    commitImportXlsx: async (file: File): Promise<CommitImportResult> => {
        if (USE_MOCK) return mockCommitImport()
        const formData = new FormData()
        formData.append('file', file)
        const response = await apiClient.post<CommitImportResult>(
            ENDPOINTS.datos.importXlsx.commit,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        return response.data
    },

    consultarJob: async (jobId: string): Promise<ImportJobStatus> => {
        if (USE_MOCK) return mockConsultarJob(jobId)
        const response = await apiClient.get<ImportJobStatus>(
            ENDPOINTS.datos.importXlsx.job(jobId)
        )
        return response.data
    },
}
