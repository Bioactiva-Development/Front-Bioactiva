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
    usuarios: {
        // GET /users — implementado en backend (doc-endpoint.md, módulo `users`).
        list: '/users',
        // Mantis #434 — GET /users/assignable. Lista todos los usuarios habilitados
        // sin restriccion por rol; fuente del selector de Encargado en leads.
        // No usar `list` aqui: GET /users esta filtrado por rol.
        assignable: '/users/assignable',
        // Endpoints marcados como "Pendiente" en el backend; se alinean a la
        // convención documentada (`/users/:id`) para cuando se expongan por HTTP.
        detail: (id: number) => `/users/${id}`,
        cambiarPassword: (id: number) => `/users/${id}/password`,
        disable: (id: number) => `/users/${id}/disable`,
        enable: (id: number) => `/users/${id}/enable`,
        // Mantis #333 — solo ADMINISTRADOR. Body { rol: 'ADMINISTRADOR' | 'TRABAJADOR' }.
        role: (id: number) => `/users/${id}/role`,
    },

    // Mantis #333 — "Mi perfil" editable (GET/PATCH /profile, PATCH /profile/password).
    perfil: {
        get: '/profile',
        update: '/profile',
        password: '/profile/password',
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
        sunat: '/organizations/sunat',
    },

    contactos: {
        list: '/contacts',
        detail: (id: number) => `/contacts/${id}`,
        create: '/contacts',
        update: (id: number) => `/contacts/${id}`,
        estadoCorreo: (id: number) => `/contacts/${id}/status`,
        byOrganizacion: (orgId: string) => `/contacts/organization/${orgId}`,
    },

    leads: {
        list: '/leads',
        detail: (id: number) => `/leads/${id}`,
        create: '/leads',
        update: (id: number) => `/leads/${id}`,
        updateEstado: (id: number) => `/leads/${id}/status`,
        delete: (id: number) => `/leads/${id}`,
    },

    actividades: {
        list: '/activities',
        detail: (id: number) => `/activities/${id}`,
        create: '/activities',
        update: (id: number) => `/activities/${id}`,
        complete: (id: number) => `/activities/${id}/complete`,
        cancel: (id: number) => `/activities/${id}/cancel`,
        calendarEvent: (id: number) => `/activities/${id}/calendar-event`,
        // Mantis #407 — edicion del comentario (campo `notas`) de la actividad.
        // Body { notas: string } (1-1000). Reemplaza el valor; sin historial.
        notes: (id: number) => `/activities/${id}/notes`,
        delete: (id: number) => `/activities/${id}`,
    },

    cotizaciones: {
        list: '/quotations',
        kpis: '/quotations/kpis',
        detail: (id: number) => `/quotations/${id}`,
        create: '/quotations',
        update: (id: number) => `/quotations/${id}`,
        send: (id: number) => `/quotations/${id}/send`,
        accept: (id: number) => `/quotations/${id}/accept`,
        reject: (id: number) => `/quotations/${id}/reject`,
        delete: (id: number) => `/quotations/${id}`,
    },

    notificaciones: {
        list:         '/notifications',
        cancel:       (id: number) => `/notifications/${id}`,
        recordatorio: '/notifications/reminders',
        seguimiento:  '/notifications/follow-ups',
        editSeguimiento: (id: number) => `/notifications/follow-ups/${id}`,
        inApp:        '/notifications/in-app',
        readInApp:    (id: number) => `/notifications/in-app/${id}/read`,
    },

    plantillas: {
        list:   '/templates',
        detail: (id: number) => `/templates/${id}`,
        create: '/templates',
        update: (id: number) => `/templates/${id}`,
        delete: (id: number) => `/templates/${id}`,
        // Selector de plantillas activas al programar notificaciones (endpoint separado)
        activas: '/notifications/templates',
    },

    dashboard: {
        metrics: '/dashboard/metrics',
    },

    datos: {
        previewImportar: '/api/datos/importar/preview',
        importar: '/api/datos/importar',
        exportar: '/api/datos/exportar',
        contar: '/api/datos/exportar/contar',
        historial: '/api/datos/historial',
        importXlsx: {
            template: '/data/import/template',
            validate: '/data/import/validate',
            commit:   '/data/import/commit',
            job:      (id: string) => `/data/import/jobs/${id}`,
        },
        exportXlsx: {
            organizaciones: '/data/export/organizaciones',
            contactos:      '/data/export/contactos',
            leads:          '/data/export/leads',
            cotizaciones:   '/data/export/cotizaciones',
            all:            '/data/export/all',
        },
    },
} as const
