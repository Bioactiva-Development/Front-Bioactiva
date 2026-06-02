export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

export function isValidFileType(file: File): boolean {
    const validExtensions = ['.xlsx', '.xls', '.csv']
    const ext = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '')
    return validExtensions.includes(ext)
}

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function escapeCSVCell(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes(';')) {
        return `"${value.replace(/"/g, '""')}"`
    }
    return value
}

export function generateCSV(
    data: Record<string, string | number | null>[],
    columnas: string[]
): string {
    const header = columnas.map(escapeCSVCell).join(',')
    const rows = data.map(row =>
        columnas.map(col => escapeCSVCell(String(row[col] ?? ''))).join(',')
    )
    return [header, ...rows].join('\n')
}

export function downloadCSV(filename: string, content: string): void {
    const bom = '﻿' // UTF-8 BOM para compatibilidad con Excel
    const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}
