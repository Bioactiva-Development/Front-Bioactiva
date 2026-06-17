import { ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Organizacion } from '@/types/organizacion.types'
import { TamanoEmpresa } from '@/types/enums'
import { ROUTES } from '@/lib/constants/routes'
import { formatSector, formatTamano } from '@/lib/utils/organizacion.utils'

interface OrganizacionCardProps {
  organizacion: Organizacion
}

const TAMAÑO_COLORS: Record<TamanoEmpresa, string> = {
  [TamanoEmpresa.Micro]:   'bg-gray-100 text-gray-600',
  [TamanoEmpresa.Pequena]: 'bg-blue-50 text-blue-600',
  [TamanoEmpresa.Mediana]: 'bg-amber-50 text-amber-600',
  [TamanoEmpresa.Grande]:  'bg-emerald-50 text-emerald-700',
}

export function OrganizacionCard({ organizacion }: Readonly<OrganizacionCardProps>) {
  const router  = useRouter()
  const inicial = organizacion.nombre.charAt(0).toUpperCase()

  const handleVerDetalle = () => {
    router.push(ROUTES.organizacion(organizacion.id))
  }

  return (
    <tr
      className="border-b border-gray-50 hover:bg-emerald-50/30 transition-colors cursor-pointer"
      onClick={handleVerDetalle}
    >
      {/* Organización — siempre visible; muestra RUC debajo en móvil */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center
            justify-center shrink-0">
            <span className="text-sm font-bold text-emerald-700">{inicial}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-700 hover:underline">
              {organizacion.nombre}
            </p>
            {organizacion.sub_area && (
              <p className="text-xs text-gray-400">{organizacion.sub_area}</p>
            )}
            {/* RUC visible solo en móvil (la columna RUC está oculta) */}
            <p className="text-xs text-gray-400 sm:hidden">
              {organizacion.ruc ?? 'Sin RUC'}
            </p>
          </div>
        </div>
      </td>

      {/* RUC — oculto en móvil, visible en sm+ */}
      <td className="hidden sm:table-cell px-4 py-3">
        {organizacion.ruc ? (
          <span className="text-sm text-gray-600">{organizacion.ruc}</span>
        ) : (
          <span className="text-sm text-gray-400 italic">Sin RUC</span>
        )}
      </td>

      {/* Sector — oculto en móvil y tablet, visible en md+ */}
      <td className="hidden md:table-cell px-4 py-3">
        <span className="text-sm text-gray-600">
          {formatSector(organizacion.sector)}
          {organizacion.actividad_economica && (
            <span className="text-gray-400"> / {organizacion.actividad_economica}</span>
          )}
        </span>
      </td>

      {/* Tamaño — oculto en móvil y tablet, visible en md+ */}
      <td className="hidden md:table-cell px-4 py-3">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs
          font-bold uppercase tracking-wide
          ${TAMAÑO_COLORS[organizacion.tamano]}`}>
          {formatTamano(organizacion.tamano)}
        </span>
      </td>

      {/* Acciones — siempre visible */}
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleVerDetalle}
          className="p-2 rounded-lg text-gray-400 hover:text-emerald-600
            hover:bg-emerald-50 transition-colors"
        >
          <ExternalLink size={16} />
        </button>
      </td>
    </tr>
  )
}
