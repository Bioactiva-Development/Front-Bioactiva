'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginacionSlidingWindowProps {
  paginaActual:  number
  totalPaginas:  number
  onChange:      (pagina: number) => void
}

function getSlidingWindowPages(current: number, total: number): (number | '...')[] {
  const alwaysShow = new Set([1, total])
  const ventana    = new Set<number>()
  for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
    ventana.add(i)
  }

  const paginas = Array.from(new Set([...alwaysShow, ...ventana])).sort((a, b) => a - b)

  const result: (number | '...')[] = []
  for (let i = 0; i < paginas.length; i++) {
    result.push(paginas[i])
    if (i + 1 < paginas.length) {
      const gap = paginas[i + 1] - paginas[i]
      if (gap === 2) {
        // Un único número oculto: mostrarlo directamente en vez de "..."
        result.push(paginas[i] + 1)
      } else if (gap > 2) {
        result.push('...')
      }
    }
  }
  return result
}

export function PaginacionSlidingWindow({
  paginaActual,
  totalPaginas,
  onChange,
}: Readonly<PaginacionSlidingWindowProps>) {
  if (totalPaginas <= 1) return null

  const paginas = getSlidingWindowPages(paginaActual, totalPaginas)

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(paginaActual - 1)}
        disabled={paginaActual === 1}
        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50
          disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Página anterior"
      >
        <ChevronLeft size={16} />
      </button>

      {paginas.map((p, idx) =>
        p === '...' ? (
          <span
            key={`ellipsis-${idx}`}
            className="w-8 h-8 flex items-center justify-center text-sm text-gray-400 select-none"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors
              ${p === paginaActual
                ? 'bg-emerald-600 text-white'
                : 'text-gray-500 hover:bg-gray-50'
              }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(paginaActual + 1)}
        disabled={paginaActual === totalPaginas}
        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50
          disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Página siguiente"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
