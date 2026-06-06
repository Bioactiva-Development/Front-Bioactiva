import { USE_MOCK } from '@/lib/constants/config'
import { ENDPOINTS } from '@/services/api/endpoints'
import { apiClient } from '@/services/api/client'
import {
    mockGetContactos,
    mockGetContacto,
    mockCreateContacto,
    mockUpdateContacto,
} from '@/services/mock/contactos.mock'
import {
    Contacto,
    ContactoFiltros,
    ContactosResponse,
    ContactoFormData,
} from '@/types/contacto.types'

function stripEmptyStrings<T extends Record<string, unknown>>(data: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== '')
    ) as Partial<T>
}

function normalizeContacto(raw: Record<string, unknown>): Contacto {
    return {
        id: Number(raw.id),
        nombres: String(raw.nombres ?? ''),
        apellidos: (raw.apellidos ?? null) as Contacto['apellidos'],
        vocativo: raw.vocativo as Contacto['vocativo'],
        cargo: (raw.cargo ?? null) as Contacto['cargo'],
        correo: String(raw.correo ?? ''),
        correo2: (raw.correo2 ?? null) as Contacto['correo2'],
        telefono: (raw.telefono ?? null) as Contacto['telefono'],
        comentarios: (raw.comentarios ?? null) as Contacto['comentarios'],
        idOrganizacion: String(raw.idOrganizacion ?? ''),
        idAuthor: Number(raw.idAuthor ?? 0),
        estado_correo: (raw.estado_correo ?? 'VIGENTE') as Contacto['estado_correo'],
        createdAt: String(raw.createdAt ?? ''),
        updatedAt: String(raw.updatedAt ?? raw.createdAt ?? ''),
        organizacion_nombre: (raw.organizacionNombre ?? raw.organizacion_nombre) as string | undefined,
    }
}

type ContactosBackendResponse =
    | Record<string, unknown>[]
    | {
        data?: Record<string, unknown>[]
        meta?: {
            page?: number
            limit?: number
            total?: number
            totalPages?: number
        }
    }

function normalizeContactosResponse(
    raw: ContactosBackendResponse,
    filtros?: ContactoFiltros
): ContactosResponse {
    if (Array.isArray(raw)) {
        const data = raw.map(normalizeContacto)
        const page = filtros?.page ?? 1
        const limit = filtros?.limit ?? data.length

        return {
            data,
            total: data.length,
            page,
            limit,
            totalPages: limit > 0 ? Math.ceil(data.length / limit) : 1,
        }
    }

    if (!Array.isArray(raw.data)) {
        throw new Error('La respuesta de contactos no tiene el formato esperado.')
    }

    const data = raw.data.map(normalizeContacto)
    const page = raw.meta?.page ?? filtros?.page ?? 1
    const limit = raw.meta?.limit ?? filtros?.limit ?? data.length
    const total = raw.meta?.total ?? data.length

    return {
        data,
        total,
        page,
        limit,
        totalPages: raw.meta?.totalPages ?? (limit > 0 ? Math.ceil(total / limit) : 1),
    }
}

export const contactosService = {

    getAll: async (filtros?: ContactoFiltros): Promise<ContactosResponse> => {
        if (USE_MOCK) return mockGetContactos(filtros)

        const params: Record<string, unknown> = {}
        if (filtros?.idOrganizacion) params.idOrganization = filtros.idOrganizacion
        if (filtros?.search)         params.search         = filtros.search
        if (filtros?.page)           params.page           = filtros.page
        if (filtros?.limit)          params.limit          = filtros.limit

        const response = await apiClient.get<ContactosBackendResponse>(
            ENDPOINTS.contactos.list,
            { params }
        )

        return normalizeContactosResponse(response.data, filtros)
    },

    getById: async (id: number): Promise<Contacto> => {
        if (USE_MOCK) return mockGetContacto(id)
        const response = await apiClient.get<Record<string, unknown>>(
            ENDPOINTS.contactos.detail(id)
        )
        return normalizeContacto(response.data)
    },

    create: async (data: ContactoFormData): Promise<Contacto> => {
        if (USE_MOCK) return mockCreateContacto(data)
        const response = await apiClient.post<Record<string, unknown>>(
            ENDPOINTS.contactos.create,
            stripEmptyStrings(data as unknown as Record<string, unknown>)
        )
        return normalizeContacto(response.data)
    },

    update: async (
        id: number,
        data: Partial<ContactoFormData>
    ): Promise<Contacto> => {
        if (USE_MOCK) return mockUpdateContacto(id, data)
        const response = await apiClient.patch<Record<string, unknown>>(
            ENDPOINTS.contactos.update(id),
            stripEmptyStrings(data as unknown as Record<string, unknown>)
        )
        return normalizeContacto(response.data)
    },

    getByOrganizacion: async (orgId: string): Promise<Contacto[]> => {
        if (USE_MOCK) {
            const response = await mockGetContactos({ idOrganizacion: orgId })
            return response.data
        }
        const response = await apiClient.get<Record<string, unknown>[]>(
            ENDPOINTS.contactos.byOrganizacion(orgId)
        )
        return response.data.map(normalizeContacto)
    },
}
