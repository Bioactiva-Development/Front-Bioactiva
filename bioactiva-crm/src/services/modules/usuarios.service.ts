import { USE_MOCK } from '@/lib/constants/config'
import { ENDPOINTS } from '@/services/api/endpoints'
import { apiClient } from '@/services/api/client'
import {
    mockGetUsuarios,
    mockEditarUsuario,
    mockCambiarPassword,
    mockDeshabilitarUsuario,
    mockHabilitarUsuario,
    mockListInvitaciones,
    mockCreateInvitacion,
    mockRevokeInvitacion,
    mockGetInvitacionInfo,
    mockAcceptInvitacion,
} from '@/services/mock/usuarios.mock'
import { mapRole, mapEstado } from '@/lib/utils/auth.mappers'
import {
    UsuariosResponse,
    UsuarioListItem,
    UsuarioFilters,
    EditarUsuarioRequest,
    CambiarPasswordRequest,
    ListInvitacionesParams,
    ListInvitacionesResponse,
    Invitacion,
    InvitacionRaw,
    InvitacionInfo,
    AcceptInvitacionRequest,
    AcceptInvitacionResponse,
} from '@/types/usuario.types'
import { EstadoToken, EstadoUsuario, RolUsuario } from '@/types/enums'

// GET /users devuelve rol y estado como strings legibles (doc-endpoint.md):
// rol ∈ { ADMINISTRADOR, TRABAJADOR }, estado ∈ { PENDIENTE, ACTIVO, SUSPENDIDO }.
// Se toleran también valores numéricos por compatibilidad con /auth/me.
const ROL_STR_MAP: Record<string, RolUsuario> = {
    ADMINISTRADOR: RolUsuario.Administrador,
    TRABAJADOR: RolUsuario.Trabajador,
}

const ESTADO_STR_MAP: Record<string, EstadoUsuario> = {
    PENDIENTE: EstadoUsuario.Pendiente,
    ACTIVO: EstadoUsuario.Activo,
    SUSPENDIDO: EstadoUsuario.Inactivo,
    INACTIVO: EstadoUsuario.Inactivo,
}

function mapRolUsuario(value: unknown): RolUsuario {
    if (typeof value === 'number') return mapRole(value)
    return ROL_STR_MAP[String(value ?? '').toUpperCase()] ?? RolUsuario.Trabajador
}

function mapEstadoUsuario(value: unknown): EstadoUsuario {
    if (typeof value === 'number') return mapEstado(value)
    return ESTADO_STR_MAP[String(value ?? '').toUpperCase()] ?? EstadoUsuario.Pendiente
}

// Sentido inverso: del enum del frontend al string que espera GET /users.
const ROL_TO_BACKEND: Record<RolUsuario, string> = {
    [RolUsuario.Administrador]: 'ADMINISTRADOR',
    [RolUsuario.Trabajador]: 'TRABAJADOR',
}

const ESTADO_TO_BACKEND: Record<EstadoUsuario, string> = {
    [EstadoUsuario.Pendiente]: 'PENDIENTE',
    [EstadoUsuario.Activo]: 'ACTIVO',
    [EstadoUsuario.Inactivo]: 'SUSPENDIDO',
}

// Construye el query string exactamente como lo define el contrato:
// search, role, estado, page, limit (ver doc-endpoint.md, módulo `users`).
function buildUsersQuery(filters?: UsuarioFilters): Record<string, string | number> {
    const params: Record<string, string | number> = {}
    if (!filters) return params
    if (filters.search) params.search = filters.search
    if (filters.rol) params.role = ROL_TO_BACKEND[filters.rol]
    if (filters.estado) params.estado = ESTADO_TO_BACKEND[filters.estado]
    if (filters.page) params.page = filters.page
    if (filters.limit) params.limit = filters.limit
    return params
}

const ESTADO_TOKEN_MAP: Record<number, EstadoToken> = {
    0: EstadoToken.Pendiente,
    1: EstadoToken.Consumido,
    2: EstadoToken.Expirado,
}

function mapInvitacionRaw(raw: InvitacionRaw): Invitacion {
    return {
        id: raw.id,
        correo: raw.correo,
        rol: typeof raw.rol === 'number' ? mapRole(raw.rol) : (raw.rol as never),
        estado:
            typeof raw.estado === 'number'
                ? (ESTADO_TOKEN_MAP[raw.estado] ?? EstadoToken.Pendiente)
                : (raw.estado as EstadoToken),
        // El backend envía `expired_at`; se mantiene `expires_at` como nombre
        // interno que consume la UI. Fallback a '' para no romper `.slice()`.
        expires_at: raw.expired_at ?? raw.expires_at ?? '',
        consumed_at: raw.consumed_at,
        created_at: raw.created_at,
    }
}

