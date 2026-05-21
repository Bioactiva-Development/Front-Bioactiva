import { RolUsuario, EstadoUsuario } from '@/types/enums'
import {
    UsuarioListItem,
    UsuariosResponse,
    Invitacion,
    InvitarUsuarioRequest,
    InvitarUsuarioResponse,
    EditarUsuarioRequest,
    CambiarPasswordRequest,
} from '@/types/usuario.types'

let mockUsuarios: UsuarioListItem[] = [
    { id: 1, nombres: 'Administración', apellidos: '', correo: 'admin@bioactiva.pe', rol: RolUsuario.Administrador, estado: EstadoUsuario.Activo, ultimo_acceso: 'Hace 11 min', created_at: '2024-01-01T08:00:00Z', updated_at: '2024-01-01T08:00:00Z' },
    { id: 2, nombres: 'Karien', apellidos: 'Diaz', correo: 'karien@bioactiva.pe', rol: RolUsuario.Trabajador, estado: EstadoUsuario.Activo, ultimo_acceso: 'Hace 11 min', created_at: '2024-01-02T08:00:00Z', updated_at: '2024-01-02T08:00:00Z' },
    { id: 3, nombres: 'Luis', apellidos: 'Torres', correo: 'ltorres@bioactiva.pe', rol: RolUsuario.Trabajador, estado: EstadoUsuario.Activo, ultimo_acceso: 'Hace 11 min', created_at: '2024-01-03T08:00:00Z', updated_at: '2024-01-03T08:00:00Z' },
    { id: 4, nombres: 'Ana', apellidos: 'Rojas', correo: 'arojas@bioactiva.pe', rol: RolUsuario.Trabajador, estado: EstadoUsuario.Activo, ultimo_acceso: 'Hace 11 min', created_at: '2024-01-04T08:00:00Z', updated_at: '2024-01-04T08:00:00Z' },
    { id: 5, nombres: 'María', apellidos: 'Quispe', correo: 'mquispe@bioactiva.pe', rol: RolUsuario.Trabajador, estado: EstadoUsuario.Activo, ultimo_acceso: 'Hace 11 min', created_at: '2024-01-05T08:00:00Z', updated_at: '2024-01-05T08:00:00Z' },
    { id: 6, nombres: 'Carlos', apellidos: 'Mamani', correo: 'cmamani@bioactiva.pe', rol: RolUsuario.Trabajador, estado: EstadoUsuario.Activo, ultimo_acceso: 'Hace 11 min', created_at: '2024-01-06T08:00:00Z', updated_at: '2024-01-06T08:00:00Z' },
]

let mockInvitaciones: Invitacion[] = [
    { id: 1, correo: 'trabajador1@bioactiva.pe', rol: RolUsuario.Trabajador, estado: 'Enviada', fecha_envio: '2026-05-21', fecha_vencimiento: '2026-05-22' },
]

let nextId = 7

export function mockGetUsuarios(): UsuariosResponse {
    const activos = mockUsuarios.filter(u => u.estado === EstadoUsuario.Activo).length
    return { usuarios: [...mockUsuarios], total: mockUsuarios.length, activos }
}

export function mockGetInvitaciones(): Invitacion[] {
    return [...mockInvitaciones]
}

export function mockInvitarUsuario(data: InvitarUsuarioRequest): InvitarUsuarioResponse {
    const yaExiste = mockInvitaciones.some(i => i.correo === data.correo)
        || mockUsuarios.some(u => u.correo === data.correo)
    if (yaExiste) throw new Error('Ya existe un usuario o invitación con ese correo.')

    const hoy = new Date()
    const vence = new Date(hoy)
    vence.setDate(hoy.getDate() + 1)

    mockInvitaciones.push({
        id: nextId++,
        correo: data.correo,
        rol: data.rol,
        estado: 'Enviada',
        fecha_envio: hoy.toISOString().split('T')[0],
        fecha_vencimiento: vence.toISOString().split('T')[0],
    })
    return { message: `Invitación enviada a ${data.correo}` }
}

export function mockEditarUsuario(data: EditarUsuarioRequest): UsuarioListItem {
    const idx = mockUsuarios.findIndex(u => u.id === data.id)
    if (idx === -1) throw new Error('Usuario no encontrado.')

    const partes = data.nombre_completo.trim().split(' ')
    const nombres = partes[0] ?? ''
    const apellidos = partes.slice(1).join(' ')

    mockUsuarios[idx] = {
        ...mockUsuarios[idx],
        nombres,
        apellidos,
        correo: data.correo,
        rol: data.rol,
        updated_at: new Date().toISOString(),
    }
    return mockUsuarios[idx]
}

export function mockCambiarPassword(_data: CambiarPasswordRequest): { message: string } {
    return { message: 'Contraseña actualizada correctamente.' }
}

export function mockDeshabilitarUsuario(id: number): UsuarioListItem {
    const idx = mockUsuarios.findIndex(u => u.id === id)
    if (idx === -1) throw new Error('Usuario no encontrado.')
    mockUsuarios[idx] = { ...mockUsuarios[idx], estado: EstadoUsuario.Inactivo, updated_at: new Date().toISOString() }
    return mockUsuarios[idx]
}

export function mockHabilitarUsuario(id: number): UsuarioListItem {
    const idx = mockUsuarios.findIndex(u => u.id === id)
    if (idx === -1) throw new Error('Usuario no encontrado.')
    mockUsuarios[idx] = { ...mockUsuarios[idx], estado: EstadoUsuario.Activo, updated_at: new Date().toISOString() }
    return mockUsuarios[idx]
}
