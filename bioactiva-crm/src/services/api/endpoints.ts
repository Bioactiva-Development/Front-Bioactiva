export const ENDPOINTS = {
    auth: {
        login:   '/auth/login',
        refresh: '/auth/refresh',
        me:      '/auth/me',
        logout:  '/auth/logout',
    },
    resetPassword: {
        request:  '/reset-password/request',
        validate: '/reset-password/validate',
        reset:    '/reset-password/reset',
    },
    invitations: {
        info:   (token: string) => `/invitations/info/${token}`,
        accept: '/invitations/accept',
        create: '/invitations',
        list:   '/invitations',
        delete: (id: number) => `/invitations/${id}`,
    },
    usuarios: {
        // GET /users — implementado en backend (doc-endpoint.md, módulo `users`).
        list: '/users',
        // Endpoints marcados como "Pendiente" en el backend; se alinean a la
        // convención documentada (`/users/:id`) para cuando se expongan por HTTP.
        detail: (id: number) => `/users/${id}`,
        cambiarPassword: (id: number) => `/users/${id}/password`,
        disable: (id: number) => `/users/${id}/disable`,
        enable: (id: number) => `/users/${id}/enable`,
    },

    perfil: {
        get: '/api/perfil',
        update: '/api/perfil',
        password: '/api/perfil/password',
    },

    integraciones: {
        microsoftStatus:     '/microsoft/status',
        microsoftConnect:    '/microsoft/connect',
        microsoftDisconnect: '/microsoft/disconnect',
    },

    invitaciones: {
        list: '/invitations',
        create: '/invitations',
        info: (token: string) => `/invitations/info/${token}`,
        accept: '/invitations/accept',
        revoke: (id: number) => `/invitations/${id}`,
    },

    organizaciones: {
        list: '/organizations',
        detail: (id: string) => `/organizations/${id}`,
        create: '/organizations',
        update: (id: string) => `/organizations/${id}`,
        delete: (id: string) => `/organizations/${id}`,
        sunat: (query: string) => `/organizations/sunat/${encodeURIComponent(query)}`,
    },

    contactos: {
        list: '/contacts',
        detail: (id: number) => `/contacts/${id}`,
        create: '/contacts',
        update: (id: number) => `/contacts/${id}`,
        byOrganizacion: (orgId: string) => `/contacts/organization/${orgId}`,
    },

    leads: {
        list: '/leads',
        detail: (id: number) => `/leads/${id}`,
        create: '/leads',
        update: (id: number) => `/leads/${id}`,
        updateEstado: (id: number) => `/leads/${id}/status`,
    },

    actividades: {
        list:     '/activities',
        detail:   (id: number) => `/activities/${id}`,
        create:   '/activities',
        update:   (id: number) => `/activities/${id}`,
        complete: (id: number) => `/activities/${id}/complete`,
        cancel:   (id: number) => `/activities/${id}/cancel`,
        delete:   (id: number) => `/activities/${id}`,
    },

    cotizaciones: {
        list:    '/quotations',
        detail:  (id: number) => `/quotations/${id}`,
        create:  '/quotations',
        update:  (id: number) => `/quotations/${id}`,
        delete:  (id: number) => `/quotations/${id}`,
        send:    (id: number) => `/quotations/${id}/send`,
        accept:  (id: number) => `/quotations/${id}/accept`,
        reject:  (id: number) => `/quotations/${id}/reject`,
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