export const usuariosService = {
    // ── Usuarios ────────────────────────────────────────────────────────────────

    getUsuarios: async (filters?: UsuarioFilters): Promise<UsuariosResponse> => {
        if (USE_MOCK) return mockGetUsuarios(filters)
        // Contrato GET /users: { data: [...], meta: { total, ... } }.
        // Se toleran respuestas planas (array) o { usuarios: [...] } por robustez.
        const { data } = await apiClient.get(ENDPOINTS.usuarios.list, { params: buildUsersQuery(filters) })
        const rows = Array.isArray(data) ? data : (data.data ?? data.usuarios ?? [])
        const usuarios: UsuarioListItem[] = rows.map((u: Record<string, unknown>) => ({
            id: Number(u.id),
            nombres: String(u.nombres ?? ''),
            apellidos: String(u.apellidos ?? ''),
            correo: String(u.correo ?? ''),
            rol: mapRolUsuario(u.rol ?? u.role),
            estado: mapEstadoUsuario(u.estado),
            ultimo_acceso: (u.ultimo_acceso ?? u.ultimoAcceso) as string | undefined,
            created_at: String(u.fechaRegistro ?? u.created_at ?? u.createdAt ?? ''),
            updated_at: String(u.updated_at ?? u.updatedAt ?? u.fechaRegistro ?? ''),
        }))
        const meta = (data?.meta ?? {}) as Record<string, unknown>
        const total = Number(meta.total ?? usuarios.length)
        const activos = usuarios.filter((u) => u.estado === EstadoUsuario.Activo).length
        return { usuarios, total, activos }
    },

    editar: async (data: EditarUsuarioRequest): Promise<UsuarioListItem> => {
        if (USE_MOCK) return mockEditarUsuario(data)
        const response = await apiClient.put<UsuarioListItem>(ENDPOINTS.usuarios.detail(data.id), data)
        return response.data
    },

    cambiarPassword: async (data: CambiarPasswordRequest): Promise<{ message: string }> => {
        if (USE_MOCK) return mockCambiarPassword(data)
        const response = await apiClient.patch<{ message: string }>(
            ENDPOINTS.usuarios.cambiarPassword(data.id),
            { password: data.password },
        )
        return response.data
    },

    deshabilitar: async (id: number): Promise<UsuarioListItem> => {
        if (USE_MOCK) return mockDeshabilitarUsuario(id)
        const response = await apiClient.patch<UsuarioListItem>(ENDPOINTS.usuarios.disable(id))
        return response.data
    },

    habilitar: async (id: number): Promise<UsuarioListItem> => {
        if (USE_MOCK) return mockHabilitarUsuario(id)
        const response = await apiClient.patch<UsuarioListItem>(ENDPOINTS.usuarios.enable(id))
        return response.data
    },

    // ── Invitaciones ────────────────────────────────────────────────────────────

    listInvitaciones: async (params?: ListInvitacionesParams): Promise<ListInvitacionesResponse> => {
        if (USE_MOCK) return mockListInvitaciones(params)
        const { data: body } = await apiClient.get(ENDPOINTS.invitaciones.list, { params })
        // El backend puede responder como array plano `[...]` o envuelto en
        // `{ data: [...], total, page, limit }`. Se toleran ambas formas.
        const rawList: InvitacionRaw[] = Array.isArray(body)
            ? body
            : (body?.data ?? body?.invitaciones ?? [])
        const data = rawList.map(mapInvitacionRaw)
        const meta = (Array.isArray(body) ? {} : (body ?? {})) as Record<string, unknown>
        const total = Number(meta.total ?? (meta.meta as { total?: number })?.total ?? data.length)
        const page = Number(meta.page ?? params?.page ?? 1)
        const limit = Number(meta.limit ?? params?.limit ?? data.length)
        return { data, total, page, limit }
    },

    createInvitacion: async (correo: string, rol: number): Promise<Invitacion> => {
        if (USE_MOCK) return mockCreateInvitacion(correo, rol)
        const response = await apiClient.post<InvitacionRaw>(
            ENDPOINTS.invitaciones.create,
            { correo, rol },
        )
        return mapInvitacionRaw(response.data)
    },

    revokeInvitacion: async (id: number): Promise<Invitacion> => {
        if (USE_MOCK) return mockRevokeInvitacion(id)
        const response = await apiClient.delete<InvitacionRaw>(
            ENDPOINTS.invitaciones.revoke(id),
        )
        return mapInvitacionRaw(response.data)
    },

    getInvitacionInfo: async (token: string): Promise<InvitacionInfo> => {
        if (USE_MOCK) return mockGetInvitacionInfo(token)
        const response = await apiClient.get<InvitacionInfo>(
            ENDPOINTS.invitaciones.info(token),
        )
        return response.data
    },

    acceptInvitacion: async (data: AcceptInvitacionRequest): Promise<AcceptInvitacionResponse> => {
        if (USE_MOCK) return mockAcceptInvitacion()
        const response = await apiClient.post<AcceptInvitacionResponse>(
            ENDPOINTS.invitaciones.accept,
            data,
        )
        return response.data
    },
}
