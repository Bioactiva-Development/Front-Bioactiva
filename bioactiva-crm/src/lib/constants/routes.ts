export const ROUTES = {
    auth: {
        login: '/login',
        forgotPassword: '/forgot-password',
        resetPassword: '/reset-password',
        activate: '/accept-invitation',
        acceptInvitation: '/accept-invitation',
    },

    dashboard: '/dashboard',

    organizaciones: '/organizaciones',
    organizacion: (id: string) => `/organizaciones/${id}`,

    contactos: '/contactos',
    contacto: (id: number) => `/contactos/${id}`,

    pipeline: '/pipeline',
    lead: (id: number) => `/pipeline/${id}`,

    cotizaciones: '/cotizaciones',
    cotizacion: (id: number) => `/cotizaciones/${id}`,

    notificaciones: '/notificaciones',

    plantillas: '/plantillas',

    datos: '/datos',

    controlAcceso: '/control-acceso',

    perfil: '/perfil',
} as const