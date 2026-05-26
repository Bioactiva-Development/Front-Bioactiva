export const ENDPOINTS = {
    auth: {
        login:   '/auth/login',
        refresh: '/auth/refresh',
        me:      '/auth/me',
        // Nota: el backend NestJS no expone `/auth/logout` aún. El logout es
        // client-side (clearSession + redirect); este endpoint queda como
        // contrato futuro si el equipo backend decide invalidar el refresh
        // token server-side en el revoke.
        logout:  '/auth/logout',
    },
    resetPassword: {
        // Base path real del backend: `/reset-password` (no bajo `/auth`).
        // Doc HackMD §"Módulo reset_password".
        request:  '/reset-password/request',   // POST { correo }
        validate: '/reset-password/validate',  // POST { token } → { correo (ofuscado) }
        reset:    '/reset-password/reset',     // POST { token, password, confirmPassword }
    },
    invitations: {
        // Activación de cuenta nueva: el backend la maneja desde el módulo
        // `invitations`, no desde `/auth/activate`. Doc HackMD §"Módulo invitations".
        info:   (token: string) => `/invitations/info/${token}`, // GET
        accept: '/invitations/accept',                            // POST
        create: '/invitations',                                   // POST (admin)
        list:   '/invitations',                                   // GET (admin)
        delete: (id: number) => `/invitations/${id}`,             // DELETE (admin)
    },
    usuarios: {
        list: '/api/usuarios',
        invitaciones: '/api/usuarios/invitaciones',
        detail: (id: number) => `/api/usuarios/${id}`,
        invite: '/api/usuarios/invite',
        cambiarPassword: (id: number) => `/api/usuarios/${id}/password`,
        disable: (id: number) => `/api/usuarios/${id}/disable`,
        enable: (id: number) => `/api/usuarios/${id}/enable`,
    },

    perfil: {
        get: '/api/perfil',
        update: '/api/perfil',
        password: '/api/perfil/password',
    },

    integraciones: {
        list: '/api/integraciones',
        microsoftAuthUrl: '/api/integraciones/microsoft/auth-url',
        microsoftDisconnect: '/api/integraciones/microsoft/disconnect',
    },

    organizaciones: {
        list: '/organizations',
        detail: (id: string) => `/organizations/${id}`,
        create: '/organizations',
        update: (id: string) => `/organizations/${id}`,
        sunat: (query: string) => `/organizations/sunat/${encodeURIComponent(query)}`,
    },

    contactos: {
        list: '/api/contactos',
        detail: (id: number) => `/api/contactos/${id}`,
        create: '/api/contactos',
        update: (id: number) => `/api/contactos/${id}`,
        byOrganizacion: (orgId: string) => `/api/contactos/organizacion/${orgId}`,
    },

    leads: {
        list: '/api/leads',
        pipeline: '/api/leads/pipeline',
        detail: (id: number) => `/api/leads/${id}`,
        create: '/api/leads',
        update: (id: number) => `/api/leads/${id}`,
        updateEstado: (id: number) => `/api/leads/${id}/estado`,
    },

    actividades: {
        byLead: (leadId: number) => `/api/leads/${leadId}/actividades`,
        detail: (id: number) => `/api/actividades/${id}`,
        create: (leadId: number) => `/api/leads/${leadId}/actividades`,
        update: (id: number) => `/api/actividades/${id}`,
        complete: (id: number) => `/api/actividades/${id}/complete`,
        delete: (id: number) => `/api/actividades/${id}`,
    },

    cotizaciones: {
        list: '/api/cotizaciones',
        detail: (id: number) => `/api/cotizaciones/${id}`,
        create: '/api/cotizaciones',
        update: (id: number) => `/api/cotizaciones/${id}`,
        byLead: (leadId: number) => `/api/leads/${leadId}/cotizaciones`,
    },

    notificaciones: {
        // El backend NestJS aún no expone el módulo `notifications` (marcado
        // "Pendiente" en la doc de endpoints). Cuando lo haga, lo más probable
        // es que use `/notifications` en inglés siguiendo la convención de
        // `/organizations` y `/auth`. Mantenemos `/notificaciones` por ahora
        // como contrato esperado; ajustar cuando el backend confirme.
        list:         '/notificaciones',
        detail:       (id: number) => `/notificaciones/${id}`,
        cancel:       (id: number) => `/notificaciones/${id}/cancel`,
        centro:       '/notificaciones/centro',
        leer:         (id: number) => `/notificaciones/${id}/leer`,
        leerTodas:    '/notificaciones/leer-todas',
        programada:   (id: number) => `/notificaciones/programadas/${id}`,
        recordatorio: '/notificaciones/recordatorio',
        seguimiento:  '/notificaciones/seguimiento',
    },

    plantillas: {
        list: '/api/plantillas',
        detail: (id: number) => `/api/plantillas/${id}`,
        create: '/api/plantillas',
        update: (id: number) => `/api/plantillas/${id}`,
        delete: (id: number) => `/api/plantillas/${id}`,
        activas: '/api/plantillas/activas',
    },

    dashboard: {
        metricas: '/api/dashboard/metricas',
    },

    datos: {
        previewImportar: '/api/datos/importar/preview',
        importar: '/api/datos/importar',
        exportar: '/api/datos/exportar',
        contar: '/api/datos/exportar/contar',
        historial: '/api/datos/historial',
    },
} as const

