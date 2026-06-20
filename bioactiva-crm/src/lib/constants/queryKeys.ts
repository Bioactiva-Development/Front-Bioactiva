export const QUERY_KEYS = {
    auth: {
        me: ['auth', 'me']
    },

    usuarios: {
        list: () => ['usuarios', 'list'],
        detail: (id: number) => ['usuarios', id],
    },

    invitaciones: {
        list: (filters?: Record<string, unknown>) => ['invitaciones', 'list', filters],
        info: (token: string) => ['invitaciones', 'info', token],
    },

    organizaciones: {
        list: (filters?: unknown) => ['organizaciones', 'list', filters],
        detail: (id: string) => ['organizaciones', id],
        sunat: (query: string) => ['organizaciones', 'sunat', query],
    },

    contactos: {
      list:           (filters?: unknown) => ['contactos', 'list', filters],
      detail:         (id: number) => ['contactos', id],
      byOrganizacion: (orgId: string) => ['contactos', 'org', orgId],
    },

    leads: {
        list:        (filters?: unknown) => ['leads', 'list', filters],
        pipeline:    (filters?: unknown) => ['leads', 'pipeline', filters],
        column:      (estado: string, filters?: unknown) => ['leads', 'column', estado, filters],
        detail:      (id: number) => ['leads', id],
        byContacto:  (id: number) => ['leads', 'contacto', id],
    },

    actividades: {
        byLead: (leadId: number) => ['actividades', 'lead', leadId],
        detail: (id: number) => ['actividades', id],
        calendar: (filters?: unknown) => ['actividades', 'calendar', filters],
    },

    cotizaciones: {
        list:   (filters?: unknown) => ['cotizaciones', 'list', filters],
        detail: (id: number) => ['cotizaciones', id],
        byLead: (leadId: number) => ['cotizaciones', 'lead', leadId],
    },

    notificaciones: {
        scheduled: (filters?: unknown) =>
          ['notificaciones', 'scheduled', filters],
        inApp: () => ['notificaciones', 'in-app'],
    },

    plantillas: {
        list: (includeInactive = false) => ['plantillas', 'list', includeInactive],
        activas: () => ['plantillas', 'activas'],
        detail: (id: number) => ['plantillas', id],
    },

    dashboard: {
        metrics: (filters?: unknown) => ['dashboard', 'metrics', filters],
    },

    datos: {
        historial: () => ['datos', 'historial'],
    },

} as const
