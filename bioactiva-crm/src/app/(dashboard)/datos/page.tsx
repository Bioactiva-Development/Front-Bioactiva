'use client'

import { useState } from 'react'
import { ImportarStepper } from '@/components/modules/datos/ImportarStepper'
import { ExportarForm } from '@/components/modules/datos/ExportarForm'
import { PageHeader } from '@/components/layout/PageHeader'

type Tab = 'importar' | 'exportar'

export default function DatosPage() {
    const [tab, setTab] = useState<Tab>('importar')

    return (
        <div className="space-y-6">
            <PageHeader
                titulo="Gestión de Datos"
                descripcion="Gestiona cargas desde Excel y exportaciones filtradas desde una sola vista."
            />

            {/* Tabs */}
            <div className="flex items-center gap-0.5 sm:gap-1 bg-white border border-gray-100
                rounded-xl px-1 sm:px-1.5 py-1 sm:py-1.5 shadow-sm w-full">
                <button
                    onClick={() => setTab('importar')}
                    className={`flex-1 text-center py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${tab === 'importar'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    Importar
                </button>
                <button
                    onClick={() => setTab('exportar')}
                    className={`flex-1 text-center py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${tab === 'exportar'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    Exportar
                </button>
            </div>

            {/* Contenido */}
            {tab === 'importar' && <ImportarStepper />}
            {tab === 'exportar' && <ExportarForm />}
        </div>
    )
}
