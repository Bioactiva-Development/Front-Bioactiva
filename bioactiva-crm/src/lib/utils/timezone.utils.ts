/**
 * Zona horaria de negocio de la aplicación. El front es dueño de la
 * conversión Lima <-> UTC; el backend trabaja siempre en instantes UTC.
 */
export const APP_TIME_ZONE = 'America/Lima'

/**
 * Convierte un valor naive proveniente de un <input type="datetime-local">
 * (interpretado como hora de Lima) a un ISO-8601 en UTC.
 *
 * Implementación manual para evitar dependencia en fromZonedTime de
 * date-fns-tz, cuya compatibilidad con date-fns v4 al recibir strings
 * naive (sin sufijo de zona) puede producir offsets incorrectos porque
 * el parseo interno delega en `new Date(string)`, que usa el TZ del
 * navegador antes de aplicar el ajuste de Lima.
 *
 * Lima = UTC-5 siempre (sin horario de verano desde 1990). Date.UTC
 * normaliza automáticamente horas ≥24 o <0 al día correcto.
 */
export function limaInputToUtcISO(naive: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(naive)
  if (!m) throw new Error(`limaInputToUtcISO: formato inválido "${naive}"`)
  const [, y, mo, d, h, mi, s = '0'] = m
  return new Date(
    Date.UTC(+y, +mo - 1, +d, +h + 5, +mi, +s)
  ).toISOString()
}
