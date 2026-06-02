import { RolUsuario, EstadoUsuario, TokenPurpose, EstadoToken } from "./enums"

//Usuario Autenticado 
export interface Usuario {
    id: number
    nombres: string
    apellidos: string
    correo: string
    rol: RolUsuario
    estado: EstadoUsuario
    created_at: string
    updated_at: string
}

// Respuesta en /auth/me backend
export interface UsuarioRaw {
    id: number
    nombres: string
    apellidos: string
    correo: string
    password: string
    role: number
    estado: number
    created_at: string
    updated_at: string
}

export interface JwtPayload {
    sub: number
    correo: string
    rol: RolUsuario
    iat: number
    exp: number
}

export interface AuthState {
    usuario: Usuario | null
    accessToken: string | null
    isAuthenticated: boolean
    isLoading: boolean
}

export interface LoginRequest {
    correo: string
    password: string
}

export interface LoginResponse {
    accessToken: string
    accessTokenExpiresIn: number
}

export interface RefreshResponse {
    accessToken: string
    accessTokenExpiresIn: number
}

export interface ForgotPasswordRequest {
    correo: string
}

export interface ForgotPasswordResponse {
    ok: boolean
}

export interface ResetPasswordRequest {
    token: string
    password: string
    confirmPassword: string
}

export interface ResetPasswordResponse {
    ok: boolean
}

export interface ValidateTokenResult {
    valid: boolean
    correo?: string
    message?: string
}

export interface ActivateAccountRequest {
    token: string
    nombres: string
    apellidos: string
    password: string
    confirmPassword: string
}

export interface ActivateAccountResponse {
    message: string
    usuario: Usuario
}

export interface UserToken {
    id: number
    correo: string
    token_hash: string
    proposito: TokenPurpose
    id_usuario: number
    rol: RolUsuario
    estado: EstadoToken
    expires_at: string
    consumed_at: string | null
    created_at: string
}

export interface ValidateTokenResponse {
    valid: boolean
    correo?: string
    message?: string
}

