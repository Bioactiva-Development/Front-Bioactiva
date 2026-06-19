import { fromZonedTime } from 'date-fns-tz'

/**
 * Zona horaria de negocio de la aplicación. El front es dueño de la
 * conversión Lima <-> UTC; el backend trabaja siempre en instantes UTC.
 */
export const APP_TIME_ZONE = 'America/Lima'

/**
 * Convierte un valor naive proveniente de un <input type="datetime-local">
 * (interpretado como hora de Lima) a un ISO-8601 en UTC con zona explícita.
 *
 * Es independiente del reloj/zona del navegador: "14:30" siempre se trata
 * como 14:30 en Lima.
 */
export function limaInputToUtcISO(naive: string): string {
  return fromZonedTime(naive, APP_TIME_ZONE).toISOString()
}
