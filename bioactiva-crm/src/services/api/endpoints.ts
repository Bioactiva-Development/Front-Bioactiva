export const ENDPOINTS = {
    auth: {
        login: '/auth/login',
        refresh: '/auth/refresh',
        me: '/auth/me',
        forgotPassword: '/auth/forgot-password',
        resetPassword: '/auth/reset-password',
        activate: '/auth/activate',
        validateToken: (token: string) => `/auth/validate-token/${token}`,
        logout: '/auth/logout',
    },
    usuarios: {
        list: '/api/usuarios',
        detail: (id: number) => `/api/usuarios/${id}`,
        invite: '/api/usuarios/invite',
        disable: (id: number) => `/api/usuarios/${id}/disable`,
        enable: (id: number) => `/api/usuarios/${id}/enable`,
    },

    organizaciones: {
        list: '/api/organizaciones',
        detail: (id: string) => `/api/organizaciones/${id}`,
        create: '/api/organizaciones',
        update: (id: string) => `/api/organizaciones/${id}`,
        sunatByRuc: (ruc: string) => `/api/organizaciones/sunat/ruc/${ruc}`,
        sunatByRazon: (razon: string) => `/api/organizaciones/sunat/razon/${razon}`
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
        list: '/api/notificaciones',
        detail: (id: number) => `/api/notificaciones/${id}`,
        cancel: (id: number) => `/api/notificaciones/${id}/cancel`,
        recordatorio: '/api/notificaciones/recordatorio',
        seguimiento: '/api/notificaciones/seguimiento',
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

