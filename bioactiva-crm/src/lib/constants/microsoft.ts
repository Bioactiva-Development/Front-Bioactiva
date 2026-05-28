// Configuración de Microsoft Graph para Teams + Outlook
// Reemplazar con valores reales del Azure App Registration
export const MICROSOFT_CLIENT_ID = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID ?? ''
export const MICROSOFT_TENANT_ID = process.env.NEXT_PUBLIC_MICROSOFT_TENANT_ID ?? 'common'

// Permisos necesarios: Teams (reuniones) + Outlook (calendario y correo)
export const MICROSOFT_SCOPES = [
    'User.Read',
    'Calendars.ReadWrite',
    'OnlineMeetings.ReadWrite',
    'Mail.Read',
].join(' ')
