const TIPO_LABELS: Record<string, string> = {
    ACADEMIA:                'Academia',
    EMPRESA_INTERNACIONAL:   'Empresa internacional',
    EMPRESA_NACIONAL:        'Empresa nacional',
    GOBIERNO_NACIONAL:       'Gobierno nacional',
    INDEPENDIENTE:           'Independiente',
    ONG:                     'ONG',
    ORGANISMO_INTERNACIONAL: 'Organismo internacional',
}

/** Convierte "EMPRESA_NACIONAL" → "Empresa Nacional" para mostrar en UI. */
export function formatTipo(tipo: string): string {
    return TIPO_LABELS[tipo] ?? tipo
}

/** Convierte "BANCA_Y_SEGUROS" → "Banca y seguros" para mostrar en UI. */
export function formatSector(sector: string): string {
    const words = sector.replaceAll('_', ' ').toLowerCase().split(' ')
    return words.map((w, i) => i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w).join(' ')
}

const TAMANO_LABELS: Record<string, string> = {
    Micro:   'Micro',
    Pequeno: 'Pequeño',
    Mediano: 'Mediano',
    Grande:  'Grande',
}

/** Devuelve el label legible de tamaño de empresa (ej. "Pequena" → "Pequeña"). */
export function formatTamano(tamano: string): string {
    return TAMANO_LABELS[tamano] ?? tamano
}

// Conectores y sufijos societarios que no aportan a la identidad del cliente
// y se ignoran al construir las iniciales del código.
const STOPWORDS = new Set([
    'DE', 'DEL', 'LA', 'LAS', 'LOS', 'EL', 'Y', 'E', 'EN', 'A',
    'SA', 'SAC', 'SRL', 'EIRL', 'SAA', 'SCRL', 'SC',
    'SOCIEDAD', 'ANONIMA', 'CERRADA', 'COMERCIAL', 'EMPRESA',
    'CORPORACION', 'GRUPO', 'CIA', 'COMPANIA',
])

function normalizar(texto: string): string {
    return texto
        .normalize('NFD')
        .replaceAll(/[̀-ͯ]/gu, '') // quita acentos
        .toUpperCase()
        .replaceAll(/[^A-Z0-9\s]/g, ' ')    // deja letras, dígitos y espacios
        .trim()
}

/**
 * Genera el código de cliente con el patrón:
 *   [iniciales en mayúscula del nombre comercial]-[hasta 3 dígitos del RUC]
 *
 * Reglas:
 *  - Se toman las iniciales de cada palabra significativa del nombre comercial
 *    (ignorando conectores y sufijos societarios como DE, SAC, SRL...).
 *  - Si solo queda una palabra significativa, se usan sus primeras 3 letras.
 *  - El sufijo numérico son los últimos 3 dígitos del RUC (o los que haya).
 *
 * Ejemplos:
 *   ("Cacao de Aroma", "20123456550") -> "CA-550"
 *   ("Altomayo",       "20100070970") -> "ALT-970"
 */
export function generarCodigoCliente(nombreComercial?: string, ruc?: string): string {
    const base = normalizar(nombreComercial ?? '')
    const palabras = base.split(/\s+/).filter(Boolean)
    const significativas = palabras.filter((w) => !STOPWORDS.has(w) && /[A-Z]/.test(w))

    let letras: string
    if (significativas.length >= 2) {
        letras = significativas.map((w) => w[0]).join('').slice(0, 4)
    } else if (significativas.length === 1) {
        letras = significativas[0].slice(0, 3)
    } else if (palabras.length > 0) {
        letras = palabras[0].slice(0, 3)
    } else {
        letras = 'ORG'
    }

    const digitos = (ruc ?? '').replaceAll(/\D/g, '')
    const numero = digitos.slice(-3) || '000'

    return `${letras}-${numero}`
}
